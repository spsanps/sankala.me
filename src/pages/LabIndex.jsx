import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, FlaskConical } from 'lucide-react';
import { experimentsData } from '../data/content';

export default function LabIndex() {
  return (
    <div className="min-h-screen bg-[#F0F4EF] text-[#1A1A1A] pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/#lab" className="inline-flex items-center gap-2 text-[#2A3C24] hover:underline mb-12 opacity-60 hover:opacity-100 transition-opacity">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="mb-16 text-center max-w-3xl mx-auto">
            <FlaskConical className="mx-auto mb-4 text-[#2A3C24]" size={32} />
            <h1 className="text-4xl md:text-6xl font-bold serif mb-6">The Lab Archive</h1>
            <p className="text-lg text-gray-600">
                A complete collection of experiments, prototypes, and technical explorations.
            </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {experimentsData.map((exp) => (
                <Link to={`/lab/${exp.id}`} key={exp.id} className="bg-white rounded-xl overflow-hidden hover-card cursor-pointer group flex flex-col h-full border border-gray-100">
                    <div className={`h-48 ${exp.color} relative flex items-center justify-center overflow-hidden`}>
                        <span className="serif italic text-[#2A3C24]/40 text-2xl group-hover:scale-110 transition-transform duration-500">
                            {exp.tag}
                        </span>
                    </div>
                    
                    <div className="p-8 flex-1 flex flex-col">
                        <h3 className="text-2xl font-bold serif mb-3 text-[#1A1A1A] group-hover:text-[#2A3C24] transition-colors">
                            {exp.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                            {exp.description}
                        </p>
                        <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-sm font-medium text-[#2A3C24]">
                            <span>Read Log</span>
                            <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
