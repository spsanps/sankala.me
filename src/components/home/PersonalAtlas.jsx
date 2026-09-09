import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function PersonalAtlas() {
  const [ordered, setOrdered] = useState(false);
  const board = useRef(null);
  const motionAllowed = useRef(false);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { motionAllowed.current = !media.matches; };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
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
      <a className="atlas-object atlas-engineering" href="#history-texas-instruments"><img src="/images/locations/ti-bangalore.jpg" alt="San outside Texas Instruments in Bengaluru" width="675" height="629" /><span><small>04 / Texas Instruments · 2019–2022</small><strong>Three years designing chips <b>↙</b></strong></span></a>
      <a className="atlas-object atlas-research" href="#history-ebay-research"><img src="/images/history/ebay-headquarters.webp" alt="San outside eBay headquarters in San Jose" width="700" height="932" /><span><small>05 / eBay · Since 2024</small><strong>Researching language models <b>↙</b></strong></span></a>
    </div>
    <div className="atlas-controls"><span>A few photographs from the years along the way.</span><div><button type="button" onClick={() => { reset(); setOrdered(!ordered); }} aria-pressed={ordered}>{ordered ? 'Spread the collection ↗' : 'Arrange as a grid ⊞'}</button></div></div>
    <div className="atlas-introduction"><span>Hi, I’m San.</span><p>I work on language models at eBay. Before that: UC San Diego, Texas Instruments, and NIT Karnataka.<br />I also write, make things, and sometimes turn an idea into a film.</p><div><Link to="/about">More about me ↗</Link><a href="mailto:san@sankala.me">Say hello ↗</a><small>Previously UC San Diego<br />& Texas Instruments</small></div></div>
  </section>;
}
