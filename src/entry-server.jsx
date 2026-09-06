import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { routes } from './app/routes';

export async function render(url) {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(url));
  if (context instanceof Response) throw new Error(`Unexpected prerender redirect: ${url}`);
  const router = createStaticRouter(handler.dataRoutes, context);
  const helmetContext = {};
  const html = renderToString(<HelmetProvider context={helmetContext}><StaticRouterProvider router={router} context={context} hydrate={false} /></HelmetProvider>);
  const { helmet } = helmetContext;
  return { html, head: [helmet.title, helmet.meta, helmet.link, helmet.script].map(value => value.toString()).join('\n') };
}
