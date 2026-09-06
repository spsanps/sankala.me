import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, stat, access } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { notesData } from "../../../../src/data/site-content.js";

const study = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repository = resolve(study, "../../..");
const prefix = "/design/prototypes/2026-09-illustrated-journal/";
const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".json": "application/json",
  ".md": "text/plain",
};
const pages = [
  ["home", "index.html"],
  ["notebook", "writing/index.html"],
  ["worlds", "worlds/index.html"],
  ["research", "research/index.html"],
  ["about", "about/index.html"],
  ["films", "films/index.html"],
  ["postmortem", "notes/startr-postmortem/index.html"],
  ["letter", "letter.html"],
  ["review", "review.html"],
];
const report = {
  checkedAt: new Date().toISOString(),
  pages: [],
  behaviors: [],
  localLinks: 0,
  errors: [],
};
const server = createServer(async (request, response) => {
  try {
    let file = resolve(
      repository,
      "." +
        decodeURIComponent(new URL(request.url, "http://localhost").pathname),
    );
    if (file !== repository && !file.startsWith(repository + sep))
      throw Error("Outside repository");
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
const origin = `http://127.0.0.1:${server.address().port}`;
const base = origin + prefix;
const browser = await chromium.launch();
const links = new Set();
try {
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1050 }],
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
        images: [...document.images]
          .filter((img) => !img.naturalWidth)
          .map((img) => img.src),
        links: [
          ...document.querySelectorAll(
            "a[href],link[href],script[src],img[src]",
          ),
        ].map((x) => x.href || x.src),
        overflow: [...document.querySelectorAll("main *")]
          .filter((x) => x.getBoundingClientRect().right > innerWidth + 1)
          .slice(0, 5)
          .map((x) => x.className),
      }));
      assert(
        data.width <= data.viewport,
        `${name} overflows at ${device}: ${JSON.stringify(data)}`,
      );
      assert.equal(data.h1, 1, `${name} must have one h1`);
      assert.deepEqual(data.images, []);
      data.links
        .filter((url) => url.startsWith(origin))
        .forEach((url) => links.add(url));
      await page.screenshot({
        path: resolve(study, "previews", device, `${name}.jpg`),
        type: "jpeg",
        quality: 85,
      });
      if (["home", "notebook", "about", "postmortem"].includes(name))
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
  for (const url of links) {
    await access(
      resolve(repository, "." + decodeURIComponent(new URL(url).pathname)),
    );
    report.localLinks++;
  }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(base + "index.html");
  for (const [label, count] of [
    ["One", 1],
    ["Twelve", 12],
    ["Six", 6],
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    assert.equal(await page.locator("[data-machine]:visible").count(), count);
    assert.equal(
      await page.locator("[data-body-status]").textContent(),
      `1 model → ${count} ${count === 1 ? "body" : "bodies"}`,
    );
  }
  report.behaviors.push(
    "The conceptual illustration changes the visible bodies and accessible status for one, six, and twelve.",
  );
  const slider = page.getByRole("slider", {
    name: "Tilt your view from street level to overhead",
  });
  await slider.focus();
  await slider.press("End");
  await page.waitForFunction(() =>
    document
      .querySelector("[data-sky-image]")
      .src.endsWith("another-sky-tilt-32.webp"),
  );
  assert.equal(
    await slider.getAttribute("aria-valuetext"),
    "The world overhead",
  );
  await page.screenshot({
    path: resolve(study, "previews/desktop/sky-overhead.jpg"),
    type: "jpeg",
    quality: 85,
  });
  await slider.press("Home");
  await page.waitForFunction(() =>
    document
      .querySelector("[data-sky-image]")
      .src.endsWith("another-sky-tilt-00.webp"),
  );
  report.behaviors.push(
    "The sky control reaches street and overhead frames through keyboard input, with matching accessible descriptions.",
  );
  await page.goto(base + "writing/index.html");
  for (const note of notesData)
    assert.equal(
      await page
        .locator(
          `[data-work][data-search*="${note.title.toLowerCase().replaceAll('"', '\\"')}"]`,
        )
        .count(),
      1,
    );
  for (const [label, count] of [
    ["Essays & notes", 3],
    ["Films", 1],
    ["Worlds", 3],
    ["Research", 3],
    ["Everything", 8],
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    assert.equal(await page.locator("[data-work]:visible").count(), count);
  }
  await page
    .getByRole("searchbox", { name: "Search the notebook" })
    .fill("accelerator");
  assert.equal(await page.locator("[data-work]:visible").count(), 1);
  await page
    .getByRole("searchbox", { name: "Search the notebook" })
    .fill("no-such-piece");
  assert.equal(await page.locator("[data-work]:visible").count(), 0);
  assert.equal(await page.locator("[data-empty]").isVisible(), true);
  await page.getByRole("button", { name: /Clear filters/ }).click();
  assert.equal(await page.locator("[data-work]:visible").count(), 8);
  report.behaviors.push(
    "All six source notes are present. Format filters, search, empty state, and reset pass; three worlds and three research entries remain discoverable.",
  );
  await page.goto(base + "about/index.html");
  assert.equal(await page.locator(".timeline details").count(), 10);
  const last = page.locator(".timeline details").last();
  await last.locator("summary").click();
  assert.equal(await last.locator(".timeline-body").isVisible(), true);
  report.behaviors.push(
    "All ten original milestones are present; the expandable history works.",
  );
  await page.goto(base + "notes/startr-postmortem/index.html");
  const body = await page.locator(".article-body").innerText();
  assert(
    body.includes("My first") ||
      body.includes("This was my first real attempt at entrepreneurship."),
  );
  assert(body.includes("What Went Wrong") && body.includes("What I Learned"));
  const sourceParagraphs =
    notesData
      .find((x) => x.slug === "startr-postmortem")
      .content.trim()
      .split(/\n\s*\n/).length - 1;
  assert.equal(
    await page.locator(".article-body > p,.article-body > h2").count(),
    sourceParagraphs,
  );
  report.behaviors.push(
    "The StartR reading page includes every source paragraph and heading, including the closing reflection.",
  );
  await page.goto(base + "letter.html");
  assert.equal(await page.locator("input[type=email],form").count(), 0);
  assert.match(
    await page.locator(".not-live").innerText(),
    /has not been created/,
  );
  report.behaviors.push(
    "The letter page clearly states that the publication does not exist and contains no collecting form.",
  );
  await page.setViewportSize({ width: 320, height: 740 });
  for (const [name, path] of pages) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `${name} overflows at 320px`,
    );
  }
  await page.goto(base + "index.html");
  await page.locator(".mobile-menu summary").click();
  assert.equal(await page.locator(".mobile-menu nav").isVisible(), true);
  await page.locator(".mobile-menu summary").press("Escape");
  assert.equal(await page.locator(".mobile-menu nav").isVisible(), false);
  report.behaviors.push(
    "All nine pages fit 320px; the mobile menu opens and closes with keyboard Escape.",
  );
  await page.goto(pathToFileURL(resolve(study, "index.html")).href);
  await page.getByRole("button", { name: "Twelve", exact: true }).click();
  assert.equal(await page.locator("[data-machine]:visible").count(), 12);
  await page.goto(
    pathToFileURL(resolve(study, "writing/index.html")).href + "?view=worlds",
  );
  assert.equal(await page.locator("[data-work]:visible").count(), 3);
  report.behaviors.push(
    "Direct file:// opening supports local assets, interaction, and archive query filters.",
  );
  await context.close();
  const noJs = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const staticPage = await noJs.newPage();
  await staticPage.goto(base + "writing/index.html");
  assert.equal(await staticPage.locator("[data-work]:visible").count(), 8);
  await staticPage.goto(base + "about/index.html");
  assert.equal(await staticPage.locator(".timeline details").count(), 10);
  await noJs.close();
  report.behaviors.push(
    "All archive entries and the native timeline remain available without JavaScript.",
  );
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
