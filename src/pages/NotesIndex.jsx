import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, PenTool } from 'lucide-react';
import { notesData } from '../data/content';

export default function NotesIndex() {
  return (
    <div className="min-h-screen bg-[#2A3C24] text-[#F5F2EB] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/#notes" className="inline-flex items-center gap-2 text-[#8A9A85] hover:text-white hover:underline mb-12 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="mb-16 text-center max-w-3xl mx-auto">
            <PenTool className="mx-auto mb-4 text-[#8A9A85]" size={32} />
            <h1 className="text-4xl md:text-6xl font-bold serif mb-6">Writing Archive</h1>
            <p className="text-lg text-[#D1D9CE]">
                Long-form essays, technical deep dives, and shorter notes on AI, robotics, and other explorations.
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            {notesData.map((note) => {
                // Use essay route if it's a link to an essay, otherwise use note route
                const linkTo = note.isEssayLink ? note.essayRoute : (note.type === "essay" ? `/notes/${note.slug}` : `/notes/${note.id}`);

                return (
                    <Link to={linkTo} key={note.id} className="bg-[#364930] p-8 rounded-xl hover:bg-[#42583C] transition-all cursor-pointer group border border-[#8A9A85]/20">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-[#8A9A85] font-mono">{note.date}</span>
                            {note.type === "essay" && (
                                <span className="text-[10px] text-[#8A9A85] uppercase tracking-widest px-2 py-0.5 border border-[#8A9A85]/30 rounded">Essay</span>
                            )}
                        </div>
                        <h3 className="text-xl font-bold serif mb-3 group-hover:underline decoration-[#8A9A85] underline-offset-4">{note.title}</h3>
                        <p className="text-[#D1D9CE] text-sm leading-relaxed mb-6">
                            {note.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-sm font-medium text-[#8A9A85] group-hover:text-white transition-colors">
                            {note.readTime ? note.readTime : "Read Entry"} <ArrowUpRight size={14} />
                        </div>
                    </Link>
                );
            })}
        </div>
      </div>
    </div>
  );
}
