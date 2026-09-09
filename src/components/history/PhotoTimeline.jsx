import { useRef, useState } from 'react';
import milestones from '../../data/history.json';
import { SiteLink } from '../site/Elements';
import '../../styles/personal-history.css';

export default function PhotoTimeline({ headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  const dialog = useRef(null);
  const [photo, setPhoto] = useState(null);
  function openPhoto(event, selected) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setPhoto(selected);
    dialog.current.showModal();
  }
  return <><div className="photo-timeline">{milestones.map((milestone, index) => <article className={`photo-milestone${milestone.images.length ? ' has-photo' : ''}`} id={`history-${milestone.id}`} data-milestone key={milestone.id}>
    <div className="milestone-date"><time dateTime={milestone.date}>{milestone.year}<span>{milestone.month}</span></time><span className="milestone-index">{String(index + 1).padStart(2, '0')} / 10</span></div>
    <div className="milestone-story"><span className="work-kind">{milestone.category} · {milestone.location}</span><Heading>{milestone.title}</Heading><p>{milestone.description}</p>{milestone.links.length > 0 && <div className="inline-links">{milestone.links.map(([href,label]) => <SiteLink key={href} href={href}>{label} <span aria-hidden="true">↗</span></SiteLink>)}</div>}</div>
    {milestone.images.length > 0 && <div className="milestone-photos">{milestone.images.map(selected => <figure key={selected.src}><a href={selected.src} onClick={event => openPhoto(event, selected)} className="history-photo-link" aria-label={`Enlarge photo: ${selected.caption}`}><img src={selected.src} alt={selected.alt} loading="lazy" /><span aria-hidden="true">+</span></a><figcaption>{selected.caption}</figcaption></figure>)}</div>}
  </article>)}</div><dialog className="history-lightbox" ref={dialog} aria-label="Career photograph"><button type="button" className="lightbox-close" onClick={() => dialog.current.close()}>Close photograph ×</button>{photo && <figure><img src={photo.src} alt={photo.alt} /><figcaption>{photo.caption}</figcaption></figure>}</dialog></>;
}
