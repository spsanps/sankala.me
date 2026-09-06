import { Helmet } from 'react-helmet-async';

export default function Metadata({ title, description, path = '/', image = '/images/identity/social-cover.jpg', type = 'website', schema }) {
  const url = `https://www.sankala.me${path}`;
  return <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={url} />
    <meta property="og:site_name" content="San Kala" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={url} />
    <meta property="og:type" content={type} />
    <meta property="og:image" content={`https://www.sankala.me${image}`} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={`https://www.sankala.me${image}`} />
    {schema && <script type="application/ld+json">{JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>}
  </Helmet>;
}
