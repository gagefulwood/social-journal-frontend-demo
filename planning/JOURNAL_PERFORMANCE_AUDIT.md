# Journal performance audit and implementation contract

Audit date: 2026-07-19. This is a measurement and planning artifact only. No application data, source, configuration, dependency, or migration was changed.

## Executive finding

The global Journal Hub, Event-filtered feed, Event Detail preview, and sampled Journal details are not currently slow on the local dataset. The severe path is `related_contact`, used by the Contact Journals panel. One five-row request takes about **2.8 seconds over only 12 owner Journals** because Django expands repeated correlated expressions into a high-cost annotated UNION. PostgreSQL compiles roughly 300 JIT functions for both the pagination count and page query. The Contact panel then starts five variants of that feed.

Event Detail should keep its existing bounded lightweight summaries and extend that pattern to a selected chapter. It must not call the full Journal feed or hydrate full Journals. The `related_contact` rewrite, Hub request consolidation, and Journal-detail lookup waterfalls belong to a separate Journal performance change.

## Measurement method and baseline

- Backend: current dirty working tree at `d832af3`, Django 6.0.3, local PostgreSQL, authenticated owner `2`.
- Fixture size: 49 Events, 49 participant links, 7 Contacts, 8 Logs, 4 Reflections, 1 Reflection attachment, and 1 MediaAsset.
- Each table row is the median of three warm in-process DRF APIClient GETs. The response was fully rendered; wall time uses `perf_counter`; SQL count/time uses `CaptureQueriesContext`; bytes are uncompressed JSON response bytes. It excludes browser/network latency, so it is a server baseline rather than a user-perceived number.
- Read-only `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` was used for the pathological and Event-filtered queries. A session-only `SET jit=off` diagnostic was restored immediately and did not alter database configuration.

### Measured baseline

| Representative request | Wall ms | SQL ms | SQL count | Bytes | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| Hub, completed, both families, page 20 | 17.6 | 10 | 2 | 4,148 | 6 rows |
| Hub, completed Logs | 8.0 | 3 | 2 | 2,763 | 4 rows |
| Hub, completed Reflections | 9.0 | 4 | 2 | 1,436 | 2 rows |
| Hub draft preview, page 10 | 13.0 | 6 | 2 | 3,607 | 6 rows |
| Format `episode`, completed | 14.4 | 6 | 1 | 52 | empty page |
| Direct `contact=6`, completed | 13.9 | 7 | 1 | 52 | empty page |
| **Related Contact 6, completed, page 5** | **2,794.7** | **2,776** | **2** | **732** | 1 row |
| Related Contact 6, Log inventory, page 1 | 11.7 | 4 | 2 | 732 | 1 row |
| Related Contact 6, Reflection inventory | 576.2 | 564 | 1 | 52 | empty page |
| Related Contact 6, draft inventory | 120.1 | 103 | 1 | 52 | empty page |
| Event 11 Journal feed | 11.5 | 5 | 2 | 1,434 | 2 rows |
| Event 11 detail, including Journal previews | 14.3 | 4 | 5 | 1,483 | 1 Log + 1 Reflection preview |
| Event 11 related Events, limit 6 | 10.8 | 2 | 4 | 5,846 | bounded list |
| Episode Log detail | 6.3 | 1 | 5 | 541 | full detail |
| Interaction Reflection detail | 9.3 | 2 | 6 | 1,380 | full detail |
| Log patterns, 30 days | 6.0 | 1 | 6 | 281 | aggregate |
| Contacts filter options, page 100 | 6.0 | <1 | 9 | 2,182 | 7 rows |
| Events filter options, page 100 | 15.6 | 2 | 3 | 43,853 | 49 rows |

Empty paginated results execute only the count query, explaining the one-query rows. Query timing is rounded to milliseconds by Django; “<1” is not zero database work.

### EXPLAIN evidence for the severe path

For `GET /api/journals/?related_contact=6&page=1&page_size=5`:

