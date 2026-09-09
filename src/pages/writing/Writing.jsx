import { Link } from 'react-router-dom';
import Metadata from '../../components/site/Metadata';
import WritingList from '../../components/writing/WritingList';

export default function Writing() {
  return <main id="main" className="shell"><Metadata title="Writing — San Kala" description="Essays on AI and robotics, research write-ups, and notes on building a startup. Writing by San Kala." path="/writing" />
    <header className="page-heading"><h1>Writing</h1><p>AI, robotics, and what I’ve learned from building things.</p></header>
    <WritingList />
    <aside className="index-footer"><p>Looking for papers or something to try?</p><div className="inline-links"><Link to="/research">Research papers →</Link><Link to="/projects">Interactive projects →</Link><Link to="/notes">All work & search →</Link><a href="/feed.xml">Subscribe via RSS</a></div></aside>
  </main>;
}
