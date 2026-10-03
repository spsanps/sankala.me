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
      <img src={coverImage(slug, 'thumb')} alt="" width="160" height="240" loading="lazy" decoding="async" />
    </span>;
  }
  // A still print at shelf size, for places where one other drawing is already alive.
  if (variant === 'still') {
    return <span className={`cover-art cover-still${className ? ' ' + className : ''}`}>
      <img src={coverImage(slug, '360')} srcSet={`${coverImage(slug, '360')} 360w, ${coverImage(slug)} 720w`} sizes={sizes}
        alt={alt ?? `Cover of “${title}”: ${coverDescriptions[slug]}`} width="360" height="540" loading="lazy" decoding="async" />
    </span>;
  }
  const image = {
    src: coverImage(slug), srcSet: `${coverImage(slug, '360')} 360w, ${coverImage(slug)} 720w`, sizes,
    alt: `Cover of “${title}”: ${coverDescriptions[slug]}`, width: 720, height: 1080,
  };
  return <LivingCanvas image={image} createRenderer={createRenderer} priority={priority} className={`cover-art${className ? ' ' + className : ''}`} />;
}
