import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Zap, ChevronUp, List } from 'lucide-react';
import { essaysData } from '../data/content';
import {
  DataPyramid, ModelScaleComparison, UnitreePriceChart, ComponentCostsChart,
  ChinaMultipliers, ValueCaptureDiagram, RobotEconomicsTable, LatencyComparisonTable,
  EVvsHumanoidTable, ReferencesSection
} from '../components/essay/EssayCharts';

const chartMap = {
  'data-pyramid': DataPyramid,
  'model-scale-comparison': ModelScaleComparison,
  'unitree-price-trajectory': UnitreePriceChart,
  'component-costs': ComponentCostsChart,
  'component-summary': ComponentCostsChart,
  'china-multipliers': ChinaMultipliers,
  'value-capture': ValueCaptureDiagram,
  'robot-economics': RobotEconomicsTable,
  'latency-comparison': LatencyComparisonTable,
  'ev-vs-humanoid': EVvsHumanoidTable,
};

// Parse the essay content with :::syntax:::
function parseEssayContent(rawContent) {
  const sections = [];
  const sidebars = [];
  let currentSection = { id: 'intro', title: 'Introduction', content: '', level: 0 };

  // Split into lines
  const lines = rawContent.split('\n');
  let i = 0;
  let buffer = '';

  while (i < lines.length) {
    const line = lines[i];

    // Check for section headers
    const partMatch = line.match(/^PART\s+([IVX]+):\s+(.+)$/);
    const h1Match = line.match(/^(\d+)\.\s+(.+)$/);
    const h2Match = line.match(/^([A-Z][a-z].+)$/);

    if (partMatch) {
      // Save current section
      if (buffer.trim() || currentSection.content) {
        currentSection.content += buffer;
        sections.push({ ...currentSection });
      }
      buffer = '';
      const title = `Part ${partMatch[1]}: ${partMatch[2]}`;
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      currentSection = { id, title, content: '', level: 1, isPart: true };
      i++;
      continue;
    }

    if (h1Match && !line.includes('2014:') && !line.includes('2024:')) {
      if (buffer.trim() || currentSection.content) {
        currentSection.content += buffer;
        sections.push({ ...currentSection });
      }
      buffer = '';
      const title = `${h1Match[1]}. ${h1Match[2]}`;
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      currentSection = { id, title, content: '', level: 2 };
      i++;
      continue;
    }

    // Check for :::sidebar
    if (line.startsWith(':::sidebar{')) {
      const titleMatch = line.match(/title="([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : '';
      let sidebarContent = '';
      i++;
      while (i < lines.length && !lines[i].trim().endsWith(':::')) {
        sidebarContent += lines[i] + '\n';
        i++;
      }
      if (lines[i] && lines[i].includes(':::')) {
        sidebarContent += lines[i].replace(':::', '').trim();
      }
      sidebars.push({ title, content: sidebarContent.trim(), sectionId: currentSection.id });
      buffer += `\n<!-- SIDEBAR: ${title} -->\n`;
      i++;
      continue;
    }

    // Check for :::callout
    if (line.startsWith(':::callout{') || line.startsWith('::: callout')) {
      const titleMatch = line.match(/title="([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : '';
      let calloutContent = '';
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(':::') && lines[i].trim() !== ':::') {
        calloutContent += lines[i] + '\n';
        i++;
      }
      buffer += `\n[CALLOUT_START:${title}]\n${calloutContent.trim()}\n[CALLOUT_END]\n`;
      if (lines[i] && lines[i].trim() === ':::') i++;
      continue;
    }

    // Check for :::quote
    if (line.startsWith(':::quote{')) {
      const attrMatch = line.match(/attribution="([^"]+)"/);
      const srcMatch = line.match(/source="([^"]+)"/);
      const attr = attrMatch ? attrMatch[1] : '';
      const src = srcMatch ? srcMatch[1] : '';
      let quoteContent = '';
      i++;
      while (i < lines.length && !lines[i].includes(':::')) {
        quoteContent += lines[i] + '\n';
        i++;
      }
      buffer += `\n> ${quoteContent.trim()}\n>\n> — ${attr}${src ? `, ${src}` : ''}\n`;
      i++;
      continue;
    }

    // Check for :::figure or :::table (charts)
    if (line.startsWith(':::figure{') || line.startsWith(':::table{')) {
      const idMatch = line.match(/id="([^"]+)"/);
      const chartId = idMatch ? idMatch[1] : '';
      buffer += `\n[CHART:${chartId}]\n`;
      // Skip until closing :::
      while (i < lines.length && !lines[i].trim().endsWith(':::')) {
        i++;
      }
      i++;
      continue;
    }

    // Check for :::hover - it comes AFTER the word
    if (line.includes(':::hover{')) {
      // Replace :::hover{content="..."} with marker
      const processed = line.replace(/(\S+)\.\s*:::hover\{content="([^"]+)"\}/g, '[[HOVER:$1|$2]]');
      const processed2 = processed.replace(/(\S+)\s*:::hover\{content="([^"]+)"\}/g, '[[HOVER:$1|$2]]');
      buffer += processed2 + '\n';
      i++;
      continue;
    }

    buffer += line + '\n';
    i++;
  }

  // Save last section
  if (buffer.trim()) {
    currentSection.content += buffer;
    sections.push(currentSection);
  }

  return { sections, sidebars };
}

