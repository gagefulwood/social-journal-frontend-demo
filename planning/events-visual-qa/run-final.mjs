import { strict as assert } from "node:assert";
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { chromium } from "/tmp/social-journal-playwright-runtime/node_modules/playwright/index.mjs";

const frontendUrl = (
  process.env.EVENTS_FRONTEND_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
const populatedAccessToken = process.env.SJ_ACCESS_TOKEN;
const browserPath =
  process.env.EVENTS_CHROMIUM_PATH ??
  "/tmp/social-journal-playwright-browsers/chromium-1228/chrome-linux64/chrome";
const artifactDir =
  process.env.EVENTS_ARTIFACT_DIR ??
  fileURLToPath(new URL(".", import.meta.url));

if (!populatedAccessToken) {
  throw new Error(
    "SJ_ACCESS_TOKEN is required for the populated Events QA run.",
  );
}

await mkdir(artifactDir, { recursive: true });

const diagnostics = {
  startedAt: new Date().toISOString(),
  frontendUrl,
  emptyStateMode: "filtered-empty",
  screenshots: [],
  checks: [],
  failures: [],
  notes: [],
  scenarios: {},
  consoleErrors: [],
  pageErrors: [],
  requestFailures: [],
};

const browserLaunchOptions = {
  headless: true,
  executablePath: browserPath,
  args: [
    "--database=/tmp/social-journal-playwright-artifacts/crash-db",
    "--force-color-profile=srgb",
  ],
};

let editPath = null;

try {
  await scenario("browser-populated-expanded-1440x900", async () => {
    await withPage(
      {
        token: populatedAccessToken,
        viewport: { width: 1440, height: 900 },
        sidebarExpanded: true,
      },
      async (page) => {
        await gotoStable(page, "/events", /^Events$/);
        await assertSidebarState(page, "expanded");
        await assertDisplayState(page, "grid");
        await waitForNumericEventLink(page);

        const eventLinks = await numericEventLinks(page);
        check(
          "populated browser contains real Event rows",
          eventLinks.length > 0,
          `${eventLinks.length} numeric Event links`,
        );
        editPath = eventLinks[0] ? `${eventLinks[0]}/edit` : null;

        const upcomingCards = await sectionCardCount(page, "Coming up");
        if (upcomingCards == null) {
          note(
            "The populated account has no currently upcoming Events; the Coming up section correctly collapsed.",
          );
        } else {
          check(
            "Coming up renders no more than two cards",
            upcomingCards <= 2,
            `${upcomingCards} cards`,
          );
        }

        await capture(page, "events-browser-populated-final.png");
        await exerciseFilterPopover(page, "desktop browser");
        await exercisePaginationIfAvailable(page);
      },
    );
  });

  await scenario("browser-list-collapsed-1280x800", async () => {
    await withPage(
      {
        token: populatedAccessToken,
        viewport: { width: 1280, height: 800 },
        sidebarExpanded: false,
      },
      async (page) => {
        await gotoStable(page, "/events?display=list", /^Events$/);
        await waitForNumericEventLink(page);
        await page.mouse.move(1260, 400);
        await page.waitForTimeout(250);
        await assertSidebarState(page, "collapsed");
        await assertDisplayState(page, "list");
        await capture(page, "events-browser-list-final.png");
      },
    );
  });

  await scenario("browser-filtered-1024x768", async () => {
    await withPage(
      {
        token: populatedAccessToken,
        viewport: { width: 1024, height: 768 },
        sidebarExpanded: false,
      },
      async (page) => {
        await gotoStable(
          page,
          "/events?impact=positive&display=list",
          /^Events$/,
        );
        await waitForNumericEventLink(page);
        await page.mouse.move(1000, 400);
        await page.waitForTimeout(250);
        await assertSidebarState(page, "collapsed");
        await assertDisplayState(page, "list");
        check(
          "filtered browser retains the requested query",
          page.url().includes("impact=positive"),
          page.url(),
        );
        check(
          "filtered browser exposes an active removable filter",
          (await page
            .getByRole("button", { name: /Remove .*impact filter/i })
            .count()) > 0,
          "positive impact chip",
        );
        await capture(page, "events-browser-filtered-final.png");
      },
    );
  });

  await scenario("browser-empty-1440x900", async () => {
    await withPage(
      {
        token: populatedAccessToken,
        viewport: { width: 1440, height: 900 },
        sidebarExpanded: true,
      },
      async (page) => {
        const path = "/events?search=__events_visual_qa_no_match__";
        await gotoStable(page, path, /^Events$/);
        const expectedTitle = "No events match these filters";
        await page.getByRole("heading", { name: expectedTitle }).waitFor({
          state: "visible",
          timeout: 15_000,
        });
        check(
          "empty browser state is backed by the requested account/filter",
          (await numericEventLinks(page)).length === 0,
          "backend-filtered empty result",
        );
        await capture(page, "events-browser-empty-final.png");
      },
    );
  });

  await scenario("browser-mobile-390x844", async () => {
    await withPage(
      {
        token: populatedAccessToken,
        viewport: { width: 390, height: 844 },
        sidebarExpanded: true,
        isMobile: true,
      },
      async (page) => {
        await gotoStable(page, "/events", /^Events$/);
        await waitForNumericEventLink(page);
        await exerciseFilterPopover(page, "mobile browser");
        await capture(page, "events-browser-mobile-final.png");
      },
    );
  });

  await scenario("event-create-empty-and-validation-1280x800", async () => {
    await withPage(
      {
        token: populatedAccessToken,
        viewport: { width: 1280, height: 800 },
        sidebarExpanded: true,
      },
      async (page) => {
        await gotoForm(page, "/events/new", /^Create a moment$/);
        await capture(page, "event-create-empty-final.png");
        await exerciseEmptyFormValidation(page);
      },
    );
  });

  await scenario("event-create-populated-1440x900", async () => {
    await withPage(
      {
        token: populatedAccessToken,
        viewport: { width: 1440, height: 900 },
        sidebarExpanded: true,
      },
      async (page) => {
        await gotoForm(page, "/events/new", /^Create a moment$/);
        const population = await populateCreateForm(page, {
          includeParticipants: true,
          inspectParticipantPopover: true,
        });
        check(
          "populated Create Event includes multiple participants",
          population.participantCount >= 2,
          `${population.participantCount} selected participants`,
        );
        check(
          "populated Create Event exposes the details summary",
          await page
            .getByRole("heading", { name: "Details added" })
            .isVisible(),
          "Details added visible",
        );
        await page
          .getByRole("heading", { name: "People and place" })
          .evaluate((heading) =>
            heading.closest("section")?.scrollIntoView({
              block: "start",
              behavior: "instant",
            }),
          );
        await page.waitForTimeout(250);
        await capture(page, "event-create-populated-final.png");
      },
    );
  });

  await scenario("event-edit-hydration-1440x900", async () => {
    assert(
      editPath,
      "A numeric Event edit route was not discoverable from /events.",
    );

    await withPage(
      {
        token: populatedAccessToken,
        viewport: { width: 1440, height: 900 },
        sidebarExpanded: true,
      },
      async (page) => {
        await gotoForm(page, editPath, /^Edit moment$/);
        const hydration = await page.evaluate(() => ({
          title: document.querySelector("#event-title")?.value ?? "",
          description:
            document.querySelector("#event-description")?.value ?? "",
          end: document.querySelector("#event-end")?.value ?? "",
          location: document.querySelector("#event-location")?.value ?? "",
          selectedContacts: document.querySelectorAll('[aria-label^="Remove "]')
            .length,
          fixedStartVisible: document.body.textContent?.includes(
            "Start time is fixed after a moment is created.",
          ),
        }));
        check(
          "edit form hydrates its title",
          Boolean(hydration.title.trim()),
          hydration,
        );
        check(
          "edit form preserves the fixed-start contract",
          Boolean(hydration.fixedStartVisible),
          hydration,
        );
        diagnostics.scenarios["event-edit-hydration-1440x900"].hydration =
          hydration;
        await capture(page, "event-edit-final.png");
      },
    );
  });

  await scenario("event-form-mobile-390x844", async () => {
    await withPage(
      {
        token: populatedAccessToken,
        viewport: { width: 390, height: 844 },
        sidebarExpanded: true,
        isMobile: true,
      },
      async (page) => {
        await gotoForm(page, "/events/new", /^Create a moment$/);
        await populateCreateForm(page, { includeParticipants: false });
        const footer = page.locator("#event-form footer");
        await footer.scrollIntoViewIfNeeded();
        await page.waitForTimeout(250);
        const footerPosition = await footer.evaluate(
          (element) => getComputedStyle(element).position,
        );
        check(
          "mobile form actions remain in normal flow",
          footerPosition !== "sticky" && footerPosition !== "fixed",
          `position: ${footerPosition}`,
        );
        await capture(page, "event-form-mobile-final.png");
      },
    );
  });

  await scenario("event-form-200-percent-equivalent", async () => {
    await withPage(
      {
        token: populatedAccessToken,
        viewport: { width: 720, height: 450 },
        deviceScaleFactor: 2,
        sidebarExpanded: false,
      },
      async (page) => {
        await gotoForm(page, "/events/new", /^Create a moment$/);
        await populateCreateForm(page, { includeParticipants: false });
        check(
          "200% equivalent uses a 720 by 450 CSS viewport at DPR 2",
          await page.evaluate(
            () =>
              innerWidth === 720 &&
              innerHeight === 450 &&
              devicePixelRatio === 2,
          ),
          await page.evaluate(() => ({
            cssViewport: [innerWidth, innerHeight],
            devicePixelRatio,
          })),
        );
        await page.evaluate(() =>
          window.scrollTo({ top: 0, behavior: "instant" }),
        );
        await page.waitForTimeout(250);
        await capture(page, "event-form-zoom-final.png");
      },
    );
  });
} finally {
  diagnostics.finishedAt = new Date().toISOString();
  diagnostics.editPath = editPath;
  await writeFile(
    `${artifactDir}/events-visual-qa-diagnostics.json`,
    `${JSON.stringify(diagnostics, null, 2)}\n`,
    "utf8",
  );
}

console.log(
  JSON.stringify(
    {
      screenshots: diagnostics.screenshots,
      scenarios: diagnostics.scenarios,
      checks: diagnostics.checks.length,
      failures: diagnostics.failures,
      diagnostics: `${artifactDir}/events-visual-qa-diagnostics.json`,
    },
    null,
    2,
  ),
);

if (diagnostics.failures.length > 0) {
  throw new Error(
    `Events visual QA finished with ${diagnostics.failures.length} failed check(s).`,
  );
}

async function scenario(name, callback) {
  diagnostics.scenarios[name] = { status: "running" };
  try {
    await callback();
    if (diagnostics.scenarios[name].status === "running") {
      diagnostics.scenarios[name].status = "passed";
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.stack || error.message : String(error);
    diagnostics.scenarios[name].status = "failed";
    diagnostics.scenarios[name].error = message;
    diagnostics.failures.push({ name: `scenario: ${name}`, detail: message });
  }
}

async function withPage(options, callback) {
  const scenarioBrowser = await chromium.launch(browserLaunchOptions);
  const context = await scenarioBrowser.newContext({
    viewport: options.viewport,
    screen: options.viewport,
    deviceScaleFactor: options.deviceScaleFactor ?? 1,
    colorScheme: "light",
    reducedMotion: "reduce",
    locale: "en-US",
    timezoneId: "America/Chicago",
    isMobile: options.isMobile ?? false,
  });

  await context.addCookies([
    {
      name: "sj_access",
      value: options.token,
      url: frontendUrl,
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: "sidebar_state",
      value: options.sidebarExpanded ? "true" : "false",
      url: frontendUrl,
      sameSite: "Lax",
    },
  ]);

  const page = await context.newPage();
  attachRuntimeDiagnostics(page);

  try {
    await callback(page, context);
  } finally {
    await context.close();
    await scenarioBrowser.close();
  }
}

function attachRuntimeDiagnostics(page) {
  page.on("console", (message) => {
    if (message.type() === "error") {
      diagnostics.consoleErrors.push({ url: page.url(), text: message.text() });
    }
  });
  page.on("pageerror", (error) => {
    diagnostics.pageErrors.push({ url: page.url(), message: error.message });
  });
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText ?? "unknown";
    if (!failure.includes("ERR_ABORTED")) {
      diagnostics.requestFailures.push({
        method: request.method(),
        url: request.url(),
        error: failure,
      });
    }
  });
}

