import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { notesData } from "../../../../src/data/site-content.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const old = "../2026-09-audience-site/shared/assets/";
const video = "https://www.youtube.com/watch?v=kzvqj4jurW0";
const live = "https://sankala.me";
const esc = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const arrow = '<span aria-hidden="true">↗</span>';
const navItems = [
  ["writing/index.html", "Writing"],
  ["films/index.html", "Films"],
  ["worlds/index.html", "Worlds"],
  ["research/index.html", "Research"],
  ["about/index.html", "About"],
];
const fmt = {
  "another-sky": ["worlds"],
  "gpt7-will-have-arms": ["essays", "films"],
  "eai-challenge": ["essays", "research"],
  "a-clauiet-life": ["worlds"],
  "dyson-swarm": ["worlds"],
  "startr-postmortem": ["essays"],
};
const works = notesData.map((note) => ({
  ...note,
  formats: fmt[note.slug],
  url:
    note.slug === "startr-postmortem"
      ? "notes/startr-postmortem/index.html"
      : note.essayRoute
        ? live + note.essayRoute
        : note.externalUrl?.startsWith("/")
          ? live + note.externalUrl
          : note.externalUrl,
}));
works.push({
  slug: "zinify",
  title: "ZINify: research to zines",
  date: "2023",
  excerpt:
    "Turning research papers into visual zines. Honorable Mention at the UIST Student Innovation Contest.",
  formats: ["research"],
  url: "https://jaidevshriram.com/zinify-uist/",
  tags: ["HCI", "Research", "Generative AI"],
});
works.push({
  slug: "power-quality",
  title: "Learning the shape of a power disturbance",
  date: "2019",
  excerpt:
    "Power Quality Event Classification Using Long Short-Term Memory Networks. IEEE DISCOVER Best Paper Award.",
  formats: ["research"],
  url: "research/index.html#power-quality",
  tags: ["Electrical Engineering", "LSTM", "Research"],
});
const timeline = [
  [
    "2025",
    "The embodied-agent challenge",
    "First place in the NeurIPS EAI Challenge at the Foundation Models Meet Embodied Agents Workshop, as team AxisTilted2.",
    "https://sankala.me/notes/eai-challenge",
    "The write-up",
  ],
  [
    "2024",
    "Research at eBay",
    "Joined the Knowledge Extraction team. Building and researching LLM systems for information extraction. Promoted in October 2025.",
    "https://sankala.me/resume",
    "Current work",
  ],
  [
    "2024",
    "An MS at UC San Diego",
    "Computer science, work with Julian McAuley’s group on AI music and language models, and teaching assistance in recommender systems and data mining.",
    null,
    null,
  ],
  [
    "2023",
    "Research, made into zines",
    "ZINify received an Honorable Mention at the UIST Student Innovation Contest. Early experiments with Claude 2 and visual storytelling.",
    "https://jaidevshriram.com/zinify-uist/",
    "The project",
  ],
  [
    "2023",
    "A startup that didn’t make it",
    "Accepted into UCSD’s StartR Rady accelerator with Glyp, a writing assistant for novelists. The post-mortem is part of the notebook, too.",
    "notes/startr-postmortem/index.html",
    "What I learned",
  ],
  [
    "2023",
    "An industry research internship",
    "Summer research with eBay’s Knowledge Extraction team, working on information extraction at scale.",
    null,
    null,
  ],
  [
    "2023",
    "First of 591 teams",
    "Won the eBay University Machine Learning Challenge with named-entity extraction from product titles. That led to the internship.",
    "https://innovation.ebayinc.com/stories/ebay-announces-winners-of-4th-annual-machine-learning-challenge/",
    "The announcement",
  ],
  [
    "2022",
    "From hardware to computer science",
    "Started the MS at UC San Diego after working in chip design.",
    null,
    null,
  ],
  [
    "2019",
    "Learning to respect silicon",
    "ASIC digital design at Texas Instruments, through 2022. Physical design, RTL, and the realities of getting a chip out of the door.",
    "https://sankala.me/resume",
    "Engineering background",
  ],
  [
    "2019",
    "Electrical engineering, and other interests",
    "Graduated from NIT Karnataka. Deep learning through Kaggle, a thesis on power-quality classification, and astronomy with the Amateur Astronomy Club.",
    null,
    null,
  ],
];

const timelineImages = [
  null,
  ["ebay-headquarters.webp", "eBay headquarters"],
  ["research-group.webp", "The UC San Diego research group"],
  ["uist-award.webp", "San and his collaborator at UIST 2023"],
  null,
  ["ebay-intern.webp", "The eBay internship"],
  null,
  ["ucsd-library.webp", "Geisel Library at UC San Diego"],
  null,
  ["nitk-lab.webp", "The NIT Karnataka lab"],
];

