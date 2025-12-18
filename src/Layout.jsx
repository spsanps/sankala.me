import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1A1A] font-sans selection:bg-[#2A3C24] selection:text-[#F5F2EB] overflow-x-hidden relative">

      {/* --- Grain Overlay --- */}
      <div className="fixed inset-0 pointer-events-none z-[60] opacity-[0.03] mix-blend-multiply"
           style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}>
      </div>

      {/* Inject Styles & Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap');

        :root {
          --bg-cream: #F5F2EB;
          --text-dark: #1A1A1A;
          --green-deep: #2A3C24;
          --green-sage: #8A9A85;
        }

        body {
          font-family: 'Inter', sans-serif;
        }

        .serif {
          font-family: 'Playfair Display', serif;
        }

        .reading-font {
          font-family: 'Crimson Pro', serif;
          font-size: 1.125rem;
          line-height: 1.75;
        }

        html {
          scroll-behavior: smooth;
        }

        .fade-in-up {
          animation: fadeInUp 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
          transform: translateY(40px);
        }

        .fade-in-delayed {
          animation: fadeInUp 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
          transform: translateY(40px);
          animation-delay: 0.2s;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .art-frame {
          position: relative;
          z-index: 10;
        }
        .art-frame::before {
          content: '';
          position: absolute;
          inset: 0;
          border: 1px solid rgba(42, 60, 36, 0.2);
          transform: translate(12px, 12px);
          z-index: -1;
          transition: transform 0.4s ease;
        }
        .art-frame:hover::before {
          transform: translate(6px, 6px);
        }

        .tape {
          position: absolute;
          height: 30px;
          width: 100px;
          background-color: rgba(255,255,255,0.4);
          transform: rotate(-5deg);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          z-index: 20;
          backdrop-filter: blur(2px);
        }

        .hover-card {
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px -10px rgba(42, 60, 36, 0.1);
        }

        /* Markdown Styles with Crimson Pro */
        .markdown {
          font-family: 'Crimson Pro', serif;
        }
        .markdown h1 {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          margin-top: 2rem;
          line-height: 1.2;
        }
        .markdown h2 {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 1rem;
          margin-top: 2rem;
          line-height: 1.3;
        }
        .markdown h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          margin-top: 1.5rem;
        }
        .markdown p {
          margin-bottom: 1.25rem;
          line-height: 1.8;
          font-size: 1.125rem;
          color: #374151;
        }
        .markdown ul, .markdown ol {
          margin-bottom: 1.25rem;
          margin-left: 1.5rem;
          line-height: 1.8;
        }
        .markdown li {
          margin-bottom: 0.5rem;
          font-size: 1.125rem;
          color: #374151;
        }
        .markdown code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
          font-family: 'Monaco', 'Menlo', monospace;
        }
        .markdown pre {
          background-color: #1a1a1a;
          color: #e5e7eb;
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin-bottom: 1.25rem;
          overflow-x: auto;
        }
        .markdown pre code {
          background: transparent;
          padding: 0;
        }
        .markdown blockquote {
          border-left: 4px solid #2A3C24;
          padding-left: 1rem;
          font-style: italic;
          color: #6b7280;
          margin-bottom: 1.25rem;
        }
        .markdown a {
          color: #2A3C24;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 2px;
        }
        .markdown a:hover {
          color: #1a2616;
        }
        .markdown table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.25rem;
        }
        .markdown th {
          background-color: #f3f4f6;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
        }
        .markdown td {
          border-top: 1px solid #e5e7eb;
          padding: 0.75rem;
        }
        .markdown strong {
          font-weight: 600;
          color: #1a1a1a;
        }
        .markdown hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 2rem 0;
        }
      `}</style>

      <Outlet />
      <ScrollRestoration />
    </div>
  );
}