async function gotoStable(page, path, headingName) {
  await page.goto(`${frontendUrl}${path}`, { waitUntil: "domcontentloaded" });
  await hideDevelopmentBadge(page);
  await waitForReactHydration(page);
  await page.getByRole("heading", { level: 1, name: headingName }).waitFor({
    state: "visible",
    timeout: 20_000,
  });
  check(
    `route ${path} remains authenticated`,
    !page.url().includes("/auth/login"),
    page.url(),
  );
  await page
    .waitForLoadState("networkidle", { timeout: 10_000 })
    .catch(() => {});
  await page
    .locator('[aria-label="Loading events"]')
    .waitFor({ state: "hidden", timeout: 15_000 })
    .catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
}

async function gotoForm(page, path, headingName) {
  await gotoStable(page, path, headingName);
  await page
    .locator("#event-form")
    .waitFor({ state: "visible", timeout: 20_000 });
  await page
    .getByRole("radiogroup", { name: "Category" })
    .waitFor({ state: "visible", timeout: 15_000 });
  await page.waitForFunction(
    () => document.querySelectorAll('[role="radio"]').length > 1,
    null,
    { timeout: 15_000 },
  );
  await page.waitForTimeout(250);
}

async function waitForReactHydration(page) {
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll("body *")].some((element) =>
        Object.keys(element).some(
          (key) =>
            key.startsWith("__reactFiber$") || key.startsWith("__reactProps$"),
        ),
      ),
    null,
    { timeout: 15_000 },
  );
}

