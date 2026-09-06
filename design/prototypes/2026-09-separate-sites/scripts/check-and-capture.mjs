import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, stat, access } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { notesData } from "../../../../src/data/site-content.js";

const study = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repository = resolve(study, "../../..");
const prefix = "/design/prototypes/2026-09-separate-sites/";
const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
const pages = [
  ["review", "index.html"],
  ["san-kala", "san-kala/index.html"],
  ["work", "san-kala/work/index.html"],
  ["history", "san-kala/history/index.html"],
  ["paper-robots", "paper-robots/index.html"],
];
const report = {
  checkedAt: new Date().toISOString(),
  pages: [],
  behaviors: [],
  errors: [],
};
const server = createServer(async (req, res) => {
  try {
    let file = resolve(
      repository,
      "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
    );
    assert(file === repository || file.startsWith(repository + sep));
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    res.writeHead(200, {
      "Content-Type": mime[extname(file)] || "application/octet-stream",
    });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
const base = origin + prefix;
const browser = await chromium.launch();
const links = new Set();
try {
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1050 }],
    ["mobile", { width: 390, height: 844 }],
    ["narrow", { width: 320, height: 800 }],
  ]) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400)
        report.errors.push(`${response.status()} ${response.url()}`);
    });
    if (device !== "narrow")
      await mkdir(resolve(study, "previews", device), { recursive: true });
    for (const [name, path] of pages) {
      await page.goto(base + path, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        document
          .querySelectorAll("img")
          .forEach((img) => (img.loading = "eager"));
        await Promise.all([...document.images].map((img) => img.decode()));
        await document.fonts.ready;
      });
      const data = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        viewport: innerWidth,
        h1: document.querySelectorAll("h1").length,
        links: [
          ...document.querySelectorAll(
            "a[href],link[href],img[src],script[src]",
          ),
        ].map((node) => node.href || node.src),
      }));
      assert(
        data.width <= data.viewport,
        `${name} overflows on ${device}: ${data.width}`,
      );
      assert.equal(data.h1, 1, `${name} has one primary heading`);
      data.links
        .filter((url) => url.startsWith(origin))
        .forEach((url) => links.add(url));
      if (device !== "narrow") {
        await page.screenshot({
          path: resolve(study, "previews", device, `${name}.jpg`),
          type: "jpeg",
          quality: 86,
        });
        if (["san-kala", "paper-robots"].includes(name))
          await page.screenshot({
            path: resolve(study, "previews", device, `${name}-full.jpg`),
            type: "jpeg",
            quality: 82,
            fullPage: true,
          });
      }
      report.pages.push({ name, device, overflow: false, imagesLoaded: true });
    }
    await context.close();
  }
  for (const link of links) {
    const url = new URL(link);
    const file = resolve(repository, "." + decodeURIComponent(url.pathname));
    await access(file);
    if (url.hash && extname(file) === ".html") {
      const html = await readFile(file, "utf8");
      assert(
        html.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),
        `Missing anchor: ${link}`,
      );
    }
  }
  report.behaviors.push(
    `${links.size} local links/assets and their HTML anchors resolve.`,
  );
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
  });
  await page.goto(base + "san-kala/index.html");
  assert((await page.locator("h1").innerText()).includes("San Kala"));
  assert.equal(await page.locator(".journey li").count(), 4);
  assert(
    (await page.locator(".journey").innerText()).includes("Texas Instruments"),
  );
  assert(
    await page
      .locator(".journey")
      .evaluate((node) => node.getBoundingClientRect().top < innerHeight),
  );
  assert.equal(await page.locator("main h1").getByText("GPT-7").count(), 0);
  await page.locator(".publication-link").click();
  assert(page.url().endsWith("paper-robots/index.html"));
  assert((await page.locator("h1").innerText()).includes("possible futures"));
  assert.equal(await page.locator("[data-publication-entry]").count(), 1);
  assert.equal(await page.locator("input[type=email],form").count(), 0);
  assert(
    (await page.locator(".publication-status").innerText()).includes(
      "has not been created",
    ),
  );
  await page.getByRole("link", { name: "About the author" }).click();
  assert(page.url().endsWith("san-kala/index.html"));
  report.behaviors.push(
    "The personal homepage identifies San and shows his career path immediately on desktop. The publication has its own promise, one real essay/film, and reciprocal author links.",
  );
  await page.goto(base + "san-kala/work/index.html");
  for (const note of notesData)
    assert.equal(await page.locator(`[data-slug="${note.slug}"]`).count(), 1);
  assert.equal(await page.locator("[data-work]:visible").count(), 8);
  for (const [topic, count] of [
    ["ai", 4],
    ["worlds", 3],
    ["making", 2],
  ]) {
    await page.locator("[name=topic]").selectOption(topic);
    assert.equal(await page.locator("[data-work]:visible").count(), count);
  }
  await page.locator("[name=format]").selectOption("research");
  assert.equal(await page.locator("[data-work]:visible").count(), 1);
  assert.equal(
    await page.locator("[data-work]:visible").getAttribute("data-slug"),
    "zinify",
  );
  await page.locator("[name=q]").fill("unmatched-query-9038");
  assert.equal(await page.locator("[data-work]:visible").count(), 0);
  assert(await page.locator("[data-empty]").isVisible());
  await page.getByRole("button", { name: "Show all work" }).click();
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll("[data-work]")].filter(
        (node) => !node.hidden,
      ).length === 8,
  );
  for (const [format, count] of [
    ["writing", 3],
    ["research", 3],
    ["experiment", 3],
    ["film", 1],
  ]) {
    await page.locator("[name=format]").selectOption(format);
    assert.equal(await page.locator("[data-work]:visible").count(), count);
  }
  await page.goto(base + "san-kala/work/index.html?topic=worlds");
  assert.equal(await page.locator("[data-work]:visible").count(), 3);
  await page.goto(
    base + "san-kala/work/index.html?topic=unknown&format=unknown",
  );
  assert.equal(await page.locator("[data-work]:visible").count(), 8);
  report.behaviors.push(
    "All six source notes and both additional research entries are present. Topic, format, combined filters, search, empty state, reset, and URL parameters work.",
  );
  await page.goto(base + "san-kala/history/index.html");
  assert.equal(await page.locator("[data-milestone]").count(), 10);
  assert((await page.locator("main").innerText()).includes("StartR"));
  report.behaviors.push(
    "All ten original milestones remain visible, including the startup and hardware background.",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".mobile-menu summary").click();
  assert(await page.locator(".mobile-menu[open]").isVisible());
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".mobile-menu[open]").count(), 0);
  await page.goto(
    pathToFileURL(resolve(study, "san-kala/work/index.html")).href +
      "?topic=ai",
  );
  assert.equal(await page.locator("[data-work]:visible").count(), 4);
  await page.locator("[name=format]").selectOption("research");
  assert.equal(await page.locator("[data-work]:visible").count(), 3);
  report.behaviors.push(
    "Mobile navigation and Escape work. Direct file opening supports subject and format filters.",
  );
  const nojs = await browser.newContext({ javaScriptEnabled: false });
  const plain = await nojs.newPage();
  await plain.goto(base + "san-kala/work/index.html");
  assert.equal(await plain.locator("[data-work]:visible").count(), 8);
  assert.equal(await plain.locator("[data-library-tools]:visible").count(), 0);
  await plain.goto(base + "san-kala/history/index.html");
  assert.equal(await plain.locator("[data-milestone]:visible").count(), 10);
  report.behaviors.push(
    "The entire work index and history remain readable without JavaScript.",
  );
  await nojs.close();
  assert.deepEqual(report.errors, []);
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.errors.push(error.stack);
  process.exitCode = 1;
} finally {
  await mkdir(resolve(study, "previews"), { recursive: true });
  await writeFile(
    resolve(study, "previews/verification.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  await browser.close();
  await new Promise((done) => server.close(done));
}
console.log(JSON.stringify(report, null, 2));
