import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { experimentsData } from '../data/content';

export default function LabEntry() {
  const { id } = useParams();

  const entry = experimentsData.find(e => e.id === parseInt(id));

  if (!entry) {
    return <div className="min-h-screen flex items-center justify-center">Entry not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1A1A] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/#lab" className="inline-flex items-center gap-2 text-[#2A3C24] hover:underline mb-8 opacity-60 hover:opacity-100 transition-opacity">
          <ArrowLeft size={16} /> Back to Lab
        </Link>

        <div className="mb-12">
            <span className="inline-block px-3 py-1 bg-[#2A3C24] text-[#F5F2EB] text-xs rounded-full font-medium mb-4">
                {entry.tag}
            </span>
            <h1 className="text-5xl md:text-7xl font-bold serif text-[#1A1A1A] mb-6 leading-tight">
                {entry.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light border-l-2 border-[#2A3C24] pl-6">
                {entry.description}
            </p>
        </div>

        <div className="w-full h-[400px] bg-gray-200 rounded-xl mb-12 overflow-hidden relative">
             <div className={`absolute inset-0 ${entry.color} opacity-50`}></div>
             <div className="absolute inset-0 flex items-center justify-center text-gray-400 italic serif text-2xl">
                Visual Representation
             </div>
        </div>

        <article className="prose prose-lg prose-stone max-w-none">
            <p className="lead text-xl text-gray-800">
                {entry.content}
            </p>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <h3 className="serif text-2xl font-bold mt-8 mb-4">The Methodology</h3>
            <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <blockquote className="border-l-4 border-[#2A3C24] pl-4 italic my-8 text-gray-600">
                "Innovation distinguishes between a leader and a follower."
            </blockquote>
            <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
        </article>
      </div>
    </div>
  );
}