async function hideDevelopmentBadge(page) {
  await page.addStyleTag({
    content: "nextjs-portal { display: none !important; }",
  });
}

async function capture(page, filename) {
  await hideDevelopmentBadge(page);
  await page.waitForTimeout(100);
  const geometry = await inspectGeometry(page);
  check(
    `${filename} has no horizontal page overflow`,
    !geometry.horizontalOverflow,
    geometry,
  );
  const path = `${artifactDir}/${filename}`;
  await page.screenshot({ path, fullPage: false });
  diagnostics.screenshots.push(path);
  diagnostics.scenarios[currentScenarioName()] ??= { status: "running" };
  diagnostics.scenarios[currentScenarioName()].geometry = geometry;
}

function currentScenarioName() {
  return (
    Object.entries(diagnostics.scenarios)
      .reverse()
      .find(([, value]) => value.status === "running")?.[0] ?? "unassigned"
  );
}

async function inspectGeometry(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    return {
      cssViewport: {
        width: innerWidth,
        height: innerHeight,
        devicePixelRatio,
      },
      document: {
        clientWidth: root.clientWidth,
        scrollWidth: root.scrollWidth,
        bodyClientWidth: body.clientWidth,
        bodyScrollWidth: body.scrollWidth,
        scrollHeight: root.scrollHeight,
      },
      horizontalOverflow:
        root.scrollWidth > root.clientWidth + 1 ||
        body.scrollWidth > body.clientWidth + 1,
    };
  });
}

