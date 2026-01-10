import React from 'react';
import { ArrowLeft, Construction } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Resume() {
  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1A1A] pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#2A3C24] hover:text-[#1A1A1A] transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>

        {/* WIP Content */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Construction size={64} className="text-[#2A3C24] mb-8" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="serif italic font-light">Work in </span>
            <span className="text-[#2A3C24]">Progress</span>
          </h1>
          <p className="text-xl text-gray-600 reading-font max-w-md">
            This page is currently being updated. Check back soon!
          </p>
        </div>

      </div>
    </div>
  );
}
