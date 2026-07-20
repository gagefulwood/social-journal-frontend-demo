# Event Detail and media implementation contract

Audit date: 2026-07-19. This is a read-only planning artifact, not an implementation. It reflects the current working trees (frontend `59b8709`, backend `d832af3`) including their pre-existing uncommitted changes. The two supplied mockups are accepted as presentation evidence: a media-rich hero and chapter view, and a no-media semantic fallback. They do not, by themselves, prove a domain model.

## Decision summary

- The reported image loss is **not an upload-persistence failure in the reproduced case**. Media row `1` and its 5,291,046-byte JPEG both persist. Delivery fails after serialization: consumers receive a relative `/media/...` path, several resolve it against the frontend origin, and the backend has no route serving that path. A request to the intended backend URL returns HTML `404`.
- Events have no chapter-equivalent model, serializer, endpoint, type, form control, or migration. Chapters require backend work.
- Do not backfill a default chapter. Return an explicit, read-only legacy projection for an Event with no persisted chapters; materialize it only in response to an intentional chapter edit/add operation.
- Preserve existing Event behavior: immutable start time, owner scoping, participant replacement, bounded Journal previews, Journal retention/detachment on Event deletion, related-moment ranking, and the one responsive route.
- Build Event/chapter media on the existing `MediaAsset` storage abstraction, but do not reuse its current trust-based upload or raw `file.url` delivery contract.

## Evidence and confirmed current contract

The executable working tree takes precedence where older requirements still describe required Event Journals or deferred general attachments. Current frontend requirements explicitly defer Event attachments, and current code matches that state.

| Concern | Confirmed contract | Evidence |
| --- | --- | --- |
| Event metadata | `id`, owner, title, description, immutable `event_timestamp`, optional end/location, tier, impact, context category, interaction mode, mood, and computed `journaled`. | `events/models.py:45-109`; `events/serializers.py:45-143` |
| Participants | Explicit `EventParticipant` rows; write payload is owner-visible Contact IDs and an update replaces the set. Detail returns nested active Contact summaries. | `events/models.py:115-135`; `events/serializers.py:145-219,293-348` |
| Journals | Logs and Reflections each have an optional `event` FK. Event detail returns total counts and at most four summaries per family, newest-updated first. | `journals/models.py:15-30`; `events/serializers.py:17,221-291`; `events/views.py:118-147` |
| Media | There is no Event-media relationship, cover, order, request field, DTO, form control, or Event serializer field. The only media visible on Event screens is participant profile imagery. Reflection attachments are a separate domain relationship. | `types/events.ts:78-125`; `events/models.py`; `events/serializers.py`; `journals/models.py:539-563` |
| Edit | Title, description, end, location, tier, impact, lookups, and participants are mutable. Start time is rejected by both client type and backend validation. | `types/events.ts:122-125`; `events/serializers.py:103-121`; `app/events/[id]/edit/page.tsx` |
| Delete | Event and participant links are deleted; retained Logs/Reflections are set to `event = null`. The confirmation states this accurately. | `JournalBase.event on_delete=SET_NULL`; `app/events/[id]/page.tsx:124-153` |
| Related moments | Separate owner-scoped endpoint, default two/max ten, weighted by participant/context/mode/tier and returning machine-readable reasons. The client waits for Event detail before issuing it. | `events/views.py:34-46,153-168,193-310`; `app/events/[id]/page.tsx:64-75` |
| Responsive rendering | One client route and one DOM tree. At `xl` it becomes content plus a 324px rail; smaller widths stack. There is no separate mobile route. | `app/events/[id]/page.tsx:100-218` |

The Journal creation affordance must remain: it always preselects the Event and preselects a Contact only when exactly one participant exists (`EventJournalsBand.tsx:29-85`). “View all” must continue to deep-link to a family- and Event-filtered Journal Hub.

### Redundancy, overfetch, and unsupported mockup needs

