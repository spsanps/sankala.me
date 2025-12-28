import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import RichMarkdown from '../components/markdown/RichMarkdown';
import { essaysData } from '../data/content';

export default function EssayEntry() {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

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

  if (!essay) {
    return <div className="min-h-screen flex items-center justify-center text-[#1A1A1A]">Essay not found</div>;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#1A1A1A]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1A1A] pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#2A3C24] hover:underline mb-8 opacity-60 hover:opacity-100 transition-opacity font-medium">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <header className="mb-16 border-b border-[#2A3C24]/10 pb-12">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-8 font-mono uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{essay.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>{essay.readTime}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold serif text-[#1A1A1A] mb-6 leading-[0.95] tracking-tight">
            {essay.title}
          </h1>

          {/* Subtitle */}
          {essay.subtitle && (
            <p className="text-2xl md:text-3xl text-[#2A3C24] reading-font leading-relaxed italic font-light">
              {essay.subtitle}
            </p>
          )}

          {/* Tags */}
          {essay.tags && essay.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {essay.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#2A3C24]/5 text-[#2A3C24] text-xs font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <article className="markdown-light">
          <style>{`
            .markdown-light h1 {
              font-family: 'Playfair Display', serif;
              font-size: 2.5rem;
              font-weight: 700;
              margin-bottom: 1.5rem;
              margin-top: 3rem;
              line-height: 1.2;
              color: #1A1A1A;
              border-bottom: 2px solid #2A3C24;
              padding-bottom: 0.5rem;
            }
            .markdown-light h1:first-child {
              margin-top: 0;
            }
            .markdown-light h2 {
              font-family: 'Playfair Display', serif;
              font-size: 2rem;
              font-weight: 600;
              margin-bottom: 1rem;
              margin-top: 2.5rem;
              line-height: 1.3;
              color: #1A1A1A;
            }
            .markdown-light h3 {
              font-family: 'Playfair Display', serif;
              font-size: 1.5rem;
              font-weight: 600;
              margin-bottom: 0.75rem;
              margin-top: 2rem;
              color: #2A3C24;
            }
            .markdown-light p {
              margin-bottom: 1.5rem;
              line-height: 1.8;
              font-size: 1.125rem;
              color: #1A1A1A;
              font-family: 'Crimson Pro', serif;
            }
            .markdown-light ul, .markdown-light ol {
              margin-bottom: 1.5rem;
              margin-left: 1.5rem;
              line-height: 1.8;
            }
            .markdown-light li {
              margin-bottom: 0.5rem;
              font-size: 1.125rem;
              color: #1A1A1A;
              font-family: 'Crimson Pro', serif;
            }
            .markdown-light code {
              background-color: #2A3C24;
              color: #F5F2EB;
              padding: 0.2rem 0.5rem;
              border-radius: 0.25rem;
              font-size: 0.9em;
              font-family: 'Monaco', 'Menlo', monospace;
            }
            .markdown-light pre {
              background-color: #1A1A1A;
              color: #F5F2EB;
              padding: 1.5rem;
              border-radius: 0.75rem;
              margin-bottom: 1.5rem;
              overflow-x: auto;
              border: 1px solid #2A3C24;
            }
            .markdown-light pre code {
              background: transparent;
              padding: 0;
              color: #F5F2EB;
            }
            .markdown-light blockquote {
              border-left: 4px solid #2A3C24;
              padding-left: 1.5rem;
              font-style: italic;
              color: #2A3C24;
              margin-bottom: 1.5rem;
              margin-top: 1.5rem;
              font-family: 'Crimson Pro', serif;
              font-size: 1.125rem;
            }
            .markdown-light a {
              color: #2A3C24;
              text-decoration: underline;
              text-decoration-thickness: 1px;
              text-underline-offset: 2px;
            }
            .markdown-light a:hover {
              color: #8A9A85;
            }
            .markdown-light strong {
              font-weight: 700;
              color: #1A1A1A;
            }
            .markdown-light em {
              font-style: italic;
            }
            .markdown-light hr {
              border: none;
              border-top: 2px solid #8A9A85;
              margin: 3rem 0;
              opacity: 0.3;
            }
            .markdown-light table {
              width: 100%;
              border-collapse: collapse;
              margin: 2rem 0;
              font-family: 'Crimson Pro', serif;
            }
            .markdown-light th {
              background-color: #2A3C24;
              color: #F5F2EB;
              padding: 0.75rem;
              text-align: left;
              font-weight: 600;
              border: 1px solid #2A3C24;
            }
            .markdown-light td {
              padding: 0.75rem;
              border: 1px solid #8A9A85;
              opacity: 0.3;
            }
            .markdown-light tr:nth-child(even) {
              background-color: rgba(138, 154, 133, 0.05);
            }
            .markdown-light tr:hover {
              background-color: rgba(138, 154, 133, 0.1);
            }
          `}</style>
          <RichMarkdown content={content} />
        </article>

        <div className="mt-20 pt-12 border-t border-[#2A3C24]/10">
          <Link to="/" className="inline-flex items-center gap-2 text-[#2A3C24] hover:underline font-medium transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
