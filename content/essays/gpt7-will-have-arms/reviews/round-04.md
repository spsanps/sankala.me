# GPT-7 Essay Review - Iteration 4

Feedback on changes made from REVIEW_ITERATION_3.md

---

## 1. Robot Economics Table

| | |
|---|---|
| **Original Request** | "No we need it. Only the last 3 rows should be removed + I liked that previous style better" |
| **Before** | Single column "Projected Annual Cost" |
| **After** | Two columns: "Current (2025)" and "Projected (2028)" |

**Rows Kept:**
| Cost Component | Current (2025) | Projected (2028) |
|----------------|----------------|------------------|
| Hardware (3yr depreciation) | ~$13,000/year | ~$2,000/year |
| Maintenance (~15%/year) | ~$2,400/year | ~$900/year |
| Electricity (~500W, 20hr/day) | ~$700/year | ~$700/year |

**Rows Removed:**
- Cloud inference (estimated)
- Total annual cost
- Hourly cost

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

bro think critically for a second: 

- Cloud inference (estimated)
- Total annual cost
- Hourly cost

this stuff was to be only removed  for current (2025) keep the projected column row as is. and didn't it have a better style more aligned with the aesthetics of the rest of the essay before? 

---

## 2. References - All Sources Added

| | |
|---|---|
| **Original Request** | "Did you find all the source for the entire essay from the org md file?" |
| **Implementation** | Cross-referenced original MD file and added all missing sources |

**New References Added:**

*Essays & Papers:*
- AI Futures Model
- OpenAI "Video generation models as world simulators"
- Wintel Profit Study (Harvard Business School)

*Robotics Research:*
- Ilya Sutskever / Dwarkesh Patel Interview

*Company & Lab Sources:*
- Google DeepMind "Gemini Robotics On-Device"
- Figure AI OpenAI Partnership Split (2025)
- 1X Technologies OpenAI Funding
- Physical Intelligence $400M Funding (Reuters)
- OpenAI Robotics Team Restart (Forbes)
- Unitree H1 / G1 Robot pages
- NVIDIA Jetson Orin

*Latency & Infrastructure (new section):*
- Google Stadia Shutdown Announcement
- OpenAI Realtime API Documentation
- Google Gemini Live API Documentation

*Data & Economics:*
- OpenAI GPT-4 Research & Pricing
- BloombergNEF Battery Pack Prices 2024
- Ars Technica LiDAR Historical Costs (Waymo)
- Reuters Hesai LiDAR Pricing

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

ok you need to find all the places it needs to be linked in situ as well and add there as well

---

## 3. Pyramid Redesign (Rectangles with Varying Widths)

| | |
|---|---|
| **Original Request** | "rectangles can be different widths to represent the pyramid shape but not actually a triangle shape" |
| **Before** | Equal-width stacked rectangles |
| **After** | Rectangles with 50% / 75% / 100% widths centered |

**Visual Structure:**
```
        ┌───────────────┐
        │  CALIBRATION  │  50% width
        │  Robot demos  │
        │  Millions     │
        └───────────────┘
    ┌───────────────────────┐
    │      ALIGNMENT        │  75% width
    │  Egocentric human     │
    │  Billions             │
    └───────────────────────┘
┌───────────────────────────────┐
│         FOUNDATION            │  100% width
│    YouTube-scale video        │
│    Trillions                  │
└───────────────────────────────┘
```

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |


the height is varying - the top one is taller giving it a weird look - make them all same height but varying widths

---

## 4. Hover Effects Removed

| | |
|---|---|
| **Original Request** | "actually remove all animation" |
| **Before** | Various hover transitions on ComponentCostsInfographic cards |
| **After** | No animations, no transitions, static display |

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

ok
---

## 5. Chris Paxton Link Fixed

| | |
|---|---|
| **Original Request** | "The link is as text not a hyperlink. FIX" |
| **Before** | `"[Human level dexterity...](https://x.com/...)"` (markdown syntax rendered as text) |
| **After** | `<a href="https://x.com/chris_j_paxton/status/2007844962780717094">Human level dexterity...</a>` (actual hyperlink) |

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

---

## 6. Sidebar Overlap Fixed

| | |
|---|---|
| **Original Request** | "it overlaps with the other sidebar item - fix" |
| **Before** | Two separate sidebars: "Learning Physics From Video" and "Why This Matters for Reasoning" |
| **After** | Combined into single sidebar with both contents |