- Pagination emits two SQL statements, 6,812 and 6,829 characters. Each contains one UNION, 11 `EXISTS` expressions, and 12 `CASE WHEN` expressions.
- Planner total costs are 1,211,739 for the count and 1,211,502 for the page, far above this database's JIT thresholds (`jit_above_cost=100000`; inline/optimize at `500000`).
- `EXPLAIN ANALYZE` reports 304 and 303 generated JIT functions. JIT takes 1,465ms and 1,456ms respectively; the actual tiny-table work is tens of milliseconds or less.
- Three normal samples had median wall/SQL of 2,941.8/2,921ms. The same request under a session-only JIT-off diagnostic had median wall/SQL of 26.2/8ms. This isolates compilation as the immediate latency, but globally disabling JIT would treat the symptom, not the query construction defect.

By contrast, Event 11's feed has planner costs around 1,500, count/page execution of 0.32/0.21ms, and no JIT. PostgreSQL chooses sequential scans over the 12-row tables; that is rational at this size and is not evidence that a missing index causes the current severe latency.

## Root causes

### Backend query construction

`JournalFeedView._with_related_contact_matches` (`journals/views.py:435-496`) creates three aliases:

1. an uncorrelated owner-visible Contact `EXISTS`;
2. a direct-match CASE (with another `EXISTS` for Reflection contacts);
3. an Event-participant `EXISTS`.

Django cannot reference those select aliases inside the same SQL select/filter, so it expands their expressions each time they appear in the filter and three-way `relation_source` CASE. The expansion happens independently for Logs and Reflections. Pagination then counts the full values/annotation UNION and executes almost the same full projection again for the page. Reflection `media_count=Count(attachments)` adds grouping before the row set is bounded (`journals/views.py:590-671`).

This is repeated-expression/JIT amplification, not a row-by-row serializer N+1. The normal feed is already page-number paginated (default 20, maximum 100) and usually takes two SQL queries. Detail querysets use `select_related`/`prefetch_related`, so the sampled 5–6 detail queries are bounded; optional Reflection cover hydration can add one bounded query.

Current indexes include owner/status/updated and owner/format/occurred for each Journal family, individual Event/owner/contact FK indexes, `(event, contact)` for Event participants, and `(reflection, contact)` for Reflection contacts. They do **not** include an owner+Event+status+occurred composite. Existing join indexes are adequate for this tiny reproduction; rewrite first and use production-shaped EXPLAIN before adding speculative reverse composites.

### Frontend request amplification

The expensive server query is multiplied by independent hooks with no shared cache or request deduplication:

- `ContactJournalsPanel.tsx:86-132` starts a main related-contact feed, completed inventory, Log inventory, Reflection inventory, draft preview, and a 100-row Contact Event list. Four inventory requests exist only to derive counts/latest state. A retry refetches all four (`:201-205`).
- `JournalHub.tsx:88-107,271` always starts the main feed, a separate draft preview, and Log patterns. `JournalHubFilters.tsx:55-58` also downloads up to 100 Contacts and 100 full Event list rows before the filter popover is opened. Thus a cold normal Hub starts five requests, and the Event options payload alone is 43.9KB on 49 Events.
- In the Drafts view, the main feed is already a 20-row draft feed, but the hidden 10-row draft preview hook still runs (`JournalHub.tsx:102-107,223-233`).
- Hub search writes the URL and changes the feed on every keystroke (`JournalHubFilters.tsx:79-85`); unlike Contact search, it is not debounced.
- `useJournalFeed` stabilizes parameter objects and aborts stale responses, but every hook instance owns isolated state (`hooks/useJournal.ts:16-129`). There are no query keys shared across instances. Development Strict Mode can abort/reissue effect requests, and the backend may still see the aborted request, but that does not explain the measured production-relevant 2.8-second server execution.
- Mutations do not form an invalidation loop; they deliberately fan out across independently owned hooks. The absence of a cache makes that fan-out larger than necessary.

### Detail hydration waterfalls

The sampled Journal detail endpoints themselves are fast, but secondary presentation data begins only after detail determines the format:

- Log detail then requests Log patterns and 1–3 lookup collections (`LogScreens.tsx:199-215,646-679`). Episode uses category, characteristic, and context-tag lists; sentiment uses emotion state and interaction dynamic lists.
- Emotional Reflection detail then requests the full emotion-state list to map IDs to names (`ReflectionDetailView.tsx:110-154`).
- These are frontend waterfalls, not backend detail N+1s. Serialize compact lookup summaries/names or share a durable lookup cache; render the primary detail without waiting for patterns.

