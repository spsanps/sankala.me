import { useMemo } from 'react';
import LivingCanvas from '../LivingCanvas';
import { coverDescriptions, coverImage } from './registry';

// The print kit is only downloaded when a cover is about to come alive.
const coverRenderer = slug => async ({ canvas, width, height }) => (await import('./renderer.js')).printCover(slug, canvas, width, height);

// A work's code-drawn cover. On a shelf it is printed live once visible; as a thumbnail it
// stays a small static print beside text that already names the work.
export default function Cover({ slug, title, variant = 'shelf', sizes = '(max-width: 600px) 45vw, 300px', priority = false, className = '', alt }) {
  const createRenderer = useMemo(() => variant === 'shelf' ? coverRenderer(slug) : null, [slug, variant]);
  if (variant === 'thumb') {
    return <span className={`cover-art cover-thumb${className ? ' ' + className : ''}`}>
      <img loading="lazy" decoding="async" src={coverImage(slug, 'thumb')} alt="" width="160" height="240" />
    </span>;
  }
  // A still print at shelf size, for places where one other drawing is already alive.
  if (variant === 'still') {
    return <span className={`cover-art cover-still${className ? ' ' + className : ''}`}>
      {/* loading first: the app renders on the client, and React sets attributes in this order (an img
          that gets its src before loading="lazy" starts downloading at once) */}
      <img loading="lazy" decoding="async" sizes={sizes} srcSet={`${coverImage(slug, '360')} 360w, ${coverImage(slug)} 720w`} src={coverImage(slug, '360')}
        alt={alt ?? `Cover of “${title}”: ${coverDescriptions[slug]}`} width="360" height="540" />
    </span>;
  }
  const image = {
    src: coverImage(slug), srcSet: `${coverImage(slug, '360')} 360w, ${coverImage(slug)} 720w`, sizes,
    alt: `Cover of “${title}”: ${coverDescriptions[slug]}`, width: 720, height: 1080,
  };
  return <LivingCanvas image={image} createRenderer={createRenderer} priority={priority} className={`cover-art${className ? ' ' + className : ''}`} />;
}
