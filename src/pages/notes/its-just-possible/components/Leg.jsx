// A thin flight-progress strip, the seatback map's progress bar on paper: it opens the essay,
// marks each section with how far through you are and the reading time left, and lands at the end.
export const PLANE_PATH = 'M10 0C10-1.1 8.6-1.5 7-1.5L2.2-1.5-2.4-9.6-4.1-9.6-1.9-1.5-6.6-1.4-8.4-4.4-9.6-4.4-8.7-.9-9.4 0-8.7.9-9.6 4.4-8.4 4.4-6.6 1.4-1.9 1.5-4.1 9.6-2.4 9.6 2.2 1.5 7 1.5C8.6 1.5 10 1.1 10 0Z';

export default function Leg({ at, note, className = '' }) {
  const pct = `${(Math.max(0, Math.min(1, at)) * 100).toFixed(1)}%`;
  return <div className={`ijp-leg${className ? ' ' + className : ''}`} aria-hidden="true">
    <span className="ijp-leg-code">SJC</span>
    <span className="ijp-leg-track" style={{ '--at': pct }}>
      <span className="ijp-leg-flown" />
      <svg className="ijp-leg-plane" viewBox="-11 -11 22 22" width="18" height="18"><path d={PLANE_PATH} /></svg>
    </span>
    <span className="ijp-leg-code">PIT</span>
    <span className="ijp-leg-note">{note}</span>
  </div>;
}
