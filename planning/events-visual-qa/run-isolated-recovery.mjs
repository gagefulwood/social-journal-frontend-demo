import { strict as assert } from "node:assert";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { chromium } from "/tmp/social-journal-playwright-runtime/node_modules/playwright/index.mjs";

const frontendUrl = "http://localhost:3000";
const token = process.env.SJ_ACCESS_TOKEN;
const browserPath =
  "/tmp/social-journal-playwright-browsers/chromium-1228/chrome-linux64/chrome";
const artifactDir = fileURLToPath(new URL(".", import.meta.url));

if (!token) throw new Error("SJ_ACCESS_TOKEN is required.");

const diagnostics = { scenarios: {}, pageErrors: [], consoleErrors: [] };

await runIsolated(
  "browser-filtered-1024x768",
  async (page) => {
    await gotoHydrated(page, "/events?impact=positive&display=list", "Events");
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll('a[href^="/events/"]')].some((link) =>
          /^\/events\/\d+$/.test(link.getAttribute("href") ?? ""),
        ),
      null,
      { timeout: 20_000 },
    );
    await page.waitForTimeout(300);
    assert.equal(
      await page
        .getByRole("button", { name: "List view" })
        .getAttribute("aria-pressed"),
      "true",
    );
    assert.ok(
      await page
        .getByRole("button", { name: /Remove .*impact filter/i })
        .isVisible(),
    );
    await assertNoOverflow(page);
    await page.screenshot({
      path: `${artifactDir}/events-browser-filtered-final.png`,
    });
  },
  { width: 1024, height: 768 },
);

await runIsolated(
  "event-form-200-percent-equivalent",
  async (page) => {
    await gotoHydrated(page, "/events/new", "Create a moment");
    await page.waitForFunction(
      () => document.querySelectorAll('[role="radio"]').length > 1,
      null,
      { timeout: 20_000 },
    );

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
    const socialCategory = page.getByRole("radio", {
      name: "Social",
      exact: true,
    });
    if ((await socialCategory.count()) > 0) {
      await socialCategory.click();
    } else {
      await page
        .getByRole("radiogroup", { name: "Category" })
        .getByRole("radio")
        .nth(1)
        .click();
    }

    const details = page.getByRole("button", { name: /More details/ });
    await details.click();
    await page.locator("#event-tier").waitFor({ state: "visible" });
    await page.locator("#event-tier").selectOption("milestone");
    await page.locator("#event-impact").selectOption("positive");
    await selectFirstRealOption(page.locator("#event-mode"));
    await selectFirstRealOption(page.locator("#event-mood"));

    assert.deepEqual(
      await page.evaluate(() => [innerWidth, innerHeight, devicePixelRatio]),
      [720, 450, 2],
    );
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(300);
    await assertNoOverflow(page);
    await page.screenshot({ path: `${artifactDir}/event-form-zoom-final.png` });
  },
  { width: 720, height: 450 },
  2,
);

await runIsolated(
  "event-edit-loading",
  async (page) => {
    const editPath = process.env.EVENTS_EDIT_PATH ?? "/events/63/edit";
    let delayed = false;
    await page.route(/\/api\/events\/\d+\/?(?:\?.*)?$/, async (route) => {
      delayed = true;
      await new Promise((resolve) => setTimeout(resolve, 900));
      await route.continue();
    });
    await page.goto(`${frontendUrl}${editPath}`, {
      waitUntil: "domcontentloaded",
    });
    await page.addStyleTag({
      content: "nextjs-portal { display: none !important; }",
    });
    const skeleton = page.locator("main.animate-pulse");
    await skeleton.waitFor({ state: "visible", timeout: 5_000 });
    for (let attempt = 0; attempt < 50 && !delayed; attempt += 1) {
      await page.waitForTimeout(100);
    }
    assert.ok(delayed, "The edit request was not delayed.");
    await assertNoOverflow(page);
    await page.getByRole("heading", { level: 1, name: "Edit moment" }).waitFor({
      state: "visible",
      timeout: 20_000,
    });
  },
  { width: 1280, height: 800 },
);

await writeFile(
  `${artifactDir}/events-visual-qa-isolated-diagnostics.json`,
  `${JSON.stringify(diagnostics, null, 2)}\n`,
  "utf8",
);

console.log(JSON.stringify(diagnostics, null, 2));

async function runIsolated(name, callback, viewport, deviceScaleFactor = 1) {
  const browser = await chromium.launch({
    headless: true,
    executablePath: browserPath,
    args: [
      "--database=/tmp/social-journal-playwright-artifacts/crash-db",
      "--force-color-profile=srgb",
    ],
  });
  const context = await browser.newContext({
    viewport,
    screen: viewport,
    deviceScaleFactor,
    colorScheme: "light",
    reducedMotion: "reduce",
    locale: "en-US",
    timezoneId: "America/Chicago",
  });
  await context.addCookies([
    {
      name: "sj_access",
      value: token,
      url: frontendUrl,
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: "sidebar_state",
      value: "false",
      url: frontendUrl,
      sameSite: "Lax",
    },
  ]);
  const page = await context.newPage();
  page.on("pageerror", (error) =>
    diagnostics.pageErrors.push({ scenario: name, message: error.message }),
  );
  page.on("console", (message) => {
    if (message.type() === "error") {
      diagnostics.consoleErrors.push({
        scenario: name,
        message: message.text(),
      });
    }
  });

  try {
    await callback(page);
    diagnostics.scenarios[name] = {
      status: "passed",
      viewport,
      deviceScaleFactor,
    };
  } catch (error) {
    diagnostics.scenarios[name] = {
      status: "failed",
      error:
        error instanceof Error ? (error.stack ?? error.message) : String(error),
    };
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

async function gotoHydrated(page, path, heading) {
  await page.goto(`${frontendUrl}${path}`, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({
    content: "nextjs-portal { display: none !important; }",
  });
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
  await page.getByRole("heading", { level: 1, name: heading }).waitFor({
    state: "visible",
    timeout: 20_000,
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
}

async function selectFirstRealOption(select) {
  if ((await select.locator("option").count()) > 1) {
    await select.selectOption({ index: 1 });
  }
}

async function assertNoOverflow(page) {
  const geometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyClientWidth: document.body.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  assert.ok(
    geometry.scrollWidth <= geometry.clientWidth + 1,
    JSON.stringify(geometry),
  );
  assert.ok(
    geometry.bodyScrollWidth <= geometry.bodyClientWidth + 1,
    JSON.stringify(geometry),
  );
}
