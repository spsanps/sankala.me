import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, ArrowDown, ArrowRight, ArrowUpRight, PenTool, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { publicationsData, experimentsData, notesData } from '../data/content';

export default function Home() {
  const [activeSection, setActiveSection] = useState('home');

  // Smooth scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'publications', 'lab', 'notes'];
      const scrollPosition = window.scrollY + 300;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Slice data for preview
  const previewExperiments = experimentsData.slice(0, 3);
  const previewNotes = notesData.slice(0, 3);

  return (
    <>
      {/* --- Main Content Wrapper --- */}
      <div className="w-full relative">

        {/* --- Top Nav --- */}
        <nav className="fixed top-0 right-0 left-0 z-40 transition-all duration-300 bg-[#F5F2EB]/90 backdrop-blur-md border-b border-[#2A3C24]/5">
            <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
            <div className="group cursor-default">
                <h1 className="serif text-2xl font-bold tracking-tight text-[#1A1A1A] group-hover:text-[#2A3C24] transition-colors">
                    San Kala
                </h1>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mt-0.5 group-hover:text-[#2A3C24] transition-colors">
                    S.P.K.S. — Portfolio
                </p>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
                {['About', 'Publications', 'Lab', 'Notes'].map((item) => (
                    <a 
                        key={item}
                        href={`#${item.toLowerCase()}`}
                        className="text-sm font-medium text-[#1A1A1A] hover:text-[#2A3C24] hover:underline decoration-[#2A3C24]/30 underline-offset-4 transition-all"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(item.toLowerCase()).scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        {item}
                    </a>
                ))}
                <Link to="/resume" className="text-sm font-medium text-[#1A1A1A] hover:text-[#2A3C24] hover:underline decoration-[#2A3C24]/30 underline-offset-4 transition-all">Resume</Link>
            </div>

            {/* Social Icons (Mobile & Desktop) */}
            <div className="flex gap-4 text-[#1A1A1A] items-center pl-6 border-l border-[#2A3C24]/10">
                <a href="https://github.com/spsanps" target="_blank" rel="noreferrer" className="hover:text-[#2A3C24] hover:scale-110 transition-all"><Github size={18} strokeWidth={1.5} /></a>
                <a href="https://linkedin.com/in/sanjayanps" target="_blank" rel="noreferrer" className="hover:text-[#2A3C24] hover:scale-110 transition-all"><Linkedin size={18} strokeWidth={1.5} /></a>
                <a href="mailto:sanjayanps@gmail.com" className="hover:text-[#2A3C24] hover:scale-110 transition-all"><Mail size={18} strokeWidth={1.5} /></a>
            </div>
            </div>
        </nav>

        {/* --- Section I: Hero (Strong & Nice) --- */}
        <section id="home" className="min-h-screen flex items-center px-6 relative overflow-hidden pt-20">
            <div className="absolute top-0 right-0 w-[60vw] h-[80vh] bg-gradient-to-b from-[#E3E7E2] to-transparent rounded-bl-[200px] opacity-60 pointer-events-none -z-10"></div>
            
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-end pb-20">
                <div className="md:col-span-8 relative z-10 fade-in-up">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#2A3C24]/20 text-[#2A3C24] text-xs font-medium uppercase tracking-wider mb-8 bg-[#F5F2EB]/50 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-[#2A3C24] animate-pulse"></span>
                        Available for Research Collaboration
                    </div>
                    
                    <h1 className="text-[13vw] md:text-[8rem] leading-[0.85] text-[#1A1A1A] tracking-tighter mb-8">
                        <span className="block serif italic font-light text-[#2A3C24]">San</span>
                        <span className="block font-bold">Kala<span className="text-[#2A3C24]">.</span></span>
                    </h1>
                    
                    <p className="max-w-lg text-xl md:text-2xl text-gray-600 leading-relaxed font-light border-l-2 border-[#2A3C24] pl-6 ml-2">
                        Applied AI Researcher bridging the gap between <span className="text-[#2A3C24] font-medium">circuit-level logic</span> and <span className="text-[#2A3C24] font-medium">embodied intelligence</span>.
                    </p>
                </div>

                <div className="md:col-span-4 flex flex-col items-start md:items-end justify-end space-y-6 fade-in-delayed">
                    <div className="text-right hidden md:block">
                        <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">Current Focus</p>
                        <p className="serif text-xl text-[#2A3C24] italic">GenAI @ eBay</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">Latest Win</p>
                        <p className="serif text-xl text-[#2A3C24] italic">NeurIPS '25 EAI</p>
                    </div>
                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <a 
                            href="#publications"
                            className="group flex items-center justify-center md:justify-start gap-4 bg-[#1A1A1A] text-[#F5F2EB] px-8 py-4 rounded-lg hover:bg-[#2A3C24] transition-all duration-300 mt-8"
                        >
                            <span className="font-medium tracking-wide">Explore Work</span>
                            <ArrowDown className="group-hover:translate-y-1 transition-transform" size={18} />
                        </a>
                        <div className="flex gap-4 justify-center md:justify-end text-sm font-medium text-gray-500">
                            <a href="#lab" className="hover:text-[#2A3C24] transition-colors">The Lab</a>
                            <span>•</span>
                            <a href="#notes" className="hover:text-[#2A3C24] transition-colors">Field Notes</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- Section II: The Path (Collage with Photos) --- */}
        <section id="about" className="py-32 px-6 bg-[#E8E6DE] relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-12 gap-16 items-start">
                        
                        {/* Visual Collage Column */}
                        <div className="md:col-span-5 relative h-[600px] hidden md:block">
                            {/* Photo 1: Profile */}
                            <div className="absolute top-0 left-0 w-64 aspect-[3/4] bg-white p-3 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-500 z-10 art-frame">
                                <div className="tape -top-4 left-10"></div>
                                <div className="w-full h-full bg-gray-200 overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-500">
                                    {/* Placeholder for your profile picture */}
                                    <div className="w-full h-full bg-[#D1D5DB] flex items-center justify-center text-gray-500 text-xs">Profile Pic</div>
                                </div>
                                <p className="serif text-center mt-2 text-xs italic text-gray-400">San Jose, 2024</p>
                            </div>

                            {/* Photo 2: Event/Award */}
                            <div className="absolute bottom-10 right-10 w-72 aspect-video bg-white p-3 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500 z-20 art-frame">
                                <div className="tape -top-3 right-10"></div>
                                <div className="w-full h-full bg-[#2A3C24] overflow-hidden flex items-center justify-center text-[#F5F2EB] relative group">
                                    {/* Placeholder for award picture */}
                                    <div className="absolute inset-0 bg-[#2A3C24]"></div>
                                    <span className="serif italic text-lg relative z-10">UIST 2023</span>
                                </div>
                            </div>
                        </div>

                        {/* Content Column */}
                        <div className="md:col-span-7 space-y-12 pt-10">
                            <div>
                                <span className="text-[#2A3C24] font-mono text-xs uppercase tracking-widest mb-4 block">The Journey</span>
                                <h2 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] serif mb-8 leading-[1.1]">
                                    From electrical <br/>
                                    <span className="italic font-light text-[#2A3C24]">circuits</span> to neural <br/>
                                    <span className="italic font-light text-[#2A3C24]">networks</span>.
                                </h2>
                                <div className="space-y-6 text-lg text-gray-700 leading-relaxed max-w-2xl">
                                    <p>
                                        My path isn't typical. It started in the hardware labs of <span className="font-semibold text-[#1A1A1A]">NIT Karnataka</span>, grounding me in the physical reality of computing before I ever wrote a line of ML code.
                                    </p>
                                    <p>
                                        At <span className="font-semibold text-[#1A1A1A]">UC San Diego</span>, I refined my philosophy of "Exploration vs. Exploitation," working in top-tier labs like Prof. Julian McAuley's while competing at the highest levels of data science.
                                    </p>
                                </div>
                            </div>

                            {/* Minimal Timeline */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-[#2A3C24]/20 pt-8">
                                <div>
                                    <h3 className="serif text-xl mb-1">eBay</h3>
                                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Applied Researcher</p>
                                    <p className="text-sm text-gray-600">San Jose • Present</p>
                                </div>
                                <div>
                                    <h3 className="serif text-xl mb-1">NeurIPS</h3>
                                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">EAI Winner</p>
                                    <p className="text-sm text-gray-600">Vancouver • 2025</p>
                                </div>
                                <div>
                                    <h3 className="serif text-xl mb-1">UCSD</h3>
                                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">MS CS (AI/ML)</p>
                                    <p className="text-sm text-gray-600">San Diego • 2023</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </section>

        {/* --- Section III: Publications (Cleaner / Card Based) --- */}
        <section id="publications" className="py-32 px-6 bg-[#F5F2EB]">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-[#2A3C24] pb-6">
                    <h2 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] serif">Selected Publications<span className="text-[#2A3C24]">.</span></h2>
                    <p className="text-gray-600 max-w-sm mt-4 md:mt-0 text-right">
                        Major contributions and formal research papers.
                    </p>
                </div>

                <div className="space-y-12">
                    {publicationsData.map((item, index) => (
                        <div key={item.id} className={`group flex flex-col md:flex-row gap-8 items-stretch hover-card rounded-2xl overflow-hidden bg-white p-2 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                            
                            {/* Visual Block (Simpler) */}
                            <div className={`w-full md:w-1/2 min-h-[300px] ${item.color} rounded-xl relative flex items-center justify-center`}>
                                <div className="text-center p-8">
                                    <div className="serif italic text-3xl md:text-4xl text-[#2A3C24] mb-2">{item.title}</div>
                                    <div className="w-12 h-1 bg-[#2A3C24]/20 mx-auto mt-4"></div>
                                </div>
                            </div>

                            {/* Content Block */}
                            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                                <span className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">{item.venue}</span>
                                <h3 className="text-3xl font-bold serif text-[#1A1A1A] mb-4 group-hover:text-[#2A3C24] transition-colors">{item.title}</h3>
                                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                    {item.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-[#F5F2EB] text-[#2A3C24] text-xs rounded-full font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <button className="inline-flex items-center gap-2 text-[#2A3C24] font-semibold hover:underline">
                                    Read Paper <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* --- Section IV: The Lab (Personal Research / Visual Grid) --- */}
        <section id="lab" className="py-32 px-6 bg-[#F0F4EF]">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <FlaskConical className="mx-auto mb-4 text-[#2A3C24]" size={32} />
                    <h2 className="text-4xl md:text-5xl font-bold serif mb-4">The Lab</h2>
                    <p className="text-lg text-gray-600">
                        A space for personal experiments, unfinished ideas, and technical explorations. 
                        This is where I write about what I'm building right now, outside of formal publications.
                    </p>
                </div>

                {/* Grid of Visual Project Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {previewExperiments.map((exp) => (
                        <Link to={`/lab/${exp.id}`} key={exp.id} className="bg-white rounded-xl overflow-hidden hover-card cursor-pointer group flex flex-col h-full border border-gray-100">
                            {/* Image Area for "Showing" */}
                            <div className={`h-48 ${exp.color} relative flex items-center justify-center overflow-hidden`}>
                                {/* Placeholder for project image */}
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
                
                <div className="mt-12 text-center">
                    <Link to="/lab" className="inline-flex items-center gap-2 text-[#2A3C24] font-semibold hover:underline">
                        View All Experiments <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>

        {/* --- Section V: Notes (Simple Grid) --- */}
        <section id="notes" className="py-32 px-6 bg-[#2A3C24] text-[#F5F2EB]">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-16 serif text-center">
                    Field Notes
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                    {previewNotes.map((note) => (
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
                    
                    {/* View All CTA */}
                    <Link to="/notes" className="border border-[#8A9A85]/50 p-8 rounded-xl hover:bg-[#1A2616] transition-all flex flex-col justify-center items-center text-center opacity-70 hover:opacity-100 group">
                        <PenTool size={32} className="mb-4 text-[#8A9A85]" />
                        <h3 className="text-lg font-medium serif">View Archive</h3>
                        <p className="text-xs mt-2 text-[#8A9A85]">Read all field notes</p>
                    </Link>
                </div>
            </div>
        </section>

        {/* --- Footer --- */}
        <footer className="bg-[#1A1A1A] text-[#8A9A85] py-20 px-6 border-t border-[#333]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                <div>
                    <h2 className="serif text-3xl text-[#F5F2EB] mb-2">San Kala<span className="text-[#2A3C24]">.</span></h2>
                    <p className="text-sm font-mono opacity-60">Engineered in California.</p>
                </div>
                
                <div className="flex gap-8">
                    <a href="https://linkedin.com/in/sanjayanps" className="text-sm hover:text-[#F5F2EB] uppercase tracking-widest transition-colors">LinkedIn</a>
                    <a href="https://github.com/spsanps" className="text-sm hover:text-[#F5F2EB] uppercase tracking-widest transition-colors">GitHub</a>
                    <a href="https://kaggle.com/spsanps" className="text-sm hover:text-[#F5F2EB] uppercase tracking-widest transition-colors">Kaggle</a>
                    <a href="mailto:sanjayanps@gmail.com" className="text-sm hover:text-[#F5F2EB] uppercase tracking-widest transition-colors">Contact</a>
                </div>
            </div>
        </footer>
      </div>
    </>
  );
}
