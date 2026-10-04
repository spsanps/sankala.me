import { useEffect, useRef, useState } from 'react';
import { queueBuild } from '../../../../components/art/build-queue';
import { WAYPOINTS, SPAN, OPENING, stateAt, stamp, eventLog } from '../flight/timeline';
import { PLANE_PATH } from './Leg';

// "The last 72 hours, as a flight": a seatback moving map. The map's still is in the HTML;
// once the figure is near the screen and the browser is idle, the same map is drawn live in a
// canvas over it (src/pages/notes/its-just-possible/flight/). The panel, messages and controls
// are real HTML, so they work before the canvas arrives, without it, and for screen readers.
const ART = '/images/notes/its-just-possible';
const LAST = WAYPOINTS[WAYPOINTS.length - 1].t;
const RATE = 150;          // minutes of the weekend per second of playback
const DWELL = 1.6;         // seconds held at each waypoint
const SENDER = { Agent: 'Agent', Me: 'Me', Fleet: 'GPUs', Leaderboard: 'Leaderboard' };
const describe = s => `${s.clock.day} ${s.clock.date}, ${s.clock.time} UTC. Track 1 ${s.track1?.rank || 'rank unknown'}, Track 2 ${s.track2?.rank || 'no upload yet'}, ${s.gpus} GPUs online.`;

function Readout({ label, value, sub, className = '' }) {
  return <div className={`ijp-readout ${className}`}>
    <span className="ijp-lbl">{label}</span>
    <span className="ijp-val" key={value}>{value}</span>
    {sub && <span className="ijp-sub">{sub}</span>}
  </div>;
}

