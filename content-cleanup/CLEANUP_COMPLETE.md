# Content Cleanup Complete ✅

**Date:** December 25, 2025

All AI-generated slop text has been replaced with authentic, human-sounding content based on your resume and actual papers.

---

## Changes Made

### 1. ✅ Hero Tagline (Home Page)

**Before:**
```
AI researcher working on machine learning systems and intelligent agents.
```

**After:**
```
ASIC designer turned AI researcher. Built things with LLMs, won Kaggle medals, placed first at NeurIPS.
```

**File:** [src/pages/Home.jsx](../src/pages/Home.jsx) line 96

---

### 2. ✅ About Section (Home Page)

**Before:**
```
Building intelligent systems that work in practice.

Currently at eBay working on ML systems at scale. Previously at UC San Diego
researching recommender systems and NLP.

Interested in the gap between research and production—building things that
actually work, at scale, with real users.
```

**After:**
```
From circuits to code to competition wins.

Started designing ASICs at Texas Instruments, got hooked on machine learning
through Kaggle competitions, ended up at UC San Diego doing research.

Now at eBay building LLM-powered extraction systems that handle thousands of
requests per second. Still compete occasionally—recently took first at NeurIPS.
```

**File:** [src/pages/Home.jsx](../src/pages/Home.jsx) lines 156-167

---

### 3. ✅ NeurIPS EAI Timeline Entry

**Before:**
```
Global first place in embodied AI challenge. Built agents that interact with
physical environments through vision-language models and reinforcement learning.

[No links - just href="#"]
```

**After:**
```
Won the Embodied Agent Interface challenge—getting LLMs to reason about physical
tasks in simulated environments. Evaluated on goal interpretation, subgoal
decomposition, action sequencing, and transition modeling in BEHAVIOR and
VirtualHome simulators.

[Real links added:]
- Paper: https://openreview.net/pdf?id=gABfrJI5ni
- Challenge: https://foundation-models-meet-embodied-agents.github.io/eai_challenge/
```

**File:** [src/pages/Home.jsx](../src/pages/Home.jsx) lines 228-242

---

### 4. ✅ ZINify Timeline Entry

**Before:**
```
Honorable Mention at UIST 2023. Using LLMs to transform dense papers into
accessible visual zines, making research digestible for everyone.

[No links - just href="#"]
```

**After:**
```
Won Honorable Mention (People's Choice) at UIST 2023. Automatically converts
academic papers into zines—visual, magazine-style summaries generated with LLMs
and text-to-image models. Makes research more engaging and helps papers stand out.

[Real links added:]
- Paper: https://dl.acm.org/doi/abs/10.1145/3586182.3625118
- Demo: https://jaidevshriram.com/zinify-uist/
```

**File:** [src/pages/Home.jsx](../src/pages/Home.jsx) lines 254-270

---

### 5. ✅ Resume Page Tagline

**Before:**
```
Applied AI Researcher — Kaggle Competitions Expert — LLM Research
```

**After:**
```
Building with LLMs, competing on Kaggle, placing first at NeurIPS
```

**File:** [src/pages/Resume.jsx](../src/pages/Resume.jsx) line 17

---

### 6. ✅ Resume - eBay Current Role

**Before:**
```
• Built & deployed Generative Extraction Models capable of 1000s of TPS with
  Small Language Models (1B) to replace NER and dictionary based methods
• Built synthetic datasets with Multi-Modal open source Large Language Models
  to evaluate services and train small models
• Automated Prompt Engineering Flows with Agents/Workflows increasing iteration
  velocity
```

**After:**
```
• Deployed 1B-parameter language models for product attribute extraction at
  thousands of transactions per second, replacing rule-based NER systems
• Generated synthetic training data using multimodal LLMs to evaluate and
  improve extraction accuracy
• Built agent-based prompt optimization workflows to speed up model iteration
```

**File:** [src/pages/Resume.jsx](../src/pages/Resume.jsx) lines 63-65

---

### 7. ✅ Resume - eBay Intern Role

**Before:**
```
• Finetuned BERT Models with PyTorch and Huggingface for data extraction from
  unstructured text, enhancing search coverage
• Explored generative models and LLMs for advanced information extraction and
  open-source/commercial LLMs for efficient synthetic dataset creation
```

**After:**
```
• Fine-tuned BERT models for extracting product attributes from unstructured text
• Prototyped LLM-based extraction systems and evaluated synthetic data
  generation approaches
```

**File:** [src/pages/Resume.jsx](../src/pages/Resume.jsx) lines 86-87

---

### 8. ✅ Publications Data - NeurIPS

**Before:**
```
Developing state-of-the-art agentic AI that bridges the gap between foundation
models and embodied interaction. Secured 1st Place globally in the EAI Challenge.
```

**After:**
```
1st place in the Embodied Agent Interface challenge. Designed agents that reason
about physical tasks in simulated environments, evaluated on goal interpretation,
subgoal decomposition, and action sequencing.
```

**File:** [src/data/content.js](../src/data/content.js) line 7

---

### 9. ✅ Publications Data - ZINify

**Before:**
```
A novel HCI system leveraging LLMs to automatically transform dense technical
papers into accessible, engaging 'zines', democratizing scientific knowledge.
```

**After:**
```
Won Honorable Mention (People's Choice). Automatically converts academic papers
into visual zines using LLMs and text-to-image models. Makes research more
engaging and helps papers stand out.
```

**File:** [src/data/content.js](../src/data/content.js) line 16

---

### 10. ✅ Lab Section - Removed All Placeholders

**Before:**
- 4 experiments with complete lorem ipsum content

**After:**
```javascript
export const experimentsData = [
  // Lab content coming soon - placeholder experiments removed
];
```

**File:** [src/data/content.js](../src/data/content.js) lines 22-24

---

## Summary of Improvements

### Removed Buzzwords:
- ❌ "state-of-the-art"
- ❌ "bridges the gap"
- ❌ "democratizing scientific knowledge"
- ❌ "at scale, with real users"
- ❌ "increasing iteration velocity"
- ❌ "enhancing search coverage"
- ❌ "novel HCI system"
- ❌ "advanced information extraction"

### Added Real Content:
- ✅ Your actual background (ASIC → Kaggle → Research → eBay)
- ✅ Specific technical details from papers
- ✅ Real competition results
- ✅ Actual paper/demo links
- ✅ Plain English descriptions of what you actually built

### Voice Change:
- **Before:** Generic LinkedIn/AI speak
- **After:** Direct, technical, human - sounds like you actually wrote it

---

## What's Left

The website is now 100% authentic content, except:

1. **Lab section is empty** - Add real projects when ready
2. **Writing section has GPT-7 essay** - Already linked correctly to your custom page
3. **Add more notes/haikus** to Writing section whenever you want

---

## All Slop Eliminated ✨

Your website now sounds like a human wrote it, not an AI assistant trying to impress recruiters.
