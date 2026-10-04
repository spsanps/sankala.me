import { useEffect, useRef, useState } from 'react';
import { queueBuild } from '../../../../components/art/build-queue';
import { STOPS, COUNT, OPENING, fraction, stateAt, stopLog } from '../flight/timeline';
import { PLANE_PATH } from './Leg';

// "The final push, as a flight": a seatback moving map that steps through the moments of the
// final push in order. Stops sit evenly along the route; the map isn't to time. The map's still
// is in the HTML; once the figure is near the screen and the browser is idle, the same map is
// drawn live in a canvas over it (src/pages/notes/its-just-possible/flight/). The panel,
// messages and controls are real HTML, so they work before the canvas arrives, without it, and
// for screen readers.
const ART = '/images/notes/its-just-possible';
const FLY = .9;            // seconds to fly from one stop to the next
const DWELL = 1.8;         // seconds held at each stop
const SENDER = { Agent: 'Agent', Me: 'Me', Fleet: 'GPUs', Leaderboard: 'Leaderboard' };
const rank = r => r === '~#7' ? 'about 7th' : r === 'Top 10' ? 'top 10' : r;
const describe = (i, s) => `${i ? `Stop ${i} of ${COUNT}` : 'The start'}. Track 1 ${rank(s.track1.rank)}, score ${s.track1.score}; Track 2 ${rank(s.track2.rank)}, score ${s.track2.score}; ${s.gpus} GPUs online.`;

function Readout({ label, value, sub, className = '' }) {
  return <div className={`ijp-readout ${className}`}>
    <span className="ijp-lbl">{label}</span>
    <span className="ijp-val" key={value}>{value}</span>
    {sub && <span className="ijp-sub">{sub}</span>}
  </div>;
}

