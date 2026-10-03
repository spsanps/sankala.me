import { works } from '../../data/work';
import { SiteLink } from '../site/Elements';
import Cover from '../art/covers/Cover';
import '../../styles/covers.css';

// Things to open, as posters: each interactive project's code-drawn cover at poster scale,
// printed live once it is on screen. The grid around them stays still.
const details = {
  'another-sky': { action: 'Explore the space habitat', collection: 'Space simulation' },
  'a-clauiet-life': { action: 'Open the bee simulation', collection: 'AI experiment' },
  'dyson-swarm': { action: 'Run the solar-collector simulation', collection: 'Space simulation' },
};

export default function ProjectPosters({ headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  return <ul className="cover-shelf poster-shelf">{works.filter(work => work.formats.includes('experiment')).map((work, index) => {
    const detail = details[work.slug] || { action: 'Open the project', collection: 'Experiment' };
    return <li className="shelf-piece" key={work.slug} data-project>
      <SiteLink className="shelf-cover" href={work.url} tabIndex={-1} aria-hidden="true"><Cover slug={work.slug} title={work.title} priority={index < 3} sizes="(max-width: 600px) 90vw, (max-width: 900px) 44vw, 340px" /></SiteLink>
      <div className="shelf-text">
        <p className="shelf-meta">{detail.collection} · {work.date}</p>
        <Heading><SiteLink href={work.url}>{work.displayTitle}</SiteLink></Heading>
        <span className="original-work-title">{work.title}</span>
        <p>{work.description}</p>
        <SiteLink className="text-link" href={work.url}>{detail.action} <span aria-hidden="true">↗</span></SiteLink>
      </div>
    </li>;
  })}</ul>;
}
