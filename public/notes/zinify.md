---
title: "ZINify"
author: Jaidev Shriram & San Kala
date: 2023-10
canonical: https://www.sankala.me/notes/zinify
---

# ZINify

**UIST 2023 · Student Innovation Contest · Honorable Mention (People’s Choice)**

*What if a research paper came out as a zine?*

[Jaidev Shriram](https://jaidevshriram.com/) & San Kala · equal contribution · UIST ’23 Adjunct · [Paper](https://dl.acm.org/doi/abs/10.1145/3586182.3625118) · [Project page](https://jaidevshriram.com/zinify-uist/)


---

Research papers are written for people who already read research papers. In 2023, Jaidev and I asked what would happen if a paper came out as a zine instead: a few folded pages of short text and pictures, the format punk scenes and independent artists have always used to say things their own way.

**Figure: Paper in, zine out.** On the page, the figure is a photocopied flyer for a copy center, drawn in code: black toner on blue copy paper. The reader puts the ZINify paper on the copier glass and watches four steps that follow the paper: 1) cut it down (an LLM, Claude in the paper, condenses the paper into short sections and picks the figures worth keeping; figures skip straight ahead), 2) plan it (Claude plans the zine page by page, and the author can steer it; a dense equation can come back as a poem), 3) picture it (the plan writes prompts for a text-to-image model; the paper names DeepFloyd IF), 4) copy it (everything is assembled into one zine). The copier, the fold and the staples belong to the figure; ZINify's real output is a multi-page PDF. The reader can then flip the eight-page zine, unfold the sheets, or copy the copy and watch it degrade over five generations.

The zine, page by page:

1. Cover: ZINIFY! Research papers into zines. Issue 1, UIST ’23. Cut. Paste. Copy.
2. Walled garden: academia is often seen as a walled garden; jargon and paywalls keep most people out.
3. The reader: curious, but not an expert. Even with good tutorials, new research is a steep climb.
4. The author: wants one paper to stand out in an exponential pile of AI papers on arXiv. Looks matter too.
5. Why zines? Self-published, small print runs, passed hand to hand, with roots in punk and queercore. Not unlike preprints.
6. How it works: PDF, then an LLM, then a summary and figures, then an LLM, then a zine plan, then a text-to-image model, then the zine. Figures skip ahead. Claude condenses and plans; you can steer the plan.
7. Math into poem: the rendering equation, and an LLM’s verse about it (Figure 3 of the paper): “In realms of code where light does dance, the rendering equation takes its chance, radiance, the light a point emits, on surfaces, its radiant flux submits.”
8. Back cover: More engaging. More accessible. Honorable Mention, People’s Choice, UIST ’23 Student Innovation Contest. Jaidev Shriram and Sanjayan Sreekala, UC San Diego, equal contribution. Copy me and pass it on.

## How it works

ZINify starts from the PDF. A large language model (we used Claude) condenses the paper into short sections and picks the figures worth keeping. Then it plans the zine: what goes on each page, and which ideas to tell differently. A dense equation might come back as a short poem. The plan also writes prompts for a text-to-image model, and the pipeline puts the words and pictures together. Authors can steer the plan along the way.

## Why zines

Zines are self-published, printed in small runs and passed from hand to hand, which isn’t so different from posting a preprint. We thought the format could help a paper reach people who would never open the PDF, and give its authors a more personal way to talk about their work.

ZINify received an Honorable Mention (People’s Choice) in the UIST 2023 Student Innovation Contest. Read the [paper](https://dl.acm.org/doi/abs/10.1145/3586182.3625118), and see [Jaidev Shriram’s project page](https://jaidevshriram.com/zinify-uist/).