async function assertSidebarState(page, expected) {
  const sidebar = page.locator('[data-slot="sidebar"][data-state]').first();
  if ((await sidebar.count()) === 0) {
    check(`desktop sidebar is ${expected}`, false, "sidebar element missing");
    return;
  }
  const state = await sidebar.getAttribute("data-state");
  check(
    `desktop sidebar is ${expected}`,
    state === expected,
    `data-state=${state}`,
  );
}

async function assertDisplayState(page, expected) {
  const active = page.getByRole("button", {
    name: expected === "grid" ? "Grid view" : "List view",
  });
  const inactive = page.getByRole("button", {
    name: expected === "grid" ? "List view" : "Grid view",
  });
  check(
    `${expected} browser display is selected`,
    (await active.getAttribute("aria-pressed")) === "true" &&
      (await inactive.getAttribute("aria-pressed")) === "false",
    {
      active: await active.getAttribute("aria-pressed"),
      inactive: await inactive.getAttribute("aria-pressed"),
    },
  );
}

async function numericEventLinks(page) {
  const hrefs = await page
    .locator('a[href^="/events/"]')
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")).filter(Boolean),
    );
  return [...new Set(hrefs.filter((href) => /^\/events\/\d+$/.test(href)))];
}

async function waitForNumericEventLink(page) {
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll('a[href^="/events/"]')].some((link) =>
        /^\/events\/\d+$/.test(link.getAttribute("href") ?? ""),
      ),
    null,
    { timeout: 20_000 },
  );
  await page.waitForTimeout(250);
}

async function sectionCardCount(page, heading) {
  const sectionHeading = page.getByRole("heading", {
    name: heading,
    exact: true,
  });
  if (
    (await sectionHeading.count()) === 0 ||
    !(await sectionHeading.isVisible())
  ) {
    return null;
  }
  return sectionHeading
    .locator("xpath=ancestor::section[1]")
    .locator('a[href^="/events/"]')
    .count();
}

