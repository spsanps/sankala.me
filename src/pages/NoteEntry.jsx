import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notesData } from '../data/content';

export default function NoteEntry() {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  // Find entry by slug (supports both essay slugs and numeric IDs)
  const entry = notesData.find(n => n.slug === slug || n.id === parseInt(slug));

  useEffect(() => {
    if (entry) {
      if (entry.type === "essay" && entry.getContent) {
        // Load essay content dynamically
        entry.getContent().then(c => {
          setContent(c);
          setLoading(false);
        });
      } else {
        // Use direct content for notes
        setContent(entry.content || '');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [entry]);

  if (!entry) {
    return <div className="min-h-screen flex items-center justify-center text-[#F5F2EB]">Entry not found</div>;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#F5F2EB]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#2A3C24] text-[#F5F2EB] pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/#notes" className="inline-flex items-center gap-2 text-[#8A9A85] hover:text-white hover:underline mb-12 transition-colors font-medium">
          <ArrowLeft size={16} /> Back to Writing
        </Link>

        <header className="mb-16 border-b border-[#8A9A85]/30 pb-12">
            <div className="flex items-center gap-4 text-[#8A9A85] mb-8 font-mono text-sm uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{entry.date}</span>
                </div>
                {entry.readTime && (
                    <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{entry.readTime}</span>
                    </div>
                )}
                {entry.type === "essay" && (
                    <span className="px-2 py-0.5 border border-[#8A9A85]/30 rounded text-[10px]">Essay</span>
                )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold serif leading-[0.95] mb-8 tracking-tight">
                {entry.title}
            </h1>
            <p className="text-xl text-[#D1D9CE] reading-font leading-relaxed italic">
                {entry.excerpt}
            </p>
        </header>

        <article className="markdown-dark">
            <style>{`
                .markdown-dark h1 {
                    font-family: 'Playfair Display', serif;
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    margin-top: 2rem;
                    line-height: 1.2;
                    color: #F5F2EB;
                }
                .markdown-dark h2 {
                    font-family: 'Playfair Display', serif;
                    font-size: 2rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    margin-top: 2rem;
                    line-height: 1.3;
                    color: #F5F2EB;
                }
                .markdown-dark h3 {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                    margin-top: 1.5rem;
                    color: #F5F2EB;
                }
                .markdown-dark p {
                    margin-bottom: 1.25rem;
                    line-height: 1.8;
                    font-size: 1.125rem;
                    color: #D1D9CE;
                    font-family: 'Crimson Pro', serif;
                }
                .markdown-dark ul, .markdown-dark ol {
                    margin-bottom: 1.25rem;
                    margin-left: 1.5rem;
                    line-height: 1.8;
                }
                .markdown-dark li {
                    margin-bottom: 0.5rem;
                    font-size: 1.125rem;
                    color: #D1D9CE;
                    font-family: 'Crimson Pro', serif;
                }
                .markdown-dark code {
                    background-color: rgba(255,255,255,0.1);
                    padding: 0.2rem 0.5rem;
                    border-radius: 0.25rem;
                    font-size: 0.9em;
                    font-family: 'Monaco', 'Menlo', monospace;
                    color: #8A9A85;
                }
                .markdown-dark pre {
                    background-color: rgba(0,0,0,0.3);
                    color: #e5e7eb;
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    margin-bottom: 1.25rem;
                    overflow-x: auto;
                    border: 1px solid rgba(138, 154, 133, 0.2);
                }
                .markdown-dark pre code {
                    background: transparent;
                    padding: 0;
                    color: #e5e7eb;
                }
                .markdown-dark blockquote {
                    border-left: 4px solid #8A9A85;
                    padding-left: 1rem;
                    font-style: italic;
                    color: #8A9A85;
                    margin-bottom: 1.25rem;
                    font-family: 'Crimson Pro', serif;
                }
                .markdown-dark a {
                    color: #8A9A85;
                    text-decoration: underline;
                    text-decoration-thickness: 1px;
                    text-underline-offset: 2px;
                }
                .markdown-dark a:hover {
                    color: #F5F2EB;
                }
                .markdown-dark strong {
                    font-weight: 600;
                    color: #F5F2EB;
                }
                .markdown-dark hr {
                    border: none;
                    border-top: 1px solid rgba(138, 154, 133, 0.3);
                    margin: 2rem 0;
                }
            `}</style>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </article>

        <div className="mt-20 pt-12 border-t border-[#8A9A85]/30">
            <Link to="/#notes" className="inline-flex items-center gap-2 text-[#8A9A85] hover:text-white hover:underline font-medium transition-colors">
                <ArrowLeft size={16} /> Back to Writing
            </Link>
        </div>
      </div>
    </div>
  );
}