- The current detail page repeats the same information across `EventAnchorHeader`, `EventMetadataStrip`, `EventMomentBand`, `EventParticipantsBand`, `EventAtAGlanceRail`, and `EventQuickFactsRail`: description twice, participants twice, and date/location/mood/impact/mode/tier/Journal state in two or three places (`app/events/[id]/page.tsx:186-212,221-338,433-699`). These widgets should not survive as parallel legacy UI after the rebuild.
- `Event.user` is returned but not rendered. Participant rows reuse `ContactListSerializer`, so Event detail receives email, phone, occupation IDs/names, and relationship metrics while rendering only name, relationship label, and profile picture (`contacts/serializers.py:209-228`). Related rows also receive description, location, participants, and participant count that their compact UI does not use.
- Detail serializes context category as an ID while mood and interaction mode are nested. Resolving that one label calls `useLookups()`, whose cold hydration starts ten lookup requests (`useLookupStore.ts:42-78,110-184`; `lib/api/lookups.ts`). The detail read model should return a nested context summary.
- `eventsApi.getLogSummaries`, `getReflectionSummaries`, `getJournalsSummary`, and `getParticipants` are unused wrappers that each refetch the full Event (`lib/api/eventsApi.ts:82-100`).
- The mockups need domain support that does not exist: chapter identity/order/content; Event/chapter media associations; covers; media order; crop/focal data; counts by media kind; chapter-scoped Journals; upload state; derivatives/posters/duration.
- The current Event form and browser intentionally have no Event media or chapter control. Keep Event creation metadata-focused; create the Event first, then manage story structure and media from Event Detail so every upload has a stable parent ID.

## Media failure: reproduced end to end

No new upload was issued because this audit was prohibited from changing application database content. The existing uploaded asset and the active client/server code provide a complete read-only trace.

| Stage | Observed behavior | Finding |
| --- | --- | --- |
| File selection | Profile photo uses one `accept="image/*"` input. Reflection media accepts multiple unrestricted files. Neither creates an object-URL preview before upload. | `ProfilePictureSelector.tsx:91-115`; `ReflectionMediaField.tsx:38-72,116-136` |
| Request | `mediaApi.upload` appends `file` and optional lookup/alt/caption fields to `FormData` and lets Axios set the multipart boundary. It has no idempotency key, progress callback, abort signal, or retry state. | `lib/api/mediaApi.ts:24-41` |
| Parse/validation | DRF uses multipart/form/json parsers. The serializer trusts the browser filename, declared MIME, and size and infers media kind from the declared MIME prefix. Existing tests intentionally accept the non-image bytes `image-bytes` as `image/png`. | `media/views.py:14-45`; `media/serializers.py:78-100`; `media/tests/test_views.py:49-68` |
| Database | Asset `1`, owner `2`, active, `image/jpeg`, filename `cfa.jpg`, path `media/2026/07/19/cfa.jpg`, recorded size 5,291,046. It is linked to Reflection `938c1442-35fa-47ec-8c0c-00a37ff2ef98` at display order 0. | Read-only ORM inspection on 2026-07-19 |
| Storage | `DefaultStorage.exists(...)` is true. The file is a real 3000×2000 baseline JPEG and filesystem size is exactly 5,291,046 bytes under `MEDIA_ROOT`. | `MEDIA_ROOT=<backend>/mediafiles`; `file`, `stat`, and storage inspection |
| Serialization | Authenticated `GET /api/media/1/` is `200 application/json`; `url` is `/media/media/2026/07/19/cfa.jpg` and `file` is the request-host absolute form. Metadata access by another user is `404`, as intended. | `media/serializers.py:28-31,73-76`; read-only APIClient requests |
| Reload request | `GET http://127.0.0.1:8000/media/media/2026/07/19/cfa.jpg` is `404`, `text/html; charset=utf-8`, 3,651 bytes, 7ms. `config/urls.py` mounts API routes but no media-content route. | Live development-server request; `config/urls.py:21-32` |
| Browser URL handling | Some Event/Journal consumers prepend `NEXT_PUBLIC_API_URL`; ProfilePictureSelector, Reflection gallery/preview, and several Contact avatars use the relative value directly, which targets the Next origin. Resolution is inconsistent. | `lib/media/resolveMediaUrl.ts`; `ProfilePictureSelector.tsx:50-56`; `ReflectionMediaGallery.tsx:41-52` |
| Rendering | Active media rendering uses native `<img>`, `<video>`, `<audio>`, or CSS backgrounds, not `next/image`. `next.config.ts` is empty. Image CSS uses `object-cover`/`bg-cover`, which can crop but cannot produce this HTTP 404. | `SensitiveMediaPreview.tsx:83-133`; `next.config.ts` |
| Cleanup | API delete only sets `is_active=false`; physical bytes remain. Removing a draft attachment/profile selection does not call media delete. `Promise.all` can leave successfully uploaded but undisplayed orphan rows when one file fails. | `media/views.py:47-49`; `ReflectionMediaField.tsx:42-70,102-111`; `ProfilePictureSelector.tsx:76-87` |