// Render markdown to HTML
function renderMarkdown(text, focusMode = false) {
  let html = text
    // Charts
    .replace(/\[CHART:([^\]]+)\]/g, '<div data-chart="$1" class="chart-container"></div>')
    // Callouts
    .replace(/\[CALLOUT_START:([^\]]*)\]/g, '<div class="callout-box"><div class="callout-title">$1</div><div class="callout-content">')
    .replace(/\[CALLOUT_END\]/g, '</div></div>')
    // Hovers
    .replace(/\[\[HOVER:([^|]+)\|([^\]]+)\]\]/g, '<span class="hover-term" data-tip="$2">$1</span>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="essay-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="essay-h2">$1</h2>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, focusMode ? '<strong class="focus-hl">$1</strong>' : '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Blockquotes with attribution
    .replace(/^> (.+)\n>\n> — (.+)$/gm, '<blockquote class="styled-quote"><p>$1</p><cite>— $2</cite></blockquote>')
    // Simple blockquotes
    .replace(/^> (.+)$/gm, '<span class="quote-line">$1</span>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Sidebar comments (remove)
    .replace(/<!-- SIDEBAR: .+ -->/g, '')
    // Paragraphs
    .split('\n\n')
    .map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<div') || p.startsWith('<blockquote') || p.startsWith('<ul') || p.startsWith('<li')) {
        return p;
      }
      // Wrap quote-lines
      if (p.includes('<span class="quote-line">')) {
        return `<blockquote>${p.replace(/<span class="quote-line">/g, '<p>').replace(/<\/span>/g, '</p>')}</blockquote>`;
      }
      return `<p>${p}</p>`;
    })
    .join('\n');

  // Wrap lists
  html = html.replace(/(<li>.+<\/li>\n?)+/g, m => `<ul>${m}</ul>`);

  return html;
}

// Callout component
function Callout({ title, children }) {
  return (
    <div className="callout-box my-8 border-l-4 border-[#2A3C24] bg-[#F8F6F0] rounded-r-lg py-5 px-6">
      {title && (
        <h4 className="text-sm font-bold text-[#2A3C24] uppercase tracking-wide mb-3">{title}</h4>
      )}
      <div className="callout-inner prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: children }} />
    </div>
  );
}

// Render section with charts
function RenderSection({ section, focusMode }) {
  const html = renderMarkdown(section.content, focusMode);

  // Split by chart markers and render
  const parts = html.split(/(<div data-chart="[^"]+" class="chart-container"><\/div>)/);

  return (
    <section id={section.id} data-section={section.id} className="scroll-mt-28">
      {section.isPart && (
        <h1 className="essay-h1">{section.title}</h1>
      )}
      {section.level === 2 && (
        <h2 className="essay-h2">{section.title}</h2>
      )}
      {parts.map((part, idx) => {
        const chartMatch = part.match(/data-chart="([^"]+)"/);
        if (chartMatch) {
          const chartId = chartMatch[1];
          const ChartComponent = chartMap[chartId];
          if (ChartComponent) {
            return <ChartComponent key={idx} />;
          }
          return null;
        }
        // Handle callouts within the HTML
        if (part.includes('callout-box')) {
          return <div key={idx} dangerouslySetInnerHTML={{ __html: part }} />;
        }
        return <div key={idx} dangerouslySetInnerHTML={{ __html: part }} />;
      })}
    </section>
  );
}

// Sidebar annotation card
function SidebarCard({ sidebar, isActive }) {
  return (
    <div className={`sidebar-card p-4 rounded-lg mb-3 transition-all duration-300 ${isActive ? 'bg-[#F8F6F0] border-l-2 border-[#2A3C24]' : 'bg-white/50'}`}>
      <h4 className="text-xs font-bold text-[#2A3C24] uppercase tracking-wide mb-2">{sidebar.title}</h4>
      <div className="text-xs text-[#1A1A1A]/70 leading-relaxed sidebar-content"
           dangerouslySetInnerHTML={{ __html: renderMarkdown(sidebar.content).replace(/<p>/g, '<p class="mb-2 last:mb-0">') }} />
    </div>
  );
}

