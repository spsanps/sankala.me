import { useState } from 'react';
const photographs = [
  { src: '/images/identity/san-kala.webp', alt: 'San Kala', caption: 'Hello, I’m San.', label: 'Portrait', href: '/about' },
  { src: '/images/history/research-group.webp', alt: 'With Julian McAuley’s research group at UC San Diego.', caption: 'The people who made grad school.', label: 'UCSD · 2023', href: '#history-ucsd-graduation' },
  { src: '/images/awards/uist-2023-presentation.jpg', alt: 'Receiving a research award with my collaborator.', caption: 'A competition with my brother.', label: 'NeurIPS · 2025', href: '#history-eai-challenge' },
  { src: '/images/history/ebay-headquarters.webp', alt: 'Outside eBay headquarters in San Jose.', caption: 'These days: AI research at eBay.', label: 'eBay · 2024', href: '#history-ebay-research' },
];
export default function CareerAlbum() {
  const [index,setIndex]=useState(0);
  const photo=photographs[index];
  return <div className="career-album" aria-label="A few photographs from my life">
    <div className="album-topline"><span>From the photo album</span><span>{String(index+1).padStart(2,'0')} / 04</span></div>
    <figure><a href={photo.href} className={`album-image${index === 0 ? ' is-portrait' : ''}`}><img src={photo.src} alt={photo.alt} width="400" height="600" /></a><figcaption aria-live="polite">{photo.caption}<a href={photo.href} aria-label={`More about ${photo.label}`}>↗</a></figcaption></figure>
    <div className="album-select" aria-label="Choose a photograph">{photographs.map((item,i)=><button type="button" key={item.src} aria-label={`Show ${item.label}`} aria-pressed={index===i} onClick={()=>setIndex(i)}><img src={item.src} alt="" width="72" height="48" loading="lazy" /></button>)}</div>
  </div>;
}