Layer classification:

- upload never persisted: **not this reproduction**;
- record persisted but file missing: **not this reproduction**;
- file persisted but URL incorrect/unservable: **confirmed root layer**;
- URL correct but authorization fails: **not reached**; the content URL is not an authenticated endpoint at all;
- Next Image rejects it: **not applicable to active renderers**;
- image loads but CSS hides it: **not this reproduction**;
- population fixture points to missing bytes: **separate confirmed risk**. `populate_account._media()` checks only for a `demo-` database row and never calls storage existence; its test creates `file="media/demo-journal-photo.jpg"` without creating bytes (`core/management/commands/populate_account.py:193-200`; `core/test_management_commands.py:164-188`).

Mounting public `static(MEDIA_URL, ...)` would mask the local symptom but would not satisfy owner-scoped media. The durable fix is an authenticated/signed content contract with one URL resolver, not a UI placeholder or public media directory.

## Domain boundary: now, first version, later

| Classification | Contract |
| --- | --- |
| Supported now | Top-level Event metadata and participants; optional Event-linked Logs/Reflections; bounded Event Journal summaries; related Events; generic stored `MediaAsset`; profile pictures; Reflection attachments. |
| Required first version | Ordered Event chapters, inheritance rules, optional chapter Journal FK, Event/chapter media associations and covers, non-destructive crop data, verified upload/processing state, safe content delivery, rich/no-media responsive presentation. |
| Reasonable extension | Per-chapter mood/impact/mode/category, geocoded locations, transcripts, automatic scene/key-frame suggestions, shared albums, cross-device resumability, user-tunable per-breakpoint crops. |
| Deliberately deferred | Nested chapters, arbitrary timeline tracks, participant roles, face recognition, collaborative editing, public sharing/CDN URLs, and silently inferring chapters from old Events. |

The mockup's mood/impact/mode chips are treated as inherited Event values in version one. If product intends them to vary by chapter, that changes the model and needs explicit approval.

## Minimal chapter contract

### Models and invariants

`EventChapter`

- UUID primary key; `event` FK with cascade; required trimmed title (1–120 characters); contiguous non-negative `position`; optional `start_timestamp`, `end_timestamp`, `location_label`, and note; `inherits_event_participants` default true; created/updated timestamps.
- Unique `(event, position)` and index `(event, position, id)`. `end >= start` when both exist.
- A blank chapter location inherits the Event location in version one. Explicit “no location despite parent” is deferred.

`EventChapterParticipant`

- Explicit chapter/contact join with display order and unique `(chapter, contact)` and `(chapter, display_order)`.
- When inheritance is true, no explicit rows are accepted and effective participants are the parent Event participants. When false, the explicit set may be empty (the user alone) and must be a subset of the parent Event participants.
- Removing a parent participant referenced by an explicit chapter is rejected with the affected chapter IDs; it is never silently removed. Adding a chapter participant first requires or atomically adds the parent participant.

Journal changes

