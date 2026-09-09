import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { paperRobotsUrl } from '../../data/links';

export default function PersonalAtlas() {
  const [ordered, setOrdered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const board = useRef(null);
  const video = useRef(null);
  const motionAllowed = useRef(false);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { motionAllowed.current = !media.matches; if (media.matches) setPlaying(false); };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const player = video.current;
    let visible = true;
    function update() {
      if (playing && visible && !document.hidden) {
        if (!player.src) player.src = '/media/another-sky/habitat-preview-9s.mp4';
        player.play().catch(() => setPlaying(false));
      } else player.pause();
    }
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); });
    observer.observe(player);
    document.addEventListener('visibilitychange', update);
    update();
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); player.pause(); };
  }, [playing]);
  function move(event) {
    if (!motionAllowed.current || ordered || event.pointerType !== 'mouse') return;
    const rect = board.current.getBoundingClientRect();
    board.current.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width - .5) * 14}px`);
    board.current.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height - .5) * 10}px`);
  }
  function reset() { board.current.style.setProperty('--pointer-x', '0px'); board.current.style.setProperty('--pointer-y', '0px'); }
  return <section className={`personal-atlas${ordered ? ' is-ordered' : ''}`} id="home" aria-labelledby="cover-title">
    <div className="atlas-topline"><span>AI researcher · Writer · Builder</span><span>San Jose, California</span></div>
    <h1 id="cover-title">SAN KALA<span aria-hidden="true">✳</span></h1>
    <div className="atlas-board" ref={board} onPointerMove={move} onPointerLeave={reset}>
      <Link className="atlas-object atlas-person" to="/about"><img src="/images/identity/san-kala.webp" alt="San Kala" width="400" height="600" /><span><small>01 / Hello</small><strong>A little about me <b>↗</b></strong></span></Link>
      <a className="atlas-object atlas-award" href="#history-eai-challenge"><img src="/images/awards/uist-2023-presentation.jpg" alt="San and his brother receiving their research award" width="1280" height="960" /><span><small>02 / NeurIPS, 2025</small><strong>First place, with my brother <b>↙</b></strong></span></a>
      <a className="atlas-object atlas-people" href="#history-ucsd-graduation"><img src="/images/history/research-group.webp" alt="With Julian McAuley’s research group at UC San Diego" width="1000" height="750" /><span><small>03 / UC San Diego, 2023</small><strong>The people along the way <b>↙</b></strong></span></a>
      <a className="atlas-object atlas-film" href={`${paperRobotsUrl}films/capricious-god/`}><img src="/images/films/capricious-god/the-eye.webp" alt="A painted agent under the eye of its god" width="1440" height="810" /><span><small>04 / Paper Robots · Animated film</small><strong>The Hugging Face incident <b>↗</b></strong></span></a>
      <a className="atlas-object atlas-world" href="https://dysonswarm.com/another-sky/"><div className="atlas-world-image"><img src="/images/identity/another-sky.webp" alt="A space habitat with its landscape curving overhead" width="1400" height="788" /><video ref={video} muted playsInline loop preload="none" aria-hidden="true" className={playing ? 'is-playing' : ''} /></div><span><small>05 / Dyson Swarm · Interactive world</small><strong>Walk inside a space habitat <b>↗</b></strong></span></a>
    </div>
    <div className="atlas-controls"><span>Photographs, films & little worlds.</span><div><button type="button" onClick={() => { reset(); setOrdered(!ordered); }} aria-pressed={ordered}>{ordered ? 'Spread the collection ↗' : 'Arrange as a grid ⊞'}</button><button type="button" onClick={() => setPlaying(!playing)} aria-pressed={playing}>{playing ? 'Pause habitat preview Ⅱ' : 'Play habitat preview ▷'}</button></div></div>
    <div className="atlas-introduction"><span>Hi, I’m San.</span><p>I work on language models at eBay.<br />Outside work, I write about AI, make animated films, and build worlds you can wander into.</p><div><Link to="/about">More about me ↗</Link><a href="mailto:san@sankala.me">Say hello ↗</a><small>Previously UC San Diego<br />& Texas Instruments</small></div></div>
  </section>;
}
