import { useEffect, useRef, useState } from 'react';
import { SiteLink } from '../../components/site/Elements';
import { ERA_LIST, PHOTOS, monthYear } from './eras';
import { WIDE_QUERY } from './four-frames/constants';

// Milestone descriptions are plain text with optional [label](https://…) links.
function withLinks(text) {
  return text.split(/(\[[^\]]+\]\(https?:\/\/[^)\s]+\))/).map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    return match ? <a key={index} href={match[2]}>{match[1]}</a> : part;
  });
}
const num = (params, key) => params.has(key) && !Number.isNaN(parseFloat(params.get(key))) ? parseFloat(params.get(key)) : undefined;

/* Static prints of the desk (npm run render:home), positioned to line up exactly with the live
   painting, so the swap from picture to canvas never moves anything. */
const STILL = {
  wide: { src: '/images/home/desk-wide-1x.webp', srcSet: '/images/home/desk-wide-1x.webp 2250w, /images/home/desk-wide-2x.webp 4500w' },
  tall: { src: '/images/home/desk-tall-1x.webp', srcSet: '/images/home/desk-tall-1x.webp 840w, /images/home/desk-tall-2x.webp 1680w' },
};
const plainStill = key => ({ src: `/images/home/plain-${key}-700.webp`, srcSet: `/images/home/plain-${key}-700.webp 700w, /images/home/plain-${key}-1400.webp 1400w` });

/* One desk, seen from the same seat, in the four places San has lived and worked. The painting
   fills the screen and stays put; the words scroll beside it, and as each place's heading comes
   up, the desk changes by hand to that place. */
export default function FourFrames() {
  const stageRef = useRef(null), canvasRef = useRef(null), laneRef = useRef(null), sectionRefs = useRef([]);
  const dialogRef = useRef(null);
  const [live, setLive] = useState(false);
  const [plain, setPlain] = useState(false);
  const [caption, setCaption] = useState('San Jose');
  const [clock, setClock] = useState('');
  const [dim, setDim] = useState(false);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('plain') === '1') { setPlain(true); return undefined; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const hooks = { t: num(params, 't'), hour: num(params, 'hour'), pos: num(params, 'pos'), era: params.get('era') || undefined };
    let stage = null, disposed = false;
    const start = async () => {
      const { createStage } = await import('./four-frames/stage.js');
      if (disposed) return;
      const created = await createStage({
        canvas: canvasRef.current, stageEl: stageRef.current, laneEl: laneRef.current,
        sections: sectionRefs.current.filter(Boolean), photos: PHOTOS, hooks,
        onChange: next => { setCaption(next.text); if (next.place === 'San Jose') setClock(next.label); },
        onTone: tone => setDim(tone === 'dim'),
        onReady: () => { setLive(true); window.__ready = true; },
      });
      if (disposed) { created.destroy(); return; }
      stage = created;
      if (hooks.era) {
        const index = ERA_LIST.findIndex(era => era.key === hooks.era), section = sectionRefs.current[index];
        if (section && index > 0) window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY - window.innerHeight * .2);
      }
    };
    // Start once the page has painted its picture of the desk and the browser is idle.
    const idle = window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 300);
    return () => {
      disposed = true;
      if (window.cancelIdleCallback && window.requestIdleCallback) window.cancelIdleCallback(idle); else clearTimeout(idle);
      stage?.destroy();
    };
  }, []);

  function openPhoto(event, image) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setPhoto(image);
    dialogRef.current?.showModal();
  }

  return <div className={`four-frames${live ? ' is-live' : ''}${plain ? ' is-plain' : ''}${dim ? ' is-dim' : ''}`} id="home">
    <div className="ff-stage" ref={stageRef}>
      <picture>
        <source media={WIDE_QUERY} srcSet={STILL.wide.srcSet} sizes="250vh" />
        {/* React 18 passes the lowercase attribute through; it marks the first paint's image as urgent. */}
        {/* eslint-disable-next-line react/no-unknown-property */}
        <img className="ff-still" src={STILL.tall.src} srcSet={STILL.tall.srcSet} sizes="140vw" alt={ERA_LIST[0].alt} fetchpriority="high" decoding="async" />
      </picture>
      <canvas ref={canvasRef} className="ff-canvas" aria-hidden="true" />
      <p className="ff-caption" aria-hidden="true">{caption}</p>
    </div>

    <div className="ff-lane" ref={laneRef}>
      {ERA_LIST.map((era, index) => <section className="ff-frame" key={era.key} data-frame={era.key} ref={el => { sectionRefs.current[index] = el; }} aria-labelledby={`place-${era.key}`}>
        {index === 0 && <div className="ff-intro">
          <h1>Hi, I’m San.</h1>
          <p className="ff-lede">I work on language models at eBay. Before that: computer science at UC San Diego, chip design at Texas Instruments, and electrical engineering at NIT Karnataka. Along the way I co-founded <SiteLink href="/notes/startr-postmortem">a startup that didn’t make it</SiteLink>. I also write, make things, and sometimes turn an idea into a film.</p>
          <p className="ff-more"><SiteLink href="/about">More about me</SiteLink><span className="ff-mail">san@sankala.me</span>{plain ? <a href="/">Living version</a> : <a href="/?plain=1">Plain version</a>}</p>
          <p className="ff-cue">The desk is drawn in code and keeps San Jose time. Scroll, and it goes back through the places I’ve worked.<span className="ff-clock">{clock && <>It’s {clock} in San Jose now.</>}</span></p>
          <h2 className="ff-path" id="history">My path so far</h2>
        </div>}
        <picture className="ff-plain-still">
          <img src={plainStill(era.key).src} srcSet={plainStill(era.key).srcSet} sizes="(max-width: 800px) 100vw, 760px" alt={era.alt} loading="lazy" decoding="async" width="1400" height="1290" />
        </picture>
        <header className="ff-place"><span className="ff-years">{era.years}</span><h2 id={`place-${era.key}`}>{era.place}</h2><span className="ff-role">{era.role}</span></header>
        <ol className="ff-entries">{era.milestones.map(m => <li key={m.id} id={`history-${m.id}`} data-milestone className={m.images.length ? 'has-print' : ''}>
          <div className="ff-entry-text">
            <time dateTime={m.date}>{monthYear(m)}</time>
            <h3>{m.title}</h3>
            <p>{withLinks(m.description)}</p>
            {m.links.length > 0 && <p className="ff-links">{m.links.map(([href, label]) => <SiteLink key={href} href={href}>{label}</SiteLink>)}</p>}
          </div>
          {m.images.map(image => <a key={image.src} className="ff-print" href={image.src} onClick={event => openPhoto(event, image)} aria-label={`Enlarge photograph: ${image.caption}`}>
            <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
          </a>)}
        </li>)}</ol>
      </section>)}
    </div>
    <dialog className="ff-lightbox" ref={dialogRef} aria-label="Photograph" onClick={event => { if (event.target === dialogRef.current) dialogRef.current.close(); }}>
      <button type="button" className="ff-lightbox-close" onClick={() => dialogRef.current?.close()}>Close ×</button>
      {photo && <figure><img src={photo.src} alt={photo.alt} /><figcaption>{photo.caption}</figcaption></figure>}
    </dialog>
  </div>;
}