- Add nullable `chapter` FKs to both `Log` and `Reflection`, `SET_NULL`, indexed. A write with a chapter must have `journal.event == chapter.event` and all three records must have the same owner. Setting a chapter sets/validates the Event atomically.
- A Journal may remain attached to the whole Event with `chapter = null`. Every existing Event-linked Journal remains exactly that; there is no data reassignment migration.

Time and order rules

- Explicit position is authoritative; times do not sort chapters.
- Overlap is allowed. Real experiences and media can overlap, and rejecting overlap would encode an unsupported product assumption.
- A supplied chapter start cannot precede Event start. If the Event has an end, supplied chapter start/end must be inside the Event range. If the Event end is absent, no upper bound is inferred. No chapter edit silently changes the parent range.
- Reordering accepts the complete ordered list of chapter IDs, locks the Event/chapters, validates exact membership, and rewrites positions transactionally. It must use temporary positions or a deferrable uniqueness strategy so swaps cannot violate the constraint.

Deletion

- Deleting a chapter sets its Logs/Reflections to `chapter = null` while preserving their Event link.
- Chapter media is transactionally appended to whole-Event media before deletion. Its cover flag is retained only when the Event has no cover; otherwise it is cleared. The media original is never deleted by chapter deletion.
- Participant links and crop rows then cascade; positions are compacted. Deleting the last chapter returns the Event to legacy-projection rendering.

### Existing-Event compatibility

- Do **not** backfill chapter rows and do not create rows on GET.
- Event detail returns `chapter_mode: "projected" | "persisted"`. With no rows it returns a `legacy_chapter` read model (`id: null`, `is_projection: true`) built from Event title/time/location/description/effective participants and the existing Event-level Journal preview.
- Editing ordinary Event metadata does not materialize a chapter. Editing the projected chapter explicitly materializes one row from current Event values. Adding a chapter to a projected Event first materializes the projection and then creates the requested chapter in the same transaction. This operation is idempotent.
- Once chapters exist, `chapter = null` Journals render in an “Event perspective” group; chapter Journals render only in their chapter. This prevents silent reassignment and preserves the current chooser/deep links.

## Shared Event media contract

### Persistence additions

`EventMedia`

- UUID ID; parent Event; optional chapter; owned `MediaAsset`; display order; recorded time; attachment-level alt text/caption/decorative flag; cover flag; focal X/Y (normalized 0–1); timestamps.
- The chapter must belong to the Event and the asset owner must equal the Event owner. An asset may be reused in different scopes, but only once in the same scope.
- Partial unique constraints enforce one order and one cover per whole Event or chapter. Use `RESTRICT` from media to chapter so direct deletion must run the preservation service while an Event-wide cascade remains possible.

`EventMediaCrop`

- One optional normalized rectangle (`x`, `y`, `width`, `height`, source-orientation revision) per `EventMedia` and crop kind. First-version editable kinds are `event_cover` and `chapter_carousel`; mobile and thumbnail variants derive from the focal point unless a future override is added.

`MediaUploadSession`, `MediaAsset`, and `MediaVariant`

- Upload session: UUID, owner, owner-scoped idempotency key, expected name/bytes/claimed MIME, strategy, temporary object key/provider multipart ID, status, expiry, final asset, timestamps, and safe failure code.
- Asset: make checksum and detected MIME server-owned; add `pending | processing | ready | failed | aborted` status, width/height/pixel count, duration, and processing error code. Keep the original file immutable and private.
- Variant: asset, optional Event-media association for crop-specific output, a concrete variant key (for example `event_cover_desktop_1280_webp`), storage file/key, detected MIME, dimensions/duration/bytes, status, and crop revision. Unique `(asset, association, variant_key, crop_revision)`.
- Existing assets migrate to `ready`; their current declared metadata is not treated as newly verified. A follow-up verifier may backfill dimensions/checksums without blocking compatibility.

### Ingest and processing sequence

