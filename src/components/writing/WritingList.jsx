import { notesData } from '../../data/site-content';
import { works } from '../../data/work';
import { SiteLink } from '../site/Elements';

export default function WritingList({ headingLevel = 2 }) {
  const Heading = `h${headingLevel}`;
  return <div className="writing-list">{works.filter(work => work.formats.includes('writing')).map(work => {
    const note = notesData.find(note => note.slug === work.slug);
    return <article className="writing-entry" key={work.slug} data-writing>
      <div className="writing-date">{work.date}<span>{note.readTime}</span></div>
      <div><Heading><SiteLink href={work.url}>{work.displayTitle}</SiteLink></Heading><span className="original-work-title">{work.title}</span><p>{work.description}</p><div className="inline-links"><SiteLink className="text-link" href={work.url}>Read {work.slug === 'eai-challenge' ? 'the write-up' : 'the essay'} <span aria-hidden="true">→</span></SiteLink>{work.formats.includes('film') && <a className="text-link" href="https://www.youtube.com/watch?v=kzvqj4jurW0">Watch the animated film <span aria-hidden="true">↗</span></a>}</div></div>
    </article>;
  })}</div>;
}
