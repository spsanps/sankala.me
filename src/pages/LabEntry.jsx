import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { experimentsData } from '../data/content';

export default function LabEntry() {
  const { id } = useParams();

  const entry = experimentsData.find(e => e.id === parseInt(id));

  if (!entry) {
    return <div className="min-h-screen flex items-center justify-center">Entry not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1A1A] pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/#lab" className="inline-flex items-center gap-2 text-[#2A3C24] hover:underline mb-8 opacity-60 hover:opacity-100 transition-opacity">
          <ArrowLeft size={16} /> Back to Lab
        </Link>

        <div className="mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#2A3C24] text-[#F5F2EB] text-xs uppercase tracking-widest rounded-full font-medium mb-6">
                {entry.tag}
            </span>
            <h1 className="text-5xl md:text-7xl font-bold serif text-[#1A1A1A] mb-8 leading-[0.95] tracking-tight">
                {entry.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed reading-font border-l-4 border-[#2A3C24] pl-6 italic">
                {entry.description}
            </p>
        </div>

        <div className={`w-full h-[400px] ${entry.color} rounded-2xl mb-16 overflow-hidden relative border border-[#2A3C24]/10`}>
             <div className="absolute inset-0 flex items-center justify-center text-gray-400/40 italic serif text-3xl">
                Visual Representation
             </div>
        </div>

        <article className="markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {entry.content}
            </ReactMarkdown>
        </article>

        <div className="mt-20 pt-12 border-t border-[#2A3C24]/10">
            <Link to="/#lab" className="inline-flex items-center gap-2 text-[#2A3C24] hover:underline font-medium">
                <ArrowLeft size={16} /> Back to Lab
            </Link>
        </div>
      </div>
    </div>
  );
}