1. Create an owner-scoped upload session with an `Idempotency-Key`; reserve count/byte quota.
2. Upload into a quarantine key while hashing. Hosted object storage uses presigned single-part PUT below 25 MiB and multipart upload above it; local/test uses the authenticated API content endpoint.
3. On completion, compare actual size, sniff magic bytes, and decode/probe the whole file. Declared MIME and extension are advisory. Reject mismatches, polyglots, SVG/active content, decompression bombs, and unsupported codecs.
4. Normalize image orientation for processing, but retain the exact original privately. Strip EXIF/GPS/device metadata from every derivative. Probe audio/video with `ffprobe`; do not trust browser duration.
5. In a worker, generate thumbnails/posters/renditions. Attachments accept only owner-owned `ready` assets. The API reports per-file state; a multi-file operation uses independent results, not fail-fast `Promise.all`.
6. Aborted/failed quarantine objects are purged within 24 hours. Ready but unattached assets are purged after seven days. An explicit asset deletion is refused while referenced, then purges original and variants within 24 hours after detachment. Cleanup is idempotent and periodically reconciles database rows with storage.

Owner-local duplicate detection uses checksum + bytes + detected MIME. The same idempotency key returns the same session/result; a deliberate repeat can reuse the owner's bytes with a new domain attachment. Never deduplicate across owners or disclose a cross-owner hash match.

The initial detected-MIME allowlist should be configuration-backed: JPEG, PNG, and WebP images; HEIC/HEIF only when a production decoder is installed; MP4/QuickTime/WebM video whose streams pass an `ffprobe` codec allowlist; and MP3, M4A/AAC, Ogg/Opus, or WAV audio. Reject SVG and animated GIF in version one because active content/animation requires a different sanitization and rendition policy.

### Recommended configurable defaults

| Setting | Initial default | Operational consequence / justification |
| --- | ---: | --- |
| `MEDIA_IMAGE_MAX_BYTES` | 20 MiB | Covers high-resolution phone photos; 40 maximum-size images are 800 MiB before derivatives. |
| `MEDIA_IMAGE_MAX_PIXELS` / edge | 40 MP / 12,000 px | A 40 MP RGBA decode is about 160 MiB before overhead; image workers need a 512 MiB class memory limit and low concurrency. |
| `MEDIA_VIDEO_MAX_BYTES` | 250 MiB | Supports short personal clips without proxying multi-gigabyte originals. Temporary + transcoded storage can approach 2× during processing. |
| `MEDIA_VIDEO_MAX_DURATION` / dimensions | 10 min / 3840×2160 input | Accepts common phone video but produces at most 1080p playback; 4K processing must be worker-isolated. |
| `MEDIA_AUDIO_MAX_BYTES` / duration | 50 MiB / 60 min | Supports compressed voice recordings while bounding probe/transcode work; large PCM recordings hit bytes first. |
| `MEDIA_CHAPTER_MAX_ASSETS` | 12 | More than the mockup requires while keeping a chapter carousel navigable. |
| `MEDIA_EVENT_MAX_ASSETS` | 40 total, including chapters | Prevents unbounded Event detail payloads; variants do not count as assets. |
| Chapter/Event original-byte cap | 750 MiB / 2 GiB | Prevents the per-file video limit from multiplying into an unbounded Event. |
| Owner storage quota | 10 GiB | Reasonable initial private-account envelope; must become plan/config driven before broader deployment. |
| Concurrent active uploads | 3 per owner/client | Preserves progress and throughput without saturating mobile uplink, app workers, or multipart quotas. Sessions expire after two hours. |

All values belong in validated settings/environment configuration and must be returned by an upload-capabilities endpoint so the client never hard-codes a divergent limit.

### Crops, variants, and accessibility