### Event-scoped behavior

The Event path is already the correct broad architecture:

- Event retrieve annotates family counts and prefetches only four recent entries per family (`events/views.py:118-147`). Its summaries contain only ID/family/format/status/title/contact/timestamps (`events/serializers.py:221-291`).
- It measured 14.3ms, five SQL queries, and 1.48KB. The standalone Event feed measured 11.5ms and two queries. There is no evidence that Event Journal preview is currently a latency source.
- The Event frontend does create a separate waterfall by waiting for Event detail before requesting related Events, even though the route already supplies the ID (`app/events/[id]/page.tsx:64-75`). That is an Event request orchestration issue, not Journal SQL.

## Required Event Detail optimization

Implement only this Journal work in the Event Detail/chapter change:

1. Preserve the existing whole-Event summary contract: total counts and at most four Logs plus four Reflections, never full Journal serializers.
2. Add nullable chapter FKs to Log and Reflection. Keep existing `chapter = null` rows as whole-Event Journals.
3. Create one reusable owner-scoped `JournalSummaryQuery` service that accepts exactly one Event and optional chapter, selects only the current summary fields, orders deterministically, and performs two bounded family queries plus counts. Do not call `GET /api/journals/` from Event or chapter UI.
4. Event detail returns chapter headers plus whole-Event Journal summary. `GET /api/events/{event}/chapters/{chapter}/` returns only the selected chapter's bounded Journal summary. Do not multiply eight previews by every chapter in the Event response.
5. Add `(user, event, status, occurred_at DESC)` indexes to both Journal tables if production-shaped EXPLAIN confirms the chosen direct query; add equivalent `(user, chapter, status, occurred_at DESC)` indexes with the chapter migration. At minimum, the new chapter FK needs its normal index.
6. Fetch Event detail and related Events in parallel by route ID. Fetch the selected chapter detail only after its ID is known from URL/default header; cache it by `(event, chapter)`.

Acceptance for this slice is independent of the global feed rewrite: summary counts are correct, each family is capped at four, query count is constant as total Journals and chapter count grow, foreign-owner IDs return 404, and no full Journal body/detail/media attachment collection appears in Event responses.

## Separate Journal performance change

### Query rewrite

1. Validate `related_contact` ownership once before constructing family querysets; remove the uncorrelated visibility `EXISTS` from every row.
2. Build a simple owner-visible Event-ID subquery for participant-related Events. Filter Logs with direct primary Contact OR Event ID. Filter Reflections with primary/through-contact OR Event ID. Avoid repeating boolean relation expressions in the UNION.
3. Count Logs and Reflections separately before adding summary/detail annotations; add the two scalar counts in the paginator. Never count the full annotated UNION.
4. Page over common lightweight columns/IDs only. Bulk-hydrate the bounded family rows, summary labels, cover/media counts, and direct/event relation flags after pagination; compute `relation_source` from those bounded sets. This may use a few cheap fixed queries and is preferable to two million-cost statements.
5. Move Reflection attachment count and cover lookup out of the unbounded selection path. Preserve stable ordering with updated/occurred, created, ID, and family tie-breakers.
6. Re-run EXPLAIN with JIT on after every structural step. Consider a database JIT threshold/endpoint-local mitigation only as a reversible emergency measure after DBA review; it is not the accepted fix.

### Endpoint and frontend consolidation

- Add owner-scoped `GET /api/contacts/{id}/journal-summary/` returning completed/Log/Reflection/draft counts, latest completed summary, and at most two draft summaries. Replace four Contact inventory feeds with this one endpoint. Initial Contact Journals work becomes main feed + summary; load Event filter options lazily and server-search them.
- Add a small Journal Hub summary endpoint for draft count/preview. Skip preview work in Drafts view. Keep Log patterns independent and non-blocking.
- Load Contact/Event filter options only when the popover opens; return compact option DTOs and server-search rather than downloading page size 100 full rows.
- Debounce Hub search by 300ms, cancel stale requests, and do not refetch for a query that normalizes to the existing key.
- Introduce a shared cache/deduplication layer keyed by normalized endpoint parameters. Invalidate `journal-feed`, `journal-summary`, Event summary, and Contact summary keys intentionally after writes instead of imperatively refetching every hook instance.
- Return nested lookup summaries in Journal details (or reuse the existing global lookup store) so IDs do not require format-dependent list waterfalls. Show detail immediately; patterns may load progressively.

