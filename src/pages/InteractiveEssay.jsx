import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Zap, ChevronUp, ExternalLink, Image as ImageIcon, List, ChevronDown } from 'lucide-react';
import { essaysData } from '../data/content';

// Parse markdown to extract headings
function parseMarkdownStructure(content) {
  const lines = content.split('\n');
  const headings = [];
  let currentPart = null;

  lines.forEach((line, index) => {
    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match && !line.includes('GPT-7 Will Have Arms')) {
      const title = h1Match[1].trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      currentPart = title;
      headings.push({ level: 1, title, id, part: currentPart, lineIndex: index });
    }

    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      const title = h2Match[1].trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      headings.push({ level: 2, title, id, part: currentPart, lineIndex: index });
    }

    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      const title = h3Match[1].trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      headings.push({ level: 3, title, id, part: currentPart, lineIndex: index });
    }
  });

  return headings;
}

// Extract key sentences for focus mode
function extractKeySentences(content) {
  const boldPattern = /\*\*([^*]+)\*\*/g;
  const sentences = [];
  let match;

  while ((match = boldPattern.exec(content)) !== null) {
    const text = match[1].trim();
    if (text.length > 30 && !text.startsWith('First') && !text.startsWith('Second') && !text.startsWith('Third')) {
      sentences.push(text);
    }
  }

  return sentences;
}