**Combined Sidebar Structure:**
```
┌─────────────────────────────────┐
│ Learning Physics From Video    │
├─────────────────────────────────┤
│ In a recent interview with Lex │
│ Fridman, Hassabis elaborated...│
│                                 │
│ Why This Matters for Reasoning: │
│ When a model can generate and   │
│ reason in visual tokens...      │
└─────────────────────────────────┘
```

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

Combined into single sidebar with both contents --> NO! put Learning Physics From Video in the Video is implicity physics section (under data is already there)

---

## 7. "What Would Prove Me Wrong" Removed

| | |
|---|---|
| **Original Request** | "Remove what would prove me wrong subsection" |
| **Implementation** | Removed from TOC, markdown content, and rendered JSX |

**Removed Content:**
- Section D4 from TOC
- Entire "What Would Prove Me Wrong" section with falsifiable predictions callout

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

---

## 8. Hardware Flood Section Reorganization

| | |
|---|---|
| **Original Request** | "Let's combine gracefully without ragebait, EV precedent and china speed as one section called china speed and racing to zero and when sensors cost pennies as one section called racing to zero" |

**Before (5 sections):**
- C1: The Unitree Trajectory
- C2: The EV Precedent
- C3: When Sensors Cost Pennies (Components Collapse)
- C4: How Many How Soon (The Forecasts)
- C5: The China Factor

**After (3 sections):**
- C1: Racing to Zero (Unitree pricing + component costs combined)
- C2: The Forecasts
- C3: China Speed (EV precedent + China factor combined)

**New Order:** Racing to Zero → The Forecasts → China Speed

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

ok
---

## 9. Integration Model Infographic Size

| | |
|---|---|
| **Original Request** | "the integration model infographic size doesn't match the platform model / cloud + hardware size" |
| **Before** | Integration model smaller than platform model |
| **After** | Both models have consistent sizing with two equal-height boxes |

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

Remove this:

↓
Hardware + AI Brain

Vertically integrated

Controls full value chain

--
and make sure Full stack yellow box height takens its space to match the combined height of cloud + hardware box on the left
--
Also I feel like this yellow is weird, was it always this yellow? maybe i am looking at it for too long. anyway to align more with site colors of green and black? 

---

## Summary

| Change | Status |
|--------|--------|
| Robot economics table (2 cols, removed last 3 rows) | Implemented |
| All references from original MD added | Implemented |
| Pyramid with varying rectangle widths | Implemented |
| All hover animations removed | Implemented |
| Chris Paxton hyperlink fixed | Implemented |
| Sidebar overlap fixed (combined) | Implemented |
| "What Would Prove Me Wrong" removed | Implemented |
| Hardware Flood sections reorganized | Implemented |
| Integration model size fixed | Implemented |

---

## Overall Feedback

**Reviewer:** _______________________

**Date:** _______________________

**Overall Assessment:** [ ] Approved  [ ] Needs revision

**General Notes:**
```



```

Additional Requests. ;

Written December 2025. Published January 6th, 2026.

Opinions my own.

Check back in 2027, 2028, 2030.

Add: Written with the help of Claude Opus 4.5

--

GEI call out rewrite:

General Embodied Intelligence (GEI)

A system that can, with no or minimal adaptation, inhabit diverse robotic bodies to perform physical tasks humans do with or without tools. It will likely function across all modalities humans can.
Core properties:
Body-agnostic: One model, many embodiments. Skills transfer across robot morphologies.
Multimodal In-Context Learning: Acquires new physical skills from demonstration, instruction, or multimodal prompts—and transfers them across modalities.
Multimodal Reasoning: Plans actions by simulating outcomes in the same latent space it uses for language, vision, and action.
Unlike R2-D2s and C-3POs—specialized units with narrow competencies—a GEI system could be a sous-chef, teach jujitsu, and do facility maintenance, all from the same underlying world model.


side bar next to GEI: 
Sidebar: GEI Wrappers

One could imagine startups emerging as robot API wrappers—collecting proprietary prompts and industry domain knowledge (in both text and action demonstrations) to sell GEI competence by vertical. Not building models, not building bodies. Just accumulating the best scaffolding and data, just like today's API wrapper companies.