async function exerciseFilterPopover(page, label) {
  const trigger = page.getByRole("button", { name: /^Filters(?: · \d+)?$/ });
  await trigger.click();
  const content = page.locator('[data-slot="popover-content"]').filter({
    has: page.getByText("Filter events", { exact: true }),
  });
  await content.waitFor({ state: "visible", timeout: 5_000 });
  await page.waitForTimeout(250);
  await assertPopoverBounds(page, content, `${label} filter popover`);
  await page.keyboard.press("Escape");
  await content.waitFor({ state: "hidden", timeout: 5_000 });
  await page.waitForTimeout(250);
  check(
    `${label} filter popover closes with Escape`,
    !(await content.isVisible()),
    "popover hidden",
  );
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await trigger.focus();
  const focus = await trigger.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      active: document.activeElement === element,
      focusVisible: element.matches(":focus-visible"),
      boxShadow: style.boxShadow,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });
  check(
    `${label} Filters action has a keyboard-visible focus treatment`,
    focus.active &&
      focus.focusVisible &&
      (focus.boxShadow !== "none" ||
        (focus.outlineStyle !== "none" && focus.outlineWidth !== "0px")),
    focus,
  );
}

async function assertPopoverBounds(page, content, label) {
  const box = await content.boundingBox();
  const viewport = page.viewportSize();
  const scroll = await content.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  check(
    `${label} stays within the viewport`,
    Boolean(
      box &&
      viewport &&
      box.x >= -1 &&
      box.y >= -1 &&
      box.x + box.width <= viewport.width + 1 &&
      box.y + box.height <= viewport.height + 1,
    ),
    { box, viewport },
  );
  check(
    `${label} has no horizontal internal overflow`,
    scroll.scrollWidth <= scroll.clientWidth + 1,
    scroll,
  );
}

async function exercisePaginationIfAvailable(page) {
  const pagination = page.getByRole("navigation", { name: "Event pages" });
  if ((await pagination.count()) === 0) {
    note(
      "Pagination was not rendered because the populated result count fit on one page.",
    );
    return;
  }

  const previous = pagination.getByRole("button", { name: "Previous page" });
  const next = pagination.getByRole("button", { name: "Next page" });
  check(
    "pagination starts with Previous disabled",
    await previous.isDisabled(),
    "page 1",
  );
  check(
    "pagination exposes an accessible current page",
    (await pagination.locator('[aria-current="page"]').count()) === 1,
    await pagination.textContent(),
  );

  if (!(await next.isDisabled())) {
    await next.click();
    await page.waitForURL((url) => url.searchParams.get("page") === "2", {
      timeout: 10_000,
    });
    await page
      .locator('[aria-label="Loading events"]')
      .waitFor({ state: "hidden", timeout: 15_000 })
      .catch(() => {});
    check(
      "pagination advances through backend-backed pages",
      new URL(page.url()).searchParams.get("page") === "2",
      page.url(),
    );
  } else {
    note("Pagination rendered a single page, so Next was correctly disabled.");
  }
}

async function exerciseEmptyFormValidation(page) {
  await page.getByRole("button", { name: "Create event" }).click();
  await page.locator('#event-form [role="alert"]').first().waitFor({
    state: "visible",
    timeout: 5_000,
  });
  await page.waitForTimeout(250);
  const emptyValidation = await page.evaluate(() => ({
    activeId: document.activeElement?.id ?? null,
    alerts: [...document.querySelectorAll('#event-form [role="alert"]')].map(
      (item) => item.textContent?.trim(),
    ),
  }));
  check(
    "empty Create Event focuses the first invalid field",
    emptyValidation.activeId === "event-title",
    emptyValidation,
  );
  check(
    "empty Create Event renders adjacent validation messages",
    emptyValidation.alerts.length >= 2,
    emptyValidation,
  );

  await page.getByLabel("Title").fill("Validation focus check");
  await page.getByLabel("Starts").fill("2026-07-24T21:15");
  await page.getByLabel("Ends (optional)").fill("2026-07-24T18:30");
  await page.getByRole("button", { name: "Create event" }).click();
  await page.waitForTimeout(250);
  const rangeValidation = await page.evaluate(() => ({
    activeId: document.activeElement?.id ?? null,
    endError:
      document.querySelector("#event-end-error")?.textContent?.trim() ?? null,
  }));
  check(
    "invalid date range focuses the End field",
    rangeValidation.activeId === "event-end" &&
      Boolean(rangeValidation.endError),
    rangeValidation,
  );
}

