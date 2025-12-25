# Website Content Cleanup Audit

This document catalogs all placeholder text, AI-generated content, and lorem ipsum throughout the sankala.me website.

**Date Created:** December 24, 2025
**Status:** Awaiting your comments and directions

---

## 1. HOME PAGE - Lab/Experiments Section

**Location:** `src/data/content.js` - Lines 22-100
**Type:** Lorem Ipsum placeholder content

### Issues Found:

**Experiment 1 (ID: 101)**
- Title: "Lorem Ipsum Dolor Sit"
- Description: Full lorem ipsum text
- Tag: "Experiment"
- Content: Entire article is lorem ipsum

**Experiment 2 (ID: 102)**
- Title: "Consectetur Adipiscing"
- Description: Lorem ipsum text
- Tag: "Deep Dive"
- Content: Lorem ipsum with placeholder code example

**Experiment 3 (ID: 103)**
- Title: "Temporibus Autem"
- Description: Lorem ipsum text
- Tag: "Case Study"
- Content: Lorem ipsum

**Experiment 4 (ID: 104)**
- Title: "Omnis Voluptas"
- Description: Lorem ipsum text
- Tag: "Analysis"
- Content: Lorem ipsum

**Your Comments:**
<!-- What should I do with these? Replace with real projects? Remove entirely? -->

---

## 2. HOME PAGE - Notes Section

**Location:** `src/data/content.js` - Lines 102-181
**Type:** Lorem Ipsum placeholder content

### Issues Found:

**Note 1**
- Date: "Dec 2024"
- Title: "Lorem Ipsum Dolor"
- Excerpt: Lorem ipsum
- Content: Full lorem ipsum article

**Note 2**
- Date: "Nov 2024"
- Title: "Quis Autem Vel Eum"
- Excerpt: Lorem ipsum
- Content: Lorem ipsum

**Note 3**
- Date: "Oct 2024"
- Title: "Omnis Dolor Repellendus"
- Excerpt: Lorem ipsum
- Content: Lorem ipsum

**Note 4**
- Date: "Sep 2024"
- Title: "Itaque Earum Rerum"
- Excerpt: Lorem ipsum
- Content: Lorem ipsum with placeholder code

**Your Comments:**
<!-- Replace with real notes? Remove the section? Write actual notes? -->

---

## 3. HOME PAGE - News/Publications Timeline

**Location:** `src/pages/Home.jsx` - Lines 228-237

### Issues Found:

**NeurIPS 2025 EAI Challenge Entry**
- Lines 228-237
- Description mentions: "Built agents that interact with physical environments through vision-language models and reinforcement learning."
- **Issue:** This is AI-generated generic description. Needs your actual project details.
- Links are placeholder (`href="#"`) - need real paper/project links

**Your Comments:**
<!-- Do you have real paper links? Project page? What was the actual work? -->

---

## 4. HOME PAGE - News/Publications Timeline (Continued)

**Location:** `src/pages/Home.jsx` - Lines 247-265

### Issues Found:

**ZINify Publication**
- Lines 247-265
- Description: "Using LLMs to transform dense papers into accessible visual zines, making research digestible for everyone."
- **Issue:** Somewhat generic AI description. Could be more specific.
- Links are placeholders (`href="#"`) - need actual paper/demo links

**Your Comments:**
<!-- Do you want to rewrite this description? Add real links? -->

---

## 5. HOME PAGE - About Section

**Location:** `src/pages/Home.jsx` - Lines 161-168

### Issues Found:

**About Text**
- Line 166: "Interested in the gap between research and production—building things that actually work, at scale, with real users."
- **Issue:** This feels AI-generated and generic. Could be more personal/specific to your actual interests and work.

**Your Comments:**
<!-- Rewrite with your own voice? Add more specifics? -->

---

## 6. HOME PAGE - Hero Section

**Location:** `src/pages/Home.jsx` - Line 96

### Issues Found:

**Tagline**
- "AI researcher working on machine learning systems and intelligent agents."
- **Issue:** Generic. Could be more specific to what you actually do/care about.

**Your Comments:**
<!-- Fine as is? Or make more specific? -->

---

## 7. RESUME PAGE

**Location:** `src/pages/Resume.jsx` - Lines 62-66

### Issues Found:

**eBay Role Description (Current Position)**
- Line 65: "Automated Prompt Engineering Flows with Agents/Workflows increasing iteration velocity"
- **Issue:** This feels like AI-generated corporate speak. Could be more concrete.

**Your Comments:**
<!-- Rewrite in your own words? Add specifics? -->

---

## 8. GPT-7 ESSAY

**Location:** `src/data/essays/gpt7-content.js` - Line 6

### Issues Found:

**Subtitle Typo**
- Line 6: "The Coming **Satisfactory** of Foundation Models and Robotics"
- **Issue:** Should be "Convergence" not "Satisfactory" - obvious AI generation error/typo

**Your Comments:**
<!-- Fix this typo? -->

---

## 9. GPT-7 ESSAY - Overall Content

**Location:** `src/data/essays/gpt7-content.js` - Entire file

### Issues Found:

**Essay appears to be AI-generated content about robotics/GPT-7**
- Very long (~1170 lines)
- Discusses predictions about robotics, foundation models, China, etc.
- Contains specific predictions and analysis
- **Issue:** Entire essay feels AI-generated. The writing style, structure, predictions all have that distinctive AI pattern.

**Your Comments:**
<!-- Is this a draft you want to heavily edit? Delete? Replace with your own writing? -->

---

## 10. MISSING IMAGES/ASSETS

**Location:** Throughout `src/pages/Home.jsx`

### Issues Found:

The following images are referenced but may not exist:
- `/images/profile/headshot-professional.jpg` (line 138)
- `/images/awards/uist-2023-award-ceremony.jpg` (lines 147, 255)
- `/images/awards/uist-2023-presentation.jpg` (line 233)
- `/images/locations/ebay-headquarters.jpg` (line 299)
- `/images/team/ucsd-research-group-2023.jpg` (line 317)

**Your Comments:**
<!-- Do these images exist? Need to be added? Replace with real photos? -->

---

## SUMMARY BY PRIORITY

### 🔴 HIGH PRIORITY (Obvious Placeholders)
1. All 4 Lab/Experiments entries - pure lorem ipsum
2. All 4 Notes entries - pure lorem ipsum
3. GPT-7 essay subtitle typo
4. Dead links on timeline (href="#")

### 🟡 MEDIUM PRIORITY (AI-Generated But Maybe Acceptable)
1. Publication descriptions on timeline
2. About section text
3. Resume job descriptions

### 🟢 LOW PRIORITY (Minor Polish)
1. Hero tagline
2. Missing image assets
3. GPT-7 essay (if you want to keep it)

---

## NEXT STEPS

Please review each section and add your comments:
1. What should I replace it with?
2. Should I delete it entirely?
3. Do you have real content to substitute?
4. Is it acceptable as-is?

Once you've commented, I'll make all the changes at once.
