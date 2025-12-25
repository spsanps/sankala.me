# Complete AI-Generated "Slop" Text Audit

**Date:** December 24, 2025
**Purpose:** Identify ALL AI-generated, generic, or placeholder text that needs human review/rewrite

---

## CRITICAL: ORGANIZE NOTES SECTION

### Current State
- Notes section currently has 4 lorem ipsum placeholder notes
- No structure for both short notes/haikus AND long essays

### Action Required
1. **Restructure `notesData` in `src/data/content.js`** to support:
   - `type: "note"` - for short notes, haikus, quick thoughts
   - `type: "essay"` - for long-form essays like GPT-7
2. **Add GPT-7 essay to notes** with proper metadata
3. **Update Notes UI** to distinguish between short notes and essays
4. **Clear out lorem ipsum** placeholders

**Location to update:**
- `src/data/content.js` lines 102-181 (notesData)
- `src/pages/NotesIndex.jsx` - update to show note types differently
- `src/pages/Home.jsx` - notes preview section

---

## 🔴 HERO SECTION - Home Page

**File:** `src/pages/Home.jsx`

### Line 96 - Main Tagline
```
"AI researcher working on machine learning systems and intelligent agents."
```
**Issue:** Generic AI-speak. Could be anyone's tagline.
**Your rewrite:**
something about ASIC Designer turned AI researcher with Electrical Engineering roots? or something a little more chill like: Kinda did a lot

---

### Lines 102-108 - Right Column Stats
```
Current Focus: GenAI @ eBay
Latest Win: NeurIPS '25 EAI
```
**Status:** These seem factual. Keep as-is?
**Your decision:**
ok

---

## 🔴 ABOUT SECTION - Home Page

**File:** `src/pages/Home.jsx`

### Lines 156-159 - Section Heading
```
"Building intelligent systems that work in practice."
```
**Issue:** AI-generated business speak. Not personal/specific.
**Your rewrite:**
can you fix it? -- haved added my new resume SanjayanSreekala.pdf to the assets folder, so you can checK? 

---

### Lines 162-168 - About Description
```
"Currently at eBay working on ML systems at scale. Previously at UC San Diego
researching recommender systems and NLP.

Interested in the gap between research and production—building things that
actually work, at scale, with real users."
```
**Issue:** Reads like LinkedIn AI summary. Generic language ("at scale", "real users").
**Your rewrite:**
hmm come up with something

---

## 🔴 PUBLICATIONS/NEWS TIMELINE - Home Page

**File:** `src/pages/Home.jsx`

### Lines 228-237 - NeurIPS EAI Entry
```
Title: "1st Place at NeurIPS EAI Challenge"
Description: "Global first place in embodied AI challenge. Built agents that
interact with physical environments through vision-language models and
reinforcement learning."
```
**Issues:**
- Generic AI description
- Missing real paper link (currently `href="#"`)
- What was the ACTUAL work you did?

**Your actual description:**
https://openreview.net/pdf?id=gABfrJI5ni can you link to actual paper and read it and figure it out? ; actually use the competition : https://foundation-models-meet-embodied-agents.github.io/eai_challenge/ 

**Paper/Project links:**


---

### Lines 247-265 - ZINify Entry
```
Title: "ZINify: Research to Zines"
Description: "Honorable Mention at UIST 2023. Using LLMs to transform dense
papers into accessible visual zines, making research digestible for everyone."
```
**Issues:**
- Somewhat generic
- Missing real links (currently `href="#"`)

**Better description (if needed):**

https://dl.acm.org/doi/abs/10.1145/3586182.3625118
**Links:**
- Paper:
- Demo:
https://jaidevshriram.com/zinify-uist/

---

## 🔴 RESUME PAGE

**File:** `src/pages/Resume.jsx`

### Line 17 - Title/Tagline
```
"Applied AI Researcher — Kaggle Competitions Expert — LLM Research"
```
**Issue:** Reads like keyword stuffing for recruiters
**Your rewrite:**
Yea figure somethin

---

### Lines 62-66 - Current eBay Role
```
"Built & deployed Generative Extraction Models capable of 1000s of TPS with
Small Language Models (1B) to replace NER and dictionary based methods

Built synthetic datasets with Multi-Modal open source Large Language Models
to evaluate services and train small models

Automated Prompt Engineering Flows with Agents/Workflows increasing iteration
velocity"
```
**Issue:** Corporate AI buzzword salad. "increasing iteration velocity" is pure slop.
**Your rewrite (in your own words):**

