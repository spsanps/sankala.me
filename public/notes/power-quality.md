---
title: "Recognizing electrical disturbances with neural networks"
author: S. K. G. Manikonda, J. Santhosh, S. P. Kumar Sreekala, S. Gangwani and D. N. Gaonkar
date: 2019
canonical: https://www.sankala.me/notes/power-quality
---

# Recognizing electrical disturbances with neural networks

**Research · 2019 · IEEE DISCOVER Best Paper Award**

*Power Quality Event Classification Using Long Short-Term Memory Networks.* S. K. G. Manikonda, J. Santhosh, S. P. Kumar Sreekala, S. Gangwani and D. N. Gaonkar. IEEE DISCOVER 2019. Best Paper Award · [Award certificate](https://www.sankala.me/documents/certificates/24_DISCOVER_BestPaper%20(2).pdf)


---

The electricity in a wall socket is meant to be a clean wave. In India it rises and falls 50 times a second, the same way every time. Real grids are messier. A big motor starting nearby pulls the voltage down for a few cycles. Switching a capacitor bank leaves a spike that rings out. Rectifiers and chargers bend the wave out of shape. Engineers call these power-quality events.

Each kind has different causes and different fixes, so the first job is naming what happened. Monitors record far more of the wave than anyone can read by eye, which is why it helps to classify events automatically.

In 2019, at NIT Karnataka, we classified these events with long short-term memory networks (LSTMs). An LSTM reads a signal one step at a time and carries a memory forward. That lets it tell a dip lasting three cycles from a single spike, or from a slow flicker that only shows up across many cycles.

**Figure: An oscilloscope you can drive.** On the page, a bench oscilloscope is drawn in code. The reader presses one of eight keys (normal, sag, swell, interruption, harmonics, transient, notch, flicker) to inject that disturbance into a 230 V, 50 Hz wave, and a row of network cells reads the trace one cycle at a time while confidence bars for each kind of event change. TIME/DIV shows 5, 10 or 20 cycles; flicker only becomes clear across several. The waveforms are synthetic, with textbook disturbances, and the reader is a small stand-in that works one cycle at a time: its memory and confidence bars are illustrative, not the paper’s model or results.

Watch the notch. After the first bite the reader guesses a transient, then changes its mind as the bites keep coming. Watch the sag, too: it calls the wave normal until the dip arrives. That running memory is what a recurrent network brings to signals like these.
