import { Link } from 'react-router-dom';
import { Arrow } from '../../components/site/Elements';
import { paperRobotsUrl } from '../../data/links';

/* The page ends as it began, in mosaic: a few loose stones on the plaster, the border (dark, gold,
   porphyry, gold, dark), a lapis wall in level courses strewn with gold stars, and the footer's
   words on a round-headed marble stele like the one at the top. The wall and the stele are CSS
   built from printed tiles, so they fit any width and need no script. */
export default function MosaicFooter() {
  return <footer className="mosaic-footer">
    <div className="mf-wall">
      <div className="stele stele-foot">
        <div className="stele-text">
          <p className="mf-name">San Kala</p>
          <p className="mf-line">AI researcher and builder.</p>
          <p className="mf-site"><Link to="/work">Writing & projects</Link><Link to="/history">Timeline</Link><Link to="/about">About</Link><Link to="/resume">CV</Link></p>
          <nav className="mf-elsewhere" aria-label="Footer"><a href="mailto:san@sankala.me">Email <Arrow /></a><a href="https://github.com/spsanps">GitHub <Arrow /></a><a href="https://linkedin.com/in/sanjayanps">LinkedIn <Arrow /></a><a href="https://kaggle.com/spsanps">Kaggle <Arrow /></a><a href="/documents/resume.pdf">CV PDF <Arrow /></a><a href="/feed.xml">RSS <Arrow /></a></nav>
          <p className="mf-small"><a href={paperRobotsUrl}>Films & essays: Paper Robots</a> · <a href="https://dysonswarm.com/">Space projects: Dyson Swarm</a></p>
        </div>
      </div>
    </div>
  </footer>;
}
