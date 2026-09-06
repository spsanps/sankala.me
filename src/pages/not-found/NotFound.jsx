import { Helmet } from 'react-helmet-async';
import { Action } from '../../components/site/Elements';
export default function NotFound() {
  return <main id="main" className="shell"><Helmet><title>Page not found — San Kala</title><meta name="robots" content="noindex" /></Helmet><header className="page-heading"><span className="eyebrow">404 / A loose thread</span><h1>This page<br /><em>isn’t here.</em></h1><p>You might find what you were looking for in the work index.</p><div className="actions"><Action href="/notes">Browse the work</Action><Action href="/" quiet>Back home</Action></div></header></main>;
}
