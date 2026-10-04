import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { SiteLink } from '../../components/site/Elements';
import { mainNav } from '../../data/navigation';
import { ERA_LIST, monthYear } from './eras';
import { PLACE_NAMES, PLACE_CAPTIONS } from './mosaic/layout';
import { sanJoseMoment, clockLabel as realClock, sanJoseDate, DEFAULT_MOMENT } from './mosaic/moments';
import { holdApse } from './mosaic/first-paint';
import stills from './mosaic/stills.json';

// Milestone descriptions are plain text with optional [label](https://…) links.
function withLinks(text) {
  return text.split(/(\[[^\]]+\]\(https?:\/\/[^)\s]+\))/).map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    return match ? <a key={index} href={match[2]}>{match[1]}</a> : part;
  });
}
const altFor = (key, moment) => stills.alts?.[key === 'now' ? `now-${moment}` : key] || 'The apse, laid in mosaic: San’s desk and its things, and the place behind it.';
const captionFor = (key, clock) => key === 'now' ? `San Jose${clock ? ` · ${clock}` : ''}` : `${PLACE_NAMES[key]} · ${PLACE_CAPTIONS[key]}`;
// the cornice's clock: San Jose's real time (or the ?hour= review hook's)
const clockLabel = () => { const h = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('hour'); return realClock(h != null && h !== '' && !Number.isNaN(+h) ? sanJoseDate(+h) : new Date()); };
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/* The first screen is one mosaic wall: lapis strewn with gold stars, a great gold apse with San's
   desk and its things in it, and his words on a marble stele set into the same wall. Every picture
   here is a still printed beforehand (scripts/publishing/render-home.mjs) and placed by CSS, so the
   first paint is already finished; the live layer (mosaic/live.js) then works off the main thread:
   the light on the gold, the small things that move, and the conch re-laid for each place as the
   words scroll past it. */
export default function MosaicApse() {
  const rootRef = useRef(null), dialogRef = useRef(null);
  const [place, setPlace] = useState({ key: 'now', moment: null });
  const [clock, setClock] = useState('');
  const [plain, setPlain] = useState(false);
  const [tilt, setTilt] = useState(null);
  const [run, setRun] = useState(0);
  const [photo, setPhoto] = useState(null);

  // reached by a link inside the site: pick the moment and hold the apse until its stills are in
  useIsoLayoutEffect(() => {
    const html = document.documentElement;
    if (!html.hasAttribute('data-sj')) {
      html.setAttribute('data-sj', sanJoseMoment(new URLSearchParams(window.location.search).get('hour')));
      html.classList.add('apse-wait');
      holdApse(1200);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPlain(params.get('plain') === '1');
    setClock(clockLabel());
    let live = null, disposed = false;
    const id = (window.requestIdleCallback || (fn => setTimeout(fn, 200)))(async () => {
      const { startMosaic } = await import('./mosaic/live.js');
      if (disposed || !rootRef.current) return;
      live = startMosaic(rootRef.current, {
        onPlace: next => { setPlace({ key: next.key, moment: next.moment }); setClock(clockLabel()); },
        onTilt: ask => setTilt(() => ask),
        onRestart: () => setRun(n => n + 1),
      });
    }, { timeout: 1500 });
    return () => {
      disposed = true;
      if (window.cancelIdleCallback && window.requestIdleCallback) window.cancelIdleCallback(id); else clearTimeout(id);
      live?.destroy();
    };
  }, [run]);

  function openPhoto(event, image) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setPhoto(image);
    dialogRef.current?.showModal();
  }
  const moment = place.moment || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-sj')) || DEFAULT_MOMENT;

  return <div className="apse" id="home" ref={rootRef}>
    <div className="apse-back" aria-hidden="true"><div className="apse-wall" /></div>
    <div className="apse-front">
      <div className="apse-strip" aria-hidden="true"><div className="apse-wall" /></div>
      <div className="apse-conch" role="img" aria-label={altFor(place.key, moment)} />
      <header className="site-header home-header">
        <Link className="wordmark" to="/">San Kala<span className="wordmark-dot">.</span></Link>
        <nav className="desktop-nav" aria-label="Main">{mainNav.map(({ to, label }) => <NavLink key={to} to={to}>{label}</NavLink>)}</nav>
      </header>
      <p className="apse-caption" aria-hidden="true">{captionFor(place.key, clock)}</p>
    </div>

    <div className="apse-lane">
      <div className="apse-intro">
        <section className="stele" aria-labelledby="hello">
          <div className="stele-text">
            <h1 id="hello">Hi, I’m San.</h1>
            <p className="stele-lede">I work on language models at eBay. Before that: computer science at UC San Diego, chip design at Texas Instruments, and electrical engineering at NIT Karnataka. Along the way I co-founded <SiteLink href="/notes/startr-postmortem">a startup that didn’t make&nbsp;it</SiteLink>. I also write, make things, and sometimes turn an idea into a film.</p>
            <p className="stele-more"><SiteLink href="/about">More about me</SiteLink><span className="stele-mail">san@sankala.me</span>{plain ? <a href="/">Living version</a> : <a href="/?plain=1">Still version</a>}</p>
          </div>
        </section>
      </div>
      <p className="wall-note">The apse is laid in stones, in code. In San Jose it keeps the real time; scroll, and it is re-laid for each place I’ve lived and worked.
        <span className="wall-clock">{clock && <>It’s {clock} in San Jose now.</>}</span>
        {tilt && <button type="button" className="wall-tilt" onClick={async () => { if (await tilt()) setTilt(null); }}>Tilt your phone to catch the light</button>}
      </p>
      <h2 className="path" id="history">My path so far</h2>

      {ERA_LIST.map(era => <section className="tab place" key={era.key} data-frame={era.key} aria-labelledby={`place-${era.key}`}>
        <header className="place-head"><span className="place-years">{era.years}</span><h2 id={`place-${era.key}`}>{era.place}</h2><span className="place-role">{era.role}</span></header>
        <ol className="entries">{era.milestones.map(m => <li key={m.id} id={`history-${m.id}`} data-milestone>
          <time dateTime={m.date}>{monthYear(m)}</time>
          <h3>{m.title}</h3>
          <p>{withLinks(m.description)}</p>
          {m.links.length > 0 && <p className="entry-links">{m.links.map(([href, label]) => <SiteLink key={href} href={href}>{label}</SiteLink>)}</p>}
          {m.images.map(image => <a key={image.src} className="tab-print" href={image.src} onClick={event => openPhoto(event, image)} aria-label={`Enlarge photograph: ${image.caption}`}>
            <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
          </a>)}
        </li>)}</ol>
      </section>)}
    </div>
    <dialog className="lightbox" ref={dialogRef} aria-label="Photograph" onClick={event => { if (event.target === dialogRef.current) dialogRef.current.close(); }}>
      <button type="button" className="lightbox-close" onClick={() => dialogRef.current?.close()}>Close ×</button>
      {photo && <figure><img src={photo.src} alt={photo.alt} /><figcaption>{photo.caption}</figcaption></figure>}
    </dialog>
  </div>;
}
