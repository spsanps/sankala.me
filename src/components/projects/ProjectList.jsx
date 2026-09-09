import { works } from '../../data/work';
import { SiteLink } from '../site/Elements';

const previews = {
  'another-sky': { image: '/images/identity/another-sky.webp', action: 'Explore the space habitat', collection: 'Space simulation' },
  'a-clauiet-life': { image: '/images/worlds/bee-life.webp', action: 'Open the bee simulation', collection: 'AI experiment' },
  'dyson-swarm': { image: '/images/worlds/dyson-swarm.webp', action: 'Run the solar-collector simulation', collection: 'Space simulation' },
};
export default function ProjectList() {
  return <div className="project-list">{works.filter(work => work.formats.includes('experiment')).map(work => {
    const preview = previews[work.slug];
    return <article className="project-entry" key={work.slug} data-project><SiteLink href={work.url} tabIndex={-1} aria-hidden="true"><img src={preview.image} alt="" width="1400" height="788" loading="lazy" /></SiteLink><div><span className="work-kind">{preview.collection} · {work.date}</span><h3><SiteLink href={work.url}>{work.displayTitle}</SiteLink></h3><span className="original-work-title">{work.title}</span><p>{work.description}</p><SiteLink className="text-link" href={work.url}>{preview.action} <span aria-hidden="true">↗</span></SiteLink></div></article>;
  })}</div>;
}
