import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Zap, ChevronUp, Menu, X } from 'lucide-react';
import LLMActions from '../components/essay/LLMActions';
import {
  DataPyramid,
  ModelScaleTable,
  UniTreePriceChart,
  ComponentCostsInfographic,
  ChinaMultipliersChart,
  ValueCaptureDiagram,
  LatencyComparisonTable,
  RobotEconomicsTable,
  EVvsHumanoidTable,
  ForecastsTable
} from '../components/essay/GPT7Visualizations';

export default function GPT7Essay() {
  const [focusMode, setFocusMode] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [showTOC, setShowTOC] = useState(false);
  const [expandedSidebars, setExpandedSidebars] = useState({});
  const contentRef = useRef(null);

  // Toggle sidebar expansion (for mobile)
  const toggleSidebar = useCallback((sidebarId) => {
    setExpandedSidebars(prev => ({
      ...prev,
      [sidebarId]: !prev[sidebarId]
    }));
  }, []);

  // Scroll handling for progress bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadProgress(Math.min(100, Math.max(0, progress)));
      setShowScrollTop(scrollTop > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll spy for sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToSection = useCallback((id) => {
    const element = document.getElementById(id);
    if (element) {
      // Instant scroll - no smooth behavior for fast feel
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'auto' });
      setShowTOC(false);
    }
  }, []);

  // Table of contents with section codes
  const toc = [
    { id: 'introduction', title: 'Introduction', code: '§', level: 1 },
    { id: 'part-i', title: 'The Convergence', code: 'A', level: 1 },
    { id: 'on-the-altar-of-scale', title: 'On the Altar of Scale', code: 'A1', level: 2 },
    { id: 'many-a-bitter-lesson', title: 'Many a Bitter Lesson', code: 'A2', level: 2 },
    { id: 'part-ii', title: 'The Architecture', code: 'B', level: 1 },
    { id: 'viki', title: 'VIKI', code: 'B1', level: 2 },
    { id: 'latency', title: 'But Latency!', code: 'B2', level: 2 },
    { id: 'robots-as-a-service', title: 'Robots-as-a-Service', code: 'B3', level: 2 },
    { id: 'part-iii', title: 'The Hardware Flood', code: 'C', level: 1 },
    { id: 'racing-to-zero', title: 'Racing to Zero', code: 'C1', level: 2 },
    { id: 'the-forecasts', title: 'The Forecasts', code: 'C2', level: 2 },
    { id: 'china-speed', title: 'China Speed', code: 'C3', level: 2 },
    { id: 'part-iv', title: 'The Economics', code: 'D', level: 1 },
    { id: 'general-embodied-intelligence', title: 'General Embodied Intelligence', code: 'D1', level: 2 },
    { id: 'who-will-buy-them', title: 'Who Will Buy Them', code: 'D2', level: 2 },
    { id: 'who-gets-rich', title: 'Who Gets Rich', code: 'D3', level: 2 },
    { id: 'coda', title: 'The Bet', code: 'E', level: 1 },
  ];

  return (
    <>
      <Helmet>
        <title>GPT-7 Will Have Arms — San Kala</title>
        <meta name="description" content="A mini Situational Awareness for robotics. We'll likely have fully capable humanoid robots during the software-singularity, not after." />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content="GPT-7 Will Have Arms" />
        <meta property="og:description" content="A mini Situational Awareness for robotics. We'll likely have fully capable humanoid robots during the software-singularity, not after." />
        <meta property="og:image" content="https://sankala.me/essays/gpt7/og-image.jpg" />
        <meta property="og:url" content="https://sankala.me/essays/gpt7-will-have-arms" />
        <meta property="og:site_name" content="San Kala" />
        <meta property="article:author" content="San Kala" />
        <meta property="article:published_time" content="2026-01-06" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GPT-7 Will Have Arms" />
        <meta name="twitter:description" content="A mini Situational Awareness for robotics. We'll likely have fully capable humanoid robots during the software-singularity, not after." />
        <meta name="twitter:image" content="https://sankala.me/essays/gpt7/og-image.jpg" />
      </Helmet>

    <div className={`gpt7-essay min-h-screen bg-[#F5F2EB] text-[#1A1A1A] ${focusMode ? 'focus-mode-active' : ''}`}>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-[#2A3C24]/10 z-50">
        <div
          className="h-full bg-[#2A3C24] transition-all duration-100 ease-out"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#F5F2EB]/95 backdrop-blur-sm border-b border-[#2A3C24]/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-[#2A3C24]/60 hover:text-[#2A3C24] transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium hidden sm:inline font-serif">San Kala</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* TOC Toggle (mobile) */}
            <button
              onClick={() => setShowTOC(!showTOC)}
              className="lg:hidden p-2 rounded-md text-[#2A3C24]/60 hover:text-[#2A3C24] hover:bg-[#2A3C24]/5 transition-all"
              title="Table of Contents"
            >
              {showTOC ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* ADHD Mode Toggle */}
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`p-2 rounded-full transition-all duration-200 ${
                focusMode
                  ? 'bg-[#FBD45B] text-[#1A1A1A]'
                  : 'text-[#2A3C24]/50 hover:text-[#2A3C24] hover:bg-[#2A3C24]/5'
              }`}
              title="ADHD Mode - Read highlighted sentences for a quick summary"
            >
              <Zap size={18} strokeWidth={focusMode ? 2.5 : 1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile TOC Overlay */}
      {showTOC && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-[#1A1A1A]/20" onClick={() => setShowTOC(false)} />
          <nav className="absolute top-14 left-0 right-0 max-h-[70vh] overflow-y-auto bg-[#F5F2EB] border-b border-[#2A3C24]/10 shadow-lg">
            <div className="p-4 space-y-1">
              {toc.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left py-2 px-3 rounded-md text-sm transition-colors font-serif ${
                    item.level === 1 ? 'font-semibold text-[#1A1A1A]' : 'pl-6 text-[#8A9A85]'
                  } ${activeSection === item.id ? 'bg-[#2A3C24] text-[#F5F2EB]' : 'hover:bg-[#2A3C24]/5'}`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex justify-center">
        {/* Left Sidebar TOC - shows on hover */}
        <aside className="left-sidebar-toc hidden xl:block fixed left-0 top-0 h-full w-[300px] z-30">
          <div className="left-sidebar-trigger h-full" />
          <nav className="left-sidebar-content">
            <div className="left-sidebar-header">
              <div className="text-xs font-semibold text-[#8A9A85] uppercase tracking-wider">Contents</div>
            </div>
            <div className="left-sidebar-scroll">
              {toc.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`left-toc-item ${item.level === 1 ? 'left-toc-part' : 'left-toc-section'} ${activeSection === item.id ? 'active' : ''}`}
                >
                  <span className="left-toc-code">{item.code}</span>
                  <span className="left-toc-title">{item.title}</span>
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content with vertical border lines */}
        <main ref={contentRef} className="essay-container w-full max-w-[680px] mx-auto px-5 sm:px-8 pt-24 pb-24">

          {/* Essay Header */}
          <header className="mb-16 pb-10 border-b border-[#2A3C24]/10">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#8A9A85] mb-8 font-mono uppercase tracking-wider">
              <span>December 2025</span>
              <span className="opacity-40">|</span>
              <span>28 min read</span>
              <span className="opacity-40">|</span>
              <span>Essay</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl leading-[1.1] font-bold tracking-tight text-[#1A1A1A] mb-6 font-serif">
              GPT-7 Will Have Arms
            </h1>

            {/* Subtitles */}
            <div className="space-y-2 mb-8">
              <p className="text-xl text-[#2A3C24]/80 leading-relaxed font-light font-serif">
                The Coming Convergence of Foundation Models and Robotics
              </p>
              <p className="text-lg text-[#8A9A85] leading-relaxed font-light font-serif italic">
                & Why the Scaling Believers Should Apply Their Own Logic to Robotics
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {['AI', 'Robotics', 'Economics', 'Forecasting'].map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-[#2A3C24]/5 text-[#2A3C24]/70 text-[10px] font-medium rounded uppercase tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* LLM-friendly formats */}
            <LLMActions markdownUrl="/essays/gpt7-will-have-arms.md" className="mt-6" />
          </header>

          {/* Essay Content */}
          <article className={`essay-prose ${focusMode ? 'focus-active' : ''}`}>
            <EssayContent focusMode={focusMode} expandedSidebars={expandedSidebars} toggleSidebar={toggleSidebar} />
          </article>

          {/* Footer */}
          <footer className="mt-24 pt-10 border-t border-[#2A3C24]/10">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="group inline-flex items-center gap-2 text-[#2A3C24] hover:underline font-medium text-sm transition-colors"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Link>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); scrollToTop(); }}
                className="text-xs text-[#8A9A85] hover:text-[#2A3C24] transition-colors"
              >
                Back to top
              </a>
            </div>
          </footer>
        </main>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 p-2.5 rounded-full bg-[#2A3C24] text-[#F5F2EB] shadow-lg transition-all duration-300 z-40 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <ChevronUp size={16} strokeWidth={1.5} />
      </button>

      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@400;500;600&display=swap');

        .gpt7-essay {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .font-serif {
          font-family: 'Playfair Display', Georgia, serif;
        }

        /* Essay Typography */
        .essay-prose {
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 1.125rem;
          line-height: 1.85;
          color: #1A1A1A;
        }

        .essay-prose p {
          margin-bottom: 1.5em;
        }

        .essay-prose strong {
          font-weight: 600;
          color: #1A1A1A;
        }

        .essay-prose em {
          font-style: italic;
        }

        /* Left margin section codes - big bold letters */
        .section-code {
          display: none;
        }

        @media (min-width: 1280px) {
          .section-code {
            display: block;
            position: absolute;
            left: -180px;
            top: 0.25rem;
            width: 150px;
            text-align: right;
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 3.5rem;
            font-weight: 900;
            color: #2A3C24;
            opacity: 0.25;
            line-height: 1;
            cursor: default;
            transition: opacity 0.15s;
          }

          .section-code:hover {
            opacity: 0.4;
          }

          .section-code-sub {
            font-size: 2rem;
            font-weight: 800;
            top: 0.15rem;
          }
        }

        /* Position relative to section - must be outside media query */
        .essay-prose section {
          position: relative;
        }

        /* Headings with decorative lines */
        .essay-prose h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #2A3C24;
          margin-top: 4rem;
          margin-bottom: 1.5rem;
          padding: 1rem 0;
          line-height: 1.2;
          position: relative;
          clear: both;
        }

        .essay-prose h1::before,
        .essay-prose h1::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: #2A3C24;
          opacity: 0.2;
        }

        .essay-prose h1::before {
          top: 0;
        }

        .essay-prose h1::after {
          bottom: 0;
        }

        .essay-prose h1:first-child {
          margin-top: 0;
        }

        /* Remove margin when heading follows section code */
        .essay-prose .section-code + h1,
        .essay-prose .section-code + h2 {
          margin-top: 0;
        }

        .essay-prose h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: #1A1A1A;
          margin-top: 3rem;
          margin-bottom: 1.25rem;
          padding: 0.75rem 0;
          line-height: 1.3;
          position: relative;
          clear: both;
        }

        .essay-prose h2::before,
        .essay-prose h2::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: #8A9A85;
          opacity: 0.3;
        }

        .essay-prose h2::before {
          top: 0;
        }

        .essay-prose h2::after {
          bottom: 0;
        }

        .essay-prose h3 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: #2A3C24;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.4;
          clear: both;
        }

        /* Links */
        .essay-prose a {
          color: #2A3C24;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 2px;
          text-decoration-color: rgba(42, 60, 36, 0.3);
          transition: text-decoration-color 0.2s;
        }

        .essay-prose a:hover {
          text-decoration-color: #2A3C24;
        }

        /* Lists */
        .essay-prose ul, .essay-prose ol {
          margin: 1.5rem 0;
          padding-left: 0;
          list-style: none;
        }

        .essay-prose li {
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 0.6rem;
        }

        .essay-prose ul li::before {
          content: '';
          position: absolute;
          left: 0.25rem;
          top: 0.7em;
          width: 4px;
          height: 4px;
          background: #2A3C24;
          border-radius: 50%;
          opacity: 0.5;
        }

        /* Blockquotes */
        .essay-prose blockquote {
          margin: 1.75rem 0;
          padding: 0.5rem 0 0.5rem 1.25rem;
          border-left: 2px solid #2A3C24;
          font-style: italic;
          color: #2A3C24;
        }

        .essay-prose blockquote p:last-child {
          margin-bottom: 0;
        }

        /* Horizontal rules - Major part dividers */
        .essay-prose hr {
          border: none;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            #2A3C24 20%,
            #2A3C24 80%,
            transparent 100%
          );
          opacity: 0.2;
          margin: 4rem 0;
        }

        /* Code */
        .essay-prose code {
          font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
          font-size: 0.875em;
          background: rgba(42, 60, 36, 0.08);
          color: #2A3C24;
          padding: 0.15rem 0.4rem;
          border-radius: 0.25rem;
        }

        /* Focus Mode - only affects main content, not sidebars */
        .focus-active p:not(.has-highlight):not(.sidebar-note p) {
          opacity: 0.3;
          transition: opacity 0.3s ease;
        }

        .focus-active .sidebar-note p {
          opacity: 1;
        }

        .focus-active p:hover {
          opacity: 0.7;
        }

        .focus-active p.has-highlight {
          opacity: 1;
        }

        .focus-active strong:not(.sidebar-note strong) {
          background: rgba(251, 212, 91, 0.25);
          padding: 0 0.1em;
        }

        .focus-active .sidebar-note strong {
          background: none;
        }

        .focus-mode-active {
          background: #FAF8F3;
        }

        /* Margin Notes - collapsible on mobile, side panel on desktop */
        .sidebar-note {
          background: transparent;
          margin: 0.5rem 0;
          font-size: 0.9rem;
          color: #1A1A1A/80;
          overflow: hidden;
          position: relative;
        }

        .sidebar-note-header {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0.25rem 0;
          cursor: pointer;
          user-select: none;
        }

        .sidebar-note-header::before {
          content: '';
          position: absolute;
          left: 0;
          right: 60px;
          height: 1px;
          background: linear-gradient(to right, transparent, #8A9A85 80%);
          top: 50%;
          transition: opacity 0.15s ease;
        }

        .sidebar-note.expanded .sidebar-note-header::before {
          opacity: 0;
        }

        .sidebar-note-peek {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #8A9A85;
          font-size: 0.65rem;
          font-family: 'Inter', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sidebar-note-peek::before {
          content: '◢';
          font-size: 0.5rem;
        }

        .sidebar-note-icon {
          display: none;
        }

        .sidebar-note-title {
          display: none;
        }

        .sidebar-note-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.2s ease-out, padding 0.15s ease-out;
          padding: 0;
          border-left: 2px solid #8A9A85;
          margin-left: 0;
        }

        .sidebar-note.expanded .sidebar-note-content {
          max-height: 600px;
          padding: 0.75rem 0 0.75rem 0.75rem;
          transition: max-height 0.25s ease-in, padding 0.15s ease-out;
        }

        .sidebar-note-content .sidebar-note-title {
          display: block;
          margin-bottom: 0.5rem;
        }

        .sidebar-note-chevron {
          display: none;
        }

        @media (min-width: 1280px) {
          .sidebar-note-icon {
            display: none;
          }

          .sidebar-note-peek {
            display: none;
          }

          .sidebar-note-title {
            display: block;
          }

          .sidebar-note {
            position: absolute;
            right: -260px;
            width: 220px;
            margin: 0;
            padding: 0;
            border: none;
            background: transparent;
            font-size: 0.8rem;
            line-height: 1.5;
            color: #8A9A85;
            border-radius: 0;
            overflow: visible;
          }

          .sidebar-note-header {
            display: none;
          }

          .sidebar-note-header::before {
            display: none;
          }

          .sidebar-note-chevron {
            display: none;
          }

          .sidebar-note-content {
            max-height: none !important;
            padding: 0 !important;
            overflow: visible;
            border-left: none;
          }

          .sidebar-note p {
            margin-bottom: 0.5rem;
            font-size: 0.8rem;
          }

          .sidebar-note ul {
            margin: 0.5rem 0;
            padding-left: 0;
          }

          .sidebar-note li {
            padding-left: 0.75rem;
            margin-bottom: 0.35rem;
            font-size: 0.8rem;
          }

          .sidebar-note li::before {
            width: 3px;
            height: 3px;
            background: #8A9A85;
          }
        }

        .sidebar-note-title {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #2A3C24;
          margin-bottom: 0;
        }

        @media (min-width: 1280px) {
          .sidebar-note-title {
            margin-bottom: 0.5rem;
          }
        }

        /* Callout */
        .callout {
          background: #2A3C24;
          color: #F5F2EB;
          padding: 1.5rem 1.75rem;
          margin: 2rem 0;
          border-radius: 0.25rem;
        }

        .callout-title {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #FBD45B;
          margin-bottom: 1rem;
        }

        .callout p {
          color: #D1D9CE;
          margin-bottom: 1rem;
        }

        .callout p:last-child {
          margin-bottom: 0;
        }

        .callout strong {
          color: #F5F2EB;
        }

        .callout ul {
          margin: 0.75rem 0;
        }

        .callout li {
          color: #D1D9CE;
        }

        .callout li::before {
          background: #8A9A85;
        }

        /* Stat highlight */
        .stat-highlight {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 0.75rem 1rem;
          margin: 2rem 0;
          padding: 1.25rem 0;
          border-top: 1px solid rgba(42, 60, 36, 0.1);
          border-bottom: 1px solid rgba(42, 60, 36, 0.1);
        }

        .stat-value {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2.25rem;
          font-weight: 700;
          color: #2A3C24;
          letter-spacing: -0.02em;
          flex-shrink: 0;
        }

        .stat-label {
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 1rem;
          color: #8A9A85;
          line-height: 1.4;
          flex: 1;
          min-width: 200px;
        }

        /* Quote */
        .quote-block {
          margin: 2.5rem 0;
          padding: 1.5rem;
          background: rgba(42, 60, 36, 0.03);
          border-radius: 0.25rem;
        }

        .quote-text {
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 1.2rem;
          font-style: italic;
          line-height: 1.6;
          margin-bottom: 0.75rem;
          color: #2A3C24;
        }

        .quote-attribution {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          color: #8A9A85;
        }

        /* Hover term */
        .hover-term {
          border-bottom: 2px dotted #2A3C24;
          cursor: help;
          position: relative;
        }

        .hover-term:hover {
          border-bottom-style: solid;
        }

        /* Hover term inside callout (dark background) */
        .callout .hover-term {
          border-bottom-color: #F5F2EB;
          color: #F5F2EB;
        }

        .hover-term:hover::after {
          content: attr(data-definition);
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: #1A1A1A;
          color: #F5F2EB;
          padding: 0.6rem 0.85rem;
          border-radius: 0.25rem;
          font-size: 0.8rem;
          line-height: 1.5;
          width: max-content;
          max-width: 280px;
          z-index: 100;
          font-style: normal;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }

        .hover-term:hover::before {
          content: '';
          position: absolute;
          bottom: calc(100% + 2px);
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: #1A1A1A;
          z-index: 100;
        }

        /* Figure */
        .figure-container {
          margin: 2.5rem 0;
        }

        .figure-caption {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          color: #8A9A85;
          text-align: center;
          margin-top: 0.75rem;
        }

        /* TOC item */
        .toc-item {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .essay-prose {
            font-size: 1.05rem;
          }

          .essay-prose h1 {
            font-size: 1.625rem;
          }

          .essay-prose h2 {
            font-size: 1.35rem;
          }
        }

        @media (max-width: 640px) {
          .essay-prose {
            font-size: 1rem;
            line-height: 1.8;
          }

          .essay-prose h1 {
            font-size: 1.5rem;
          }

          .essay-prose h2 {
            font-size: 1.25rem;
          }

          .essay-prose h3 {
            font-size: 1.1rem;
          }

          .stat-value {
            font-size: 1.75rem;
          }

          .hover-term:hover::after,
          .hover-term:hover::before {
            display: none;
          }
        }

        /* Scrollbar */
        aside::-webkit-scrollbar {
          width: 3px;
        }

        aside::-webkit-scrollbar-track {
          background: transparent;
        }

        aside::-webkit-scrollbar-thumb {
          background: rgba(42, 60, 36, 0.1);
          border-radius: 2px;
        }

        ::selection {
          background-color: #2A3C24;
          color: #F5F2EB;
        }

        html {
          scroll-behavior: auto;
        }

        /* Left Sidebar TOC - hover to reveal */
        .left-sidebar-toc {
          pointer-events: none;
        }

        .left-sidebar-trigger {
          position: absolute;
          left: 0;
          top: 0;
          width: 220px;
          height: 100%;
          pointer-events: auto;
        }

        .left-sidebar-content {
          position: absolute;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          width: 280px;
          max-height: 70vh;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.1s ease;
          display: flex;
          flex-direction: column;
        }

        .left-sidebar-toc:hover .left-sidebar-content {
          opacity: 1;
          pointer-events: auto;
        }

        .left-sidebar-header {
          padding: 0 0.5rem 0.75rem;
          flex-shrink: 0;
        }

        .left-sidebar-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem 0;
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
        }

        .left-toc-item {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          width: 100%;
          padding: 0.45rem 0.5rem;
          text-align: left;
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 0.95rem;
          color: #8A9A85;
          transition: color 0.1s;
          cursor: pointer;
          border: none;
          background: transparent;
        }

        .left-toc-item:hover {
          color: #2A3C24;
        }

        .left-toc-item:hover .left-toc-code {
          color: #2A3C24;
        }

        .left-toc-item.active {
          color: #2A3C24;
        }

        .left-toc-item.active .left-toc-code {
          color: #2A3C24;
        }

        .left-toc-part {
          font-weight: 600;
          font-size: 1rem;
          color: #2A3C24;
        }

        .left-toc-part .left-toc-code {
          color: #2A3C24;
          font-size: 1rem;
        }

        .left-toc-section {
          padding-left: 2rem;
          font-weight: 400;
          font-size: 0.9rem;
        }

        .left-toc-code {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: #8A9A85;
          min-width: 2rem;
          transition: color 0.1s;
        }

        .left-toc-title {
          flex: 1;
        }

        /* Hide scrollbar */
        .left-sidebar-scroll::-webkit-scrollbar {
          width: 0;
          display: none;
        }
      `}</style>
    </div>
    </>
  );
}

// Simple Section Code Component (just displays the code)
function SectionCode({ code, isPart }) {
  return (
    <span className={`section-code ${!isPart ? 'section-code-sub' : ''}`}>
      {code}
    </span>
  );
}

// Essay Content Component
function EssayContent({ focusMode, expandedSidebars, toggleSidebar }) {
  return (
    <div>
      {/* Introduction */}
      <section id="introduction" data-section="introduction">
        <SectionCode code="§" isPart={true} />
        <h1>Introduction</h1>

        {/* Opening Image */}
        <div className="figure-container" style={{ marginBottom: '2.5rem' }}>
          <div style={{ overflow: 'hidden', borderRadius: '0.5rem' }}>
            <img
              src="/essays/gpt7/Opening-optimized.jpg"
              alt="Chrome robot standing under a partial Dyson swarm in a sunflower field"
              className="w-full"
              style={{
                height: '350px',
                objectFit: 'cover',
                objectPosition: 'center top',
                background: '#E8E5DE'
              }}
            />
          </div>
          <p className="figure-caption" style={{ fontStyle: 'italic' }}>A chrome robot stands under a partial <a href="https://dysonswarm.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px dotted #8A9A85' }}>Dyson swarm</a> in a sunflower field</p>
        </div>

        <p>
          On the eve of the technological singularity, the discussion around superintelligence—and the vision we have in our collective psyche—is of a world transformed by superintelligent AI that is fundamentally about software and virtual agents. The AIs are disembodied: a "country of geniuses in a datacenter" doing research and writing superhuman code, but never picking up a test tube or building a bridge.
        </p>

        <div className={`sidebar-note ${expandedSidebars['disembodied'] ? 'expanded' : ''}`}>
          <div className="sidebar-note-header" onClick={() => toggleSidebar('disembodied')}>
            <span className="sidebar-note-peek">note</span>
          </div>
          <div className="sidebar-note-content">
            <div className="sidebar-note-title">The Disembodied AI Assumption</div>
            <p>The current AGI discourse largely assumes intelligence stays in datacenters:</p>
            <ul>
              <li><strong><a href="https://darioamodei.com/machines-of-loving-grace" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Dario Amodei's "Machines of Loving Grace"</a></strong> — focuses on AI accelerating science and policy, with physical applications as an afterthought</li>
              <li><strong><a href="https://situational-awareness.ai/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Leopold Aschenbrenner's "Situational Awareness"</a></strong> — charts a path to superintelligence through software, not embodiment</li>
              <li><strong>The AI-2027 scenario</strong> — models AGI impact primarily through digital channels</li>
              <li><strong>Most AGI timelines discussions</strong> — software-only singularity</li>
            </ul>
            <p><strong>This essay argues the assumption is wrong.</strong></p>
          </div>
        </div>

        <p className={focusMode ? 'has-highlight' : ''}>
          I think this framing is incorrect. <strong>The robot that folds your laundry will be powered by a version of <span className="hover-term" data-definition="By 'GPT-7' I mean GPT-7 class models from any frontier lab—Google, Anthropic, OpenAI, or others. The name is shorthand for 'frontier foundation model circa 2027-2028'">GPT-7</span>.</strong>{' '}
          Not a robotics model. Not a purpose-built manipulation system. A finetune of the same trillion-parameter model that automates software engineering and scientific research—that model will also fold your shirts.
        </p>

        <p>This essay makes three claims:</p>

        <div className="callout">
          <div className="callout-title">The Three Claims</div>
          <p className={focusMode ? 'has-highlight' : ''}>
            <strong>First</strong>, frontier multimodal models—the GPTs, Geminis, Claudes—will become the robot brains. Not purpose-built robotics models. <strong>The same model that powers your chatbot will power your robot.</strong>
          </p>
          <p>
            The scaling insight: the next generation of frontier models will be natively multimodal—video generation integrated with language and reasoning. To generate video, you must model how the world works. Current video models already show physics understanding at moderate scale. When frontier labs apply trillion-parameter scale to unified multimodal training, dexterous humanoid manipulation—I postulate—will emerge almost for free.
          </p>
          <p className={focusMode ? 'has-highlight' : ''}>
            <strong>Second</strong>, this implies cloud architecture. You can't run a trillion-parameter model on embedded hardware. <strong>The intelligence lives in the cloud.</strong> One brain, millions of bodies—I call this the{' '}
            <span className="hover-term" data-definition="Named after the AI in I, Robot that controlled all NS-5 robots centrally">VIKI architecture</span>. The slider between edge and cloud is moving cloud-ward faster than roboticists expect.
          </p>
          <p className={focusMode ? 'has-highlight' : ''}>
            <strong>Third</strong>, this creates Wintel-like value capture. AI labs capture value through inference APIs. Hardware commoditizes—China is already producing humanoids under $6,000. <strong>The hardware race is a race to the bottom. The intelligence race is the one that matters.</strong>
          </p>
        </div>

        <p>
          This matters beyond technology. If AI takeoff happens in the late 20s, it won't just be intelligence in datacenters as we imagine it to be. It will be intelligence with physical presence—in factories, warehouses, homes, and battlefields. The competition won't just be about who builds AGI first. It will be about who controls <em>physical</em> AGI during the takeoff window.
        </p>

        <div className="callout">
          <div className="callout-title">Reading Guide</div>
          <p style={{ fontStyle: 'italic' }}>
            This essay proceeds in four parts: <strong>The Convergence</strong> (why foundation models become robot brains), <strong>The Architecture</strong> (why cloud beats edge), <strong>The Hardware Flood</strong> (why costs collapse), and <strong>The Economics</strong> (who captures value).
          </p>
        </div>
      </section>

      <hr />

      {/* Part I */}
      <section id="part-i" data-section="part-i">
        <SectionCode code="A" isPart={true} />
        <h1>PART I: THE CONVERGENCE</h1>
      </section>

      <section id="on-the-altar-of-scale" data-section="on-the-altar-of-scale">
        <SectionCode code="A1" isPart={false} />
        <h2>On the Altar of Scale</h2>

        <p>
          The robotics data problem was supposed to be insurmountable. You can train GPT-4/GPT-5 class models on trillions of tokens from the internet; you cannot download robot demonstrations. This implied that robotics would lag language AI by decades.
        </p>

        <p>
          This is turning out to be wrong, for reasons that become clear once you accept the scaling hypothesis.
        </p>

        <h3>The Data Is Already There</h3>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>The internet already contains most of what a robot needs to know.</strong>
        </p>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>Video is implicit physics.</strong> YouTube contains trillions of frames of the physical world in motion. Objects falling, liquids pouring, hands manipulating, bodies moving through space. A model trained to predict the next frame of video must learn how the world works—gravity, friction, rigidity, occlusion, cause and effect.
        </p>

        <div className={`sidebar-note ${expandedSidebars['physics-video'] ? 'expanded' : ''}`}>
          <div className="sidebar-note-header" onClick={() => toggleSidebar('physics-video')}>
            <span className="sidebar-note-peek">note</span>
          </div>
          <div className="sidebar-note-content">
            <div className="sidebar-note-title">Learning Physics From Video</div>
            <p>
              In a recent <a href="https://lexfridman.com/demis-hassabis-2-transcript/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">interview with Lex Fridman</a>, Hassabis elaborated: even five or ten years ago, he would have assumed you need embodied experience to understand intuitive physics. Veo 3 is directly challenging that assumption—learning physics just from watching video.
            </p>
          </div>
        </div>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>Human video is manipulation data.</strong> Billions of hours of humans folding laundry, cooking, assembling furniture, using tools. First-person GoPro footage. Cooking tutorials. Assembly instructions. This teaches the model what it looks like when a humanoid-shaped agent interacts with objects.
        </p>

        {/* Sora Wine Glass Video */}
        <div className="figure-container">
          <div className="relative overflow-hidden rounded-lg" style={{ background: '#E8E5DE' }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            >
              <source src="/essays/gpt7/wine-video-optimized.mp4" type="video/mp4" />
            </video>
          </div>
          <p className="figure-caption">To render this accurately, the model must already understand manipulation physics</p>
        </div>

        <p>
          Consider what a video generation model must know to accurately render a human hand holding a wine glass. To model each frame correctly—from every angle, in any lighting, through any motion—the model must understand dexterous manipulation at a granular level. It needs to know exactly where fingers should be positioned, how grip pressure affects the glass, how the liquid moves, how wrist rotation translates through the arm. A model that can generate this video has already learned the physics of manipulation. The robot-specific training just needs to steer this immense pre-trained knowledge.
        </p>

        <div className="quote-block">
          <p className="quote-text">
            "Predicting the next token well means that you understand the underlying reality that led to the creation of that token."
          </p>
          <p className="quote-attribution">— Ilya Sutskever, <a href="https://www.dwarkesh.com/p/ilya-sutskever" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Dwarkesh Patel Interview</a></p>
        </div>

        <p>
          <strong>Modality-seep.</strong> Understanding can bleed between modalities. Early text-only models "knew" things about vision—they could describe colors, spatial relationships, visual aesthetics—despite never seeing an image. A picture is worth a thousand words, but a thousand words also encode the picture.
        </p>

        <p>
          The same applies to other modalities like touch, temperature, and force. Video of a hand gripping a hot mug implicitly contains thermal information (steam rising, careful handling). Video of fingers testing fruit ripeness encodes tactile feedback (the slight give, the pressure applied). Video of lifting objects reveals weight and balance. A model trained on enough video may develop surprisingly rich representations of sensory modalities it has never directly experienced. Sensor data in post-training can then align these representations to actual tactile and proprioceptive feedback.
        </p>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>The data for robot intelligence was always there. It just wasn't labeled "robot data."</strong>
        </p>

        <h3>The Data Pyramid</h3>

        <div className="figure-container">
          <DataPyramid />
        </div>

        <p>The evidence for this hierarchy is already visible in the progression of robotics models:</p>

        <p>
          <strong><a href="https://arxiv.org/abs/2212.06817" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">RT-1</a> (Google, 2022):</strong> Trained on 130,000 demonstrations collected over 17 months. Used vision-language pretraining (ImageNet-pretrained image encoder), but robot-specific manipulation data was collected from scratch.
        </p>

        <p>
          <strong><a href="https://arxiv.org/abs/2307.15818" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">RT-2</a> (Google, 2023):</strong> Same robot data, combined with large-scale vision-language pretraining. Result: performance on novel semantic concepts jumped from 32% to 62%—nearly doubling. The model exhibited emergent reasoning: asking it to "pick up the extinct animal" led it to correctly identify and grasp a plastic dinosaur, despite no such instruction appearing in the robot training data.
        </p>

        <div className="stat-highlight">
          <span className="stat-value">32% → 62%</span>
          <span className="stat-label">Performance on novel concepts with same robot data, just better pretraining</span>
        </div>

        <p>
          <strong><a href="https://www.physicalintelligence.company/blog/pi0" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">π0</a> (Physical Intelligence, 2024):</strong> Demonstrates that foundation model pretraining dramatically reduces the robot-specific data needed. The paper describes using diverse demonstration data, with task-specific finetuning requiring far less data than training from scratch.
        </p>

        <p>
          <strong><a href="https://www.pi.website/research/human_to_robot" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Physical Intelligence</a> (December 2025):</strong> "Adding more robot data in pre-training improves ability to absorb human data in fine-tuning." Human video transfers to robot learning.
        </p>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>The pattern is clear: each generation requires less robot-specific data because more capability comes from general pretraining.</strong> The stronger you think this data efficiency effect is, the faster you think the transition will occur.
        </p>

        <h3>What Scaled Multimodal Models Will Look Like</h3>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>The next generation of frontier models won't just understand video. They will think in video.</strong>
        </p>

        <p>
          Today's multimodal models—GPT-4.5, Gemini 2.5, Claude 4—can look at images and video. They accept visual inputs. But they don't generate visual outputs, and they don't reason in visual tokens. When you ask them to imagine rotating an object, they simulate it in language. They're text models with eyes.
        </p>

        <p>
          The next generation will be different. These models will be trained with video generation objectives alongside text—predicting future frames, generating scenes from descriptions, completing partial videos. Think <a href="https://openai.com/index/video-generation-models-as-world-simulators/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Sora</a> merged with GPT, or Veo merged with Gemini, in a single unified model.
        </p>

        <div className="quote-block">
          <p className="quote-text">
            "It's kind of mindblowing how good Veo 3 is at modeling intuitive physics. Our world models are getting pretty good, and in my view this has important implications regarding the computational complexity of the world."
          </p>
          <p className="quote-attribution">— Demis Hassabis, <a href="https://x.com/demishassabis/status/1926057739416965438" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Twitter</a>, May 2025</p>
        </div>

        <div className={`sidebar-note ${expandedSidebars['reasoning'] ? 'expanded' : ''}`}>
          <div className="sidebar-note-header" onClick={() => toggleSidebar('reasoning')}>
            <span className="sidebar-note-peek">note</span>
          </div>
          <div className="sidebar-note-content">
            <div className="sidebar-note-title">Why This Matters for Reasoning</div>
            <p>
              When a model can generate and reason in visual tokens, it can "imagine" physical manipulations before executing them. Benchmarks requiring spatial reasoning—like ARC-AGI puzzles—could fall to models that can visualize and mentally rotate objects, rather than reason purely in text.
            </p>
          </div>
        </div>

        <p>
          And just as RL on text models gave us chain-of-thought reasoning, RL on video-generating models could give us reasoning in visual tokens. Models that "imagine" actions before taking them—mentally simulating the physics of a grasp, visualizing the trajectory of a throw, previewing the result of an assembly step.
        </p>

        <p>
          Current video models are small by frontier standards. Open-source Sora equivalents are 3-10B parameters. Frontier LLMs are 100B+ parameters—one to two orders of magnitude larger.
        </p>

        <div className="figure-container">
          <ModelScaleTable />
          <p className="figure-caption">Video models today are where language models were in 2019</p>
        </div>

        <p>
          To make the analogy concrete: current video models are to frontier LLMs what GPT-2 was to GPT-4. To my knowledge, nobody has trained unified multimodal models—video generation + language + reasoning—at frontier scale on YouTube-scale data. This will likely only happen when the next wave of datacenters come online in 2026.
        </p>

        <p>
          Perhaps this is why intuition about what large multimodal models can do is systematically wrong. We're extrapolating from GPT-2-scale video models and concluding "video models can't do X." We made the same mistake about language models in 2020.
        </p>

        <h3>The Implication</h3>

        <p>
          A frontier-scale model that's seen YouTube-scale video of everything in existence—humans manipulating objects, navigating spaces, using tools, in every context and configuration—has already learned most of what it needs to know about the physical world. The robot-specific data just aligns this understanding to a specific embodiment. The foundation does the heavy lifting. The fine-tuning is the easy part.
        </p>

        <div className={`sidebar-note ${expandedSidebars['labs-realizing'] ? 'expanded' : ''}`}>
          <div className="sidebar-note-header" onClick={() => toggleSidebar('labs-realizing')}>
            <span className="sidebar-note-peek">note</span>
          </div>
          <div className="sidebar-note-content">
            <div className="sidebar-note-title">Labs Have Started Realizing This</div>
            <p>The AI labs are now training robot brains:</p>
            <ul>
              <li><strong><a href="https://deepmind.google/blog/gemini-robotics-brings-ai-into-the-physical-world/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Google DeepMind</a></strong>: Gemini Robotics (March 2025)</li>
              <li><strong>OpenAI</strong>: Restarted robotics team (2024), invested in <a href="https://figure.ai/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Figure</a>, <a href="https://www.1x.tech/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">1X</a>, <a href="https://www.physicalintelligence.company/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Physical Intelligence</a></li>
              <li><strong><a href="https://www.physicalintelligence.company/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Physical Intelligence</a></strong>: $400M funding to build foundation models for robots</li>
            </ul>
            <p><em>Logan Kilpatrick (Google Gemini): "2026 is going to be a huge year for embodied AI."</em></p>
          </div>
        </div>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>This is why frontier labs—not robotics labs—will likely build the robot brain.</strong> They're training trillion-parameter multimodal models on internet-scale video. The robotics teams are finetuning 7B models while the real capability is being built elsewhere.
        </p>
      </section>

      <section id="many-a-bitter-lesson" data-section="many-a-bitter-lesson">
        <SectionCode code="A2" isPart={false} />
        <h2>Many a Bitter Lesson to Go</h2>

        <p>
          Chess. Go. Protein folding. Machine translation. Image recognition. Speech synthesis. Self-driving. In every domain, the pattern repeated: hand-engineered systems with decades of expert knowledge were swept away by scaled-up learning.
        </p>

        <div className={`sidebar-note ${expandedSidebars['nlp-reckoning'] ? 'expanded' : ''}`}>
          <div className="sidebar-note-header" onClick={() => toggleSidebar('nlp-reckoning')}>
            <span className="sidebar-note-peek">note</span>
          </div>
          <div className="sidebar-note-content">
            <div className="sidebar-note-title">The NLP Reckoning</div>
            <p><a href="https://www.quantamagazine.org/when-chatgpt-broke-an-entire-field-an-oral-history-20250430/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Quanta Magazine (April 2025)</a> published an oral history of the NLP community's reaction to ChatGPT:</p>
            <p><strong>Christopher Callison-Burch (UPenn):</strong> <em>"I'm trying out all the things that my recent Ph.D. students had done as their dissertations, and just realizing—oh my God, the thing that had taken a student five years? Seems like I could reproduce that in a month."</em></p>
            <p><strong>Iz Beltagy (Allen Institute):</strong> <em>"In a day, a lot of the problems that a large percentage of researchers were working on—they just disappeared."</em></p>
          </div>
        </div>

        <p>
          The NLP researchers didn't see it coming. They were world experts in parsing, syntax, semantics, discourse. They had spent decades building linguistic knowledge into systems. And then a team at OpenAI trained a large transformer on internet text and made most of that expertise irrelevant.
        </p>

        <p>
          <strong>This is about to happen to robotics.</strong>
        </p>

        <p>
          The roboticists don't see it coming. They're debating actuator designs and sim-to-real transfer and reward shaping, while foundation model labs are building the fundamental scale required for embodiment.
        </p>
      </section>

      <hr />

      {/* Part II */}
      <section id="part-ii" data-section="part-ii">
        <SectionCode code="B" isPart={true} />
        <h1>PART II: THE ARCHITECTURE</h1>
      </section>

      <section id="viki" data-section="viki">
        <SectionCode code="B1" isPart={false} />
        <h2>VIKI</h2>

        <div className="figure-container">
          <img
            src="/essays/gpt7/VIKI_alt-optimized.jpg"
            alt="VIKI from I, Robot"
            className="w-full rounded-lg"
            style={{ maxHeight: '400px', objectFit: 'contain', background: '#E8E5DE' }}
          />
          <p className="figure-caption">VIKI (Virtual Interactive Kinetic Intelligence) from I, Robot—one central AI controlling all robots. The future architecture: cloud intelligence, distributed bodies.</p>
        </div>

        <p>
          A natural question is where computation should live. The robotics community has historically assumed edge-first architecture: robots should be autonomous, self-contained, independent. This assumption deserves scrutiny.
        </p>

        <h3>The Slider</h3>

        <p>
          There's a spectrum between "cloud robotics" and "edge robotics":
        </p>

        <p>
          <strong>Pure edge</strong>: All computation on the robot. No network required. Tesla FSD works this way—the car runs entirely on its onboard computer.
        </p>

        <p>
          <strong>Pure cloud</strong>: The robot is a dumb terminal. All decisions happen in a datacenter. The robot streams sensors up, receives motor commands back. Think VIKI from <em>I, Robot</em>—one central intelligence controlling every NS-5 body simultaneously.
        </p>

        <p>
          Today's leading humanoids are mixed. Figure describes a two-level control stack: a larger vision-language model for high-level perception and planning, and a smaller policy network for real-time trajectory tracking, both running on-device embedded GPUs. Tesla Optimus similarly runs on-board. 1X, meanwhile, is heavily investing in teleoperation infrastructure—their architecture explicitly includes remote human operators providing demonstrations and corrections.
        </p>

        <p>
          This works for current capabilities. A mid-size model can pick up a box.
        </p>

        <p>
          But what happens when you need{' '}
          <span className="hover-term" data-definition="I imagine such a system could be a top-notch sous-chef *and* a breakdancer—learning new physical skills in context, reasoning about novel situations with multimodal tokens in its reasoning rollouts, conversing naturally about what to do and then doing it.">general embodied intelligence</span>? I expect those capabilities will require 1T+ parameters. And those only run in the cloud.
        </p>

        <p>
          My prediction: as capability requirements increase, the slider moves cloud-ward. The robots of 2027 will run small models on-device for reflexes, but their "brain"—the part that reasons and plans—will live in a datacenter.
        </p>

        <div className="callout">
          <div className="callout-title">Important Clarification</div>
          <p>
            This is not the System 1/System 2 cognitive split. I'm not arguing that "fast intuitive thinking" stays on-device while "slow deliberate reasoning" moves to cloud. The thesis is stronger. The <em>entire</em> intelligent agent—perception, planning, reasoning, language, control—lives in the cloud. The on-device component handles translating action vectors to real action, reflexes, and safety-critical functions: emergency stops, collision limits, balance recovery, network-drop handling. The cloud will do everything intelligent.
          </p>
        </div>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong><em>Whoever runs the cloud controls the robots.</em></strong>
        </p>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>The robotics industry thinks it's building robots. It might actually be building terminals.</strong>
        </p>

        <h3>Why Cloud Wins</h3>

        <p>
          It is clear why today's chatbots run in datacenters rather than on laptops and devices:
        </p>

        <div className={`sidebar-note ${expandedSidebars['why-cloud'] ? 'expanded' : ''}`}>
          <div className="sidebar-note-header" onClick={() => toggleSidebar('why-cloud')}>
            <span className="sidebar-note-peek">note</span>
          </div>
          <div className="sidebar-note-content">
            <div className="sidebar-note-title">Why AI Ended Up in the Cloud</div>
            <p><strong>Scale & Performance</strong></p>
            <ul>
              <li>Models got huge. State-of-the-art needs tens-hundreds of GB of weights.</li>
              <li>Inference is compute-bound. Quality generation needs GPU FLOPs that devices lack.</li>
              <li>Memory bandwidth bottleneck—even if weights "fit."</li>
              <li>Specialized hardware. Datacenters deploy newest GPUs immediately.</li>
            </ul>
            <p><strong>Economics</strong></p>
            <ul>
              <li>Economies of scale. One cluster serving millions beats everyone maintaining local hardware.</li>
              <li>Multi-tenancy. Many users share same model and caches.</li>
              <li>Usage-based pricing maps to centralized serving.</li>
            </ul>
            <p><strong>Operations</strong></p>
            <ul>
              <li>Fast iteration. Model updates deploy instantly.</li>
              <li>Centralized safety. Content filters easier server-side.</li>
              <li>Security of IP. Weights stay server-side.</li>
            </ul>
            <p><em>These forces don't disappear for robotics. They intensify.</em></p>
          </div>
        </div>

        <p>
          For robotics specifically, many of the same arguments hold—and perhaps are even stronger:
        </p>

        <p>
          <strong>Economies of scale.</strong> An on-device GPU sits idle when the robot waits. Real-world utilization will probably be tiny. A datacenter GPU serves 100+ robots by interleaving requests and amortizing costs with huge batch sizes.
        </p>

        <p>
          <strong>GPUs are scarce.</strong> A cloud robot doesn't need a $1,000+ reasoning GPU in its body. The expensive compute stays in the datacenter—and can leverage the massive datacenter buildout already underway.
        </p>

        <p>
          <strong>Model scale.</strong> A trillion-parameter model takes ~2TB of weights in FP16. NVIDIA's Jetson Orin runs mid-size models (up to ~20B parameters) comfortably on-device; frontier-scale reasoning requires datacenter hardware.
        </p>

        <p>
          <strong>Training & IP.</strong> Every robot interaction generates data. In cloud architecture, all data flows back to the corporation. And no company will distribute their newly trained robotics model weights to sit on-device where they can be extracted.
        </p>

        <p>
          <strong>Inference costs are falling.</strong> GPT-4 launched at $30/million input tokens (March 2023). The cost to achieve a fixed level of LLM capability has fallen dramatically—roughly an order of magnitude over the past two years.
        </p>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>If cloud is borderline viable now, it's clearly superior in 12 months.</strong>
        </p>
      </section>

      <section id="latency" data-section="latency">
        <SectionCode code="B2" isPart={false} />
        <h2>But Latency!</h2>

        <p>
          "But latency!" This is the first objection everyone raises. Motor control needs 200Hz—every 5 milliseconds. You can't wait for datacenter round-trip. Cloud robotics is physically impossible.
        </p>

        <p>
          This objection is why the thesis hasn't been widely internalized. Everyone assumes latency kills it.
        </p>

        <p>
          But:
        </p>

        <h3>Teleoperation Already Works</h3>

        <p>
          Sanctuary AI operates robots remotely over standard internet connections. Humans teleoperating robots fold laundry, manipulate objects, perform dexterous tasks—at latencies in the 100-200ms range.
        </p>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>If a human teleoperator can control a robot at that latency, so can an AI.</strong>
        </p>

        <h3>The Human Precedent</h3>

        <p>
          Consider how you pick up a coffee cup. Your conscious reaction time—from "I want to grab that" to "my hand starts moving"—is approximately 200-250 milliseconds.
        </p>

        <p>
          Your brain doesn't update your motor plan 200 times per second. You decide "move hand toward cup," your arm moves, you get visual feedback, you adjust. The millisecond-level work—reflexes, balance corrections, smooth muscle coordination—happens automatically in your spinal cord and motor cortex, not in conscious planning.
        </p>

        <p>
          Robots can work the same way. The cloud runs the "brain" at ~10Hz, streaming <span className="hover-term" data-definition="Vectors in some latent action/multimodal space that the low-level controller uses to guide motion">action vectors</span> that guide the motion. The robot's onboard controller handles low-level corrections, balance, and reflexes at hundreds of Hz.
        </p>

        <h3>Latency Is Solved Engineering</h3>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>Roboticists miss something: latency optimization is what big tech is <em>good at</em>.</strong>
        </p>

        <p>
          Google invested heavily in <a href="https://en.wikipedia.org/wiki/Google_Stadia" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Stadia</a>. Amazon optimized AWS for real-time applications. Microsoft built Xbox Cloud Gaming. Video calling handles real-time bidirectional audio/video globally with latencies humans find acceptable. Financial firms built high-frequency trading infrastructure with microsecond precision.
        </p>

        <p>
          They're now applying the same expertise to AI voice agents, achieving <a href="https://platform.openai.com/docs/guides/realtime" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">sub-100ms response times</a> for natural conversation.
        </p>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>The infrastructure for cloud robotics is being built for other applications.</strong>
        </p>

        <p>For instance, cloud robotics is <em>less</em> demanding than gaming:</p>

        <div className={`sidebar-note ${expandedSidebars['edge-cases'] ? 'expanded' : ''}`}>
          <div className="sidebar-note-header" onClick={() => toggleSidebar('edge-cases')}>
            <span className="sidebar-note-peek">note</span>
          </div>
          <div className="sidebar-note-content">
            <div className="sidebar-note-title">Edge Cases Remain Edge</div>
            <p>
              Some applications may remain edge-first longer: surgical robotics where milliseconds matter, military applications where network denial is a tactic, remote locations without reliable connectivity. These domains may require on-device intelligence even at capability cost.
            </p>
            <p>
              But for the vast majority of commercial applications—warehouses, factories, retail, eldercare, hospitality—cloud architecture works.
            </p>
          </div>
        </div>

        <div className="figure-container">
          <LatencyComparisonTable />
          <p className="figure-caption">Cloud robotics has more forgiving latency requirements than gaming</p>
        </div>

        <p>
          A cloud gaming lag spike means you die in PvP. A cloud robot lag spike means the robot pauses for a second before picking up the next box. For warehouse tasks, that's fine.
        </p>
      </section>

      <section id="robots-as-a-service" data-section="robots-as-a-service">
        <SectionCode code="B3" isPart={false} />
        <h2>Robots-as-a-Service</h2>

        <p>
          Claude Code became the revenue story for AI in 2025. Coding—where AI creates measurable value, where enterprises pay—is now central to every lab's business model.
        </p>

        <p>
          Robotics is next. Here's what financial analysts miss:
        </p>

        <p>
          <strong><em>It's the same model.</em></strong>
        </p>

        <div className={`sidebar-note ${expandedSidebars['labs-interested'] ? 'expanded' : ''}`}>
          <div className="sidebar-note-header" onClick={() => toggleSidebar('labs-interested')}>
            <span className="sidebar-note-peek">note</span>
          </div>
          <div className="sidebar-note-content">
            <div className="sidebar-note-title">Every Major AI Lab Is Suddenly Interested</div>
            <ul>
              <li><strong>OpenAI</strong>: Shut down robotics in 2020 ("lack of data"). Restarted 2024. Invested in <a href="https://www.1x.tech/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">1X</a>, <a href="https://figure.ai/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Figure</a>, <a href="https://www.physicalintelligence.company/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Physical Intelligence</a>. Now hiring for robotics world models.</li>
              <li><strong><a href="https://deepmind.google/blog/gemini-robotics-brings-ai-into-the-physical-world/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Google DeepMind</a></strong>: Gemini Robotics (March 2025). Published <a href="https://arxiv.org/abs/2212.06817" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">RT-1</a>, <a href="https://arxiv.org/abs/2307.15818" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">RT-2</a>, <a href="https://arxiv.org/abs/2310.08864" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">RT-X</a>. Hassabis: robots are "the ultimate application."</li>
            </ul>
            <p><em>Observable pattern: investments in robotics companies, API-based business models. These are distribution plays.</em></p>
          </div>
        </div>

        <p>
          When analysts project the "robotics AI market," they model it separately from "language AI." Separate TAMs. Separate products. Separate revenue streams.
        </p>

        <p>
          However, if GPT-7 powers the robots, it's one model serving both digital and physical applications. Training and research costs amortize across all use cases. Inference infrastructure is shared. The same datacenter that answers your ChatGPT query controls the warehouse robot.
        </p>

        <p>
          <strong>For AI labs:</strong> Robotics is a new distribution channel for the existing product, not a new product. The marginal cost to serve a robot is just inference.
        </p>

        <p>
          <strong>For hardware companies:</strong> The "brain" is an API call. You're not building intelligence. You're building a body and paying rent.
        </p>

        <p>
          <strong>For investors:</strong> The robotics boom and AI boom are the same boom.
        </p>
      </section>

      <hr />

      {/* Part III */}
      <section id="part-iii" data-section="part-iii">
        <SectionCode code="C" isPart={true} />
        <h1>PART III: THE HARDWARE FLOOD</h1>
      </section>

      <section id="racing-to-zero" data-section="racing-to-zero">
        <SectionCode code="C1" isPart={false} />
        <h2>Racing to Zero</h2>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>The hardware story is simple: costs are collapsing faster than anyone expected.</strong>
        </p>

        <p>
          <a href="https://www.unitree.com/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Unitree's</a> headline humanoid pricing has moved dramatically:
        </p>

        <p>
          <strong>~$90,000</strong> (H1, mid-2023) → <strong>$16,000</strong> (G1, 2024) → <strong>~$5,900</strong> (R1, July 2025)
        </p>

        <div className="stat-highlight">
          <span className="stat-value">93%</span>
          <span className="stat-label">Price reduction in under two years</span>
        </div>

        <div className="figure-container">
          <UniTreePriceChart />
          <p className="figure-caption">Unitree humanoid pricing trajectory 2023-2025 (log scale)</p>
        </div>

        <p>
          Note: these are different capability tiers, not the same robot getting cheaper. But the trend is clear—a 93% reduction in entry-point pricing in under two years.
        </p>

        <p>
          <a href="https://www.goldmansachs.com/insights/articles/humanoid-robots" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Goldman Sachs</a>, in their February 2024 humanoid robot report, projected 40% annual cost declines continuing through 2030. They expect humanoids to reach "factory viability" by 2027 and "consumer viability" by 2028-2031.
        </p>

        <h3>Why Costs Are Collapsing</h3>

        <p>
          Zoom in on the components, and the price collapse makes more sense.
        </p>

        <div className="figure-container">
          <ComponentCostsInfographic />
          <p className="figure-caption">Every major component is on a steep cost curve driven by other industries</p>
        </div>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>Every component is on a steep cost curve driven by other industries.</strong> Humanoids leverage existing supply chains—batteries from EVs, motors from drones, sensors from smartphones. This is why $5,000 humanoids are plausible by 2027-2028.
        </p>

        <div className="callout">
          <div className="callout-title">The Bottleneck Shifts</div>
          <p>
            <strong>The bottleneck is then intelligence.</strong>
          </p>
          <p>
            A $5,000 body with no brain is useless. A $5,000 body with frontier AI is worth $50,000 in labor per year. <strong>The value comes entirely from intelligence.</strong>
          </p>
        </div>

        <div className={`sidebar-note ${expandedSidebars['dexterity'] ? 'expanded' : ''}`}>
          <div className="sidebar-note-header" onClick={() => toggleSidebar('dexterity')}>
            <span className="sidebar-note-peek">note</span>
          </div>
          <div className="sidebar-note-content">
            <div className="sidebar-note-title">Dexterity Isn't Hardware-Gated</div>
            <p>
              Chris Paxton (Agility Robotics): "<a href="https://x.com/chris_j_paxton/status/2007844962780717094" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Human level dexterity is absolutely not gated by hardware.</a>"
            </p>
            <p>
              The proof: excavator operators flipping water bottles with 30-ton machines. The hardware is crude—hydraulic cylinders with massive backlash. The dexterity comes entirely from the human operator's learned control policy.
            </p>
          </div>
        </div>

        <p className={focusMode ? 'has-highlight' : ''}>
          This is why the robotics industry's obsession with hardware is misplaced. <strong>Intelligence is the differentiator.</strong> And intelligence is being built by AI labs, not robotics companies.
        </p>
      </section>

      <section id="the-forecasts" data-section="the-forecasts">
        <SectionCode code="C2" isPart={false} />
        <h2>The Forecasts</h2>

        <p>How many humanoids will actually ship? The analyst projections:</p>

        <div className="figure-container">
          <ForecastsTable />
          <p className="figure-caption">Major analyst forecasts for humanoid shipments</p>
        </div>

        <p>
          <a href="https://www.goldmansachs.com/insights/articles/humanoid-robots" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Goldman</a> forecasts near-term annual shipments, <a href="https://www.morganstanley.com/insights/articles/humanoid-robots-ai-market" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Morgan Stanley</a> forecasts long-term installed base, <a href="https://institute.bankofamerica.com/content/dam/transformation/humanoid-robots.pdf" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">BofA</a> provides the most detailed near-term breakdown.
        </p>

        <p>
          I don't have a better model than these analysts. The uncertainty is about which regime we're in:
        </p>

        <ul>
          <li><strong>If humanoids remain industrial equipment</strong> with slow enterprise sales cycles, even Goldman's 250K may be optimistic.</li>
          <li><strong>If General Embodied Intelligence (GEI) capabilities emerge</strong> and China treats humanoids like EVs, Goldman is probably 2-4x low.</li>
          <li><strong>If state mobilization compounds with GEI</strong>, BofA's 1M becomes plausible.</li>
        </ul>

        <p>
          The key variable is capability. Price declines alone don't create demand—a $5,000 robot that can't do useful work is worthless. A $20,000 robot that can reliably perform $50,000/year of labor sells itself.
        </p>

        <div className={`sidebar-note ${expandedSidebars['recognition'] ? 'expanded' : ''}`}>
          <div className="sidebar-note-header" onClick={() => toggleSidebar('recognition')}>
            <span className="sidebar-note-peek">note</span>
          </div>
          <div className="sidebar-note-content">
            <div className="sidebar-note-title">The Recognition Moment</div>
            <p>
              Adoption curves don't start smooth. The AI discourse hasn't fully internalized that the robot story is the same as the LLM story. When that recognition hits—probably late 2026—you'll see a rapid shift in investment, deployment, and attention.
            </p>
          </div>
        </div>
      </section>

      <section id="china-speed" data-section="china-speed">
        <SectionCode code="C3" isPart={false} />
        <h2>China Speed</h2>

        <p>
          China has repeatedly demonstrated what happens when they identify an industry as strategic.
        </p>

        <h3>The EV Precedent</h3>

        <p>
          2014: China produced ~78,000 new energy vehicles (NEVs).
        </p>

        <p>
          2024: China produced ~12.4 million electric cars (BEV+PHEV).
        </p>

        <div className="stat-highlight">
          <span className="stat-value">~160x</span>
          <span className="stat-label">Growth in 10 years. Peak compound annual growth rate ~66%.</span>
        </div>

        <p>
          By 2024, China was producing more EVs than the rest of the world combined (12.4M vs global 17.3M). This wasn't market forces alone. The Chinese government identified EVs as strategic. Subsidies. Mandates. Infrastructure. Coordinated supply chain. Dozens of companies emerged. The ones that couldn't compete died. The survivors—BYD, NIO, XPeng—became globally competitive in a decade.
        </p>

        <p>
          <strong>Humanoids are getting the same treatment.</strong>
        </p>

        <p>
          China is layering national "patient capital" and regional funds behind embodied AI and humanoids—Shanghai announced a major fund in July 2024. Over 100 Chinese companies are building humanoids. Government goal: humanoids as "new engine" for economic development. The <a href="https://www.uscc.gov/sites/default/files/2024-10/Humanoid_Robots.pdf" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">USCC</a> notes potential military-civil fusion implications.
        </p>

        <h3>Historical Multipliers</h3>

        <p>When China designates an industry as strategic, the scaling multipliers are dramatic:</p>

        <div className="figure-container">
          <ChinaMultipliersChart />
          <p className="figure-caption">Historical scaling when China designates strategic industries</p>
        </div>

        <h3>Why Humanoids May Scale Faster</h3>

        <p>But humanoids are <em>easier</em> than EVs:</p>

        <div className="figure-container">
          <EVvsHumanoidTable />
          <p className="figure-caption">Humanoids leverage existing supply chains that EVs had to build</p>
        </div>

        <ol>
          <li><strong>Lower unit cost enables faster adoption.</strong> A $6,000 humanoid is 5x cheaper than a $30,000 EV.</li>
          <li><strong>Supply chains already exist.</strong> EVs required building gigafactories from scratch. Humanoids assemble existing components.</li>
          <li><strong>Capability inflection creates demand shock.</strong> EVs offered incremental improvement over ICE vehicles. GEI could offer step-function capability.</li>
          <li><strong>Strategic priority may be higher.</strong> The <a href="https://www.uscc.gov/sites/default/files/2024-10/Humanoid_Robots.pdf" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">USCC report</a> explicitly flags military-civil fusion implications.</li>
        </ol>

        <p>
          Goldman's projections assume market-driven adoption. They don't model state-directed procurement, provincial pilot mandates, or military demand.
        </p>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>If humanoids receive similar treatment—and early signals suggest they will—Goldman's 250K by 2030 projection may prove conservative by an order of magnitude.</strong>
        </p>
      </section>

      <hr />

      {/* Part IV */}
      <section id="part-iv" data-section="part-iv">
        <SectionCode code="D" isPart={true} />
        <h1>PART IV: THE ECONOMICS</h1>

        <p>
          Predicting technology adoption is hard. I've seen "robotics is about to take off" predictions before—they were wrong for decades. But the current moment feels different, and worth examining with whatever specificity we can muster.
        </p>
      </section>

      <section id="general-embodied-intelligence" data-section="general-embodied-intelligence">
        <SectionCode code="D1" isPart={false} />
        <h2>General Embodied Intelligence</h2>

        <p>What exactly are we building toward?</p>

        <div className="figure-container">
          <img
            src="/essays/gpt7/Robbie-IROBOT-optimized.jpg"
            alt="Robbie from I, Robot"
            className="w-full rounded-lg"
            style={{ maxHeight: '350px', objectFit: 'contain', background: '#E8E5DE' }}
          />
          <p className="figure-caption">Robbie from I, Robot with Gloria—a vision of general-purpose robot assistance</p>
        </div>

        <div className="callout">
          <div className="callout-title">General Embodied Intelligence (GEI)</div>
          <p>
            A system that can, with no or minimal adaptation, inhabit diverse robotic bodies to perform physical tasks humans do with or without tools. It will likely function across all modalities humans can.
          </p>
          <p><strong>Core properties:</strong></p>
          <ul>
            <li><strong>Body-agnostic</strong>: One model, many embodiments. Skills transfer across robot morphologies.</li>
            <li><strong>Multimodal In-Context Learning</strong>: Acquires new physical skills from demonstration, instruction, or multimodal prompts—and transfers them across modalities.</li>
            <li><strong>Multimodal Reasoning</strong>: Plans actions by simulating outcomes in the same latent space it uses for language, vision, and action.</li>
          </ul>
          <p>
            Unlike R2-D2s and C-3POs—specialized units with narrow competencies—a GEI system could be a sous-chef, teach jujitsu, and do facility maintenance, all from the same underlying world model.
          </p>
        </div>

        <div className={`sidebar-note ${expandedSidebars['gei-wrappers'] ? 'expanded' : ''}`}>
          <div className="sidebar-note-header" onClick={() => toggleSidebar('gei-wrappers')}>
            <span className="sidebar-note-peek">note</span>
          </div>
          <div className="sidebar-note-content">
            <div className="sidebar-note-title">GEI Wrappers</div>
            <p>
              One could imagine startups emerging as robot API wrappers—collecting proprietary prompts and industry domain knowledge (in both text and action demonstrations) to sell GEI competence by vertical. Not building models, not building bodies. Just accumulating the best scaffolding and data, just like today's API wrapper companies.
            </p>
          </div>
        </div>

        <p>By 2027, I expect GEI systems will reliably handle:</p>

        <p><strong>Warehousing & Logistics</strong>: Picking, packing, inventory management, loading/unloading.</p>
        <p><strong>Retail & Hospitality</strong>: Store assistance, restocking, basic food preparation, cleaning.</p>
        <p><strong>Light Manufacturing</strong>: Assembly line "last mile" tasks too variable for fixed automation.</p>
        <p><strong>Facility Operations</strong>: Security patrols, building maintenance, groundskeeping.</p>
        <p><strong>Basic Care Support</strong>: Mobility assistance, meal preparation, medication reminders.</p>
        <p><strong>Service & Wellness</strong>: Fitness instruction, physical therapy assistance.</p>

        <p>
          The first killer apps of GEI probably won't look like sci-fi. They'll look like a night shift: roaming through semi-structured spaces doing dozens of tiny tasks that internet video contains at scale.
        </p>
      </section>

      <section id="who-will-buy-them" data-section="who-will-buy-them">
        <SectionCode code="D2" isPart={false} />
        <h2>Who Will Buy Them</h2>

        <h3>The TAM Question</h3>

        <p>
          Most economic analyses assume humanoid robots will do one thing well—warehouse picking or assembly line work. They model the TAM as "tasks currently done by human warehouse workers."
        </p>

        <p>This dramatically underestimates the opportunity.</p>

        <div className="stat-highlight">
          <span className="stat-value">$4.6T</span>
          <span className="stat-label">US employee compensation for "hands-on/service/manual" work per year (2024)</span>
        </div>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>A GEI system competes not with warehouse workers, but with <em>human physical capability</em> broadly.</strong> The TAM is physical labor in its entirety—and beyond.
        </p>

        <h3>The Robot Economics</h3>

        <div className="figure-container">
          <RobotEconomicsTable />
          <p className="figure-caption">Unit economics at current and projected price points</p>
        </div>

        <p>Compare to human wages:</p>
        <ul>
          <li>Manufacturing wages in Vietnam: $2-3/hour</li>
          <li>Manufacturing wages in China: $6-8/hour</li>
          <li>Manufacturing wages in US: $20-30/hour</li>
        </ul>

        <div className={`sidebar-note ${expandedSidebars['inference-economics'] ? 'expanded' : ''}`}>
          <div className="sidebar-note-header" onClick={() => toggleSidebar('inference-economics')}>
            <span className="sidebar-note-peek">note</span>
          </div>
          <div className="sidebar-note-content">
            <div className="sidebar-note-title">The Counterintuitive Inference Economics</div>
            <p>
              The obvious play is white-collar automation—coding, analysis, document work. Pure software, no hardware risk.
            </p>
            <p>
              But consider: A coding agent might burn through millions of tokens per task. A robot doing physical work might need far fewer tokens—mostly ingesting video tokens and generating real-time control signals.
            </p>
            <p>
              <em>If you're an AI lab selling inference, a million robots doing night shifts might be better unit economics than a million developers.</em>
            </p>
          </div>
        </div>

        <h3>The Labor Shortage Is Already Real</h3>

        <div className="stat-highlight">
          <span className="stat-value">85.2M</span>
          <span className="stat-label">Projected global worker shortage by 2030 (<a href="https://www.kornferry.com/insights/this-week-in-leadership/talent-crunch-future-of-work" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Korn Ferry</a>)</span>
        </div>

        <p><strong>4.6 million</strong> — projected US eldercare worker shortfall by 2032</p>

        <p>
          China's working-age population has peaked. Japan's elderly population already exceeds its working-age population in some regions.
        </p>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>Demographics, not wages. The workers don't exist.</strong>
        </p>
      </section>

      <section id="who-gets-rich" data-section="who-gets-rich">
        <SectionCode code="D3" isPart={false} />
        <h2>Who Gets Rich</h2>

        <p>
          If cloud wins and hardware commoditizes, who captures the value? History offers a precedent.
        </p>

        <p>
          In the 1990s, the PC industry looked competitive. Dell, HP, Compaq, IBM, Gateway sold computers. Competitive market, right?
        </p>

        <p>Not really.</p>

        <div className="stat-highlight">
          <span className="stat-value">6x</span>
          <span className="stat-label">Intel + Microsoft profits vs top three PC OEMs combined (2004)</span>
        </div>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>The platform layer captured 6x the profits of the hardware makers.</strong>
        </p>

        <p>
          Competition among hardware makers drove margins toward zero. Intel and Microsoft collected rent. This was "Wintel."
        </p>

        <p>The robotics industry could follow the same pattern.</p>

        <div className="figure-container">
          <ValueCaptureDiagram />
          <p className="figure-caption">Two winning positions in the robotics value chain</p>
        </div>

        <h3>The Apple Counter-Model</h3>

        <p>
          There's a counterexample: Apple. They kept hardware and software integrated, controlled the full stack, built one of the most valuable companies in history.
        </p>

        <p>
          The Apple model in robotics: a company that builds both the robot body AND the AI brain, capturing value through integration rather than platform control. Tesla is betting on this. Figure AI too—they ended their OpenAI collaboration in February 2025 to develop proprietary AI.
        </p>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>What doesn't work: hardware without controlling intelligence. That's Dell in 1998—competing on cost with no moat, while platform owners take the profit.</strong>
        </p>
      </section>

      <hr />

      {/* Coda */}
      <section id="coda" data-section="coda">
        <SectionCode code="E" isPart={true} />
        <h1>CODA: The Bet</h1>

        <p>This essay makes a specific bet:</p>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>The team training GPT-7 will also train the dominant robot brain.</strong>
        </p>

        <p>
          Not a separate robotics team. Not a purpose-built manipulation system. The same researchers, infrastructure, and scaling laws that produce frontier language models will produce the model controlling millions of robot bodies.
        </p>

        <p>Why is this time different?</p>

        <p>
          <strong>The intelligence actually works.</strong> Previous hype cycles assumed intelligence would come from robotics research. This time it's coming from foundation models. <a href="https://arxiv.org/abs/2307.15818" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">RT-2's</a> emergent reasoning, <a href="https://www.physicalintelligence.company/blog/pi0" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">π0's</a> cross-embodiment transfer.
        </p>

        <p>
          <strong>The hardware is actually cheap.</strong> Previous cycles featured $500,000 research platforms. This time: $6,000 production humanoids and falling.
        </p>

        <p>
          <strong>The demand is actually urgent.</strong> Previous cycles offered "wouldn't it be cool" applications. This time: 85 million worker shortage globally, AI companies seeking new revenue streams beyond chatbots, and geopolitical competition accelerating state investment.
        </p>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>When capability, cost, and demand align simultaneously, technology transitions happen.</strong>
        </p>

        <h3>The Stakes</h3>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>The robot that folds your laundry will run GPT-7.</strong> But GPT-7 will also fold the laundry of millions of other people. It will work in factories and warehouses and construction sites and hospitals.
        </p>

        <p className={focusMode ? 'has-highlight' : ''}>
          <strong>One model. Many bodies. Whoever controls the model controls the future of physical labor.</strong>
        </p>

        <hr />

        <p style={{ color: '#8A9A85', fontStyle: 'italic' }}>
          Written December 2025. Published January 6th, 2026.
        </p>

        <p style={{ color: '#8A9A85', fontStyle: 'italic' }}>
          Opinions my own. Written with the help of Claude Opus 4.5.
        </p>

        <p style={{ color: '#8A9A85', fontStyle: 'italic' }}>
          Check back in 2027, 2028, 2030.
        </p>
      </section>

      {/* References Section */}
      <section id="references" className="mt-16 pt-8 border-t-2 border-[#2A3C24]/20">
        <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>References</h2>
        <div className="text-sm space-y-3" style={{ fontFamily: 'Crimson Pro, Georgia, serif' }}>
          <p><strong>Essays & Papers:</strong></p>
          <ul className="list-disc pl-6 space-y-1.5 text-[#4A5D42]">
            <li>Dario Amodei, <a href="https://www.darioamodei.com/essay/machines-of-loving-grace" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">"Machines of Loving Grace"</a></li>
            <li>Leopold Aschenbrenner, <a href="https://situational-awareness.ai/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">"Situational Awareness"</a></li>
            <li>Kokotajlo et al., <a href="https://ai-2027.com/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">"AI 2027"</a></li>
            <li><a href="https://www.aifuturesmodel.com/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">AI Futures Model</a></li>
            <li>OpenAI, <a href="https://openai.com/index/video-generation-models-as-world-simulators/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">"Video generation models as world simulators"</a></li>
            <li>Wintel Profit Study, <a href="https://www.hbs.edu/ris/Publication%20Files/05-083.pdf" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Harvard Business School</a></li>
          </ul>

          <p className="pt-3"><strong>Robotics Research:</strong></p>
          <ul className="list-disc pl-6 space-y-1.5 text-[#4A5D42]">
            <li>Google, <a href="https://arxiv.org/abs/2212.06817" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">RT-1: Robotics Transformer (2022)</a></li>
            <li>Google, <a href="https://arxiv.org/abs/2307.15818" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">RT-2: Vision-Language-Action Models (2023)</a></li>
            <li>Google, <a href="https://arxiv.org/abs/2310.08864" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Open X-Embodiment (RT-X) (2023)</a></li>
            <li>Physical Intelligence, <a href="https://www.physicalintelligence.company/blog/pi0" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">π0 Foundation Model (2024)</a></li>
            <li>Physical Intelligence, <a href="https://www.pi.website/research/human_to_robot" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Human to Robot Transfer</a></li>
            <li>Ilya Sutskever, <a href="https://www.dwarkesh.com/p/ilya-sutskever" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Dwarkesh Patel Interview</a></li>
          </ul>

          <p className="pt-3"><strong>Industry Reports:</strong></p>
          <ul className="list-disc pl-6 space-y-1.5 text-[#4A5D42]">
            <li>Goldman Sachs, <a href="https://www.goldmansachs.com/insights/articles/humanoid-robots" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">"Humanoid Robots" (February 2024)</a></li>
            <li>Bank of America, <a href="https://institute.bankofamerica.com/content/dam/transformation/humanoid-robots.pdf" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">"Humanoid Robots" (April 2025)</a></li>
            <li>Morgan Stanley, <a href="https://www.morganstanley.com/insights/articles/humanoid-robots-ai-market" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">"Humanoid Robots and AI Market"</a></li>
            <li>USCC, <a href="https://www.uscc.gov/sites/default/files/2024-10/Humanoid_Robots.pdf" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">"Humanoid Robots" (October 2024)</a></li>
            <li>Korn Ferry, <a href="https://www.kornferry.com/insights/this-week-in-leadership/talent-crunch-future-of-work" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">"Global Talent Crunch"</a></li>
          </ul>

          <p className="pt-3"><strong>Company & Lab Sources:</strong></p>
          <ul className="list-disc pl-6 space-y-1.5 text-[#4A5D42]">
            <li>Google DeepMind, <a href="https://deepmind.google/blog/gemini-robotics-brings-ai-into-the-physical-world/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">"Gemini Robotics" (March 2025)</a></li>
            <li>Google DeepMind, <a href="https://deepmind.google/blog/gemini-robotics-on-device-brings-ai-to-local-robotic-devices/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">"Gemini Robotics On-Device"</a></li>
            <li>Figure AI, <a href="https://www.figure.ai/news/helix" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Helix Architecture</a></li>
            <li>Figure AI, <a href="https://techcrunch.com/2025/02/04/figure-drops-openai-in-favor-of-in-house-models/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">OpenAI Partnership Split (2025)</a></li>
            <li>1X Technologies, <a href="https://www.1x.tech/discover/introducing-neo-gamma" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Neo Gamma Introduction</a></li>
            <li>1X Technologies, <a href="https://www.1x.tech/discover/1x-rasies-23-5m-in-series-a2-funding-led-by-open-ai" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">OpenAI Funding</a></li>
            <li>Sanctuary AI, <a href="https://sanctuary.ai/blog/ai-robotics-and-the-case-for-teleoperation/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">"AI Robotics and Teleoperation"</a></li>
            <li>Physical Intelligence, <a href="https://www.reuters.com/technology/artificial-intelligence/robot-ai-startup-physical-intelligence-raises-400-mln-bezos-openai-2024-11-04/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">$400M Funding (Reuters)</a></li>
            <li>OpenAI, <a href="https://www.forbes.com/sites/kenrickcai/2024/05/30/openai-robotics-team/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Robotics Team Restart (Forbes)</a></li>
            <li>Unitree, <a href="https://www.unitree.com/R1" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">R1 Humanoid Robot</a></li>
            <li>Unitree, <a href="https://shop.unitree.com/products/unitree-h1" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">H1 Robot</a> / <a href="https://shop.unitree.com/products/unitree-g1" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">G1 Robot</a></li>
            <li>NVIDIA, <a href="https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Jetson Orin</a></li>
          </ul>

          <p className="pt-3"><strong>Interviews & Commentary:</strong></p>
          <ul className="list-disc pl-6 space-y-1.5 text-[#4A5D42]">
            <li>Demis Hassabis, <a href="https://x.com/demishassabis/status/1926057739416965438" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Twitter on Veo 3 physics (May 2025)</a></li>
            <li>Demis Hassabis, <a href="https://lexfridman.com/demis-hassabis-2-transcript/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Lex Fridman Interview</a></li>
            <li>Chris Paxton, <a href="https://x.com/chris_j_paxton/status/2007844962780717094" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Twitter on Hardware vs Software</a></li>
            <li>Quanta Magazine, <a href="https://www.quantamagazine.org/when-chatgpt-broke-an-entire-field-an-oral-history-20250430/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">"When ChatGPT Broke an Entire Field" (April 2025)</a></li>
          </ul>

          <p className="pt-3"><strong>Latency & Infrastructure:</strong></p>
          <ul className="list-disc pl-6 space-y-1.5 text-[#4A5D42]">
            <li>Google, <a href="https://support.google.com/stadia/answer/12790109?hl=en" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Stadia Shutdown Announcement</a></li>
            <li>OpenAI, <a href="https://platform.openai.com/docs/guides/realtime" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Realtime API Documentation</a></li>
            <li>Google, <a href="https://ai.google.dev/gemini-api/docs/live" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Gemini Live API Documentation</a></li>
          </ul>

          <p className="pt-3"><strong>Data & Economics:</strong></p>
          <ul className="list-disc pl-6 space-y-1.5 text-[#4A5D42]">
            <li>IEA, <a href="https://www.iea.org/reports/global-ev-outlook-2025" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Global EV Outlook 2025</a></li>
            <li>a16z, <a href="https://a16z.com/llmflation-llm-inference-cost/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">"LLMflation: LLM Inference Cost"</a></li>
            <li>Epoch AI, <a href="https://epoch.ai/blog/what-you-need-to-know-about-ai-data-centers" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">"AI Data Centers"</a></li>
            <li>OpenAI, <a href="https://openai.com/index/gpt-4-research/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">GPT-4 Research & Pricing</a></li>
            <li>BloombergNEF, <a href="https://about.bnef.com/insights/commodities/lithium-ion-battery-pack-prices-see-largest-drop-since-2017-falling-to-115-per-kilowatt-hour-bloombergnef/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Battery Pack Prices 2024</a></li>
            <li>Ars Technica, <a href="https://arstechnica.com/cars/2017/01/googles-waymo-invests-in-lidar-technology-cuts-costs-by-90-percent/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">LiDAR Historical Costs (Waymo)</a></li>
            <li>Reuters, <a href="https://www.reuters.com/technology/chinas-hesai-halve-lidar-prices-next-year-sees-wide-adoption-electric-cars-2024-11-27/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Hesai LiDAR Pricing</a></li>
            <li>FRED, <a href="https://fred.stlouisfed.org/series/A033RC1A027NBEA" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">US Employee Compensation Data</a></li>
            <li>Gasgoo/CAPBIIA, <a href="https://autonews.gasgoo.com/70035698.html" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">China Li-ion Battery Data</a></li>
            <li>CAAM data via <a href="https://en.wikipedia.org/wiki/New_energy_vehicles_in_China" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Wikipedia, China NEV Production Statistics</a></li>
            <li>pv magazine, <a href="https://www.pv-magazine.com/2025/01/21/china-hits-277-17-gw-of-new-pv-installations-in-2024/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">China Solar PV Installations</a></li>
          </ul>
        </div>
      </section>
    </div>
  );
}