async function populateCreateForm(
  page,
  { includeParticipants = false, inspectParticipantPopover = false } = {},
) {
  await page
    .getByLabel("Title")
    .fill("A thoughtfully planned summer evening with friends and family");
  await page.getByLabel("Starts").fill("2026-07-24T18:30");
  await page.getByLabel("Ends (optional)").fill("2026-07-24T21:15");
  await page
    .getByLabel("Description")
    .fill(
      "Dinner, conversation, and a long walk through the neighborhood after sunset.",
    );
  await page
    .getByLabel("Place (optional)")
    .fill("The Garden Room at Riverside Community House");

  const social = page.getByRole("radio", { name: "Social", exact: true });
  if ((await social.count()) > 0) {
    await social.click();
  } else {
    const categoryOptions = page
      .getByRole("radiogroup", { name: "Category" })
      .getByRole("radio");
    const index = (await categoryOptions.count()) > 1 ? 1 : 0;
    await categoryOptions.nth(index).click();
    note(
      "The Social category was unavailable; the first available saved category was used.",
    );
  }

  let participantCount = 0;
  if (includeParticipants || inspectParticipantPopover) {
    participantCount = await exerciseParticipantPopover(page, {
      selectParticipants: includeParticipants ? 2 : 0,
      inspectBounds: inspectParticipantPopover,
    });
  }

  const details = page.getByRole("button", { name: /More details/ });
  if ((await details.getAttribute("aria-expanded")) !== "true") {
    await details.click();
  }
  await page.getByLabel("Significance").selectOption("milestone");
  await page.getByLabel("Impact").selectOption("positive");
  await selectFirstRealOption(page.getByLabel("Interaction"));
  await selectFirstRealOption(page.getByLabel("Mood"));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);

  return { participantCount };
}

async function exerciseParticipantPopover(
  page,
  { selectParticipants, inspectBounds },
) {
  const trigger = page.getByRole("button", { name: "Add person" });
  await trigger.click();
  const content = page.locator('[data-slot="popover-content"]').filter({
    has: page.getByText("Add people", { exact: true }),
  });
  await content.waitFor({ state: "visible", timeout: 5_000 });
  await page.waitForTimeout(250);

  if (inspectBounds) {
    await assertPopoverBounds(page, content, "participant picker popover");
  }

  const search = page.getByRole("searchbox", { name: "Search people to add" });
  check(
    "participant picker moves focus into search",
    await search.evaluate((element) => document.activeElement === element),
    "search input focused",
  );

  await page.keyboard.press("Escape");
  await content.waitFor({ state: "hidden", timeout: 5_000 });
  await page.waitForTimeout(250);
  check(
    "participant picker closes with Escape",
    !(await content.isVisible()),
    "popover hidden",
  );

  if (selectParticipants === 0) return 0;

  await trigger.click();
  await content.waitFor({ state: "visible", timeout: 5_000 });
  await page.waitForTimeout(250);
  const resultRegion = page.getByRole("region", {
    name: "People search results",
  });
  await page
    .waitForFunction(
      () => {
        const region = document.querySelector(
          '[role="region"][aria-label="People search results"]',
        );
        return region?.getAttribute("aria-busy") === "false";
      },
      null,
      { timeout: 15_000 },
    )
    .catch(() => {});

  for (let index = 0; index < selectParticipants; index += 1) {
    const buttons = resultRegion.getByRole("button");
    if ((await buttons.count()) === 0) break;
    await buttons.first().click();
    await page.waitForTimeout(150);
  }

  await page.keyboard.press("Escape");
  await content.waitFor({ state: "hidden", timeout: 5_000 });
  await page.waitForTimeout(250);
  return page.locator('#event-form [aria-label^="Remove "]').count();
}

async function selectFirstRealOption(select) {
  if ((await select.locator("option").count()) > 1) {
    await select.selectOption({ index: 1 });
  }
}

function check(name, pass, detail) {
  const result = { name, pass: Boolean(pass), detail: serializable(detail) };
  diagnostics.checks.push(result);
  if (!result.pass) diagnostics.failures.push({ name, detail: result.detail });
  return result.pass;
}

function note(message) {
  diagnostics.notes.push(message);
}

function serializable(value) {
  if (value == null || typeof value === "string" || typeof value === "number") {
    return value;
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}
