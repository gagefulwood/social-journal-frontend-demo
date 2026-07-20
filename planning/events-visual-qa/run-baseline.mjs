import { mkdir } from "node:fs/promises";
import { chromium } from "/tmp/social-journal-playwright-runtime/node_modules/playwright/index.mjs";

const frontendUrl = process.env.EVENTS_FRONTEND_URL ?? "http://localhost:3000";
const accessToken = process.env.SJ_ACCESS_TOKEN;
const browserPath =
  process.env.EVENTS_CHROMIUM_PATH ??
  "/tmp/social-journal-playwright-browsers/chromium-1228/chrome-linux64/chrome";
const artifactDir =
  process.env.EVENTS_ARTIFACT_DIR ??
  "/tmp/social-journal-playwright-artifacts/events-baseline";

if (!accessToken) {
  throw new Error(
    "SJ_ACCESS_TOKEN is required for the populated Events QA run.",
  );
}

await mkdir(artifactDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: browserPath,
  args: [
    "--database=/tmp/social-journal-playwright-artifacts/crash-db",
    "--force-color-profile=srgb",
  ],
});

const diagnostics = {
  consoleErrors: [],
  pageErrors: [],
  requestFailures: [],
  states: {},
};

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  await context.addCookies([
    {
      name: "sj_access",
      value: accessToken,
      url: frontendUrl,
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: "sidebar_state",
      value: "true",
      url: frontendUrl,
      sameSite: "Lax",
    },
  ]);

  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error")
      diagnostics.consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => diagnostics.pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    diagnostics.requestFailures.push({
      method: request.method(),
      url: request.url(),
      error: request.failure()?.errorText ?? "unknown",
    });
  });

  await gotoStable(page, "/events", "Events");
  diagnostics.states.browser = await inspectPage(page, {
    cardSelector: 'a[href^="/events/"]',
    toolbarSelector: '[aria-label="Event browser controls"]',
  });
  diagnostics.states.browser.headings = await page
    .getByRole("heading")
    .allTextContents();
  diagnostics.states.browser.eventLinks = await page
    .locator('a[href^="/events/"]')
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")).filter(Boolean),
    );
  await page.screenshot({
    path: `${artifactDir}/events-browser-1440-baseline.png`,
    fullPage: false,
  });

  await gotoStable(page, "/events/new", "Create a moment");
  diagnostics.states.createEmpty = await inspectPage(page, {
    cardSelector: '#event-form [data-slot="surface-card"]',
    toolbarSelector: "#event-form",
  });
  await page.screenshot({
    path: `${artifactDir}/event-create-empty-1440-baseline.png`,
    fullPage: false,
  });

  await populateCreateForm(page);
  diagnostics.states.createPopulated = await inspectPage(page, {
    cardSelector: '#event-form [data-slot="surface-card"]',
    toolbarSelector: "#event-form",
  });
  await page.screenshot({
    path: `${artifactDir}/event-create-populated-1440-baseline.png`,
    fullPage: false,
  });

  const editHref = diagnostics.states.browser.eventLinks
    .filter((href) => /^\/events\/\d+$/.test(href))
    .map((href) => `${href}/edit`)[0];
  if (editHref) {
    await gotoStable(page, editHref, "Edit moment");
    diagnostics.states.edit = await inspectPage(page, {
      cardSelector: '#event-form [data-slot="surface-card"]',
      toolbarSelector: "#event-form",
    });
    diagnostics.states.edit.formValues = await page.evaluate(() => ({
      title: document.querySelector("#event-title")?.value ?? null,
      end: document.querySelector("#event-end")?.value ?? null,
      location: document.querySelector("#event-location")?.value ?? null,
      participants: document.querySelectorAll('[aria-label^="Remove "]').length,
    }));
    await page.screenshot({
      path: `${artifactDir}/event-edit-1440-baseline.png`,
      fullPage: false,
    });
  }

  console.log(JSON.stringify(diagnostics, null, 2));
  await context.close();
} finally {
  await browser.close();
}

async function gotoStable(page, path, heading) {
  await page.goto(`${frontendUrl}${path}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { level: 1, name: heading }).waitFor({
    state: "visible",
    timeout: 20_000,
  });
  await page
    .waitForLoadState("networkidle", { timeout: 10_000 })
    .catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
}

async function inspectPage(page, { cardSelector, toolbarSelector }) {
  return page.evaluate(
    ({ cardSelector, toolbarSelector }) => {
      const root = document.documentElement;
      const body = document.body;
      const toolbar = document.querySelector(toolbarSelector);
      const cards = [...document.querySelectorAll(cardSelector)].slice(0, 12);
      const focused = document.activeElement;
      return {
        viewport: {
          width: innerWidth,
          height: innerHeight,
          scale: devicePixelRatio,
        },
        document: {
          clientWidth: root.clientWidth,
          scrollWidth: root.scrollWidth,
          clientHeight: root.clientHeight,
          scrollHeight: root.scrollHeight,
          bodyScrollWidth: body.scrollWidth,
          horizontalOverflow: root.scrollWidth > root.clientWidth + 1,
        },
        toolbar: toolbar
          ? {
              rect: rect(toolbar),
              style: style(toolbar, [
                "display",
                "gap",
                "padding",
                "borderRadius",
                "backgroundColor",
              ]),
            }
          : null,
        cards: cards.map((card) => ({
          rect: rect(card),
          style: style(card, [
            "display",
            "padding",
            "borderRadius",
            "backgroundColor",
            "boxShadow",
          ]),
          text: card.textContent?.replace(/\s+/g, " ").trim().slice(0, 180),
        })),
        focused: focused
          ? {
              tag: focused.tagName,
              id: focused.id,
              label: focused.getAttribute("aria-label"),
            }
          : null,
      };

      function rect(element) {
        const value = element.getBoundingClientRect();
        return {
          x: Math.round(value.x * 10) / 10,
          y: Math.round(value.y * 10) / 10,
          width: Math.round(value.width * 10) / 10,
          height: Math.round(value.height * 10) / 10,
          right: Math.round(value.right * 10) / 10,
          bottom: Math.round(value.bottom * 10) / 10,
        };
      }

      function style(element, names) {
        const computed = getComputedStyle(element);
        return Object.fromEntries(names.map((name) => [name, computed[name]]));
      }
    },
    { cardSelector, toolbarSelector },
  );
}

async function populateCreateForm(page) {
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

  const category = page.getByRole("radio", { name: "Social" });
  if (await category.count()) {
    await category.click();
  } else {
    await page
      .getByRole("radiogroup", { name: "Category" })
      .getByRole("radio")
      .nth(1)
      .click();
  }

  await page.getByRole("button", { name: "Add person" }).click();
  const results = page.getByRole("region", { name: "People search results" });
  await results.getByRole("button").first().waitFor({ state: "visible" });
  await results.getByRole("button").first().click();
  if ((await results.getByRole("button").count()) > 0) {
    await results.getByRole("button").first().click();
  }
  await page.keyboard.press("Escape");

  const details = page.getByRole("button", { name: /More details/ });
  if ((await details.getAttribute("aria-expanded")) !== "true") {
    await details.click();
  }
  await page.getByLabel("Significance").selectOption("milestone");
  await page.getByLabel("Impact").selectOption("positive");
  const interaction = page.getByLabel("Interaction");
  if ((await interaction.locator("option").count()) > 1) {
    await interaction.selectOption({ index: 1 });
  }
  const mood = page.getByLabel("Mood");
  if ((await mood.locator("option").count()) > 1) {
    await mood.selectOption({ index: 1 });
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
}