- Preserve the original; no UI operation overwrites it. Crop coordinates are normalized against the EXIF-normalized source.
- Standard image/poster outputs: desktop Event cover 16:9 at widths 1920/1280/768; mobile cover 4:3 at 960/640; chapter carousel 4:3 at 1600/800; square thumbnail 320. Generate modern WebP plus a codec-compatible fallback where needed.
- Server outputs are the bandwidth and composition source of truth. CSS may use `object-fit: cover` and focal `object-position` for last-mile resizing only. Layer gradients/controls above media with an explicit media/overlay/content stack and keep controls outside clipped containers.
- Video gets an automatic poster at 10% of duration (capped at five seconds), with an owner-selectable `poster_timestamp_ms`. Audio stores duration and embedded title/artist only after sanitizing; it has no crop.
- Image alt text is attachment-specific and required unless `decorative=true`. Video supports a caption/description plus optional WebVTT track; audio supports a descriptive label and optional transcript. Automated transcription and mandatory-caption policy are deferred product decisions, not silently promised.

Direct object upload should be implemented now because video is in the approved first-version surface and retrying a 250 MiB Django-proxied request is not production-conscious. Presigned multipart part retry/cancel is required; full tus-style cross-device/offline resume is deferred.

## API, types, and UI additions

### Backend endpoints

- `GET /api/events/{event_id}/`: nested context summary, `chapter_mode`, legacy projection or chapter headers, whole-Event media cover/count summary, and the existing bounded Event-level Journal summary.
- `GET|POST /api/events/{event_id}/chapters/`; `GET|PATCH|DELETE /api/events/{event_id}/chapters/{chapter_id}/`; `PUT /api/events/{event_id}/chapters/reorder/`; idempotent `POST .../chapters/materialize-legacy/`.
- Chapter detail returns effective/inheritance fields, ordered ready media, and at most four Log plus four Reflection summaries and counts. It never embeds full Journal detail or all previews for every chapter.
- `POST|PATCH|DELETE /api/events/{event_id}/media[/<attachment_id>/]` and `PUT .../media/reorder/`; `chapter_id` selects scope and every write revalidates parent/asset ownership.
- `POST /api/media/uploads/`, `GET|DELETE /api/media/uploads/{upload_id}/`, part/sign/complete operations, and a local authenticated content fallback. `GET /api/media/{id}/content/` owner-checks then streams with Range support or redirects to a short-lived private URL. Never serialize raw storage paths as the render contract.
- `GET /api/media/capabilities/` returns accepted detected MIME families, limits, concurrency, and enabled upload strategy.

### Frontend DTOs and state

Add `EventDetailDTO`, `EventChapterHeader`, `EventChapterDetail`, `LegacyChapterProjection`, `EffectiveParticipants`, `EventMediaAttachment`, `MediaCrop`, `MediaVariant`, `MediaCapabilities`, `MediaUploadSession`, and a discriminated per-file `queued | uploading | processing | ready | failed | cancelled` state. URLs are opaque expiring content URLs and refresh through one media resolver.

The upload client needs progress, `AbortController` cancellation, bounded queue concurrency, retry with the same idempotency key, `Promise.allSettled`-style partial results, removal/detach semantics, and expired-read-URL refresh. Do not send a manually fixed multipart `Content-Type` boundary.

### Components and responsive behavior

- `EventDetailShell`, `EventHero` (rich and no-media variants), `EventMediaSummary`, `ChapterNavigator`, `ChapterDetail`, `ChapterParticipants`, `ChapterMediaCarousel`, `ChapterNote`, `ChapterJournalPreview`, and a retained/repositioned `RelatedMoments` section.
- Shared `MediaUploadQueue`, `MediaTile`, `MediaCropDialog`, `VideoPosterPicker`, and accessible audio/video controls. Use them for Event/chapter media; migrate Reflection/profile upload later without coupling domain attachments.
- Desktop: rich hero uses one primary cover plus bounded supporting tiles; no-media uses semantic Event presentation and participant imagery. Mobile: one cover/card, horizontal chapter navigation, touch carousel, no hover-only actions, and the 4:3 mobile rendition. The same route/data contract serves both.
- Preserve an explicit empty state with Add photo/video/audio controls. Do not render broken placeholders when no asset exists or while processing.
- Event create/edit metadata remains intact. Chapter/media mutation occurs after Event creation from detail; the immutable Event start rule and delete wording remain.

## Security and ownership requirements