// Render simple markdown to HTML for sidebar content
function renderSimpleMarkdown(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^- (.+)$/gm, '<span class="sidebar-list-item">$1</span>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// Extract references with character position for precise tracking
function extractReferences(content) {
  const refs = [];
  const lines = content.split('\n');
  let currentSection = 'introduction';
  let charPosition = 0;

  // First pass: extract titled callout boxes
  const calloutPattern = /^>\s*\*\*([^*]+)\*\*\s*\n((?:>\s*.*\n?)+)/gm;
  let calloutMatch;

  while ((calloutMatch = calloutPattern.exec(content)) !== null) {
    const calloutTitle = calloutMatch[1].trim();
    const calloutBody = calloutMatch[2]
      .split('\n')
      .map(line => line.replace(/^>\s*/, '').trim())
      .filter(line => line.length > 0)
      .join('\n');

    const beforeCallout = content.substring(0, calloutMatch.index);
    const headingMatches = [...beforeCallout.matchAll(/^##?\s+(.+)$/gm)];
    if (headingMatches.length > 0) {
      const lastHeading = headingMatches[headingMatches.length - 1][1].trim();
      currentSection = lastHeading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    } else {
      currentSection = 'introduction';
    }

    // Convert [REF: url] to clickable links instead of stripping them
    const cleanBody = calloutBody.replace(/\[REF:\s*([^\]]+)\]/g, (match, url) => {
      if (url.startsWith('http')) {
        const hostname = new URL(url).hostname.replace('www.', '');
        return `[${hostname}](${url})`;
      }
      return ''; // Remove non-URL refs
    });

    refs.push({
      id: `callout-${calloutMatch.index}`,
      sectionId: currentSection,
      position: calloutMatch.index,
      type: 'callout',
      title: calloutTitle,
      content: cleanBody
    });
  }

  // Second pass: extract [REF:] and [SIDEBAR_IMAGE:] markers
  lines.forEach((line, lineIndex) => {
    const h1Match = line.match(/^#\s+(.+)$/);
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);

    if (h1Match || h2Match || h3Match) {
      const title = (h1Match || h2Match || h3Match)[1].trim();
      currentSection = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    if (!line.startsWith('>')) {
      const refPattern = /\[REF:\s*([^\]]+)\]/g;
      let refMatch;
      while ((refMatch = refPattern.exec(line)) !== null) {
        const refContent = refMatch[1].trim();
        const isUrl = refContent.startsWith('http');

        refs.push({
          id: `ref-${charPosition + refMatch.index}`,
          sectionId: currentSection,
          position: charPosition + refMatch.index,
          type: 'reference',
          title: isUrl ? new URL(refContent).hostname.replace('www.', '') : refContent,
          content: isUrl ? 'External reference' : refContent,
          url: isUrl ? refContent : null
        });
      }

      const sidebarImagePattern = /\[SIDEBAR_IMAGE:\s*([^\]]+)\]/g;
      let imgMatch;
      while ((imgMatch = sidebarImagePattern.exec(line)) !== null) {
        refs.push({
          id: `img-${charPosition + imgMatch.index}`,
          sectionId: currentSection,
          position: charPosition + imgMatch.index,
          type: 'image',
          title: imgMatch[1].trim(),
          content: 'Image placeholder'
        });
      }
    }

    charPosition += line.length + 1;
  });

  // Sort by position
  refs.sort((a, b) => a.position - b.position);

  return refs;
}

// Markdown to HTML converter
function renderMarkdownToHTML(markdown, focusMode = false, isFirst = false, isNewSection = false) {
  let html = markdown
    // Remove the main title and subtitles (shown in header)
    .replace(/^#\s+GPT-7 Will Have Arms\s*$/gm, '')
    .replace(/^\*\*The Coming Convergence of Foundation Models and Robotics\*\*\s*$/gm, '')
    .replace(/^\*& Why the Scaling Believers.*Robotics\*\s*$/gm, '')
    // Remove titled callout boxes
    .replace(/^>\s*\*\*[^*]+\*\*\s*\n((?:>\s*.*\n?)+)/gm, '')
    // Remove markers
    .replace(/\s*\[REF:\s*[^\]]+\]/g, '')
    .replace(/\s*\[SIDEBAR_IMAGE:\s*[^\]]+\]/g, '')
    // Convert [IMAGE: ...]
    .replace(/\[IMAGE:\s*([^|\]]+)\s*\|\s*([^\]]+)\]/g, '<figure class="image-placeholder"><div class="image-icon"></div><figcaption><strong>$1</strong><span>$2</span></figcaption></figure>')
    .replace(/\[IMAGE:\s*([^\]]+)\]/g, '<figure class="image-placeholder"><div class="image-icon"></div><figcaption><strong>$1</strong></figcaption></figure>')
    // Convert [HOVER: ...]
    .replace(/\[HOVER:\s*([^|\]]+)\s*\|\s*([^\]]+)\]/g, '<span class="hover-term" data-tooltip="$2">$1</span>')
    // Headers (skip the main title which was already removed)
    .replace(/^### (.+)$/gm, '<h3 class="essay-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="essay-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="essay-h1">$1</h1>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, (_, text) => {
      if (focusMode) {
        return `<strong class="focus-highlight">${text}</strong>`;
      }
      return `<strong>${text}</strong>`;
    })
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // HR
    .replace(/^---$/gm, '<hr class="essay-hr" />')
    // Code blocks
    .replace(/```([^`]+)```/gs, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Tables
    .replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map(c => c.trim());
      const isHeader = cells.some(c => c.includes('---'));
      if (isHeader) return '';
      return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
    });

  // Wrap consecutive li in ul
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // Merge consecutive blockquotes
  html = html.replace(/(<blockquote>.*<\/blockquote>\n?)+/g, (match) => {
    return match.replace(/<\/blockquote>\n?<blockquote>/g, '<br/>');
  });

  // Wrap tr in table
  html = html.replace(/(<tr>.*<\/tr>\n?)+/g, (match) => `<table>${match}</table>`);

  // Paragraphs - handle empty lines properly
  const lines = html.split('\n');
  const processedLines = [];
  let paragraphCount = 0;

  // Block-level elements that should NOT be wrapped in <p>
  const blockElements = ['<h1', '<h2', '<h3', '<h4', '<h5', '<h6', '<ul', '<ol', '<li', '<table', '<tr', '<td', '<th', '<pre', '<blockquote', '<hr', '<figure', '<div'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      processedLines.push('');
      continue;
    }

    // Check if it's a block-level element that shouldn't be wrapped
    const isBlockElement = blockElements.some(tag => trimmed.toLowerCase().startsWith(tag));
    if (isBlockElement) {
      processedLines.push(line);
      continue;
    }

    // Everything else gets wrapped in a paragraph (including lines with inline HTML like <strong>)
    paragraphCount++;
    // Add drop cap class to first real paragraph of sections with drop caps enabled
    if (paragraphCount === 1 && isNewSection && !trimmed.startsWith('<em>') && !trimmed.startsWith('<strong>The Coming')) {
      processedLines.push(`<p class="drop-cap">${trimmed}</p>`);
    } else {
      processedLines.push(`<p>${trimmed}</p>`);
    }
  }

  return processedLines.join('\n');
}

// Custom renderer with sections
function RenderMarkdownWithSections({ content, focusMode }) {
  const sections = useMemo(() => {
    const parts = [];
    const lines = content.split('\n');
    let currentSection = { id: 'intro', content: [], level: 0 };

    lines.forEach((line) => {
      const h1Match = line.match(/^#\s+(.+)$/);
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);

      if (h1Match || h2Match || h3Match) {
        if (currentSection.content.length > 0) {
          parts.push(currentSection);
        }
        const title = (h1Match || h2Match || h3Match)[1].trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const level = h1Match ? 1 : h2Match ? 2 : 3;
        currentSection = { id, title, content: [line], level };
      } else {
        currentSection.content.push(line);
      }
    });

    if (currentSection.content.length > 0) {
      parts.push(currentSection);
    }

    return parts;
  }, [content]);

  return (
    <div className="essay-content">
      {sections.map((section, idx) => {
        // Drop cap on intro and on first paragraph after h2 headings (main sections)
        const useDropCap = idx === 0 || section.level === 2;
        return (
          <section key={idx} id={section.id} className="scroll-mt-24" data-section={section.id}>
            <div
              dangerouslySetInnerHTML={{
                __html: renderMarkdownToHTML(section.content.join('\n'), focusMode, idx === 0, useDropCap)
              }}
            />
          </section>
        );
      })}
    </div>
  );
}

// Expandable annotation card - measures actual overflow
function AnnotationCard({ annotation, isExpanded, onToggle }) {
  const contentRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const maxHeight = 64; // 4rem in pixels

  // Check if content overflows after render
  useEffect(() => {
    if (contentRef.current && annotation.type === 'callout') {
      const el = contentRef.current;
      setHasOverflow(el.scrollHeight > maxHeight);
    }
  }, [annotation]);

  return (
    <div
      className={`annotation-card p-3 rounded-lg transition-all duration-200 ${
        annotation.type === 'image'
          ? 'bg-[#2A3C24]/[0.03] border border-dashed border-[#2A3C24]/15'
          : annotation.type === 'callout'
          ? 'bg-[#F8F6F0] border-l-2 border-[#2A3C24]/25'
          : 'bg-[#EDEBE4]'
      }`}
    >
      {annotation.type === 'image' ? (
        <>
          <div className="flex items-center gap-1.5 mb-1.5">
            <ImageIcon size={10} className="text-[#8A9A85]" />
            <p className="text-[9px] uppercase tracking-[0.15em] text-[#8A9A85] font-medium">
              Figure
            </p>
          </div>
          <p className="text-[11px] text-[#2A3C24] font-medium leading-snug">
            {annotation.title}
          </p>
        </>
      ) : annotation.type === 'callout' ? (
        <>
          <p className="text-[11px] font-semibold text-[#2A3C24] mb-2 leading-snug font-serif">
            {annotation.title}
          </p>
          <div
            ref={contentRef}
            className="sidebar-content text-[10px] text-[#1A1A1A]/70 leading-relaxed overflow-hidden transition-all duration-200"
            style={{ maxHeight: isExpanded ? contentRef.current?.scrollHeight : maxHeight }}
            dangerouslySetInnerHTML={{
              __html: renderSimpleMarkdown(annotation.content)
            }}
          />
          {hasOverflow && (
            <button
              onClick={onToggle}
              className="flex items-center gap-1 mt-2 text-[9px] text-[#2A3C24]/60 hover:text-[#2A3C24] font-medium transition-colors"
            >
              {isExpanded ? 'Show less' : 'Show more'}
              <ChevronDown
                size={10}
                className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </>
      ) : (
        <>
          <p className="text-[9px] uppercase tracking-[0.15em] text-[#8A9A85] mb-1 font-medium">
            Reference
          </p>
          <p className="text-[11px] font-medium text-[#1A1A1A]/80 leading-snug">
            {annotation.title}
          </p>
          {annotation.url && (
            <a
              href={annotation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1.5 text-[9px] text-[#2A3C24]/70 hover:text-[#2A3C24] font-medium"
            >
              View source <ExternalLink size={8} />
            </a>
          )}
        </>
      )}
    </div>
  );
}

export default function InteractiveEssay() {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [tocExpanded, setTocExpanded] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const contentRef = useRef(null);

  const essay = essaysData.find(e => e.slug === slug);

  useEffect(() => {
    if (essay && essay.getContent) {
      essay.getContent().then(c => {
        setContent(c);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [essay]);

  const headings = useMemo(() => parseMarkdownStructure(content), [content]);
  const keySentences = useMemo(() => extractKeySentences(content), [content]);
  const annotations = useMemo(() => extractReferences(content), [content]);

  const currentHeadingIndex = useMemo(() => {
    return headings.findIndex(h => h.id === activeSection);
  }, [headings, activeSection]);

  const visibleHeadings = useMemo(() => {
    if (tocExpanded) return headings;
    if (currentHeadingIndex === -1) return headings.slice(0, 6);
    const start = Math.max(0, currentHeadingIndex - 2);
    const end = Math.min(headings.length, currentHeadingIndex + 4);
    return headings.slice(start, end);
  }, [headings, currentHeadingIndex, tocExpanded]);

  // Get annotations for current section, showing only 2-3 at a time based on scroll
  const currentAnnotations = useMemo(() => {
    const sectionAnnotations = annotations.filter(a => a.sectionId === activeSection);
    if (sectionAnnotations.length === 0) return [];

    // Show a sliding window of annotations based on scroll progress
    const totalAnnotations = sectionAnnotations.length;
    const windowSize = Math.min(3, totalAnnotations);
    const startIdx = Math.floor(scrollProgress * Math.max(0, totalAnnotations - windowSize));

    return sectionAnnotations.slice(startIdx, startIdx + windowSize);
  }, [annotations, activeSection, scrollProgress]);

  // Scroll spy
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
  }, [content]);

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadProgress(Math.min(100, Math.max(0, progress)));
      setShowScrollTop(scrollTop > 500);

      // Calculate progress within current section
      const activeEl = document.querySelector(`[data-section="${activeSection}"]`);
      if (activeEl) {
        const rect = activeEl.getBoundingClientRect();
        const sectionTop = window.scrollY + rect.top;
        const sectionHeight = activeEl.offsetHeight;
        const scrollInSection = scrollTop - sectionTop;
        const sectionProgress = Math.max(0, Math.min(1, scrollInSection / sectionHeight));
        setScrollProgress(sectionProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const scrollToSection = useCallback((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleCard = useCallback((id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  if (!essay) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EB]">
        <p className="text-[#1A1A1A]/50">Essay not found</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EB]">
        <div className="w-5 h-5 border border-[#2A3C24]/30 border-t-[#2A3C24] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`interactive-essay min-h-screen bg-[#F5F2EB] text-[#1A1A1A] ${focusMode ? 'focus-mode-active' : ''}`}>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50">
        <div
          className="h-full bg-[#2A3C24] transition-all duration-150"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
        <div className="max-w-[1600px] mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            to={`/essays/${slug}`}
            className="pointer-events-auto group inline-flex items-center gap-2 text-[#2A3C24] opacity-50 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </Link>

          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`pointer-events-auto p-2.5 rounded-full transition-all duration-300 ${
              focusMode
                ? 'bg-[#FBD45B] text-[#1A1A1A]'
                : 'text-[#2A3C24]/40 hover:text-[#2A3C24] hover:bg-[#2A3C24]/5'
            }`}
            title="Focus Mode"
          >
            <Zap size={16} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Three column layout */}
      <div className="flex justify-center">

        {/* Left sidebar - TOC */}
        <aside
          className="hidden lg:block fixed left-0 top-0 bottom-0 w-56 pt-24 pb-12 pl-6 pr-3 overflow-y-auto toc-sidebar"
          onMouseEnter={() => setTocExpanded(true)}
          onMouseLeave={() => setTocExpanded(false)}
        >
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8A9A85] font-medium">Contents</p>
              <List size={12} className={`text-[#8A9A85] transition-opacity ${tocExpanded ? 'opacity-100' : 'opacity-40'}`} />
            </div>

            <nav className={`space-y-0.5 transition-all duration-300 ${tocExpanded ? 'toc-expanded' : ''}`}>
              {visibleHeadings.map((heading, idx) => {
                const isActive = heading.id === activeSection;
                return (
                  <button
                    key={heading.id + idx}
                    onClick={() => scrollToSection(heading.id)}
                    className={`toc-item block w-full text-left py-1 transition-all duration-200 ${
                      isActive
                        ? 'text-[#2A3C24] font-medium'
                        : 'text-[#8A9A85]/70 hover:text-[#2A3C24]'
                    } ${heading.level === 1 ? 'text-[11px] font-semibold mt-3 first:mt-0' : ''} ${
                      heading.level === 3 ? 'pl-3 text-[10px]' : heading.level === 2 ? 'pl-1.5 text-[11px]' : ''
                    }`}
                  >
                    <span className={`inline-block transition-transform ${isActive ? 'translate-x-0.5' : ''}`}>
                      {heading.title}
                    </span>
                  </button>
                );
              })}
            </nav>

            {!tocExpanded && headings.length > 6 && (
              <p className="text-[10px] text-[#8A9A85]/50 mt-3 italic">Hover to see all</p>
            )}

            {focusMode && keySentences.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#2A3C24]/10">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#FBD45B] mb-3 font-medium">Key Points</p>
                {keySentences.slice(0, 3).map((s, i) => (
                  <p key={i} className="text-[10px] text-[#2A3C24]/50 leading-relaxed mb-2 line-clamp-2">
                    {s}
                  </p>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main ref={contentRef} className="w-full max-w-[680px] mx-auto px-6 lg:px-0 pt-24 pb-24 lg:ml-56 lg:mr-60">

            {/* Essay header */}
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
                <div className="space-y-2">
                  <p className="text-xl text-[#2A3C24]/80 leading-relaxed font-light font-serif">
                    {essay.subtitle}
                  </p>
                  <p className="text-lg text-[#8A9A85] leading-relaxed font-light font-serif italic">
                    & Why the Scaling Believers Should Apply Their Own Logic to Robotics
                  </p>
                </div>
              )}

              {essay.tags && essay.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8">
                  {essay.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-[#2A3C24]/5 text-[#2A3C24]/70 text-[10px] font-medium rounded uppercase tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Essay content */}
            <article className={`essay-prose ${focusMode ? 'focus-active' : ''}`}>
              <RenderMarkdownWithSections content={content} focusMode={focusMode} />
            </article>

            {/* Footer */}
            <footer className="mt-24 pt-10 border-t border-[#2A3C24]/10">
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="group inline-flex items-center gap-2 text-[#2A3C24] hover:underline font-medium text-sm"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Home
                </Link>
                <Link
                  to={`/essays/${slug}`}
                  className="text-xs text-[#8A9A85] hover:text-[#2A3C24] transition-colors"
                >
                  Standard view
                </Link>
              </div>
            </footer>
        </main>

        {/* Right sidebar - Annotations */}
        <aside className="hidden lg:block fixed right-0 top-0 bottom-0 w-60 pt-24 pb-12 pr-6 pl-3 overflow-y-auto">
          <div className="pt-4">
            {currentAnnotations.length > 0 ? (
              <div className="space-y-3">
                {currentAnnotations.map((annotation) => (
                  <AnnotationCard
                    key={annotation.id}
                    annotation={annotation}
                    isExpanded={expandedCards[annotation.id]}
                    onToggle={() => toggleCard(annotation.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-[#8A9A85]/60 leading-relaxed">
                <p>Notes and references appear here as you read.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Scroll to top */}
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Cinzel+Decorative:wght@400;700&family=Cormorant+Infant:wght@600;700&display=swap');

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
          margin-top: 0;
          margin-bottom: 1.5em;
        }

        .essay-prose p:last-child {
          margin-bottom: 0;
        }

        .essay-prose p + p,
        .essay-prose ul + p,
        .essay-prose ol + p,
        .essay-prose blockquote + p,
        .essay-prose table + p,
        .essay-prose figure + p {
          margin-top: 0;
        }

        /* Raised cap - ornate decorative first letter that extends upward only */
        .essay-prose p.drop-cap::first-letter {
          font-family: 'Cinzel Decorative', 'Cormorant Infant', Georgia, serif;
          font-size: 3.2rem;
          font-weight: 700;
          line-height: 1;
          vertical-align: baseline;
          margin-right: 0.05rem;
          color: #2A3C24;
        }

        .essay-prose .essay-h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.875rem;
          font-weight: 700;
          color: #1A1A1A;
          margin-top: 3.5rem;
          margin-bottom: 1.5rem;
          line-height: 1.2;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(42, 60, 36, 0.15);
        }

        .essay-prose .essay-h1:first-child {
          margin-top: 0;
        }

        .essay-prose .essay-h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1A1A1A;
          margin-top: 2.75rem;
          margin-bottom: 1.25rem;
          line-height: 1.3;
        }

        .essay-prose .essay-h3 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.2rem;
          font-weight: 600;
          color: #2A3C24;
          margin-top: 2.25rem;
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        .essay-prose strong {
          font-weight: 600;
          color: #1A1A1A;
        }

        .essay-prose em {
          font-style: italic;
        }

        .essay-prose blockquote {
          margin: 1.75rem 0;
          padding: 0.5rem 0 0.5rem 1.25rem;
          border-left: 2px solid #2A3C24;
          font-style: italic;
          color: #2A3C24;
        }

        .essay-prose .essay-hr {
          border: none;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(42, 60, 36, 0.2), transparent);
          margin: 3.5rem 0;
        }

        .essay-prose pre {
          background: #1A1A1A;
          color: #F5F2EB;
          padding: 1.25rem;
          border-radius: 0.5rem;
          margin: 1.75rem 0;
          overflow-x: auto;
          font-size: 0.85rem;
          line-height: 1.6;
          font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
        }

        .essay-prose code {
          background: rgba(42, 60, 36, 0.08);
          color: #2A3C24;
          padding: 0.15rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
        }

        .essay-prose pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }

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

        .essay-prose ul {
          margin: 1.5rem 0;
          padding-left: 0;
          list-style: none;
        }

        .essay-prose li {
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 0.6rem;
        }

        .essay-prose li::before {
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

        .essay-prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          font-size: 0.95rem;
        }

        .essay-prose td {
          padding: 0.6rem 0.75rem;
          border-bottom: 1px solid rgba(42, 60, 36, 0.1);
        }

        .essay-prose tr:first-child td {
          font-weight: 600;
          background: rgba(42, 60, 36, 0.03);
        }

        /* Hover tooltips */
        .hover-term {
          border-bottom: 1px dashed rgba(42, 60, 36, 0.4);
          cursor: help;
          position: relative;
        }

        .hover-term:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: #1A1A1A;
          color: #F5F2EB;
          padding: 0.6rem 0.85rem;
          border-radius: 0.375rem;
          font-size: 0.8rem;
          line-height: 1.5;
          width: max-content;
          max-width: 280px;
          z-index: 100;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          font-family: system-ui, -apple-system, sans-serif;
          font-style: normal;
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

        /* Image placeholders */
        .image-placeholder {
          margin: 2.5rem 0;
          padding: 2rem 1.5rem;
          background: rgba(42, 60, 36, 0.02);
          border: 1px dashed rgba(42, 60, 36, 0.15);
          border-radius: 0.5rem;
          text-align: center;
        }

        .image-placeholder .image-icon {
          width: 40px;
          height: 40px;
          margin: 0 auto 0.75rem;
          background: rgba(42, 60, 36, 0.06);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-placeholder .image-icon::before {
          content: '📊';
          font-size: 1.25rem;
        }

        .image-placeholder figcaption strong {
          display: block;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #2A3C24;
          margin-bottom: 0.25rem;
        }

        .image-placeholder figcaption span {
          display: block;
          font-size: 0.8rem;
          color: #8A9A85;
          max-width: 320px;
          margin: 0 auto;
          line-height: 1.4;
        }

        /* Sidebar content styling */
        .sidebar-content strong {
          font-weight: 600;
          color: #2A3C24;
        }

        .sidebar-content em {
          font-style: italic;
        }

        .sidebar-content a {
          color: #2A3C24;
          text-decoration: underline;
          text-decoration-color: rgba(42, 60, 36, 0.4);
          text-underline-offset: 2px;
          transition: all 0.15s ease;
          cursor: pointer;
        }

        .sidebar-content a:hover {
          color: #1A1A1A;
          text-decoration-color: #2A3C24;
          background: rgba(42, 60, 36, 0.05);
        }

        .sidebar-content code {
          background: rgba(42, 60, 36, 0.1);
          padding: 0.1rem 0.3rem;
          border-radius: 2px;
          font-size: 0.9em;
        }

        .sidebar-list-item {
          display: block;
          padding-left: 0.75rem;
          margin-bottom: 0.35rem;
          position: relative;
        }

        .sidebar-list-item::before {
          content: '•';
          position: absolute;
          left: 0;
          color: #8A9A85;
        }

        /* Make annotation card links clearly clickable */
        .annotation-card a {
          color: #2A3C24;
          text-decoration: underline;
          text-decoration-color: rgba(42, 60, 36, 0.3);
          text-underline-offset: 2px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .annotation-card a:hover {
          color: #1A1A1A;
          text-decoration-color: #2A3C24;
        }

        /* Focus mode */
        .focus-highlight {
          font-weight: 600;
          background: linear-gradient(to bottom, transparent 55%, rgba(251, 212, 91, 0.35) 55%);
          padding: 0 0.1em;
        }

        .focus-active p:not(:has(.focus-highlight)) {
          opacity: 0.3;
          transition: opacity 0.3s ease;
        }

        .focus-active p:hover {
          opacity: 0.8;
        }

        .focus-active p:has(.focus-highlight) {
          opacity: 1;
        }

        .focus-mode-active {
          background-color: #FAF8F3;
        }

        /* TOC styles */
        .toc-sidebar {
          transition: width 0.3s ease;
        }

        .toc-sidebar:hover {
          width: 15rem;
        }

        .toc-item {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Annotation cards */
        .annotation-card {
          animation: fadeSlideIn 0.25s ease-out forwards;
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
          scroll-behavior: smooth;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .essay-prose {
            font-size: 1.05rem;
          }

          .essay-prose .essay-h1 {
            font-size: 1.625rem;
          }

          .essay-prose .essay-h2 {
            font-size: 1.35rem;
          }

          .hover-term:hover::after,
          .hover-term:hover::before {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .essay-prose {
            font-size: 1rem;
            line-height: 1.8;
          }

          .essay-prose .essay-h1 {
            font-size: 1.5rem;
          }

          .essay-prose .essay-h2 {
            font-size: 1.25rem;
          }

          .essay-prose .essay-h3 {
            font-size: 1.1rem;
          }

          .essay-prose p.drop-cap::first-letter {
            font-size: 2.25rem;
          }
        }
      `}</style>
    </div>
  );
}
