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
            <h1 className="text-4xl md:text-6xl font-bold serif mb-6">Field Notes Archive</h1>
            <p className="text-lg text-[#D1D9CE]">
                Thoughts, reflections, and learnings from the journey.
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            {notesData.map((note) => (
                <Link to={`/notes/${note.id}`} key={note.id} className="bg-[#364930] p-8 rounded-xl hover:bg-[#42583C] transition-all cursor-pointer group border border-[#8A9A85]/20">
                    <span className="text-xs text-[#8A9A85] font-mono mb-4 block">{note.date}</span>
                    <h3 className="text-xl font-bold serif mb-3 group-hover:underline decoration-[#8A9A85] underline-offset-4">{note.title}</h3>
                    <p className="text-[#D1D9CE] text-sm leading-relaxed mb-6">
                        {note.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#8A9A85] group-hover:text-white transition-colors">
                        Read Entry <ArrowUpRight size={14} />
                    </div>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
