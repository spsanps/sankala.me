import { useRef, useState } from 'react';
import milestones from '../../data/history.json';
import { SiteLink } from '../site/Elements';
import { places, placeFor } from './places';
import '../../styles/personal-history.css';

// Milestone descriptions are plain text with optional [label](https://…) links.
function withLinks(text) {
  return text.split(/(\[[^\]]+\]\(https?:\/\/[^)\s]+\))/).map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    return match ? <a key={index} href={match[2]}>{match[1]}</a> : part;
  });
}

// grouped: open each place with its drawn window view (History). Ungrouped keeps one list.
export default function PhotoTimeline({ headingLevel = 3, grouped = false }) {
  const Heading = `h${grouped ? Math.min(6, headingLevel + 1) : headingLevel}`;
  const PlaceHeading = `h${headingLevel}`;
  const dialog = useRef(null);
  const [photo, setPhoto] = useState(null);
  function openPhoto(event, selected) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setPhoto(selected);
    dialog.current.showModal();
  }
  const total = milestones.length;
  const item = (milestone, index) => <article className={`photo-milestone${milestone.images.length ? ' has-photo' : ''}`} id={`history-${milestone.id}`} data-milestone key={milestone.id}>
    <div className="milestone-date"><time dateTime={milestone.date}>{milestone.year}<span>{milestone.month}</span></time><span className="milestone-index">{String(index + 1).padStart(2, '0')} / {total}</span></div>
    <div className="milestone-story"><span className="work-kind">{milestone.category} · {milestone.location}</span><Heading>{milestone.title}</Heading><p>{withLinks(milestone.description)}</p>{milestone.links.length > 0 && <div className="inline-links">{milestone.links.map(([href,label]) => <SiteLink key={href} href={href}>{label} <span aria-hidden="true">↗</span></SiteLink>)}</div>}</div>
    {milestone.images.length > 0 && <div className="milestone-photos">{milestone.images.map(selected => <figure key={selected.src}><a href={selected.src} onClick={event => openPhoto(event, selected)} className="history-photo-link" aria-label={`Enlarge photo: ${selected.caption}`}><img src={selected.src} alt={selected.alt} loading="lazy" /><span aria-hidden="true">+</span></a><figcaption>{selected.caption}</figcaption></figure>)}</div>}
  </article>;
  const indexed = milestones.map((milestone, index) => ({ milestone, index }));
  const body = grouped
    ? places.map(place => {
      const own = indexed.filter(({ milestone }) => placeFor(milestone.date).id === place.id);
      if (!own.length) return null;
      return <section className="place-group" id={`place-${place.id}`} aria-labelledby={`place-${place.id}-title`} key={place.id}>
        <header className="place-heading">
          <img src={`/images/history/places/${place.id}.webp`} srcSet={`/images/history/places/${place.id}.webp 320w, /images/history/places/${place.id}-2x.webp 640w`} sizes="(max-width: 650px) 150px, 220px" alt={place.alt} width="320" height="316" loading="lazy" decoding="async" />
          <div><span className="place-years">{place.years}</span><PlaceHeading id={`place-${place.id}-title`}>{place.name}</PlaceHeading><p>{place.line}</p></div>
        </header>
        {own.map(({ milestone, index }) => item(milestone, index))}
      </section>;
    })
    : indexed.map(({ milestone, index }) => item(milestone, index));
  return <><div className={`photo-timeline${grouped ? ' is-grouped' : ''}`}>{body}</div><dialog className="history-lightbox" ref={dialog} aria-label="Career photograph"><button type="button" className="lightbox-close" onClick={() => dialog.current.close()}>Close photograph ×</button>{photo && <figure><img src={photo.src} alt={photo.alt} /><figcaption>{photo.caption}</figcaption></figure>}</dialog></>;
}
