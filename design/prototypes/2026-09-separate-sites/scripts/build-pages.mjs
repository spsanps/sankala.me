import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { notesData } from "../../../../src/data/site-content.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const previous = JSON.parse(
  await readFile(
    resolve(root, "../2026-09-illustrated-journal/content-map.json"),
    "utf8",
  ),
);
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const arrow = '<span aria-hidden="true">↗</span>';
const art = "@@../2026-09-audience-site/shared/assets/";
const journalArt = "@@../2026-09-illustrated-journal/assets/";
const video = "https://www.youtube.com/watch?v=kzvqj4jurW0";
const topics = [
  {
    id: "ai",
    name: "AI & robotics",
    number: "01",
    description:
      "Learning systems, embodied agents, and what happens when models can act.",
    examples: "GPT-7 Will Have Arms · EAI Challenge · ZINify",
  },
  {
    id: "worlds",
    name: "Space & simulated worlds",
    number: "02",
    description:
      "Places to explore, from a bee’s little world to a civilization around a star.",
    examples: "Another Sky · A Clauiet Life · Dyson Swarm",
  },
  {
    id: "making",
    name: "Building & reflection",
    number: "03",
    description:
      "Projects, decisions, and what I learned by trying to make something work.",
    examples: "The StartR post-mortem · ZINify",
  },
];
const assignment = {
  "another-sky": { topics: ["worlds"], formats: ["experiment"] },
  "gpt7-will-have-arms": { topics: ["ai"], formats: ["writing", "film"] },
  "eai-challenge": { topics: ["ai"], formats: ["writing", "research"] },
  "a-clauiet-life": { topics: ["worlds"], formats: ["experiment"] },
  "dyson-swarm": { topics: ["worlds"], formats: ["experiment"] },
  "startr-postmortem": { topics: ["making"], formats: ["writing"] },
  zinify: { topics: ["ai", "making"], formats: ["research"] },
  "power-quality": { topics: ["ai"], formats: ["research"] },
};
const works = previous.works.map((work) => {
  const note = notesData.find((n) => n.slug === work.slug);
  return {
    slug: work.slug,
    title:
      note?.title ||
      (work.slug === "power-quality"
        ? "Power quality event classification with LSTMs"
        : work.title),
    date: note?.date || (work.slug === "zinify" ? "2023" : "2019"),
    description:
      note?.excerpt ||
      (work.slug === "zinify"
        ? "Turning research papers into visual zines with language models. UIST 2023 Student Innovation Contest Honorable Mention."
        : "Using recurrent neural networks to classify disturbances in electrical signals. IEEE DISCOVER 2019 Best Paper Award."),
    url:
      work.slug === "startr-postmortem"
        ? "https://sankala.me/notes/startr-postmortem"
        : work.slug === "power-quality"
          ? "https://sankala.me/resume"
          : work.url,
    ...assignment[work.slug],
  };
});
const formatNames = {
  research: "Research",
  writing: "Essay / note",
  film: "Film",
  experiment: "Experiment",
};
const milestoneDetails = [
  [
    "First place in the NeurIPS 2025 EAI Challenge at the Foundation Models Meet Embodied Agents Workshop, as team AxisTilted2.",
    "https://sankala.me/notes/eai-challenge",
    "Read the account",
  ],
  [
    "Joined eBay’s Knowledge Extraction team in April 2024. Researching and building language-model systems for information extraction. Promoted in October 2025.",
    "https://sankala.me/resume",
    "Current work",
  ],
  [
    "Completed an MS in computer science at UC San Diego. Worked with Julian McAuley’s group on AI music and language models, and TA’d recommender systems and data mining.",
    null,
    null,
  ],
  [
    "ZINify received an Honorable Mention at the UIST Student Innovation Contest. Experiments with language models and visual storytelling.",
    "https://jaidevshriram.com/zinify-uist/",
    "See ZINify",
  ],
  [
    "Accepted into UCSD’s StartR Rady accelerator with Glyp, a writing assistant for novelists. The project did not make it to market; I wrote about what went wrong.",
    "https://sankala.me/notes/startr-postmortem",
    "Read the post-mortem",
  ],
  [
    "Summer research with eBay’s Knowledge Extraction team, working on information extraction at scale.",
    null,
    null,
  ],
  [
    "Won the eBay University Machine Learning Challenge with named-entity extraction from product titles. The challenge led to the research internship.",
    "https://innovation.ebayinc.com/stories/ebay-announces-winners-of-4th-annual-machine-learning-challenge/",
    "The announcement",
  ],
  [
    "Started the MS at UC San Diego after three years in chip design.",
    null,
    null,
  ],
  [
    "ASIC digital design at Texas Instruments, 2019–2022: physical design, RTL, and getting actual chips out of the door.",
    "https://sankala.me/resume",
    "Engineering background",
  ],
  [
    "Graduated from NIT Karnataka in electrical and electronics engineering. Deep learning through Kaggle, a thesis on power-quality classification, and the Amateur Astronomy Club.",
    null,
    null,
  ],
];
const milestones = previous.milestones.map((m, i) => ({
  ...m,
  description: milestoneDetails[i][0],
  url: milestoneDetails[i][1],
  linkLabel: milestoneDetails[i][2],
}));
const image = (name, alt, extra = "") =>
  `<img src="${art + name}.webp" alt="${esc(alt)}" ${extra}>`;