export default function InteractiveEssay() {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('intro');
  const [focusMode, setFocusMode] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [tocExpanded, setTocExpanded] = useState(false);

  const essay = essaysData.find(e => e.slug === slug);

  useEffect(() => {
    if (essay?.getContent) {
      essay.getContent().then(c => {
        setContent(c);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [essay]);

  const { sections, sidebars } = useMemo(() => {
    if (!content) return { sections: [], sidebars: [] };
    return parseEssayContent(content);
  }, [content]);

  const currentSidebars = useMemo(() => {
    return sidebars.filter(s => s.sectionId === activeSection);
  }, [sidebars, activeSection]);

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(Math.min(100, (scrollTop / docHeight) * 100));
      setShowScrollTop(scrollTop > 500);
    };

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0.3] }
    );

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Observe sections after render
    setTimeout(() => {
      document.querySelectorAll('[data-section]').forEach(el => observer.observe(el));
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [content]);

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  if (!essay) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F5F2EB]">Essay not found</div>;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F5F2EB]">
      <div className="w-5 h-5 border border-[#2A3C24]/30 border-t-[#2A3C24] rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className={`interactive-essay min-h-screen bg-[#F5F2EB] text-[#1A1A1A] ${focusMode ? 'focus-mode' : ''}`}>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 bg-[#2A3C24]/10">
        <div className="h-full bg-[#2A3C24] transition-all" style={{ width: `${readProgress}%` }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
        <div className="max-w-[1600px] mx-auto px-6 py-5 flex justify-between">
          <Link to="/" className="pointer-events-auto group inline-flex items-center gap-2 text-[#2A3C24] opacity-50 hover:opacity-100 transition">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Home</span>
          </Link>
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`pointer-events-auto p-2.5 rounded-full transition ${focusMode ? 'bg-[#FBD45B] text-[#1A1A1A]' : 'text-[#2A3C24]/40 hover:text-[#2A3C24] hover:bg-[#2A3C24]/5'}`}
          >
            <Zap size={16} />
          </button>
        </div>
      </header>

      <div className="flex justify-center">
        {/* Left TOC */}
        <aside
          className="hidden lg:block fixed left-0 top-0 bottom-0 w-56 pt-24 pb-12 pl-6 pr-3 overflow-y-auto"
          onMouseEnter={() => setTocExpanded(true)}
          onMouseLeave={() => setTocExpanded(false)}
        >
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-4">
              <List size={12} className="text-[#8A9A85]" />
              <p className="text-[10px] uppercase tracking-widest text-[#8A9A85] font-medium">Contents</p>
            </div>
            <nav className="space-y-1">
              {sections.slice(0, tocExpanded ? undefined : 10).map(section => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`block w-full text-left text-[11px] py-1 transition-all ${
                    section.id === activeSection
                      ? 'text-[#2A3C24] font-medium translate-x-1'
                      : 'text-[#8A9A85]/70 hover:text-[#2A3C24]'
                  } ${section.isPart ? 'font-semibold mt-3 first:mt-0' : ''} ${section.level === 2 ? 'pl-2' : ''}`}
                >
                  {section.title}
                </button>
              ))}
              {!tocExpanded && sections.length > 10 && (
                <p className="text-[10px] text-[#8A9A85]/50 mt-2 italic">Hover to see all...</p>
              )}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="w-full max-w-[680px] mx-auto px-6 lg:px-0 pt-24 pb-24 lg:ml-56 lg:mr-60">
          {/* Header */}
          <header className="mb-16 pb-10 border-b border-[#2A3C24]/10">
            <div className="flex items-center gap-3 text-xs text-[#8A9A85] mb-8 font-mono uppercase tracking-wider">
              <span>{essay.date}</span>
              <span className="opacity-40">|</span>
              <span>{essay.readTime}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight text-[#1A1A1A] mb-6 font-serif">
              {essay.title}
            </h1>
            {essay.subtitle && (
              <p className="text-xl text-[#2A3C24]/80 leading-relaxed font-light font-serif">{essay.subtitle}</p>
            )}
          </header>

          {/* Essay body */}
          <article className="essay-prose">
            {sections.map(section => (
              <RenderSection key={section.id} section={section} focusMode={focusMode} />
            ))}
            <ReferencesSection />
          </article>

          {/* Footer */}
          <footer className="mt-24 pt-10 border-t border-[#2A3C24]/10">
            <Link to="/" className="group inline-flex items-center gap-2 text-[#2A3C24] hover:underline font-medium text-sm">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </footer>
        </main>

        {/* Right sidebar */}
        <aside className="hidden lg:block fixed right-0 top-0 bottom-0 w-60 pt-24 pb-12 pr-6 pl-3 overflow-y-auto">
          <div className="pt-4">
            {currentSidebars.length > 0 ? (
              currentSidebars.map((sb, i) => <SidebarCard key={i} sidebar={sb} isActive={true} />)
            ) : (
              <p className="text-[11px] text-[#8A9A85]/50 leading-relaxed">
                Notes and context appear here as you read.
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 p-2.5 rounded-full bg-[#2A3C24] text-[#F5F2EB] shadow-lg transition-all z-40 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <ChevronUp size={16} />
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

        .font-serif { font-family: 'Playfair Display', Georgia, serif; }

        .essay-prose {
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 1.125rem;
          line-height: 1.85;
        }

        .essay-prose p { margin-bottom: 1.5em; }
        .essay-prose p:first-of-type::first-letter {
          font-family: 'Playfair Display', serif;
          font-size: 3.5rem;
          font-weight: 700;
          float: left;
          line-height: 1;
          margin-right: 0.1em;
          color: #2A3C24;
        }

        .essay-h1 {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 700;
          margin: 3rem 0 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #2A3C24;
          color: #1A1A1A;
        }

        .essay-h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 2.5rem 0 1.25rem;
          color: #1A1A1A;
        }

        .essay-h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 2rem 0 1rem;
          color: #2A3C24;
        }

        .essay-prose strong { font-weight: 600; color: #1A1A1A; }
        .essay-prose em { font-style: italic; }

        .essay-prose a {
          color: #2A3C24;
          text-decoration: underline;
          text-underline-offset: 2px;
          text-decoration-color: rgba(42,60,36,0.3);
        }
        .essay-prose a:hover { text-decoration-color: #2A3C24; }

        .essay-prose blockquote {
          margin: 1.75rem 0;
          padding: 0.5rem 0 0.5rem 1.25rem;
          border-left: 2px solid #2A3C24;
          font-style: italic;
          color: #2A3C24;
        }
        .essay-prose blockquote p { margin-bottom: 0.5em; }
        .essay-prose blockquote cite {
          display: block;
          font-style: normal;
          font-size: 0.9rem;
          color: #8A9A85;
          margin-top: 0.5rem;
        }

        .essay-prose ul {
          margin: 1.5rem 0;
          padding-left: 0;
          list-style: none;
        }
        .essay-prose li {
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .essay-prose li::before {
          content: '';
          position: absolute;
          left: 0.25rem;
          top: 0.65em;
          width: 4px;
          height: 4px;
          background: #2A3C24;
          border-radius: 50%;
          opacity: 0.5;
        }

        /* Callout boxes */
        .callout-box {
          margin: 2rem 0;
          border-left: 4px solid #2A3C24;
          background: linear-gradient(to right, rgba(42,60,36,0.03), transparent);
          border-radius: 0 0.5rem 0.5rem 0;
          padding: 1.25rem 1.5rem;
        }
        .callout-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #2A3C24;
          margin-bottom: 0.75rem;
        }
        .callout-content { font-size: 1rem; line-height: 1.7; }
        .callout-content p { margin-bottom: 0.75rem; }
        .callout-content p:last-child { margin-bottom: 0; }

        /* Hover terms */
        .hover-term {
          border-bottom: 1px dashed rgba(42,60,36,0.4);
          cursor: help;
          position: relative;
        }
        .hover-term:hover::after {
          content: attr(data-tip);
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: #1A1A1A;
          color: #F5F2EB;
          padding: 0.6rem 0.85rem;
          border-radius: 0.375rem;
          font-size: 0.8rem;
          font-style: normal;
          line-height: 1.5;
          width: max-content;
          max-width: 280px;
          z-index: 100;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          font-family: system-ui, sans-serif;
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

        /* Focus mode */
        .focus-mode .essay-prose p:not(:has(.focus-hl)) { opacity: 0.25; transition: opacity 0.3s; }
        .focus-mode .essay-prose p:hover { opacity: 0.7; }
        .focus-mode .essay-prose p:has(.focus-hl) { opacity: 1; }
        .focus-hl {
          font-weight: 600;
          background: linear-gradient(to bottom, transparent 55%, rgba(251,212,91,0.35) 55%);
        }

        /* Sidebar cards */
        .sidebar-card { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sidebar-content a {
          color: #2A3C24;
          text-decoration: underline;
        }

        /* Scrollbar */
        aside::-webkit-scrollbar { width: 3px; }
        aside::-webkit-scrollbar-track { background: transparent; }
        aside::-webkit-scrollbar-thumb { background: rgba(42,60,36,0.1); border-radius: 2px; }

        ::selection { background: #2A3C24; color: #F5F2EB; }
        html { scroll-behavior: smooth; }

        @media (max-width: 1024px) {
          .essay-prose { font-size: 1.05rem; }
          .hover-term:hover::after, .hover-term:hover::before { display: none; }
        }
      `}</style>
    </div>
  );
}