function page(path, title, body, { section = "", className = "" } = {}) {
  const depth = path.split("/").length - 1;
  const p = "../".repeat(depth);
  const links = navItems
    .map(
      ([url, label]) =>
        `<a href="${p + url}" ${section === label ? 'aria-current="page"' : ""}>${label}</a>`,
    )
    .join("");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="color-scheme" content="light"><title>${esc(title)} · San Kala / Design study</title><link rel="icon" href="${p + old}paper-robot.webp"><link rel="stylesheet" href="${p}styles/journal.css"><script src="${p}scripts/journal.js" defer></script></head><body class="${className}"><a class="skip" href="#main">Skip to content</a><div class="reading-progress" aria-hidden="true"></div><div class="study-strip"><span>Illustrated journal / second study</span><a href="${p}review.html">Design notes & content map ${arrow}</a></div><header class="masthead shell"><a href="${p}index.html" class="wordmark" aria-label="San Kala, home">San Kala<span>.</span></a><span class="masthead-note">AI, robots &<br>possible futures.</span><nav class="desktop-nav" aria-label="Main">${links}</nav><a class="letter-link" href="${p}letter.html">The letter ${arrow}</a><details class="mobile-menu"><summary>Menu <span aria-hidden="true">+</span></summary><nav aria-label="Mobile navigation">${links}<a href="${p}letter.html">The letter ${arrow}</a></nav></details></header>${body.replaceAll("@@", p)}<footer class="site-footer shell"><div class="footer-top"><a class="footer-name" href="${p}index.html">San Kala<span>.</span></a><p>Research, essays,<br>and a few possible worlds.</p><a class="hello" href="mailto:san@sankala.me">Have a thought?<br><span>Say hello ${arrow}</span></a></div><div class="footer-bottom"><span>Made with curiosity. Kept on the open web.</span><nav aria-label="Elsewhere"><a href="https://www.youtube.com/@paperrobotsfilms">YouTube ${arrow}</a><a href="https://github.com/spsanps">GitHub ${arrow}</a><a href="https://linkedin.com/in/sanjayanps">LinkedIn ${arrow}</a><a href="https://kaggle.com/spsanps">Kaggle ${arrow}</a><a href="https://sankala.me/resume">CV ${arrow}</a></nav></div></footer></body></html>`;
  return mkdir(resolve(root, dirname(path)), { recursive: true }).then(() =>
    writeFile(resolve(root, path), html),
  );
}

const eyebrow = (number, label) =>
  `<div class="eyebrow"><span class="section-number">${number}</span>${label}</div>`;
const button = (url, text, style = "") =>
  `<a class="button ${style}" href="${url}">${text} ${arrow}</a>`;
const oldImage = (name, alt, cls = "", lazy = true) =>
  `<img src="@@${old + name}.webp" alt="${alt}" class="${cls}" ${lazy ? 'loading="lazy"' : ""}>`;
const letterBand = () =>
  `<section class="letter-band shell"><div class="envelope" aria-hidden="true"><svg viewBox="0 0 180 140"><path d="M14 35 L92 4 L166 34 L164 128 L13 126Z" fill="#ece4d4" stroke="currentColor" stroke-width="1.4"/><path d="M24 90 L22 15 L150 17 L149 91" fill="#f6f2e8" stroke="currentColor" stroke-width="1.4"/><path d="M39 38 L119 39 M39 49 L127 50 M39 60 L111 61" stroke="currentColor" stroke-width="1.4"/><path d="M14 35 L88 89 L166 34 M13 126 L64 77 M164 128 L113 76" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="89" cy="90" r="12" fill="#b74324"/><path d="M84 90 L94 90 M89 85 L89 95" stroke="#f6f2e8"/></svg></div><div><div class="eyebrow">Paper Robots / by San Kala</div><h2>A letter from<br><em>this corner of the world.</em></h2><p>The essays, the films, the occasional experiment.<br>Free, and sent when there’s something ready.</p></div><div class="letter-invitation">${button("@@letter.html", "Get the next one")}<span>Read about the proposed publication ${arrow}</span></div></section>`;
const thread = () =>
  `<svg class="drawn-thread" viewBox="0 0 600 160" aria-hidden="true"><path d="M1 38 C98 24 144 123 238 101 S359 4 423 44 S454 151 559 117"/><path d="M545 103 L561 118 L540 129"/></svg>`;
const machine = (i) =>
  `<span class="machine" data-machine ${i >= 6 ? "hidden" : ""} style="--order:${i}"><svg viewBox="0 0 50 78" role="img" aria-label="Illustrated robot body ${i + 1}"><path d="M12 3 L35 2 L40 10 L40 31 L12 32Z" fill="#1d5784"/><path d="M35 2 L35 11 L40 10" fill="#f6f2e8"/><circle cx="20" cy="20" r="4" fill="#f6f2e8"/><circle cx="32" cy="20" r="4" fill="#f6f2e8"/><path d="M15 37 L38 37 L36 59 L17 59Z M18 60 L25 60 L24 75 L16 75Z M29 60 L35 59 L40 75 L31 75Z" fill="#1d5784"/><path d="M12 40 L4 51 L8 62 M41 40 L46 54 L42 64" fill="none" stroke="#1d5784" stroke-width="7"/><circle class="machine-signal" cx="26" cy="46" r="4" fill="#b74324"/></svg></span>`;
const bodyFigure = () =>
  `<figure class="body-figure" data-body-figure><div class="figure-heading"><span class="eyebrow">Fig. 01 / A thought from the essay</span><span class="figure-status" role="status" data-body-status>1 model → 6 bodies</span></div><div class="body-architecture"><div class="model-origin">${oldImage("paper-robot", "The Paper Robots mascot represents one shared model.", "model-image")}<span>One model</span></div><div class="distribution-line" aria-hidden="true"><svg viewBox="0 0 300 130" preserveAspectRatio="none"><path d="M0 65 L120 65 C150 65 135 15 168 15 L300 15 M120 65 L300 65 M120 65 C150 65 135 115 168 115 L300 115"/></svg></div><div class="machine-field">${Array.from({ length: 12 }, (_, i) => machine(i)).join("")}</div></div><div class="figure-controls"><span>How many bodies?</span><div role="group" aria-label="Number of robot bodies"><button type="button" data-body-count="1" aria-pressed="false">One</button><button type="button" data-body-count="6" aria-pressed="true">Six</button><button type="button" data-body-count="12" aria-pressed="false">Twelve</button></div></div><figcaption>A conceptual illustration of the essay’s proposed architecture. More bodies still mean hardware, control, and reliability problems.</figcaption></figure>`;
const skyWindow = (id = "home") =>
  `<figure class="sky-window" data-sky-view><div class="sky-image-wrap"><img src="@@assets/worlds/another-sky-tilt-00.webp" width="1100" height="618" alt="Street-level view between buildings inside Another Sky." data-sky-image loading="lazy"><div class="viewfinder" aria-hidden="true"><span>ANOTHER SKY</span><span data-sky-angle>01 / GROUND</span></div><div class="frame-corners" aria-hidden="true"></div></div><div class="sky-controller"><label for="sky-${id}">Look up <span aria-hidden="true">↗</span></label><input id="sky-${id}" type="range" min="0" max="32" value="0" step="1" data-sky-slider data-frame-base="@@assets/worlds/another-sky-tilt-" aria-label="Tilt your view from street level to overhead" aria-valuetext="Street level"><span data-sky-output>Ground</span></div><figcaption>Drag or use the arrow keys. These are views from the actual explorer.</figcaption></figure>`;

function row(work, number, { compact = false } = {}) {
  const url = work.url?.startsWith("https:") ? work.url : "@@" + work.url;
  const format = work.formats
    .map(
      (x) =>
        ({
          essays: "Essay / note",
          films: "Film",
          worlds: "Interactive",
          research: "Research",
        })[x],
    )
    .join(" + ");
  return `<article class="catalogue-row ${compact ? "compact" : ""}" data-work data-formats="${work.formats.join(" ")}" data-search="${esc([work.title, work.excerpt, ...work.tags].join(" ").toLowerCase())}"><span class="row-number">${String(number).padStart(2, "0")}</span><div class="row-main"><div class="row-meta">${esc(format)} <span>· ${esc(work.date)}</span></div><h3><a href="${url}">${esc(work.title)}</a></h3><p>${esc(work.excerpt)}</p></div><a class="row-arrow" href="${url}" aria-label="Open ${esc(work.title)}">${arrow}</a></article>`;
}

const home = `<main id="main">
<section class="cover shell" aria-labelledby="cover-title"><div class="cover-spine"><span>THE ILLUSTRATED JOURNAL</span><i></i><span>BY SAN KALA</span></div><div class="cover-copy">${eyebrow("01", "An essay, now a film")}<h1 id="cover-title">GPT-7 will<br>have <em>arms.</em></h1><p>What if the model that writes your code<br class="desktop-break"> also folds your laundry?</p><div class="cover-actions">${button(live + "/essays/gpt7-will-have-arms", "Read the essay")}<a class="watch-link" href="${video}"><span class="play-disc" aria-hidden="true">▶</span><span>Watch the film<small>Paper Robots · 7:29</small></span></a></div><span class="margin-note">A forecast about where AI goes next.</span></div><div class="paper-stage" data-paper-stage><img class="cover-art" src="@@assets/cover/robot-and-the-page-v2-flat-paper.webp" width="1536" height="1024" alt="A blue paper robot reaches out from a folded page to place a red cup beside a tiny person." fetchpriority="high"><div class="art-annotation"><svg viewBox="0 0 140 64" aria-hidden="true"><path d="M135 4 C73 7 61 41 8 43 M18 32 L7 44 L23 50"/></svg><span>out of the page,<br>into the world</span></div></div><div class="cover-colophon"><span>Essays · films · things you can explore</span><a href="#notebook">Open the notebook <span aria-hidden="true">↓</span></a><span>San Kala / September 2026</span></div></section>
<section class="introduction shell"><span class="eyebrow">A note from the author</span><p>I work on AI. I’m interested in what happens when it can act in the world, how we make that go well, and what we might build with it.</p><div class="author-inline">${oldImage("san-kala", "San Kala")}<div><span>San Kala</span><a href="@@about/index.html">A little about me ${arrow}</a></div></div></section>
<section class="idea-spread shell"><div class="spread-margin">${eyebrow("02", "Follow the idea")}<span class="margin-number" aria-hidden="true">∞</span></div><div class="idea-copy"><h2>A mind can have<br><em>more than two hands.</em></h2><p>One human gets one body. Software works differently. The essay asks what happens if the same frontier model can operate many robots.</p><p>That is the argument behind the first Paper Robots film.</p><a class="text-link" href="@@films/index.html">The coming robotics revolution ${arrow}</a></div>${bodyFigure()}</section>
<section class="world-spread" aria-labelledby="world-title"><div class="shell world-heading">${eyebrow("03", "A world you can walk into")}<span class="world-imprint">DYSON SWARM / SPACE EXPERIMENTS</span></div><div class="shell world-grid"><div class="world-copy"><h2 id="world-title">The sky has<br><em>an address.</em></h2><p>Stand on the inside of a space habitat. Look up, and the ground on the other side is above your head.</p><p class="hand-note">Try looking a little higher →</p>${button("https://dysonswarm.com/another-sky/", "Step into Another Sky", "light")}<a class="text-link" href="@@worlds/index.html">All three little worlds ${arrow}</a></div>${skyWindow()}</div><div class="shell world-bottom"><span>An O’Neill cylinder, in your browser.</span><span>Made as an experiment. Open to explore.</span></div></section>
<section id="notebook" class="notebook shell"><div class="notebook-heading">${eyebrow("04", "The rest of the notebook")}<h2>Things built.<br><em>Things learned.</em></h2><p>Research notes, small worlds, and a startup that didn’t work out. The unfinished paths belong here too.</p><a class="text-link" href="@@writing/index.html">Browse all eight pieces ${arrow}</a>${thread()}</div><div class="notebook-rows">${[works.find((x) => x.slug === "eai-challenge"), works.find((x) => x.slug === "startr-postmortem"), works.find((x) => x.slug === "a-clauiet-life"), works.find((x) => x.slug === "zinify")].map((x, i) => row(x, i + 1, { compact: true })).join("")}</div></section>
<section class="research-teaser shell"><div class="research-photo"><img src="@@assets/research/uist-award.webp" alt="San and his collaborator holding the UIST 2023 Honorable Mention certificate." width="1000" height="1334" loading="lazy"><span class="photo-label">UIST, 2023 / ZINify</span></div><div>${eyebrow("05", "The work behind the writing")}<h2>From silicon<br><em>to systems that learn.</em></h2><p>Chip design at Texas Instruments. Computer science at UC San Diego. Now, applied AI research at eBay.</p><p>The papers, prototypes, and milestones live here alongside the essays.</p><div class="inline-links"><a class="text-link" href="@@research/index.html">Research & publications ${arrow}</a><a class="text-link" href="@@about/index.html#history">The longer story ${arrow}</a></div></div></section>
${letterBand()}</main>`;

const catalogue = `<main id="main" class="archive-page shell"><header class="page-heading">${eyebrow("INDEX", "The complete notebook")}<h1>The <em>notebook.</em></h1><p>Essays, films, research, and worlds you can explore. Different forms for the questions I keep coming back to.</p></header><section class="archive" aria-label="Browse all work"><div class="archive-tools"><div class="filters" role="group" aria-label="Filter by format">${[
  ["all", "Everything"],
  ["essays", "Essays & notes"],
  ["films", "Films"],
  ["worlds", "Worlds"],
  ["research", "Research"],
]
  .map(
    ([id, label]) =>
      `<button type="button" data-filter="${id}" aria-pressed="${id === "all"}">${label}</button>`,
  )
  .join(
    "",
  )}</div><label class="search-box"><span>Search the notebook</span><input type="search" data-search-input placeholder="AI, space, something else…" aria-label="Search the notebook"></label></div><div class="archive-count"><span role="status" data-result-count>8 pieces</span><button type="button" class="reset-search" data-reset hidden>Clear filters ${arrow}</button></div><div class="archive-rows">${works.map((x, i) => row(x, i + 1)).join("")}</div><p class="empty-results" data-empty hidden>No pieces match that search. Try a different word or clear the filters.</p></section><aside class="archive-footnote"><span class="eyebrow">Looking for the older pages?</span><p>The <a href="https://sankala.me/notes">existing writing archive</a>, <a href="https://sankala.me/lab">Lab route</a>, and <a href="https://sankala.me/resume">full CV</a> remain available. The current Lab has no published entries; the interactive projects are collected under Worlds here.</p></aside>${letterBand()}</main>`;

const worlds = `<main id="main"><header class="page-heading shell">${eyebrow("WORLDS", "Small experiments / large questions")}<h1>A few places<br><em>to get lost.</em></h1><p>A quiet life as a bee, a civilization building around a star, and a landscape that curves overhead.</p></header><section class="world-spread worlds-feature"><div class="shell world-grid"><div class="world-copy"><div class="eyebrow">01 / Another Sky</div><h2>Look up.</h2><p>The other side of an O’Neill cylinder is a landscape in the sky. A small experiment in what it might feel like to live there.</p>${button("https://dysonswarm.com/another-sky/", "Enter the explorer", "light")}</div>${skyWindow("worlds")}</div></section><section class="world-projects shell"><article><a href="https://sankala.me/toys/bee-sim/index.html"><img src="@@assets/worlds/bee-life.webp" alt="The quiet pixel landscape of A Clauiet Life, with a small bee above flowers." loading="lazy"></a><div class="eyebrow">02 / A Clauiet Life / January 2026</div><h2>What if Claude<br><em>were a bee?</em></h2><p>A meditative pixel simulation, made with Claude Code. A smaller scale of possible life.</p><a class="text-link" href="https://sankala.me/toys/bee-sim/index.html">Spend a little time there ${arrow}</a></article><article><a href="https://dysonswarm.com/swarm/"><img src="@@assets/worlds/dyson-swarm.webp" alt="A small yellow star surrounded by a growing swarm of orbiting solar collectors." loading="lazy"></a><div class="eyebrow">03 / Dyson Swarm / 2024</div><h2>First, take apart<br><em>a planet.</em></h2><p>A browser simulation of dismantling Mercury to build a civilization-scale solar collector.</p><a class="text-link" href="https://dysonswarm.com/swarm/">Watch the swarm grow ${arrow}</a></article></section>${letterBand()}</main>`;

const research = `<main id="main" class="shell"><header class="page-heading research-heading">${eyebrow("RESEARCH", "Papers, systems & experiments")}<h1>Built to find<br><em>something out.</em></h1><p>My work has moved from circuits to language models, information extraction, and embodied agents.</p><a class="text-link" href="https://sankala.me/resume">Full professional profile & CV ${arrow}</a></header><section class="research-lead"><div class="research-abstract"><span class="eyebrow">NeurIPS 2025 / FMEA Workshop</span><h2>Let the evaluator<br><em>teach the agent.</em></h2><p>Evaluator-Guided LLM Distillation for Embodied Agent Decision-Making.</p><p class="muted">C. Pradeep and S. P. Kumar Sreekala. Team AxisTilted2 placed first in the Embodied Agent Interface Challenge.</p><div class="inline-links"><a class="text-link" href="https://openreview.net/pdf?id=gABfrJI5ni">Read the paper ${arrow}</a><a class="text-link" href="https://sankala.me/notes/eai-challenge">The accessible write-up ${arrow}</a><a class="text-link" href="https://foundation-models-meet-embodied-agents.github.io/eai_challenge/">Challenge ${arrow}</a></div></div><div class="research-diagram" aria-label="Diagram: task, agent, evaluator, then distillation. A simplified illustration of the paper’s approach."><span>01 / A task</span><i>↓</i><strong>The agent tries</strong><i>↓</i><span>The evaluator responds</span><i>↓</i><strong>Distill what worked</strong><small>A simplified view of the approach</small></div></section><section class="publication-list"><h2>Selected publications</h2><article id="zinify"><span class="publication-year">2023</span><div><div class="eyebrow">UIST Adjunct / Honorable Mention</div><h3>ZINify: Transforming Research Papers into Engaging Zines with Large Language Models</h3><p>J. Shriram and S. P. Kumar Sreekala</p><div class="inline-links"><a href="https://dl.acm.org/doi/abs/10.1145/3586182.3625118">Paper ${arrow}</a><a href="https://jaidevshriram.com/zinify-uist/">Project & demo ${arrow}</a></div></div></article><article id="power-quality"><span class="publication-year">2019</span><div><div class="eyebrow">IEEE DISCOVER / Best Paper Award</div><h3>Power Quality Event Classification Using Long Short-Term Memory Networks</h3><p>S. K. G. Manikonda, J. Santhosh, S. P. Kumar Sreekala, S. Gangwani, and D. N. Gaonkar</p><a href="https://sankala.me/resume">Background and award record ${arrow}</a></div></article></section><section class="work-history"><h2>At work</h2><div class="work-job"><span>2024–present</span><div><h3>eBay</h3><strong>Applied Researcher / Knowledge Extraction for Search</strong><p>Multimodal information extraction, synthetic training and evaluation data, and small-model pipelines at production scale.</p></div></div><div class="work-job"><span>2019–2022</span><div><h3>Texas Instruments</h3><strong>ASIC Digital Design Engineer</strong><p>Physical design, timing and reliability signoff, RTL, and automation for chip-design flows.</p></div></div><a class="text-link" href="@@about/index.html#history">All milestones, education & awards ${arrow}</a></section>${letterBand()}</main>`;

const about = `<main id="main" class="shell"><section class="about-opening"><div>${eyebrow("ABOUT", "The person making these things")}<h1>Hi,<br><em>I’m San.</em></h1><p class="about-intro">Pick hard things you want to understand.<br>Build until they’re real.</p><p>I started in electrical engineering, found machine learning through Kaggle, and spent a few years designing chips at Texas Instruments. Then came computer science at UC San Diego, and applied AI research at eBay.</p><p>Paper Robots is where the essays become films. Dyson Swarm is where the space projects live. They’re different parts of the same set of interests.</p><div class="inline-links"><a class="text-link" href="mailto:san@sankala.me">Say hello ${arrow}</a><a class="text-link" href="https://sankala.me/documents/resume.pdf">Download the CV ${arrow}</a></div></div><figure class="about-portrait">${oldImage("san-kala", "San Kala, wearing a white shirt against a blue background.", "", false)}<figcaption>San Kala / researcher, writer, maker of Paper Robots</figcaption></figure></section><section id="history" class="milestones"><div class="milestone-intro"><div class="eyebrow">The longer story</div><h2>A few turns<br><em>along the way.</em></h2><p>The full set of milestones from the original homepage, including the paths that changed direction.</p></div><div class="timeline">${timeline.map(([year, title, description, url, label], i) => `<details ${i === 0 ? "open" : ""}><summary><span>${year}</span><h3>${title}</h3><i aria-hidden="true">+</i></summary><div class="timeline-body"><p>${description}</p>${timelineImages[i] ? `<figure class="timeline-photo"><img src="@@assets/research/${timelineImages[i][0]}" alt="${timelineImages[i][1]}" loading="lazy"></figure>` : ""}${url ? `<a class="text-link" href="${url.startsWith("https:") ? url : "@@" + url}">${label} ${arrow}</a>` : ""}</div></details>`).join("")}</div></section><section class="about-record"><div><h2>Education</h2><p><strong>University of California San Diego</strong><br>MS, Computer Science & Engineering · 2024</p><p><strong>National Institute of Technology Karnataka</strong><br>B.Tech, Electrical & Electronics Engineering · 2019</p></div><div><h2>Honors</h2><ul><li>NeurIPS EAI Challenge · 1st place, 2025</li><li>UIST Student Innovation Contest · Honorable Mention, 2023</li><li>eBay University ML Challenge · 1st of 591 teams, 2023</li><li>IEEE DISCOVER · Best Paper Award, 2019</li><li>Kaggle Competitions Expert · silver and bronze medals</li></ul></div></section>${letterBand()}</main>`;

const films = `<main id="main"><header class="film-heading shell"><div class="film-identity">${oldImage("paper-robot", "Paper Robots mascot", "", false)}<span>A film project by San Kala</span></div><h1>Paper Robots</h1><p>Animated essays about AI, robots, and possible futures.</p></header><section class="cinema shell"><a class="cinema-screen" href="${video}">${oldImage("many-arms-film", "Watch The Coming Robotics Revolution. The blue paper robot has six arms extending from a monitor.", "", false)}<span class="cinema-play" aria-hidden="true">▶</span></a><div class="cinema-caption"><span>FILM 01 / 7 MIN 29 SEC</span><span>Published September 6, 2026</span></div><div class="film-description"><h2>The coming<br><em>robotics revolution.</em></h2><div><p>What happens if the model that powers your chatbot can also power a robot? An animated adaptation of <em>GPT-7 Will Have Arms</em>, my December 2025 essay.</p><p>The title is a forecast about embodied AI, not a product announcement.</p><div class="inline-links">${button(video, "Watch on YouTube")}<a class="text-link" href="${live}/essays/gpt7-will-have-arms">Read the full argument ${arrow}</a></div></div></div></section><section class="film-stills shell"><div class="section-heading"><div class="eyebrow">Inside the first film</div><h2>A world on paper.</h2></div><div class="still-strip">${oldImage("desert-traveler", "The small traveler in a vermilion desert below blue mountains.")}${oldImage("robot-workshop", "A person working beside a cobalt robot.")}${oldImage("robot-hand", "An enormous robot hand reaches toward the traveler.")}</div><p class="muted">The paintings are part of the film’s visual world. The arguments and sources are in the essay.</p></section>${letterBand()}</main>`;

function simpleMarkdown(markdown) {
  const inline = (s) =>
    esc(s)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return markdown
    .trim()
    .split(/\n\s*\n/)
    .map((block) =>
      block.startsWith("## ")
        ? `<h2>${inline(block.slice(3))}</h2>`
        : block.startsWith("# ")
          ? ""
          : `<p>${inline(block.replaceAll("\n", " "))}</p>`,
    )
    .join("");
}
const startr = notesData.find((x) => x.slug === "startr-postmortem");
const postmortem = `<main id="main" class="article-shell"><header class="article-heading">${eyebrow("NOTE", "Entrepreneurship / December 2025")}<h1>A startup that<br><em>didn’t make it.</em></h1><p>StartR Accelerator: A Post-Mortem</p><div class="article-author">${oldImage("san-kala", "San Kala", "", false)}<span>By San Kala · 5 min read<br>Original pitch: October 2023</span></div></header><div class="article-context">From the existing notebook. The text below is the complete published post-mortem, in the proposed reading layout.</div><article class="article-body">${simpleMarkdown(startr.content)}</article><div class="article-end"><a class="text-link" href="@@writing/index.html">Back to the notebook ${arrow}</a><a class="text-link" href="https://sankala.me/notes/startr-postmortem">Original page ${arrow}</a></div>${letterBand()}</main>`;

const letter = `<main id="main" class="letter-page shell"><div class="letter-front">${oldImage("paper-robot", "Paper Robots mascot", "letter-robot", false)}<div class="eyebrow">Paper Robots / a proposed free publication</div><h1>More from<br><em>this little world.</em></h1><p class="lead">Complete essays, animated films,<br>and things you can explore. By San Kala.</p><p>I’m planning to publish the essays on Substack too, so you can read, share, and discuss them there. The website will keep the interactive versions and the rest of my work together.</p><div class="not-live"><strong>The letter isn’t open yet.</strong><p>This is a design preview. A Substack publication has not been created, so there’s no email field collecting addresses here.</p><a class="text-link" href="@@films/index.html">Watch the first film while you’re here ${arrow}</a></div></div><aside class="letter-edition"><span class="eyebrow">First edition / planned contents</span><h2>GPT-7 will<br><em>have arms.</em></h2>${oldImage("many-arms-film", "The many-armed robot thumbnail for the first animated essay.")}<ol><li>The complete reading edition of the essay</li><li>The animated film, included in the post</li><li>Sources and a link to interactive figures</li><li>A question to discuss with readers</li></ol><p>Free. No separate weekly publishing promise.</p><a href="@@review.html#publishing" class="text-link">How the two editions work ${arrow}</a></aside></main>`;

const review = `<main id="main" class="review-page"><header class="page-heading">${eyebrow("SECOND STUDY", "Direction one, developed")}<h1>A journal with<br><em>a world of its own.</em></h1><p>The original direction’s paper, cobalt, and warmth, developed into an illustrated publication with a complete content structure.</p></header><p class="review-lead">San’s feedback: retain direction one, account for the rest of the existing site, publish substantial content on Substack itself, and make the design feel authored. This is a working proposal, not a deployed replacement or an award claim.</p><div class="review-actions">${button("@@index.html", "Open the new homepage")}<a class="text-link" href="@@writing/index.html">Try the complete notebook ${arrow}</a><a class="text-link" href="@@about/index.html#history">Find the old milestones ${arrow}</a></div><section class="review-section"><h2>What makes it more personal</h2><ul><li><strong>A cover made for this essay:</strong> the Paper Robots character reaches out from a folded page into the physical world. The exact prompt, original PNG, and display WebP are in <code>assets/cover/</code>.</li><li><strong>An idea you can inspect:</strong> change the number of bodies connected to one model. This is a labeled conceptual illustration, not measured robotics capability.</li><li><strong>A world you can look around:</strong> tilt the view inside Another Sky using 33 frames from the actual rendered explorer.</li><li><strong>A complete notebook:</strong> search and filter the eight existing pieces and publications. The complete StartR post-mortem demonstrates the new reading treatment.</li><li><strong>The person behind the pictures:</strong> the real UIST photo, research work, all ten original milestones, education, honors, and CV links are part of the design.</li></ul><div class="review-pair"><figure><a href="@@../2026-09-audience-site/illustrated-journal/index.html"><img src="@@../2026-09-audience-site/previews/desktop/illustrated-journal.jpg" alt="The first proof of concept, with the reaching robot hand." loading="lazy"></a><figcaption>First study / useful structure, limited character</figcaption></figure><figure><a href="@@index.html"><img src="@@previews/desktop/home.jpg" alt="The second study, with the original folded-page robot cover." loading="lazy"></a><figcaption>Second study / custom cover, interactive ideas, fuller site</figcaption></figure></div></section><section class="review-section" id="content-map"><h2>Where everything goes</h2><p>The homepage selects a starting point. The archive and interior pages keep the breadth of the existing site within one or two clicks.</p><table class="map-table"><thead><tr><th>Existing content</th><th>In this design</th><th>What happens to the live URL</th></tr></thead><tbody><tr><td>GPT-7 essay & film</td><td>Cover, Writing, and Films</td><td>Existing essay URL and YouTube link stay intact</td></tr><tr><td>EAI Challenge write-up</td><td>Notebook and Research</td><td><code>/notes/eai-challenge</code> stays intact</td></tr><tr><td>StartR post-mortem</td><td>Notebook, full reading page, About timeline</td><td><code>/notes/startr-postmortem</code> stays intact</td></tr><tr><td>Another Sky, bee simulation, Dyson swarm</td><td>Worlds and the complete notebook</td><td>All three interactive URLs stay intact</td></tr><tr><td>Three research publications</td><td>Research, with paper/project links</td><td>External source links and CV stay intact</td></tr><tr><td>All ten news & career milestones</td><td>About, in an expandable timeline</td><td>Original homepage anchors get an implementation mapping</td></tr><tr><td>Education, honors, work details, PDF</td><td>Research & About, with the full CV linked</td><td><code>/resume</code> and the PDF stay intact</td></tr><tr><td>Lab index</td><td>Published interactives are under Worlds</td><td><code>/lab</code> remains valid; it currently has no published entries</td></tr><tr><td>Portrait, research photos, contact & profiles</td><td>Author context, About, Research, footer</td><td>Existing public assets and profile links stay intact</td></tr></tbody></table><p class="small">The catalogue is generated from <code>src/data/site-content.js</code>, plus the two research projects not already represented there. No production route or source page was removed. The older page’s UIST photograph was mislabeled as an EAI presentation; this design uses it only for the actual UIST project.</p></section><section class="review-section" id="publishing"><h2>Substack should have the essays, too.</h2><p><strong>Revised recommendation: publish complete, free reading editions on Substack.</strong> Readers should be able to finish the argument there, watch the film, share a passage, restack the post, and join a discussion. The site holds the rich edition: interactive figures, experiments, sources, and the rest of the author’s work.</p><p>Substack’s <a href="https://on.substack.com/p/demystifying-the-feed">own explanation of its feed</a> says it uses interests, subscriptions, follows, audience overlap, and activity inside Substack to find relevant work. Publishing native posts gives readers something to engage with there. That is a reason to participate; it does not establish a guaranteed ranking boost for full text.</p><ol><li>Keep one master manuscript in this repo.</li><li>Publish the complete reading edition on Substack, with images, sources, and the film.</li><li>Keep the site edition at its existing URL; link to it for interactive figures or additional material.</li><li>Share a few good standalone observations or scenes through Notes and X, leading to the relevant edition.</li><li>When correcting the argument, update both editions from the master and keep the original publication date visible.</li></ol><p class="small">This supersedes the first study’s adapted-letter default. Substack is still proposed and entirely free; no account, publication address, subscriber form, paid plan, or sending action is connected.</p></section><section class="review-section"><h2>My design recommendation</h2><p>Use the author’s journal as the main site, and let Paper Robots supply the visual world. Keep the most expressive artwork on covers and chapter openings; give reading pages and research records quieter layouts. Build two or three memorable interactions around real ideas and projects.</p><p>The wider content matters: the chip-design history, the contest work, the bee simulation, and the startup that didn’t work out make this your site. They should remain part of the story.</p><p class="small">The prototype retains native scrolling, supports keyboard controls and reduced motion, and has no heavy 3D engine, autoplaying video, or artificial audience metrics. The cover uses a small pointer-driven perspective shift. The world control uses actual rendered frames.</p></section></main>`;

await Promise.all([
  page("index.html", "The illustrated journal", home, { className: "home" }),
  page("writing/index.html", "The notebook", catalogue, { section: "Writing" }),
  page("worlds/index.html", "Worlds", worlds, { section: "Worlds" }),
  page("research/index.html", "Research", research, { section: "Research" }),
  page("about/index.html", "About", about, { section: "About" }),
  page("films/index.html", "Paper Robots", films, { section: "Films" }),
  page(
    "notes/startr-postmortem/index.html",
    "StartR: a post-mortem",
    postmortem,
    { section: "Writing" },
  ),
  page("letter.html", "The letter", letter),
  page("review.html", "Design notes and content map", review),
]);
await writeFile(
  resolve(root, "content-map.json"),
  JSON.stringify(
    {
      sourceNotes: "src/data/site-content.js",
      works: works.map(({ slug, title, formats, url }) => ({
        slug,
        title,
        formats,
        url,
      })),
      timelineSource: "src/pages/home/Home.jsx",
      milestones: timeline.map(([year, title]) => ({ year, title })),
      note: "All existing live URLs are unchanged. The Lab currently has no published entries. Research and about pages summarize, and link to, the full existing CV. Graduation month differs between current Home and Resume; this study uses the year only.",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Built 9 pages from ${notesData.length} existing notes, with ${works.length} catalogue entries and ${timeline.length} milestones.`,
);