export default function FlightFigure() {
  const [stop, setStop] = useState(OPENING);      // the stop shown in the panel (0 = the start)
  const [pos, setPos] = useState(OPENING);        // where the plane is, in stops; between stops while flying
  const [playing, setPlaying] = useState(false);
  const [live, setLive] = useState(false);
  const stage = useRef(null), canvas = useRef(null), map = useRef(null), now = useRef({ pos: OPENING, stop: OPENING });
  const s = stateAt(stop);
  now.current = { pos, stop };

  // Draw the live map once the figure is close and the browser is idle; rebuild on a real resize.
  useEffect(() => {
    const el = stage.current; if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    let disposed = false, built = 0, building = false, timer = 0;
    const build = () => {
      if (building || disposed) return;
      const rect = el.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
      if (!width || (built && Math.abs(width - built) / built < .1)) return;
      building = true;
      queueBuild(async () => {
        const { createFlightMap } = await import('../flight/flight-map.js');
        if (disposed) return;
        const next = await createFlightMap({ canvas: canvas.current, width, height, small: rect.width < 560 });
        if (disposed) return;
        map.current = next; built = width;
        next.draw(now.current.pos, now.current.stop);
        setLive(true);
      }).catch(() => {}).finally(() => { building = false; });
    };
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) build(); }, { rootMargin: '300px' });
    io.observe(el);
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(() => { if (built) build(); }, 250); });
    ro?.observe(el);
    return () => { disposed = true; io.disconnect(); ro?.disconnect(); clearTimeout(timer); };
  }, []);

  useEffect(() => { if (map.current) map.current.draw(pos, stop); }, [pos, stop, live]);

  // Playback: fly to the next stop, wait there, and go on. With reduced motion the plane jumps.
  useEffect(() => {
    if (!playing) return undefined;
    let cur = now.current.stop >= COUNT ? 0 : now.current.stop, raf = 0, timer = 0;
    setStop(cur); setPos(cur);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const arrive = n => { cur = n; setStop(n); setPos(n); if (n >= COUNT) { setPlaying(false); return; } timer = setTimeout(next, DWELL * 1000); };
    const next = () => {
      const from = cur, to = cur + 1;
      if (reduce) { arrive(to); return; }
      const t0 = performance.now();
      const frame = time => {
        const u = Math.min(1, (time - t0) / (FLY * 1000)), e = u * u * (3 - 2 * u);
        setPos(from + e);
        if (u < 1) raf = requestAnimationFrame(frame); else arrive(to);
      };
      raf = requestAnimationFrame(frame);
    };
    timer = setTimeout(next, cur === 0 ? 900 : 200);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [playing]);

  const go = n => { setPlaying(false); const v = Math.max(0, Math.min(COUNT, n)); setStop(v); setPos(v); };
  const here = stop > 0 ? STOPS[stop - 1] : null;
  const atEnd = stop >= COUNT && !playing;
  const pct = v => `${(fraction(v) * 100).toFixed(2)}%`;

  return <figure className="ijp-flight" id="flight">
    <div className="ijp-bezel">
      <div className="ijp-lcd">
        <div className="ijp-map" ref={stage}>
          <picture>
            <source media="(max-width: 600px)" srcSet={`${ART}/flight-map-phone-760.webp`} />
            <img src={`${ART}/flight-map-1400.webp`} srcSet={`${ART}/flight-map-700.webp 700w, ${ART}/flight-map-1400.webp 1400w`} sizes="(max-width: 1060px) 70vw, 720px"
              width="1400" height="933" alt="An in-flight map of the United States: a glowing route from San Jose to Pittsburgh, flown to the end, with eight stops along it for the messages and results of the final push." />
          </picture>
          <canvas ref={canvas} className={live ? 'is-live' : ''} aria-hidden="true" />
        </div>

        <div className="ijp-side">
          <div className="ijp-readouts">
            <Readout className="ijp-rank" label="Track 1" value={s.track1.rank} sub={`score ${s.track1.score}`} />
            <Readout className="ijp-rank" label="Track 2" value={s.track2.rank} sub={`score ${s.track2.score}`} />
            <Readout className="ijp-wide" label="GPUs online" value={s.gpus} />
          </div>
          <div className="ijp-message">
            <div className="ijp-message-head">
              <span>{here ? `Stop ${stop} of ${COUNT}` : 'The start'}</span>
              <span className="ijp-message-nav">
                <button type="button" onClick={() => go(stop - 1)} disabled={stop <= 0} aria-label="Previous stop">‹</button>
                <button type="button" onClick={() => go(stop + 1)} disabled={stop >= COUNT} aria-label="Next stop">›</button>
              </span>
            </div>
            <div className="ijp-message-body" aria-live="polite">
              {here ? here.lines.map(([who, text], i) => <p key={i} className={`ijp-line is-${who.toLowerCase()}`}><span className="ijp-who">{SENDER[who]}</span><span className="ijp-said">{text}</span></p>)
                : <p className="ijp-line is-quiet"><span className="ijp-said">Where we start: 13 GPUs online, Track 1 in the top 10, Track 2 about 7th.</span></p>}
            </div>
          </div>
        </div>

        <div className="ijp-bar">
          <button type="button" className="ijp-play" onClick={() => setPlaying(p => !p)} aria-pressed={playing}>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">{playing ? <path d="M3 2h3.5v12H3zM9.5 2H13v12H9.5z" /> : <path d="M3.5 1.8 14 8 3.5 14.2z" />}</svg>
            <span>{playing ? 'Pause' : atEnd ? 'Replay' : 'Play'}</span>
          </button>
          <span className="ijp-code">SJC</span>
          <div className="ijp-track" style={{ '--at': pct(pos) }}>
            <span className="ijp-track-flown" aria-hidden="true" />
            {STOPS.map((st, i) => <span key={i} className={`ijp-tick is-${st.kind}${i + 1 <= pos + 1e-6 ? ' is-passed' : ''}`} style={{ left: pct(i + 1) }} aria-hidden="true" />)}
            <span className="ijp-thumb" aria-hidden="true"><svg viewBox="-11 -11 22 22" width="24" height="24"><path d={PLANE_PATH} /></svg></span>
            <input type="range" min="0" max={COUNT} step="1" value={stop} onChange={event => go(Number(event.target.value))}
              aria-label="Stops of the final push" aria-valuetext={describe(stop, s)} />
          </div>
          <span className="ijp-code">PIT</span>
        </div>
      </div>
    </div>
    <figcaption>
      <strong>The final push, as a flight.</strong> How the final push of RealPDE went, drawn as an in-flight map of my trip to Pittsburgh. Each stop is a moment, in order; the map isn’t to time.
      <span className="ijp-legend" aria-hidden="true"><i className="is-chat" /> messages <i className="is-fleet" /> GPUs <i className="is-board" /> leaderboard</span>
    </figcaption>
    <details className="ijp-log">
      <summary>The final push as text</summary>
      <p>{stopLog()[0]}</p>
      <ol>{stopLog().slice(1).map(text => <li key={text}>{text}</li>)}</ol>
    </details>
  </figure>;
}