read resume
---

### Lines 85-88 - eBay Intern Role
```
"Finetuned BERT Models with PyTorch and Huggingface for data extraction from
unstructured text, enhancing search coverage

Explored generative models and LLMs for advanced information extraction and
open-source/commercial LLMs for efficient synthetic dataset creation"
```
**Issue:** Reads like AI wrote your resume. "enhancing search coverage", "advanced information extraction"
**Your rewrite:**


---

## 🔴 DATA FILE - Publications

**File:** `src/data/content.js`

### Lines 4-9 - NeurIPS Publication
```
title: "Axis Tilted2: Embodied Agents"
venue: "NeurIPS 2025 Winner"
year: "2025"
description: "Developing state-of-the-art agentic AI that bridges the gap
between foundation models and embodied interaction. Secured 1st Place globally
in the EAI Challenge."
```
**Issue:** "state-of-the-art", "bridges the gap", "embodied interaction" - AI slop
**Your actual description:**
uh read paper

---

### Lines 13-18 - ZINify Publication
```
title: "ZINify: Research to Zines"
venue: "UIST 2023 Honorable Mention"
year: "2023"
description: "A novel HCI system leveraging LLMs to automatically transform
dense technical papers into accessible, engaging 'zines', democratizing
scientific knowledge."
```
**Issue:** "novel system", "democratizing scientific knowledge" - marketing speak
**Your actual description:**

read paper
---

## 🔴 MISSING/PLACEHOLDER CONTENT

### Lab/Experiments Section
**File:** `src/data/content.js` lines 22-100

All 4 experiments are complete lorem ipsum:
1. "Lorem Ipsum Dolor Sit"
2. "Consectetur Adipiscing"
3. "Temporibus Autem"
4. "Omnis Voluptas"

**Your decision:**
- [ ] Delete all 4, hide Lab section until I have real content
- [ ] Replace with actual projects (list them):
  1.
  2.
  3.
  4.
- [ ] Other:


---

### Notes Section
**File:** `src/data/content.js` lines 102-181

All 4 notes are lorem ipsum.

**Your plan:**
- [ ] Delete all lorem ipsum notes
- [ ] Add GPT-7 essay as first essay-type note
- [ ] Add some short notes/haikus (you'll write them)
- [ ] Restructure to support both `type: "note"` and `type: "essay"`

**Structure I'll implement:**
```javascript
export const notesData = [
  {
    id: 1,
    type: "essay",  // NEW FIELD
    slug: "gpt7-will-have-arms",
    date: "Dec 2024",
    title: "GPT-7 Will Have Arms",
    excerpt: "The Coming Convergence of Foundation Models and Robotics",
    readTime: "45 min read",
    // ... link to essay content
  },
  {
    id: 2,
    type: "note",   // Short note/haiku
    date: "Dec 2024",
    title: "...",
    content: "..."  // Direct content, not markdown file
  },
  // ... more
];
```

**Confirm this structure works for you:**


---

## 🟡 POTENTIALLY OKAY BUT REVIEW

### Home Page - Timeline Locations
Lines throughout timeline have locations like:
- "Vancouver, Canada"
- "San Francisco, CA"
- "San Diego, CA"
- "Bangalore, India"

**Are these accurate?**


---

### Footer Text
```
"Engineered in California."
```
**Keep or change?**


---

## 📝 TEXT NEEDING YOUR VOICE

### Places where YOU need to write in your own words:

1. **Hero tagline** - Who are you? What do you do? (not AI speak)
2. **About section** - Your actual story, interests, what drives you
3. **NeurIPS project** - What you actually built and why it matters
4. **ZINify** - Your perspective on the project
5. **Resume bullets** - Actual work you did, in plain English
6. **Lab projects** - Real projects or remove section
7. **Notes** - Real notes, thoughts, haikus, essays

---

## NEXT STEPS

1. **Review each section above and add your rewrites**
2. **Mark your decisions** (delete/keep/replace)
3. **I'll implement all changes at once**

Once you've filled this in, I'll:
- Restructure Notes to support essays + short notes
- Add GPT-7 essay to Notes
- Replace all AI slop with your actual text
- Remove lorem ipsum
- Fix all dead links