### Broader index and payload work

- Add composite indexes only after the rewritten query is measured on production-shaped cardinality. Candidate read indexes are owner+status+ordering and owner+Event/chapter+status+occurred. Evaluate reverse Contact/EventParticipant and Contact/ReflectionContact composites only if EXPLAIN shows them hot after rewrite.
- Keep `page_size <= 100`, but use compact option/summary serializers. Do not use page size 100 full Event rows for selects.
- Establish explicit list/detail serializers: Hub rows must not accrete Journal body, guided detail, attachment lists, or all lookup objects.

## Tests and measurable acceptance criteria

### Backend tests

- Correctness matrix for family, format, status, direct Contact, related Contact (direct/event/both), Event, chapter, date, search, ordering, empty page, and cross-owner IDs.
- Query-budget tests with `CaptureQueriesContext`: budgets remain constant between 10 and 10,000 Journals; no per-row Contact/Event/media query appears.
- Pagination tests prove count is `log_count + reflection_count`, stable tie ordering, no duplicate Reflection from through-contact joins, and correct `relation_source` after hydration.
- Event/chapter summary tests enforce max four per family, correct total counts, whole-Event versus chapter separation, and payload field allowlists.
- Generate a performance fixture with at least 10,000 Logs, 10,000 Reflections, 5,000 Events, multi-participant Events, Reflection contacts, and covers. Run warm/cold timings and `EXPLAIN (ANALYZE, BUFFERS)` in a safe staging database.

### Frontend tests

- Production-build network test: normal Hub starts at most main feed + Hub summary + patterns; Drafts does not issue a duplicate draft preview; filter option requests wait for popover open.
- Contact panel starts at most main feed + Contact Journal summary before optional filter data; one retry does not fan out into four inventory feeds.
- Search fake-timer test proves one request after 300ms and stale responses cannot overwrite the current key.
- Event detail never calls the full Journal feed; selected chapter changes use cached bounded summary keys and preserve whole-Event Journals.
- Journal detail renders core content without waiting for lookups/patterns and emits no duplicate identical GET in a production build. Record development Strict Mode separately so it is not mistaken for production duplication.

### Numeric gates

On the same local reference environment and the production-shaped fixture:

- related-Contact page: median ≤100ms, p95 ≤200ms, ≤6 fixed SQL queries, no JIT compilation, and ≤15KB for five summaries;
- Hub page 20: p95 ≤150ms, ≤4 fixed SQL queries, and ≤50KB;
- Contact Journals initial server critical path: p95 ≤300ms across at most two Journal requests before lazy filter data;
- Event detail: p95 ≤150ms, ≤10 SQL queries, ≤25KB without media URLs, and exactly max four summaries/family;
- selected chapter detail: p95 ≤150ms, ≤8 SQL queries, ≤25KB without binary media, with query count invariant across Event chapter count;
- Log/Reflection detail: p95 ≤200ms and usable content requires one HTTP response; secondary patterns may remain progressive.

The current PostgreSQL role cannot create a test database, so the existing 80 targeted media/Event/Journal API tests could not be rerun (`permission denied to create database`). Implementation is not complete until that test-environment blocker is resolved and the gates above are recorded in CI or a safe staging run.

## Work split

**In Event Detail now:** chapter FKs and ownership validation; direct bounded whole-Event/selected-chapter summary service; required indexes after EXPLAIN; Event/related request parallelism; tests proving no full Journal hydration.

**In the separate Journal pass:** related-Contact SQL/JIT rewrite; custom family counts and two-stage hydration; Contact/Hub summary endpoints; removal of duplicate inventory/draft/filter requests; search debounce/cache/deduplication; detail lookup/pattern waterfalls; production-scale index tuning.
