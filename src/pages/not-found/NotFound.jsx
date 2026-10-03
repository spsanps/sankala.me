import { Helmet } from 'react-helmet-async';
import { Action } from '../../components/site/Elements';
import '../../styles/site-pages.css';

export default function NotFound() {
  return <main id="main" className="shell not-found"><Helmet><title>Page not found — San Kala</title><meta name="robots" content="noindex" /></Helmet>
    <header className="page-heading"><span className="eyebrow">404 · Page not found</span><h1>This page isn’t here.</h1><p>You might find what you were looking for in the work index.</p><div className="actions"><Action href="/notes">Browse the work</Action><Action href="/" quiet>Back home</Action></div></header>
    <figure className="not-found-art"><img src="/images/not-found/telescope.webp" srcSet="/images/not-found/telescope.webp 420w, /images/not-found/telescope-2x.webp 840w" sizes="(max-width: 760px) 80vw, 420px" alt="A telescope on a windowsill at night, aimed at a patch of sky over San Jose with nothing in it." width="420" height="415" decoding="async" /></figure>
  </main>;
}
