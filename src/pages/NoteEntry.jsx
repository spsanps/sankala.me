import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { notesData } from '../data/content';

export default function NoteEntry() {
  const { id } = useParams();

  const entry = notesData.find(n => n.id === parseInt(id));

  if (!entry) {
    return <div className="min-h-screen flex items-center justify-center">Entry not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#2A3C24] text-[#F5F2EB] pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/#notes" className="inline-flex items-center gap-2 text-[#8A9A85] hover:text-white hover:underline mb-12 transition-colors">
          <ArrowLeft size={16} /> Back to Notes
        </Link>

        <header className="mb-12 border-b border-[#8A9A85]/30 pb-12">
            <div className="flex items-center gap-3 text-[#8A9A85] mb-6 font-mono text-sm">
                <Calendar size={14} />
                <span>{entry.date}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold serif leading-tight mb-6">
                {entry.title}
            </h1>
            <p className="text-xl text-[#D1D9CE] font-light leading-relaxed">
                {entry.excerpt}
            </p>
        </header>

        <article className="prose prose-lg prose-invert max-w-none">
            <p className="lead text-xl text-[#F5F2EB] opacity-90">
                {entry.content}
            </p>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <h3 className="serif text-2xl font-bold mt-8 mb-4 text-[#F5F2EB]">Key Takeaways</h3>
            <ul className="list-disc pl-5 space-y-2 text-[#D1D9CE]">
                <li>Point one about the subject matter.</li>
                <li>Another interesting observation.</li>
                <li>Final conclusion or thought.</li>
            </ul>
            <p className="mt-6">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
        </article>
      </div>
    </div>
  );
}
