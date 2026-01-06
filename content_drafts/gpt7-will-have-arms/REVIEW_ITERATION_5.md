# GPT-7 Essay Review - Iteration 5

Feedback on changes made from REVIEW_ITERATION_4.md comments

---

## 1. Robot Economics Table

| | |
|---|---|
| **Original Request** | "this stuff was to be only removed for current (2025) keep the projected column row as is" |
| **Before** | Only 3 rows: Hardware, Maintenance, Electricity |
| **After** | 6 rows with dashes for Current column on cloud/total/hourly |

**Updated Table:**
| Cost Component | Current (2025) | Projected (2028) |
|----------------|----------------|------------------|
| Hardware (3yr depreciation) | ~$13,000/year | ~$2,000/year |
| Maintenance (~15%/year) | ~$6,000/year | ~$900/year |
| Electricity (~500W, 20hr/day) | ~$700/year | ~$700/year |
| Cloud inference (estimated) | — | ~$3,500/year |
| **Total annual cost** | — | **~$7,100-8,100/year** |
| **Hourly cost** | — | **$1.00-1.15/hr** |

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

OK 
---

## 2. In-Situ Links Added

| | |
|---|---|
| **Original Request** | "you need to find all the places it needs to be linked in situ as well" |

**New In-Situ Links Added:**
- "Stadia" → linked to Google Stadia shutdown announcement
- "sub-100ms response times" → linked to OpenAI Realtime API
- "Sora" → linked to OpenAI "Video generation models as world simulators"
- Ilya Sutskever quote attribution → linked to Dwarkesh Patel Interview

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

---

## 3. Pyramid Fixed Heights

| | |
|---|---|
| **Original Request** | "the height is varying - make them all same height but varying widths" |
| **Before** | `minHeight: '56px'` (content-dependent) |
| **After** | `height: '64px'` (fixed for all layers) |

All three layers now have identical height (64px) with varying widths (50% / 75% / 100%).

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

now the text is overflowing on the top layer , make sure text fits correctly
---

## 4. Sidebar Moved

| | |
|---|---|
| **Original Request** | "NO! put Learning Physics From Video in the Video is implicitly physics section (under data is already there)" |
| **Before** | Combined sidebar after Hassabis quote in "What Scaled Multimodal Models Will Look Like" |
| **After** | Split into two sidebars: |

1. **"Learning Physics From Video"** → Now placed directly after "Video is implicit physics" paragraph in "The Data Is Already There" section
2. **"Why This Matters for Reasoning"** → Kept as separate sidebar in original location

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

---

## 5. Integration Model Fixed

| | |
|---|---|
| **Original Request** | "Remove: ↓ Hardware + AI Brain, Vertically integrated, Controls full value chain" + "make Full Stack box height match" + "change yellow to green" |

**Changes Made:**
- Removed the arrow (↓) and second box with "Hardware + AI Brain" text
- Changed color from yellow (#FBD45B) to dark green (#3D5235)
- Full-Stack box now has `minHeight: '180px'` to match combined height of Platform Model boxes
- Border color changed to match green

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

height doesn't match, there should be a better way to do this right so that it works on all screen sizes?

---

## 6. Footer Updated

| | |
|---|---|
| **Original Request** | "Add: Written with the help of Claude Opus 4.5" |
| **Before** | "Opinions my own." |
| **After** | "Opinions my own. Written with the help of Claude Opus 4.5." |

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |
ok
---

## 7. GEI Callout Rewritten

| | |
|---|---|
| **Original Request** | New GEI definition with updated core properties |

**Updated Callout:**
```
General Embodied Intelligence (GEI)

A system that can, with no or minimal adaptation, inhabit diverse robotic
bodies to perform physical tasks humans do with or without tools. It will
likely function across all modalities humans can.

Core properties:
- Body-agnostic: One model, many embodiments. Skills transfer across robot
  morphologies.
- Multimodal In-Context Learning: Acquires new physical skills from
  demonstration, instruction, or multimodal prompts—and transfers them
  across modalities.
- Multimodal Reasoning: Plans actions by simulating outcomes in the same
  latent space it uses for language, vision, and action.

Unlike R2-D2s and C-3POs—specialized units with narrow competencies—a GEI
system could be a sous-chef, teach jujitsu, and do facility maintenance,
all from the same underlying world model.
```

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

---

## 8. GEI Wrappers Sidebar Added

| | |
|---|---|
| **Original Request** | Add "GEI Wrappers" sidebar next to GEI section |

**New Sidebar Content:**
```
GEI Wrappers

One could imagine startups emerging as robot API wrappers—collecting
proprietary prompts and industry domain knowledge (in both text and action
demonstrations) to sell GEI competence by vertical. Not building models,
not building bodies. Just accumulating the best scaffolding and data, just
like today's API wrapper companies.
```

Placed directly after the GEI callout, before "By 2027, I expect GEI systems will reliably handle..."

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |
ok
---

## 9. Part II TOC Titles Fixed

| | |
|---|---|
| **Original Request** | "section b sub headings contents don't match, we want the VIKI, 'but Latency!' etc" |

**Before:**
- B1: "The Cloud Thesis"
- B2: "The Latency Objection"
- B3: "The Revenue Connection"

**After:**
- B1: "VIKI"
- B2: "But Latency!"
- B3: "Robots-as-a-Service"

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

---

## Summary

| Change | Status |
|--------|--------|
| Robot economics table (dash for current, keep projected) | Implemented |
| In-situ links for new references | Implemented |
| Pyramid fixed heights (64px all) | Implemented |
| Learning Physics sidebar moved to Video section | Implemented |
| Integration model (remove arrow, green, match height) | Implemented |
| Footer (Claude Opus 4.5 credit) | Implemented |
| GEI callout rewritten | Implemented |
| GEI Wrappers sidebar added | Implemented |
| Part II TOC titles fixed (VIKI, But Latency!, Robots-as-a-Service) | Implemented |
| Pyramid text overflow fixed (minHeight: 72px, text wrapping) | Implemented |
| Integration model heights (flexbox flex-1 for dynamic matching) | Implemented |
| Part D TOC titles fixed (Who Will Buy Them, Who Gets Rich) | Implemented |
| Lex Fridman link added to Learning Physics sidebar | Implemented |

---

## Overall Feedback

**Reviewer:** _______________________

**Date:** _______________________

**Overall Assessment:** [ ] Approved  [ ] Needs revision

**General Notes:**
```



```

Additional; same content- heading issue in D

--

Learning Physics From Video
In a recent interview with Lex Fridman, Hassabis elaborated: even five or ten years ago, he would have assumed you need embodied experience to understand intuitive physics. Veo 3 is directly challenging that assumption—learning physics just from watching video.

no link anywheere for this? 