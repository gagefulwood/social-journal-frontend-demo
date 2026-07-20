import { strict as assert } from "node:assert";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { chromium } from "/tmp/social-journal-playwright-runtime/node_modules/playwright/index.mjs";

const frontendUrl = (
  process.env.EVENT_DETAIL_FRONTEND_URL ??
  process.env.EVENTS_FRONTEND_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");
const apiUrl = (
  process.env.EVENT_DETAIL_API_URL ?? "http://localhost:8000"
).replace(/\/$/, "");
const accessToken = process.env.SJ_ACCESS_TOKEN;
const richEventId = process.env.SJ_RICH_EVENT_ID;
const noMediaEventId = process.env.SJ_NO_MEDIA_EVENT_ID;
const legacyEventId = process.env.SJ_LEGACY_EVENT_ID;
const multiEventId = process.env.SJ_MULTI_EVENT_ID ?? richEventId;
const browserPath =
  process.env.EVENT_DETAIL_CHROMIUM_PATH ??
  process.env.EVENTS_CHROMIUM_PATH ??
  "/tmp/social-journal-playwright-browsers/chromium-1228/chrome-linux64/chrome";
const artifactDir =
  process.env.EVENT_DETAIL_ARTIFACT_DIR ??
  fileURLToPath(new URL(".", import.meta.url));

const missingEnvironment = [
  ["SJ_ACCESS_TOKEN", accessToken],
  ["SJ_RICH_EVENT_ID", richEventId],
  ["SJ_NO_MEDIA_EVENT_ID", noMediaEventId],
  ["SJ_LEGACY_EVENT_ID", legacyEventId],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingEnvironment.length > 0) {
  throw new Error(
    `Event Detail visual QA requires: ${missingEnvironment.join(", ")}. ` +
      "SJ_MULTI_EVENT_ID is optional and falls back to SJ_RICH_EVENT_ID.",
  );
}

await mkdir(artifactDir, { recursive: true });

const diagnostics = {
  startedAt: new Date().toISOString(),
  finishedAt: null,
  frontendUrl,
  apiUrl,
  eventIds: {
    rich: richEventId,
    noMedia: noMediaEventId,
    legacy: legacyEventId,
    multi: multiEventId,
    multiSource: process.env.SJ_MULTI_EVENT_ID
      ? "SJ_MULTI_EVENT_ID"
      : "SJ_RICH_EVENT_ID fallback",
  },
  screenshots: [],
  checks: [],
  failures: [],
  notes: [],
  scenarios: {},
  consoleErrors: [],
  pageErrors: [],
  requestFailures: [],
  mediaResponses: [],
};

const browserLaunchOptions = {
  headless: true,
  executablePath: browserPath,
  args: [
    "--database=/tmp/social-journal-playwright-artifacts/crash-db",
    "--force-color-profile=srgb",
  ],
};

let browser;

try {
  browser = await chromium.launch(browserLaunchOptions);

  await scenario("rich-desktop-1440x900", async (scenarioName) => {
    await withEventPage(
      scenarioName,
      {
        eventId: richEventId,
        viewport: { width: 1440, height: 900 },
        sidebarExpanded: true,
        expectMediaContent: true,
      },
      async (page) => {
        await assertEventDetailBasics(page, richEventId);
        await assertRichState(page);
        await capture(page, scenarioName, "event-detail-rich-desktop.png");
      },
    );
  });

  await scenario("no-media-desktop-1440x900", async (scenarioName) => {
    await withEventPage(
      scenarioName,
      {
        eventId: noMediaEventId,
        viewport: { width: 1440, height: 900 },
        sidebarExpanded: true,
      },
      async (page) => {
        await assertEventDetailBasics(page, noMediaEventId);
        await assertNoMediaState(page);
        await capture(page, scenarioName, "event-detail-no-media-desktop.png");
      },
    );
  });

  await scenario("multiple-chapters-1280x800", async (scenarioName) => {
    await withEventPage(
      scenarioName,
      {
        eventId: multiEventId,
        viewport: { width: 1280, height: 800 },
        sidebarExpanded: false,
      },
      async (page) => {
        await assertEventDetailBasics(page, multiEventId);
        await exerciseChapterKeyboardNavigation(page, scenarioName);
        await capture(page, scenarioName, "event-detail-multiple-chapters.png");
      },
    );
  });

  await scenario("legacy-projection-1024x768", async (scenarioName) => {
    await withEventPage(
      scenarioName,
      {
        eventId: legacyEventId,
        viewport: { width: 1024, height: 768 },
        sidebarExpanded: false,
      },
      async (page) => {
        await assertEventDetailBasics(page, legacyEventId);
        await assertLegacyProjection(page);
        await capture(page, scenarioName, "event-detail-legacy-projection.png");
      },
    );
  });

  await scenario("rich-mobile-390x844", async (scenarioName) => {
    await withEventPage(
      scenarioName,
      {
        eventId: richEventId,
        viewport: { width: 390, height: 844 },
        sidebarExpanded: true,
        isMobile: true,
        expectMediaContent: true,
      },
      async (page) => {
        await assertEventDetailBasics(page, richEventId);
        await assertRichState(page);
        await capture(page, scenarioName, "event-detail-rich-mobile.png");
      },
    );
  });

  await scenario("no-media-mobile-390x844", async (scenarioName) => {
    await withEventPage(
      scenarioName,
      {
        eventId: noMediaEventId,
        viewport: { width: 390, height: 844 },
        sidebarExpanded: true,
        isMobile: true,
      },
      async (page) => {
        await assertEventDetailBasics(page, noMediaEventId);
        await assertNoMediaState(page);
        await capture(page, scenarioName, "event-detail-no-media-mobile.png");
      },
    );
  });

  await scenario("rich-200-percent-equivalent", async (scenarioName) => {
    await withEventPage(
      scenarioName,
      {
        eventId: richEventId,
        viewport: { width: 720, height: 450 },
        deviceScaleFactor: 2,
        sidebarExpanded: false,
        expectMediaContent: true,
      },
      async (page) => {
        await assertEventDetailBasics(page, richEventId);
        await assertRichState(page);
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
          scenarioName,
        );
        await capture(page, scenarioName, "event-detail-rich-zoom-200.png");
      },
    );
  });
} catch (error) {
  const message = errorMessage(error);
  diagnostics.failures.push({
    name: "visual QA harness",
    scenario: null,
    detail: message,
  });
} finally {
  if (browser) await browser.close();
  diagnostics.finishedAt = new Date().toISOString();
  await writeFile(
    `${artifactDir}/event-detail-media-visual-qa-summary.json`,
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
      diagnostics: `${artifactDir}/event-detail-media-visual-qa-summary.json`,
    },
    null,
    2,
  ),
);

