import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, stat, access } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";

const study = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repository = resolve(study, "../../..");
const prefix = "/design/prototypes/2026-09-audience-site/";
const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".md": "text/plain",
  ".json": "application/json",
};
const report = {
  checkedAt: new Date().toISOString(),
  pages: [],
  behaviors: [],
  localLinks: 0,
  errors: [],
};
const pages = [
  ["illustrated-journal", "illustrated-journal/index.html"],
  ["paper-robots-studio", "paper-robots-studio/index.html"],
  ["field-notes", "field-notes/index.html"],
  ["essay", "illustrated-journal/essay.html"],
  ["newsletter", "letters/index.html"],
  ["comparison-board", "index.html"],
];
const server = createServer(async (request, response) => {
  try {
    let file = resolve(
      repository,
      "." +
        decodeURIComponent(new URL(request.url, "http://localhost").pathname),
    );
    if (file !== repository && !file.startsWith(repository + sep))
      throw new Error("Outside repository");
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    response.writeHead(200, {
      "Content-Type": mime[extname(file)] || "application/octet-stream",
    });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;
const browser = await chromium.launch();
const localLinks = new Set();
try {
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    await mkdir(resolve(study, "previews", device), { recursive: true });
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.on("pageerror", (error) =>
      report.errors.push(`${device}: ${error.message}`),
    );
    page.on("response", (response) => {
      if (response.status() >= 400)
        report.errors.push(`${response.status()}: ${response.url()}`);
    });
    for (const [name, path] of pages) {
      await page.goto(base + path, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        document.querySelectorAll("img").forEach((img) => {
          img.loading = "eager";
        });
        await Promise.all([...document.images].map((img) => img.decode()));
        await document.fonts.ready;
      });
      const layout = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        h1s: document.querySelectorAll("h1").length,
        brokenImages: [...document.images]
          .filter((img) => !img.naturalWidth)
          .map((img) => img.src),
        links: [
          ...document.querySelectorAll(
            "a[href],img[src],link[href],script[src],iframe[src]",
          ),
        ].map((element) => element.href || element.src),
      }));
      assert(
        layout.documentWidth <= layout.viewportWidth,
        `${name} overflows at ${device}: ${layout.documentWidth}`,
      );
      assert.equal(layout.h1s, 1, `${name} must have one main heading`);
      assert.deepEqual(layout.brokenImages, []);
      layout.links
        .filter((link) => link.startsWith(base.slice(0, base.indexOf(prefix))))
        .forEach((link) => localLinks.add(link));
      await page.screenshot({
        path: resolve(study, "previews", device, `${name}.jpg`),
        type: "jpeg",
        quality: 85,
      });
      if (name !== "comparison-board")
        await page.screenshot({
          path: resolve(study, "previews", device, `${name}-full.jpg`),
          type: "jpeg",
          quality: 82,
          fullPage: true,
        });
      report.pages.push({
        name,
        device,
        viewport,
        overflow: false,
        imagesLoaded: true,
      });
    }
    await context.close();
  }

  for (const url of localLinks) {
    const path = resolve(
      repository,
      "." + decodeURIComponent(new URL(url).pathname),
    );
    await access(path);
    report.localLinks += 1;
  }

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(base + "field-notes/index.html");
  for (const [label, count] of [
    ["Essays", 2],
    ["Films", 1],
    ["Worlds", 2],
    ["Everything", 5],
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    assert.equal(await page.locator("[data-kind]:visible").count(), count);
    assert.equal(
      await page.locator("[data-filter-count]").textContent(),
      `${count} ${count === 1 ? "piece" : "pieces"} shown`,
    );
  }
  report.behaviors.push(
    "Notebook filters and live result counts work for all four categories.",
  );

  await page.goto(base + "letters/index.html");
  await page.waitForLoadState("networkidle");
  const requestsAfterLoad = [];
  const recordRequest = (request) => requestsAfterLoad.push(request.url());
  page.on("request", recordRequest);
  await page
    .getByLabel("Email address · preview only")
    .fill("reader@example.com");
  await page.getByRole("button", { name: "Try the signup" }).click();
  assert.match(
    await page.getByRole("status").textContent(),
    /nothing was submitted/,
  );
  assert.equal(
    await page.getByLabel("Email address · preview only").inputValue(),
    "",
  );
  assert.deepEqual(requestsAfterLoad, []);
  assert.deepEqual(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
    { local: 0, session: 0 },
  );
  page.off("request", recordRequest);
  report.behaviors.push(
    "Newsletter demo makes no network request, stores nothing, resets the field, and reports preview-only status.",
  );

  await page.goto(base + "index.html");
  await page
    .locator("[data-preview-select]")
    .selectOption("field-notes/index.html");
  assert.equal(
    await page.locator("[data-preview-frame]").getAttribute("src"),
    "field-notes/index.html",
  );
  assert.equal(
    await page.locator("[data-open-preview]").getAttribute("href"),
    "field-notes/index.html",
  );
  await page.getByRole("button", { name: "Phone · 390 px" }).click();
  assert.equal(
    await page.locator("[data-preview-stage]").getAttribute("data-device"),
    "mobile",
  );
  report.behaviors.push(
    "Comparison selector, standalone link, and phone-width toggle work.",
  );

  await page.setViewportSize({ width: 320, height: 740 });
  for (const [name, path] of pages) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    assert.equal(overflow, false, `${name} overflows at 320 px`);
  }
  report.behaviors.push("All six pages fit a 320 px viewport.");

  await page.goto(pathToFileURL(resolve(study, "field-notes/index.html")).href);
  await page.getByRole("button", { name: "Films", exact: true }).click();
  assert.equal(await page.locator("[data-kind]:visible").count(), 1);
  await page.goto(pathToFileURL(resolve(study, "index.html")).href);
  await page
    .locator("[data-preview-select]")
    .selectOption("letters/index.html");
  const frame = page.frameLocator("[data-preview-frame]");
  await frame
    .getByLabel("Email address · preview only")
    .fill("reader@example.com");
  await frame.getByRole("button", { name: "Try the signup" }).click();
  assert.match(
    await frame.getByRole("status").textContent(),
    /nothing was submitted/,
  );
  report.behaviors.push(
    "Direct file:// opening supports the notebook, comparison iframe, and newsletter demo.",
  );
  await context.close();
  assert.deepEqual(report.errors, []);
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.errors.push(error.stack);
  process.exitCode = 1;
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
  await writeFile(
    resolve(study, "previews/verification.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
}
