# Web Analytics on San Kala and Paper Robots

Requested by San on September 9, 2026. Both public sites now send pageviews to
Vercel Web Analytics. No further setup or API credentials are needed from San.

| Site | Integration | Verified behavior |
| --- | --- | --- |
| `www.sankala.me` | Existing `@vercel/analytics/react` in `src/app/App.jsx` | One analytics script; homepage and React navigation to `/writing` pageviews accepted, HTTP 200 |
| `www.paperrobots.studio` | HTML queue and managed `/_vercel/insights/script.js` in the shared template | One analytics script per page; homepage and `/films/` pageviews accepted, HTTP 200 |

San pasted `@vercel/analytics/next`; that entry point belongs to Next.js. The
personal site uses Vite and React, while Paper Robots builds static HTML. Neither
was migrated, and no second personal analytics component was added. Existing
personal Speed Insights integration remains as it was.

Paper Robots runtime commit: `4040d84`, successful Vercel deployment. The build
includes analytics only when `VERCEL=1` and there is no Pages base path. Normal
local builds and the Pages fallback omit the endpoint. Build checks cover each
variant and all eight publication routes. The 24 existing browser checks pass.

Live verification used a regular-browser simulation because Vercel's public
tracking script intentionally skips automated/headless browsers. The requests
were normal pageviews on the public homepages and one navigation per site. No
custom event or user-identification calls were made. Dashboard aggregates were
not inspected: the evidence is the installed script and successful collection
responses, not a claim to have viewed private reports or changed the dashboard.

No paid tier, custom event reporting, cookie/session identification, advertising,
monetization, or other account setting was configured by the assistant.

To view reports, open the appropriate Vercel project and its Analytics section:
- San Kala project: https://vercel.com/sankalas-projects/sankala-me
- Paper Robots project: https://vercel.com/sankalas-projects/paper-robots-site

Official integration and dashboard guide: https://vercel.com/docs/analytics/quickstart