const action = (url, label, extra = "") =>
  `<a class="action ${extra}" href="${url}">${label} ${arrow}</a>`;
const topicCards = () =>
  topics
    .map(
      (t) =>
        `<a class="topic-folder topic-${t.id}" href="@@san-kala/work/index.html?topic=${t.id}"><span class="tab">${t.number} / ${works.filter((w) => w.topics.includes(t.id)).length} pieces</span><h3>${t.name}</h3><p>${t.description}</p><span class="examples">${t.examples}</span><span class="folder-arrow" aria-hidden="true">↗</span></a>`,
    )
    .join("");
const workRow = (work) =>
  `<article class="work-row" data-work data-slug="${work.slug}" data-topics="${work.topics.join(" ")}" data-formats="${work.formats.join(" ")}" data-search="${esc(`${work.title} ${work.description} ${work.topics.map((t) => topics.find((x) => x.id === t).name).join(" ")}`.toLowerCase())}"><div class="work-date">${esc(work.date)}</div><div><div class="work-meta">${work.topics.map((t) => topics.find((x) => x.id === t).name).join(" · ")}</div><h3><a href="${work.url}">${esc(work.title)} ${arrow}</a></h3><p>${esc(work.description)}</p><div class="formats">${work.formats.map((f) => `<span>${formatNames[f]}</span>`).join("")}</div></div></article>`;
const journey = `<section class="journey" aria-labelledby="journey-title"><div class="journey-label"><span class="eyebrow">The short version</span><h2 id="journey-title">How I got here</h2><a href="@@san-kala/history/index.html">The full history ${arrow}</a></div><ol><li><span>2019</span><strong>NIT Karnataka</strong><small>Electrical engineering</small></li><li><span>2019–22</span><strong>Texas Instruments</strong><small>Chip design</small></li><li><span>2022–24</span><strong>UC San Diego</strong><small>MS, computer science</small></li><li><span>2024–now</span><strong>eBay</strong><small>Applied AI research</small></li></ol></section>`;