if (diagnostics.failures.length > 0) {
  throw new Error(
    `Event Detail visual QA finished with ${diagnostics.failures.length} failed check(s).`,
  );
}

async function scenario(name, callback) {
  diagnostics.scenarios[name] = {
    status: "running",
    screenshots: [],
    geometry: [],
  };
  try {
    await callback(name);
    diagnostics.scenarios[name].status = diagnostics.failures.some(
      (failure) => failure.scenario === name,
    )
      ? "failed"
      : "passed";
  } catch (error) {
    const message = errorMessage(error);
    diagnostics.scenarios[name].status = "failed";
    diagnostics.scenarios[name].error = message;
    diagnostics.failures.push({
      name: `scenario: ${name}`,
      scenario: name,
      detail: message,
    });
  }
}

async function withEventPage(scenarioName, options, callback) {
  const context = await browser.newContext({
    viewport: options.viewport,
    screen: options.viewport,
    deviceScaleFactor: options.deviceScaleFactor ?? 1,
    colorScheme: "light",
    reducedMotion: "reduce",
    locale: "en-US",
    timezoneId: "America/Chicago",
    isMobile: options.isMobile ?? false,
  });

  const cookieOrigins = distinctCookieOrigins(frontendUrl, apiUrl);
  await context.addCookies(
    cookieOrigins.flatMap((url) => [
      {
        name: "sj_access",
        value: accessToken,
        url,
        httpOnly: true,
        sameSite: "Lax",
      },
      ...(url === frontendUrl
        ? [
            {
              name: "sidebar_state",
              value: options.sidebarExpanded ? "true" : "false",
              url,
              sameSite: "Lax",
            },
          ]
        : []),
    ]),
  );

  const page = await context.newPage();
  const runtimeStart = attachRuntimeDiagnostics(page, scenarioName);

  try {
    await gotoEventStable(page, options.eventId, scenarioName);
    await callback(page, context);
    await page.waitForTimeout(250);
    assertRuntimeHealth(
      scenarioName,
      runtimeStart,
      options.expectMediaContent ?? false,
    );
  } finally {
    await context.close();
  }
}