export default function FlightFigure() {
  const [t, setT] = useState(OPENING);
  const [playing, setPlaying] = useState(false);
  const [live, setLive] = useState(false);
  const stage = useRef(null), canvas = useRef(null), map = useRef(null), now = useRef(OPENING);
  const s = stateAt(t);
  now.current = t;

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
        next.draw(now.current, stateAt(now.current).waypoint);
        setLive(true);
      }).catch(() => {}).finally(() => { building = false; });
    };
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) build(); }, { rootMargin: '300px' });
    io.observe(el);
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(() => { if (built) build(); }, 250); });
    ro?.observe(el);
    return () => { disposed = true; io.disconnect(); ro?.disconnect(); clearTimeout(timer); };
  }, []);

  useEffect(() => { if (map.current) map.current.draw(t, s.waypoint); }, [t, s.waypoint, live]);

  // Playback: the plane flies at a steady rate and waits at each waypoint. With reduced motion
  // it steps from waypoint to waypoint instead.
  useEffect(() => {
    if (!playing) return undefined;
    let cur = now.current >= LAST ? 0 : now.current, raf = 0, timer = 0, hold = 0, last = performance.now();
    setT(cur);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const step = () => { const next = WAYPOINTS.find(w => w.t > cur); if (!next) { setT(SPAN); setPlaying(false); return; } cur = next.t; setT(cur); timer = setTimeout(step, 2400); };
      timer = setTimeout(step, 700);
      return () => clearTimeout(timer);
    }
    const frame = time => {
      const dt = Math.min(.1, (time - last) / 1000); last = time;
      if (hold > 0) hold -= dt;
      else {
        const next = WAYPOINTS.find(w => w.t > cur);
        let nt = cur + dt * RATE;
        if (next && nt >= next.t) { nt = next.t; hold = DWELL; }
        cur = Math.min(SPAN, nt); setT(cur);
        if (cur >= SPAN) { setPlaying(false); return; }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const go = value => { setPlaying(false); setT(Math.max(0, Math.min(SPAN, value))); };
  const onKey = event => {
    const jumps = { ArrowLeft: -30, ArrowDown: -30, ArrowRight: 30, ArrowUp: 30, PageDown: -360, PageUp: 360 };
    if (jumps[event.key] === undefined) return;
    event.preventDefault(); go(Math.round(t) + jumps[event.key]);
  };
  const prevWp = [...WAYPOINTS].reverse().find(w => w.t < Math.round(t)), nextWp = WAYPOINTS.find(w => w.t > Math.round(t));
  const wp = s.waypoint >= 0 ? WAYPOINTS[s.waypoint] : null;
  const atEnd = t >= LAST && !playing;
  const pct = v => `${(v / SPAN * 100).toFixed(2)}%`;

  return <figure className="ijp-flight" id="flight">
    <div className="ijp-bezel">
      <div className="ijp-lcd">
        <div className="ijp-map" ref={stage}>
          <picture>
            <source media="(max-width: 600px)" srcSet={`${ART}/flight-map-phone-760.webp`} />
            <img src={`${ART}/flight-map-1400.webp`} srcSet={`${ART}/flight-map-700.webp 700w, ${ART}/flight-map-1400.webp 1400w`} sizes="(max-width: 1060px) 70vw, 720px"
              width="1400" height="933" alt="An in-flight map of the United States: a glowing route from San Jose to Pittsburgh, flown almost to the end, with waypoints along it for the messages and results of the final 72 hours." />
          </picture>
          <canvas ref={canvas} className={live ? 'is-live' : ''} aria-hidden="true" />
        </div>

        <div className="ijp-side">
          <div className="ijp-readouts">
            <Readout className="ijp-wide" label="Time (UTC)" value={`${s.clock.day} ${s.clock.date} · ${s.clock.time}`} />
            <Readout className="ijp-rank" label="Track 1" value={s.track1?.rank || '—'} sub={s.track1 ? `score ${s.track1.score}` : 'no upload yet'} />
            <Readout className="ijp-rank" label="Track 2" value={s.track2?.rank || '—'} sub={s.track2 ? `score ${s.track2.score}` : 'no upload yet'} />
            <Readout label="GPUs online" value={s.gpus} />
            <Readout label="Time to deadline" value={s.toGo} />
          </div>
          <div className="ijp-message">
            <div className="ijp-message-head">
              <span>{wp ? `${stamp(wp.t)} UTC` : 'Messages'}</span>
              <span className="ijp-message-nav">
                <button type="button" onClick={() => prevWp && go(prevWp.t)} disabled={!prevWp} aria-label="Previous waypoint">‹</button>
                <span aria-hidden="true">{s.waypoint + 1}/{WAYPOINTS.length}</span>
                <button type="button" onClick={() => nextWp && go(nextWp.t)} disabled={!nextWp} aria-label="Next waypoint">›</button>
              </span>
            </div>
            <div className="ijp-message-body" aria-live="polite">
              {wp ? wp.lines.map(([who, text], i) => <p key={i} className={`ijp-line is-${who.toLowerCase()}`}><span className="ijp-who">{SENDER[who]}</span><span className="ijp-said">{text}</span></p>)
                : <p className="ijp-line is-quiet"><span className="ijp-said">Friday, 00:00 UTC. 72 hours to the deadline.</span></p>}
            </div>
          </div>
        </div>

        <div className="ijp-bar">
          <button type="button" className="ijp-play" onClick={() => setPlaying(p => !p)} aria-pressed={playing}>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">{playing ? <path d="M3 2h3.5v12H3zM9.5 2H13v12H9.5z" /> : <path d="M3.5 1.8 14 8 3.5 14.2z" />}</svg>
            <span>{playing ? 'Pause' : atEnd ? 'Replay the 72 hours' : 'Play'}</span>
          </button>
          <span className="ijp-code">SJC</span>
          <div className="ijp-track" style={{ '--at': pct(t) }}>
            <span className="ijp-track-flown" aria-hidden="true" />
            {WAYPOINTS.map(w => <span key={w.t} className={`ijp-tick is-${w.kind}${w.t <= t ? ' is-passed' : ''}`} style={{ left: pct(w.t) }} aria-hidden="true" />)}
            {[['Sat', 1440], ['Sun', 2880]].map(([d, v]) => <span key={d} className="ijp-day" style={{ left: pct(v) }} aria-hidden="true">{d}</span>)}
            <span className="ijp-thumb" aria-hidden="true"><svg viewBox="-11 -11 22 22" width="24" height="24"><path d={PLANE_PATH} /></svg></span>
            <input type="range" min="0" max={SPAN} step="1" value={Math.round(t)} onChange={event => go(Number(event.target.value))} onKeyDown={onKey}
              aria-label="Time through the final 72 hours" aria-valuetext={describe(s)} />
          </div>
          <span className="ijp-code">PIT</span>
        </div>
      </div>
    </div>
    <figcaption>
      <strong>The last 72 hours, as a flight.</strong> Our leaderboard positions over the final 72 hours of RealPDE, drawn as an in-flight map of my trip to Pittsburgh. The plane’s position is time, not GPS. Times UTC.
      <span className="ijp-legend" aria-hidden="true"><i className="is-chat" /> messages <i className="is-fleet" /> GPUs <i className="is-board" /> leaderboard</span>
    </figcaption>
    <details className="ijp-log">
      <summary>The 72 hours as text</summary>
      <ol>{eventLog().map(e => <li key={e.t + e.text}><time>{e.when}</time> {e.text}</li>)}</ol>
    </details>
  </figure>;
}