async function page(
  path,
  title,
  content,
  { brand = "san", section = "" } = {},
) {
  const prefix = "../".repeat(path.split("/").length - 1);
  const isPaper = brand === "paper";
  const isReview = brand === "review";
  const name = isPaper
    ? "Paper Robots"
    : isReview
      ? "Two sites, one author"
      : "San Kala";
  const home = isPaper
    ? "paper-robots/index.html"
    : isReview
      ? "index.html"
      : "san-kala/index.html";
  const nav = isPaper
    ? [
        ["paper-robots/index.html#about", "About"],
        ["paper-robots/index.html#topics", "Topics"],
        ["paper-robots/index.html#library", "Essays & films"],
        ["paper-robots/index.html#follow", "Follow"],
      ]
    : isReview
      ? [
          ["san-kala/index.html", "San Kala"],
          ["paper-robots/index.html", "Paper Robots"],
        ]
      : [
          ["san-kala/work/index.html", "Work & ideas"],
          ["san-kala/history/index.html", "History"],
          ["san-kala/index.html#about", "About"],
        ];
  const navLinks = nav
    .map(
      ([href, label]) =>
        `<a href="${prefix + href}" ${section === label ? 'aria-current="page"' : ""}>${label}</a>`,
    )
    .join("");
  const header = `<div class="prototype-strip"><span>Design study · separate sites</span><a href="${prefix}index.html">Site relationship & content map ${arrow}</a></div><header class="site-header shell"><a class="wordmark" href="${prefix + home}">${isPaper ? image("paper-robot", "", 'width="46" height="46"') : ""}${name}<span class="wordmark-dot">.</span></a><nav class="desktop-nav" aria-label="Main">${navLinks}${!isPaper && !isReview ? '<a href="https://sankala.me/resume">CV ↗</a>' : ""}</nav><details class="mobile-menu"><summary>Menu +</summary><nav aria-label="Mobile">${navLinks}</nav></details></header>`;
  const footer = isPaper
    ? `<footer class="site-footer shell"><div><strong>Paper Robots</strong><p>AI, robots & possible futures.<br>Essays and films by San Kala.</p></div><nav aria-label="Footer"><a href="@@san-kala/index.html">About the author ${arrow}</a><a href="https://www.youtube.com/@paperrobotsfilms">YouTube ${arrow}</a><a href="mailto:san@sankala.me">Get in touch ${arrow}</a></nav><small>Free to read and watch.</small></footer>`
    : `<footer class="site-footer shell"><div><strong>San Kala.</strong><p>Research, writing, experiments.<br>A personal site, with room to change.</p></div><nav aria-label="Footer"><a href="mailto:san@sankala.me">Email ${arrow}</a><a href="https://github.com/spsanps">GitHub ${arrow}</a><a href="https://linkedin.com/in/sanjayanps">LinkedIn ${arrow}</a><a href="https://kaggle.com/spsanps">Kaggle ${arrow}</a><a href="https://sankala.me/documents/resume.pdf">CV PDF ${arrow}</a></nav><small><a href="@@index.html">Design study / September 2026</a></small></footer>`;
  const html =
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="color-scheme" content="light"><title>${esc(title)} · Design study</title><link rel="stylesheet" href="${prefix}styles/sites.css"><script defer src="${prefix}scripts/library.js"></script></head><body class="brand-${brand}"><a class="skip" href="#main">Skip to content</a>${header}${content}${footer}</body></html>`.replaceAll(
      "@@",
      prefix,
    );
  await mkdir(resolve(root, dirname(path)), { recursive: true });
  await writeFile(resolve(root, path), html);
}

const sanHome = `<main id="main"><section class="personal-intro shell" id="about"><div class="intro-copy"><span class="eyebrow">Researcher · writer · curious about things</span><h1>Hi, I’m<br><em>San Kala.</em></h1><p class="intro-lead">I’m an AI researcher at eBay. I write about AI and robotics, build small experiments, and keep notes on what I learn.</p><p class="intro-detail">Before this: computer science at UC San Diego, chip design at Texas Instruments, and electrical engineering at NIT Karnataka.</p><div class="actions">${action("@@san-kala/work/index.html", "Explore my work")}${action("mailto:san@sankala.me", "Say hello", "quiet")}</div></div><div class="portrait-composition"><figure class="portrait">${image("san-kala", "San Kala", 'fetchpriority="high"')}<figcaption>San Kala / a face to the name</figcaption></figure><figure class="research-snapshot"><img src="${journalArt}research/uist-award.webp" alt="San and his collaborator at the UIST 2023 award ceremony."><figcaption>UIST ’23 · ZINify</figcaption></figure><span class="portrait-note">Making, thinking,<br>occasionally getting it right.</span></div></section><div class="shell">${journey}</div>
<section class="section shell" id="ideas"><div class="section-heading"><div><span class="eyebrow">A map of the work</span><h2>Things I keep coming back to.</h2></div><a href="@@san-kala/work/index.html">Everything ${arrow}</a></div><div class="topic-folders">${topicCards()}</div></section>
<section class="section shell selected"><div class="section-heading"><div><span class="eyebrow">From the notebook</span><h2>A few starting points.</h2></div><span class="section-aside">Research, a place to explore,<br>and a lesson from trying.</span></div><div class="selected-grid"><article><span class="eyebrow">Research / 2025 challenge · 2026 account</span><h3><a href="https://sankala.me/notes/eai-challenge">Winning by Overfitting ${arrow}</a></h3><p>How we won the EAI Challenge, and what the result does—and doesn’t—say about embodied AI.</p><a class="text-link" href="https://openreview.net/pdf?id=gABfrJI5ni">Read the research paper ${arrow}</a></article><article><a href="https://dysonswarm.com/another-sky/">${image("another-sky", "A landscape curving overhead inside Another Sky.", 'loading="lazy"')}<h3>Another Sky ${arrow}</h3></a><p>A walk inside an O’Neill cylinder. Part of my space collection, Dyson Swarm.</p></article><article><span class="eyebrow">Personal note / December 2025</span><h3><a href="https://sankala.me/notes/startr-postmortem">A startup that didn’t make it. ${arrow}</a></h3><p>The StartR post-mortem: building a writing assistant, losing focus, and learning about distribution.</p><a class="text-link" href="@@san-kala/history/index.html">Where it fits in my history ${arrow}</a></article></div></section>
<section class="section shell elsewhere"><div class="section-heading"><div><span class="eyebrow">Projects with their own homes</span><h2>Also made by me.</h2></div></div><div class="project-homes"><a class="publication-link" href="@@paper-robots/index.html">${image("paper-robot", "", 'loading="lazy"')}<div><span class="eyebrow">The publication</span><h3>Paper Robots ${arrow}</h3><p>Animated essays about AI, robots, and possible futures.</p><small>Latest: GPT-7 Will Have Arms</small></div></a><a class="space-link" href="https://dysonswarm.com/"><span class="orbit-mark" aria-hidden="true">☉</span><div><span class="eyebrow">The space collection</span><h3>Dyson Swarm ${arrow}</h3><p>Interactive experiments in space, scale, and places we might build.</p><small>Another Sky · Dyson Swarm simulation</small></div></a></div></section></main>`;

const library = `<main id="main" class="shell"><header class="page-heading"><span class="eyebrow">San Kala / Work & ideas</span><h1>A place for<br><em>all the threads.</em></h1><p>Research, essays, films, and small worlds. Browse by what they’re about, or choose the kind of work you want to see.</p></header><div class="library-tools" data-library-tools hidden><form id="library-filters" role="search"><label>Subject<select name="topic"><option value="all">All subjects</option>${topics.map((t) => `<option value="${t.id}">${t.name}</option>`).join("")}</select></label><label>Format<select name="format"><option value="all">All formats</option>${Object.entries(
  formatNames,
)
  .map(([v, n]) => `<option value="${v}">${n}</option>`)
  .join(
    "",
  )}</select></label><label class="search-field">Search<input type="search" name="q" placeholder="A title, a question, a project…"></label><button type="reset">Reset</button></form></div><div class="library-count"><p role="status" aria-live="polite" data-count>8 pieces</p><span>Some work belongs to more than one subject.</span></div><div class="work-list">${works.map(workRow).join("")}</div><div class="empty-state" data-empty hidden><h2>No matches here.</h2><p>Try another subject, format, or search term.</p><button type="button" data-clear>Show all work</button></div><aside class="archive-note"><h2>One body of work, a few different homes.</h2><p>This is my complete index. Some pieces also belong to <a href="@@paper-robots/index.html">Paper Robots</a>; the space experiments live at <a href="https://dysonswarm.com/">Dyson Swarm</a>. Each entry takes you to the work itself.</p><a href="https://sankala.me/resume">Full publication details and CV ${arrow}</a></aside></main>`;

const history = `<main id="main" class="shell"><header class="page-heading history-heading"><div><span class="eyebrow">San Kala / History</span><h1>The path<br><em>so far.</em></h1><p>From electrical engineering and chip design to AI research—with a startup, some competitions, and a few detours along the way.</p></div><figure><img src="${journalArt}research/research-group.webp" alt="San with the UC San Diego research group."><figcaption>UC San Diego / the research years</figcaption></figure></header><div class="timeline">${milestones.map((m, i) => `<article class="milestone" data-milestone><span class="timeline-year">${m.year}</span><div><span class="milestone-number">${String(i + 1).padStart(2, "0")}</span><h2>${m.title}</h2><p>${m.description}</p>${m.url ? `<a href="${m.url}">${m.linkLabel} ${arrow}</a>` : ""}${[3, 9].includes(i) ? `<figure class="timeline-photo"><img src="${journalArt}research/${i === 3 ? "uist-award" : "nitk-lab"}.webp" alt="${i === 3 ? "UIST 2023 award ceremony." : "At the NIT Karnataka laboratory."}" loading="lazy"><figcaption>${i === 3 ? "ZINify / UIST 2023" : "Electrical engineering / NIT Karnataka"}</figcaption></figure>` : ""}</div></article>`).join("")}</div><section class="history-end"><span class="eyebrow">And still figuring things out</span><h2>The work continues.</h2><div class="actions">${action("@@san-kala/work/index.html", "Explore the work")}${action("https://sankala.me/resume", "Full CV", "quiet")}</div></section></main>`;

const paper = `<main id="main"><section class="publication-intro shell" id="about"><div class="publication-copy"><span class="eyebrow">An independent publication by San Kala</span><h1>AI, robots &<br><em>possible futures.</em></h1><p>Animated essays about the machines we’re building, the choices around them, and the worlds we might live in.</p><div class="actions">${action("#library", "Start with an essay")}${action("https://www.youtube.com/@paperrobotsfilms", "Watch on YouTube", "quiet")}</div><div class="publication-byline">${image("san-kala", "San Kala", 'width="38" height="46"')}<span>Written and made by <a href="@@san-kala/index.html">San Kala ${arrow}</a><small>Researcher by day. These are my own explorations.</small></span></div></div><figure class="publication-art"><img src="${journalArt}cover/robot-and-the-page-v2-flat-paper.webp" alt="The Paper Robots character reaches out of a folded page to place a cup in the world." fetchpriority="high"><figcaption>Big questions. Paper robots. Human choices.</figcaption></figure></section>
<section class="editorial-map shell" id="topics"><div class="section-heading"><div><span class="eyebrow">What we’re curious about</span><h2>Three threads to follow.</h2></div><span class="section-aside">The first essay is out.<br>The questions go further.</span></div><div class="editorial-threads"><article><span class="thread-number">01</span><h3>AI & robotics</h3><p>What changes when models can act in the physical world?</p><a href="#library">Start with GPT-7 Will Have Arms ${arrow}</a></article><article><span class="thread-number">02</span><h3>Minds & identity</h3><p>Agency, identity, and how we make powerful AI systems go well.</p><span class="planned-topic">An intended thread for future essays</span></article><article><span class="thread-number">03</span><h3>Possible worlds</h3><p>Space habitats, imagined futures, and what we could choose to build.</p><a href="https://dysonswarm.com/another-sky/">Explore San’s Another Sky ${arrow}</a><small>A related experiment from Dyson Swarm</small></article></div></section>
<section class="publication-library shell section" id="library"><div class="section-heading"><div><span class="eyebrow">From the publication / 01</span><h2>The first essay, now a film.</h2></div></div><article class="published-essay" data-publication-entry><a class="film-art" href="${video}">${image("many-arms-film", "GPT-7 Will Have Arms: the many-armed robot film artwork.", 'loading="lazy"')}<span class="film-duration">Watch / 7:29 ↗</span></a><div><span class="eyebrow">AI & robotics · Essay + film</span><h3>GPT-7 Will<br>Have Arms</h3><p>A forecast about foundation models and robotics: one model, many bodies, and the changes that might follow.</p><div class="actions">${action("https://sankala.me/essays/gpt7-will-have-arms", "Read the essay")}${action(video, "Watch the film", "quiet")}</div><small>Essay: December 2025 · Film: September 2026<br>Film title: The Coming Robotics Revolution</small></div></article></section>
<section class="follow-section shell" id="follow"><div><span class="eyebrow">Keep following the thread</span><h2>The next idea<br><em>when it’s ready.</em></h2><p>Follow Paper Robots on YouTube for the films.</p>${action("https://www.youtube.com/@paperrobotsfilms", "Visit the channel")}</div><aside><span class="eyebrow">The proposed reading edition</span><h3>Paper Robots on Substack</h3><p>Complete free essays, the film, and references in the same post.</p><p class="publication-status">The Substack publication has not been created yet. There is no signup form connected here.</p></aside></section></main>`;

const review = `<main id="main" class="shell"><header class="page-heading review-heading"><span class="eyebrow">Third study / architecture before more decoration</span><h1>A person.<br><em>A publication.</em></h1><p>Separate front doors, with a clear link between them. San’s history and complete body of work belong on his personal site. Paper Robots has its own editorial promise.</p></header><div class="site-choices"><a class="site-choice choice-san" href="san-kala/index.html"><span class="eyebrow">01 / sankala.me</span><h2>Meet San.</h2>${image("san-kala", "San Kala")}<p>Who I am, how I got here,<br>and what I’ve made.</p><strong>Open the personal site ${arrow}</strong></a><a class="site-choice choice-paper" href="paper-robots/index.html"><span class="eyebrow">02 / Paper Robots · address undecided</span><h2>Follow an idea.</h2>${image("paper-robot", "Paper Robots mascot")}<p>Essays and films about AI,<br>robots, and possible futures.</p><strong>Open the publication ${arrow}</strong></a></div><section class="section review-section"><span class="eyebrow">The structure</span><h2>Each site answers a different question.</h2><div class="relationship-map"><div><strong>San Kala</strong><span>The person and complete index</span><small>Work & ideas · History · About · CV</small></div><span class="map-connection">created by ↔ made by</span><div><strong>Paper Robots</strong><span>The publication</span><small>Topics · Essays & films · Follow</small></div><div class="map-space"><strong>Dyson Swarm</strong><span>San’s space collection</span><small>Another Sky · Swarm simulation</small></div></div><p>San links to Paper Robots as a project. Paper Robots credits San as its author. Dyson Swarm keeps its existing home as the space collection. The personal site does not ask visitors to subscribe before they know who San is.</p></section><section class="section review-section"><span class="eyebrow">The content model</span><h2>Subjects organize ideas.<br>Formats describe the work.</h2><div class="topic-folders">${topicCards()}</div><p>These are proposed subject groups, grounded in the current archive. The complete index stays on San’s site. Entries can belong to more than one subject; an essay can also have a film or research paper attached.</p><div class="content-table-wrap"><table><thead><tr><th>Work</th><th>Subject</th><th>Where it belongs</th></tr></thead><tbody>${works.map((w) => `<tr><td>${esc(w.title)}</td><td>${w.topics.map((t) => topics.find((x) => x.id === t).name).join(" / ")}</td><td>${w.slug === "gpt7-will-have-arms" ? "San’s index + Paper Robots publication" : ["another-sky", "dyson-swarm"].includes(w.slug) ? "San’s index + Dyson Swarm experience" : "San’s work and personal archive"}</td></tr>`).join("")}</tbody></table></div><p>Paper Robots currently has one published film, with its source essay. “Minds & identity” is an intended editorial thread, not a populated archive. Another Sky is labelled as a related external experiment. No additional published work has been invented.</p></section><section class="section review-section"><span class="eyebrow">Publishing and implementation</span><h2>Distinct identities.<br>A manageable publishing routine.</h2><p>The free Substack would carry the Paper Robots name and complete native reading editions. YouTube carries its film editions. This mockup explores a dedicated Paper Robots front door; the final address and hosting choice remain open. A separate identity does not require an independently maintained copy of every manuscript.</p><p>Keep existing essay and project URLs working. Keep the personal index complete. Select which work joins the publication; a personal startup reflection or CV does not automatically become a Paper Robots issue. Create the publication and decide its address after choosing the structure.</p><p>This is a prototype only. It does not replace the live site, reserve a domain, create an account, or collect email addresses.</p><div class="actions">${action("san-kala/work/index.html", "Try the full index")}${action("san-kala/history/index.html", "See all ten milestones", "quiet")}</div></section></main>`;

await page("index.html", "Two sites, one author", review, { brand: "review" });
await page(
  "san-kala/index.html",
  "San Kala — research, writing, experiments",
  sanHome,
);
await page("san-kala/work/index.html", "Work & ideas — San Kala", library, {
  section: "Work & ideas",
});
await page("san-kala/history/index.html", "History — San Kala", history, {
  section: "History",
});
await page(
  "paper-robots/index.html",
  "Paper Robots — AI, robots & possible futures",
  paper,
  { brand: "paper" },
);
await writeFile(
  resolve(root, "content-map.json"),
  JSON.stringify(
    {
      sources: [
        "src/data/site-content.js",
        "src/pages/home/Home.jsx",
        "src/pages/resume/Resume.jsx",
        "../2026-09-illustrated-journal/content-map.json",
      ],
      topics,
      works,
      milestones,
      publicationEntries: ["gpt7-will-have-arms"],
      status:
        "Design prototype. Distinct sites requested; taxonomy and publication address proposed. Existing URLs unchanged.",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Built five pages, ${works.length} works, ${milestones.length} milestones, and one publication entry.`,
);