function distinctCookieOrigins(...values) {
  const seen = new Set();
  return values.filter((value) => {
    const url = new URL(value);
    const key = `${url.protocol}//${url.hostname}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function attachRuntimeDiagnostics(page, scenarioName) {
  const start = {
    consoleErrors: diagnostics.consoleErrors.length,
    pageErrors: diagnostics.pageErrors.length,
    requestFailures: diagnostics.requestFailures.length,
    mediaResponses: diagnostics.mediaResponses.length,
  };

  page.on("console", (message) => {
    if (message.type() === "error") {
      diagnostics.consoleErrors.push({
        scenario: scenarioName,
        url: page.url(),
        text: message.text(),
      });
    }
  });
  page.on("pageerror", (error) => {
    diagnostics.pageErrors.push({
      scenario: scenarioName,
      url: page.url(),
      message: error.message,
    });
  });
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText ?? "unknown";
    if (!isExpectedAbortedRequest(failure)) {
      diagnostics.requestFailures.push({
        scenario: scenarioName,
        method: request.method(),
        resourceType: request.resourceType(),
        url: request.url(),
        error: failure,
      });
    }
  });
  page.on("response", (response) => {
    if (isMediaContentUrl(response.url())) {
      diagnostics.mediaResponses.push({
        scenario: scenarioName,
        method: response.request().method(),
        resourceType: response.request().resourceType(),
        url: response.url(),
        status: response.status(),
        fromServiceWorker: response.fromServiceWorker(),
      });
    }
  });
  return start;
}

function assertRuntimeHealth(scenarioName, start, expectMediaContent) {
  const consoleErrors = diagnostics.consoleErrors.slice(start.consoleErrors);
  const pageErrors = diagnostics.pageErrors.slice(start.pageErrors);
  const requestFailures = diagnostics.requestFailures.slice(
    start.requestFailures,
  );
  const mediaResponses = diagnostics.mediaResponses.slice(start.mediaResponses);
  const failedMedia = mediaResponses.filter(
    (response) => response.status >= 400,
  );

  diagnostics.scenarios[scenarioName].runtime = {
    consoleErrors,
    pageErrors,
    requestFailures,
    mediaResponses,
  };
  check(
    `${scenarioName} emits no browser console errors`,
    consoleErrors.length === 0,
    consoleErrors,
    scenarioName,
  );
  check(
    `${scenarioName} emits no uncaught page errors`,
    pageErrors.length === 0,
    pageErrors,
    scenarioName,
  );
  check(
    `${scenarioName} has no unexpected failed requests`,
    requestFailures.length === 0,
    requestFailures,
    scenarioName,
  );
  check(
    `${scenarioName} media content has no 4xx or 5xx response`,
    failedMedia.length === 0,
    failedMedia,
    scenarioName,
  );
  if (expectMediaContent) {
    check(
      `${scenarioName} loads authenticated media content`,
      mediaResponses.length > 0,
      mediaResponses,
      scenarioName,
    );
  }
}

async function gotoEventStable(page, eventId, scenarioName) {
  const path = `/events/${encodeURIComponent(eventId)}`;
  await page.goto(`${frontendUrl}${path}`, { waitUntil: "domcontentloaded" });
  await hideDevelopmentBadge(page);
  await waitForReactHydration(page);
  await page.getByRole("heading", { level: 1 }).waitFor({
    state: "visible",
    timeout: 20_000,
  });
  await page
    .locator('[aria-label="Loading Event detail"]')
    .waitFor({ state: "hidden", timeout: 20_000 })
    .catch(() => {});
  await page.getByRole("tablist", { name: "Event chapters" }).waitFor({
    state: "visible",
    timeout: 20_000,
  });
  await page.locator("#selected-chapter-panel").waitFor({
    state: "visible",
    timeout: 20_000,
  });
  await page
    .waitForLoadState("networkidle", { timeout: 10_000 })
    .catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await waitForVisibleMedia(page);
  await page.waitForTimeout(350);

  check(
    `route ${path} remains authenticated`,
    !page.url().includes("/auth/login"),
    page.url(),
    scenarioName,
  );
  check(
    `route ${path} does not render an Event error state`,
    (await page.getByText("Unable to load event", { exact: true }).count()) ===
      0 &&
      (await page.getByText("Event not found", { exact: true }).count()) === 0,
    await page.locator("body").innerText(),
    scenarioName,
  );
}

async function assertEventDetailBasics(page, eventId) {
  const scenarioName = currentScenarioName();
  const title = (
    await page.getByRole("heading", { level: 1 }).innerText()
  ).trim();
  check(
    `Event ${eventId} exposes a non-empty primary heading`,
    title.length > 0,
    title,
    scenarioName,
  );
  check(
    `Event ${eventId} renders the Event hero`,
    (await page.locator('section[aria-labelledby="event-title"]').count()) ===
      1,
    "one Event hero",
    scenarioName,
  );
  check(
    `Event ${eventId} renders the media count strip`,
    await page
      .getByRole("region", { name: "Event media collection summary" })
      .isVisible(),
    "Event media collection summary",
    scenarioName,
  );
  check(
    `Event ${eventId} renders chapter navigation`,
    (await page
      .getByRole("heading", { name: "How this moment unfolded" })
      .count()) === 1 &&
      (await page
        .getByRole("tablist", { name: "Event chapters" })
        .getByRole("tab")
        .count()) > 0,
    "chapter heading and at least one tab",
    scenarioName,
  );
  check(
    `Event ${eventId} renders a selected chapter panel`,
    await page.locator("#selected-chapter-panel").isVisible(),
    await page
      .locator("#selected-chapter-heading")
      .innerText()
      .catch(() => "missing selected chapter heading"),
    scenarioName,
  );
  check(
    `Event ${eventId} renders the whole-Event Journal perspective`,
    (await page
      .getByRole("heading", { name: "Event perspective", exact: true })
      .count()) === 1,
    "Event perspective",
    scenarioName,
  );
  check(
    `Event ${eventId} renders related moments`,
    (await page
      .getByRole("heading", { name: "Related moments", exact: true })
      .count()) === 1,
    "Related moments",
    scenarioName,
  );
}

async function assertRichState(page) {
  const scenarioName = currentScenarioName();
  const hero = page.locator('section[aria-labelledby="event-title"]');
  const heroMedia = hero.locator("img, video");
  const renderedMedia = await heroMedia.evaluateAll((elements) =>
    elements.map((element) =>
      element instanceof HTMLImageElement
        ? {
            kind: "image",
            url: element.currentSrc || element.src,
            complete: element.complete,
            naturalWidth: element.naturalWidth,
          }
        : {
            kind: "video",
            url:
              element.currentSrc || element.querySelector("source")?.src || "",
            readyState: element.readyState,
          },
    ),
  );
  check(
    `${scenarioName} uses the rich media hero`,
    renderedMedia.length > 0 &&
      renderedMedia.some((item) =>
        item.kind === "image"
          ? item.complete && item.naturalWidth > 0
          : item.readyState >= 1,
      ),
    renderedMedia,
    scenarioName,
  );

  const summaryText = await page
    .getByRole("region", { name: "Event media collection summary" })
    .innerText();
  check(
    `${scenarioName} reports at least one media item`,
    /\b[1-9]\d*\s+media item(?:s)?\b/i.test(summaryText),
    summaryText,
    scenarioName,
  );
}

async function assertNoMediaState(page) {
  const scenarioName = currentScenarioName();
  const hero = page.locator('section[aria-labelledby="event-title"]');
  const summaryText = await page
    .getByRole("region", { name: "Event media collection summary" })
    .innerText();
  check(
    `${scenarioName} uses the intentional no-media hero`,
    (await hero.locator("img, video").count()) === 0 &&
      (await hero
        .getByRole("button", { name: "Add photos or video" })
        .count()) === 1,
    await hero.innerText(),
    scenarioName,
  );
  check(
    `${scenarioName} reports zero media items`,
    /\b0\s+media items\b/i.test(summaryText),
    summaryText,
    scenarioName,
  );
}

async function exerciseChapterKeyboardNavigation(page, scenarioName) {
  const tablist = page.getByRole("tablist", { name: "Event chapters" });
  const tabs = tablist.getByRole("tab");
  const count = await tabs.count();
  assert(
    count >= 2,
    `Multiple-chapter QA requires at least two chapter tabs; received ${count}.`,
  );

  const selectedBefore = tablist.locator('[role="tab"][aria-selected="true"]');
  assert.equal(
    await selectedBefore.count(),
    1,
    "Exactly one chapter tab must be selected before keyboard navigation.",
  );
  const titleBefore = (await selectedBefore.innerText()).trim();
  const chapterBefore = new URL(page.url()).searchParams.get("chapter");
  await selectedBefore.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(
    ({ before }) => {
      const selected = document.querySelector(
        '[role="tab"][aria-selected="true"]',
      );
      return Boolean(selected && selected.textContent?.trim() !== before);
    },
    { before: titleBefore },
    { timeout: 10_000 },
  );
  await page.waitForFunction(
    ({ before }) =>
      new URL(location.href).searchParams.get("chapter") !== before,
    { before: chapterBefore },
    { timeout: 10_000 },
  );
  await page.locator("#selected-chapter-panel").waitFor({ state: "visible" });
  await page.waitForTimeout(250);

  const selectedAfter = tablist.locator('[role="tab"][aria-selected="true"]');
  const titleAfter = (await selectedAfter.innerText()).trim();
  const chapterAfter = new URL(page.url()).searchParams.get("chapter");
  check(
    "ArrowRight selects a different chapter tab",
    titleAfter !== titleBefore && (await selectedAfter.count()) === 1,
    { titleBefore, titleAfter },
    scenarioName,
  );
  check(
    "ArrowRight updates the chapter deep link",
    Boolean(chapterAfter) && chapterAfter !== chapterBefore,
    { chapterBefore, chapterAfter, url: page.url() },
    scenarioName,
  );
  check(
    "keyboard-selected chapter keeps focus on its tab",
    await selectedAfter.evaluate(
      (element) => document.activeElement === element,
    ),
    titleAfter,
    scenarioName,
  );

  diagnostics.scenarios[scenarioName].chapterNavigation = {
    tabCount: count,
    titleBefore,
    titleAfter,
    chapterBefore,
    chapterAfter,
  };
}

async function assertLegacyProjection(page) {
  const scenarioName = currentScenarioName();
  const tabs = page
    .getByRole("tablist", { name: "Event chapters" })
    .getByRole("tab");
  const chapterQuery = new URL(page.url()).searchParams.get("chapter");
  check(
    "legacy Event exposes exactly one projected chapter",
    (await tabs.count()) === 1 && chapterQuery == null,
    { tabCount: await tabs.count(), chapterQuery, url: page.url() },
    scenarioName,
  );
  check(
    "legacy Event labels its projection as one chapter",
    (await page.getByText("One chapter", { exact: true }).count()) === 1,
    await page
      .getByRole("heading", { name: "How this moment unfolded" })
      .locator("xpath=..")
      .innerText(),
    scenarioName,
  );

  const actionButton = page.getByRole("button", { name: /^Actions for / });
  await actionButton.click();
  const projectionAction = page.getByRole("menuitem", {
    name: "Edit and create chapter",
  });
  await projectionAction.waitFor({ state: "visible", timeout: 5_000 });
  check(
    "legacy chapter remains a projection until intentional editing",
    await projectionAction.isVisible(),
    "Edit and create chapter action",
    scenarioName,
  );
  await page.keyboard.press("Escape");
}

async function capture(page, scenarioName, filename) {
  await hideDevelopmentBadge(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(100);
  const geometry = await inspectGeometry(page);
  check(
    `${filename} has no horizontal page overflow`,
    !geometry.horizontalOverflow,
    geometry,
    scenarioName,
  );
  check(
    `${filename} has no nested vertical content scroller`,
    geometry.nestedVerticalScrollers.length === 0,
    geometry.nestedVerticalScrollers,
    scenarioName,
  );

  const path = `${artifactDir}/${filename}`;
  await page.screenshot({ path, fullPage: false });
  diagnostics.screenshots.push(path);
  diagnostics.scenarios[scenarioName].screenshots.push(path);
  diagnostics.scenarios[scenarioName].geometry.push(geometry);
}

async function inspectGeometry(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const nestedVerticalScrollers = [...document.querySelectorAll("main *")]
      .filter((element) => {
        if (!(element instanceof HTMLElement)) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          ["auto", "scroll"].includes(style.overflowY) &&
          element.scrollHeight > element.clientHeight + 2
        );
      })
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        id: element.id || null,
        role: element.getAttribute("role"),
        ariaLabel: element.getAttribute("aria-label"),
        className:
          typeof element.className === "string"
            ? element.className.slice(0, 180)
            : null,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        overflowY: getComputedStyle(element).overflowY,
      }));

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
      nestedVerticalScrollers,
    };
  });
}

async function waitForVisibleMedia(page) {
  await page
    .waitForFunction(
      () =>
        [...document.querySelectorAll("main img")]
          .filter((image) => image.getBoundingClientRect().width > 0)
          .every((image) => image.complete),
      null,
      { timeout: 10_000 },
    )
    .catch(() => {});
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

function isExpectedAbortedRequest(message) {
  return [
    "ERR_ABORTED",
    "ERR_CANCELED",
    "NS_BINDING_ABORTED",
    "cancelled",
  ].some((token) => message.toLowerCase().includes(token.toLowerCase()));
}

function isMediaContentUrl(value) {
  try {
    const pathname = new URL(value).pathname;
    return (
      /\/api\/media\/[^/]+\/content\/?$/.test(pathname) ||
      pathname.startsWith("/mediafiles/")
    );
  } catch {
    return false;
  }
}

function currentScenarioName() {
  return (
    Object.entries(diagnostics.scenarios)
      .reverse()
      .find(([, value]) => value.status === "running")?.[0] ?? "unassigned"
  );
}

function check(name, pass, detail, scenario = currentScenarioName()) {
  const result = {
    name,
    scenario,
    pass: Boolean(pass),
    detail: serializable(detail),
  };
  diagnostics.checks.push(result);
  if (!result.pass) {
    diagnostics.failures.push({
      name,
      scenario,
      detail: result.detail,
    });
  }
  return result.pass;
}

function serializable(value) {
  if (
    value == null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

function errorMessage(error) {
  return error instanceof Error ? error.stack || error.message : String(error);
}
