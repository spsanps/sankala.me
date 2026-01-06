# GPT-7 Essay Review - Iteration 6

Feedback on changes made from REVIEW_ITERATION_5.md comments

---

## 1. VIKI Hover Term Styling Fixed

| | |
|---|---|
| **Original Request** | "VIKI architecture doesn't look like its hoverable in the first callout" |
| **Before** | Subtle dashed underline `border-bottom: 1px dashed rgba(42, 60, 36, 0.4)` |
| **After** | Yellow highlight background + dotted underline that becomes solid on hover |

**New CSS:**
```css
.hover-term {
  border-bottom: 1px dotted #2A3C24;
  cursor: help;
  background: rgba(251, 212, 91, 0.15);
  padding: 0 2px;
  border-radius: 2px;
}

.hover-term:hover {
  background: rgba(251, 212, 91, 0.35);
  border-bottom-style: solid;
}
```

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

---

## 2. Duplicate Pyramid Caption Removed

| | |
|---|---|
| **Original Request** | "there is 2 'Each layer requires orders of magnitude less data than the one below'" |
| **Before** | Caption in DataPyramid component AND in figure-caption wrapper |
| **After** | Removed figure-caption from GPT7Essay.jsx, keeping only the one inside DataPyramid |

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

---

## 3. EV Parallel Paragraph Removed

| | |
|---|---|
| **Original Request** | Remove: "The EV parallel is instructive. In 2012, skeptics said China would never compete with Western automakers..." |
| **Implementation** | Removed from China Speed section |

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

---

## 4. In-Situ Links Audit - All Added

| | |
|---|---|
| **Original Request** | "many links are missing in situ... audit properly and see what is really missing" |

**New In-Situ Links Added:**

| Reference | Location | Link |
|-----------|----------|------|
| Demis Hassabis Twitter | Quote attribution | x.com/demishassabis/status/1926057739416965438 |
| Quanta Magazine | NLP Reckoning sidebar | quantamagazine.org/.../when-chatgpt-broke-an-entire-field |
| USCC | China section (2 locations) | uscc.gov/.../Humanoid_Robots.pdf |
| Goldman Sachs | Forecasts paragraph | goldmansachs.com/insights/articles/humanoid-robots |
| Morgan Stanley | Forecasts paragraph | morganstanley.com/insights/articles/humanoid-robots-ai-market |
| Bank of America | Forecasts paragraph | institute.bankofamerica.com/.../humanoid-robots.pdf |
| Korn Ferry | Labor shortage stat | kornferry.com/.../talent-crunch-future-of-work |
| Physical Intelligence | December 2025 mention | pi.website/research/human_to_robot |
| Physical Intelligence | Labs sidebar | physicalintelligence.company |
| Logan Kilpatrick | Labs sidebar quote | x.com/OfficialLoganK/status/1868753943444263104 |
| Unitree | Racing to Zero section | unitree.com |
| RT-2 | "Why different" section | arxiv.org/abs/2307.15818 |
| π0 | "Why different" section | physicalintelligence.company/blog/pi0 |

| **Feedback** | [ ] Approved  [ ] Needs revision  Notes: _________________ |

---

## Summary of All Changes

| Change | Status |
|--------|--------|
| VIKI hover term styling (yellow highlight + better underline) | ✅ Complete |
| Duplicate pyramid caption removed | ✅ Complete |
| EV parallel paragraph removed | ✅ Complete |
| Demis Hassabis Twitter link | ✅ Complete |
| Quanta Magazine link | ✅ Complete |
| USCC links (2 locations) | ✅ Complete |
| Goldman/Morgan Stanley/BofA links | ✅ Complete |
| Korn Ferry link | ✅ Complete |
| Physical Intelligence links (2 locations) | ✅ Complete |
| Logan Kilpatrick link | ✅ Complete |
| Unitree link | ✅ Complete |
| RT-2/π0 links in "Why different" section | ✅ Complete |

---

## Overall Feedback

**Reviewer:** _______________________

**Date:** _______________________

**Overall Assessment:** [ ] Approved  [ ] Needs revision

**General Notes:**
```



```
