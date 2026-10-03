import { publications, experience, education, honors } from '../../data/profile';
import { Arrow, SiteLink } from './Elements';

export function Publications() {
  return <div className="publication-list">{publications.map(p => <article className="profile-row" key={p.id} id={p.id}><span className="eyebrow">{p.year}</span><div><h3>{p.title}</h3><p>{p.authors}</p><p className="venue">{p.venue}</p><p>{p.note}</p><div className="profile-links">{p.links.map(([href,label]) => <SiteLink key={href} href={href}>{label} <Arrow /></SiteLink>)}</div></div></article>)}</div>;
}
export function Experience() {
  return <div>{experience.map(job => <article className="profile-row" key={job.organization}><div><h3>{job.organization}</h3><span className="eyebrow">{job.date}</span></div><div><h3>{job.role}</h3><ul>{job.details.map(detail => <li key={detail}>{detail}</li>)}</ul></div></article>)}</div>;
}
export function Education() {
  return <div>{education.map(e => <article className="profile-row" key={e.institution}><span className="eyebrow">{e.date}</span><div><h3>{e.institution}</h3><p className="venue">{e.degree}</p><p>{e.detail}</p></div></article>)}</div>;
}
export function Honors() {
  return <div>{honors.map(([year,title,detail]) => <article className="profile-row" key={title}><span className="eyebrow">{year}</span><div><h3>{title}</h3><p>{detail}</p></div></article>)}</div>;
}