- Every query begins with the requesting owner. A nested URL never authorizes by child ID alone; return `404` for foreign Event, chapter, attachment, asset, upload session, or Journal.
- Validate Contact, lookup, MediaAsset, Event, chapter, and Journal ownership at write time and again in transactional services; parent ownership is authoritative.
- Presigned write URLs are single owner/session/key, constrained in size/type where the provider permits, short-lived, and never grant list/read access. Presigned reads are short-lived and private. Local content has equivalent owner checks and byte-range behavior.
- Escape filenames in headers, generate server storage keys, scan/decode before `ready`, set `nosniff`, and use an allowlist for display MIME. Derivatives are metadata-stripped; originals are never public.
- Quota reservation, idempotency, final attachment creation, failure cleanup, and reorder/delete services must be race-safe. Cross-owner existence must not be observable through dedupe, timing, or error detail.

## Migrations, cleanup, and implementation sequence

1. **Repair delivery contract first:** add authenticated/signed content delivery, absolute/opaque read URLs, Range behavior, one frontend resolver, storage-existence tests, and a `populate_account` existence guard. Correct hard-coded `DEBUG=True`/`ALLOWED_HOSTS=[]` before deployment; do not expose local `MEDIA_ROOT` publicly.
2. **Harden generic media:** upload session/status metadata, sniff/decode/probe, configuration/capabilities, idempotency, cleanup, worker/variants, and existing-asset compatibility migration.
3. **Add chapter schema:** EventChapter/participant tables, nullable Log/Reflection chapter FKs, constraints/indexes, serializers/services/permissions, projection/materialization, reorder/delete tests. No chapter data backfill.
4. **Add Event media schema:** EventMedia/crop/variant relationships, cover/order preservation services, endpoints, and owner/race tests.
5. **Build frontend read states:** new DTOs and shell, no-media first, legacy projection, retained Journals/related behavior, then rich hero and chapter navigation.
6. **Build mutation states:** upload queue, crop/poster, attach/reorder/remove, partial failure, accessibility metadata, and mobile interactions.
7. **Remove legacy UI only after parity, accessibility, responsive, authorization, storage, and performance acceptance tests pass.**

Legacy cleanup inventory:

- Replace and then delete the nested detail implementations in `app/events/[id]/page.tsx`: anchor, metadata strip, moment band, duplicate participant band, at-a-glance rail, and quick-facts rail. Related moments must be retained or replaced with equivalent behavior.
- Remove the unused full-Event refetch helpers in `lib/api/eventsApi.ts` and the page-local `profilePictureUrl` in favor of the shared content contract.
- Do not resurrect the already deleted `components/events/EventContextChip.tsx`, `components/events/event-presentation.ts`, `components/events/participantWidget.tsx`, or `store/useEventsStore.ts`; current canonical presentation lives under `lib/presentation` and `components/presentation`.
- Keep `/events/calendar` and `/events/timeline` compatibility redirects. They are not obsolete just because the canonical browser is `/events?view=...`.
- Reuse/refactor `EventJournalsBand` until whole-Event and chapter preview parity exists; remove it only when the new components preserve counts, family links, chooser context, and empty states.

## Decisions requiring approval

1. Confirm that mood, impact, interaction mode, and category are inherited Event fields in version one, not chapter fields.
2. Confirm materialization UX: editing the projection creates one chapter; adding to a projected Event preserves the projection as chapter one and adds chapter two.
3. Approve the recommended byte/count/quota defaults and whether explicit asset deletion has a short undo/retention window instead of purge within 24 hours.
4. Choose the worker/broker and provision `ffprobe`/transcoding plus MIME-sniffing support. Pillow and S3 libraries exist; `ffprobe`, libmagic bindings, and a job queue do not.
5. Confirm whether video captions/audio transcripts are optional-at-launch or a publish gate.
6. Confirm the related-moment placement and whether owners may override the automatically derived mobile/thumbnail crop in version one.

The backend test suite could not be rerun in this environment because the configured PostgreSQL role cannot create a test database. That is a verification blocker for implementation, not evidence against the read-only API/SQL/storage findings above.
