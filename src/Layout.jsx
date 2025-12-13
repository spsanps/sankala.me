import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1A1A] font-sans selection:bg-[#2A3C24] selection:text-[#F5F2EB] overflow-x-hidden relative">
      
      {/* --- Grain Overlay (The "Print" Feel) --- */}
      <div className="fixed inset-0 pointer-events-none z-[60] opacity-[0.03] mix-blend-multiply" 
           style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}>
      </div>

      {/* Inject Styles & Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
      `}</style>

      <Outlet />
      <ScrollRestoration />
    </div>
  );
}
