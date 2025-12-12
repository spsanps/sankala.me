import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, ArrowDown, ArrowRight, ArrowUpRight, PenTool, FlaskConical, Camera, MoveRight } from 'lucide-react';

export default function App() {
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

  const publicationsData = [
    {
      id: 1,
      title: "Axis Tilted2: Embodied Agents",
      venue: "NeurIPS 2025 Winner",
      year: "2025",
      description: "Developing state-of-the-art agentic AI that bridges the gap between foundation models and embodied interaction. Secured 1st Place globally in the EAI Challenge.",
      tags: ["Reinforcement Learning", "LLMs", "Robotics"],
      color: "bg-[#E8E6DE]"
    },
    {
      id: 2,
      title: "ZINify: Research to Zines",
      venue: "UIST 2023 Honorable Mention",
      year: "2023",
      description: "A novel HCI system leveraging LLMs to automatically transform dense technical papers into accessible, engaging 'zines', democratizing scientific knowledge.",
      tags: ["HCI", "Generative AI", "Visualization"],
      color: "bg-[#E3E7E2]"
    }
  ];

  const experimentsData = [
    {
      id: 101,
      title: "Audio Diffusion & S4",
      tag: "Deep Dive",
      description: "Exploring sequence modeling for high-fidelity audio generation. Visualizing the math behind diffusion processes.",
      color: "bg-[#F0F4EF]"
    },
    {
      id: 102,
      title: "GenAI Extraction at Scale",
      tag: "Case Study",
      description: "Replacing legacy NER systems with 1B parameter Small Language Models. Lessons from deploying to 1000s of TPS.",
      color: "bg-[#EAEAEA]"
    },
     {
      id: 103,
      title: "Wordle Solver: RL vs Greedy",
      tag: "Code & Analysis",
      description: "A comparative analysis of reinforcement learning agents versus greedy algorithms in solving Wordle efficiently.",
      color: "bg-[#F0F4EF]"
    }
  ];

  const notesData = [
    {
      id: 1,
      date: "Dec 2023",
      title: "Exploration vs. Exploitation",
      excerpt: "Why early career researchers should prioritize breadth over depth."
    },
    {
      id: 2,
      date: "Nov 2023",
      title: "The Art of K-Folding",
      excerpt: "A technical deep dive into the cross-validation strategy that won the eBay Challenge."
    },
    {
      id: 3,
      date: "Oct 2023",
      title: "On Trust in Teams",
      excerpt: "Reflections on leadership and boundaries during competitive hackathons."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1A1A] font-sans selection:bg-[#2A3C24] selection:text-[#F5F2EB] overflow-x-hidden relative">
      
      {/* --- Grain Overlay (The "Print" Feel) --- */}
      <div className="fixed inset-0 pointer-events-none z-[60] opacity-[0.03] mix-blend-multiply" 
           style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}>
      </div>

      {/* Inject Styles & Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
        
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

        /* Artistic Photo Frame */
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

        /* Tape Effect */
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
      `}</style>

      {/* --- NEW: Fixed Left Sidebar --- */}
      <div className="fixed left-0 top-0 h-full w-14 md:w-20 bg-[#F5F2EB] border-r border-[#2A3C24]/10 z-50 flex flex-col items-center justify-between py-12">
        {/* Top Monogram */}
        <div className="h-20 flex items-center justify-center">
            <span className="serif font-bold text-lg text-[#2A3C24] -rotate-90 whitespace-nowrap tracking-widest opacity-80 cursor-default">
                SPKS
            </span>
        </div>

        {/* Navigation Dots */}
        <div className="flex flex-col gap-8">
            {['home', 'about', 'publications', 'lab', 'notes'].map((item, idx) => (
            <a 
                key={item}
                href={`#${item}`}
                className="group relative flex items-center justify-center w-full"
                onClick={(e) => {
                e.preventDefault();
                document.getElementById(item).scrollIntoView({ behavior: 'smooth' });
                }}
            >
                <span className={`serif text-xs font-medium transition-all duration-500 absolute 
                    ${activeSection === item ? 'opacity-100 scale-125 font-bold text-[#2A3C24]' : 'opacity-40 text-gray-500 group-hover:opacity-100'}`}>
                {["I", "II", "III", "IV", "V"][idx]}
                </span>
                <span className="w-10 h-10 flex items-center justify-center z-10"></span> {/* Hit area */}
            </a>
            ))}
        </div>

        {/* Bottom Line */}
        <div className="h-20 flex flex-col items-center justify-end gap-4">
            <div className="w-[1px] h-16 bg-[#2A3C24]/20"></div>
        </div>
      </div>


      {/* --- Main Content Wrapper (Pushed Right) --- */}
      <div className="pl-14 md:pl-20 w-full relative">

        {/* --- Top Nav --- */}
        <nav className="fixed top-0 right-0 left-14 md:left-20 z-40 transition-all duration-300 bg-[#F5F2EB]/90 backdrop-blur-md border-b border-[#2A3C24]/5">
            <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-baseline">
            <div className="group cursor-default">
                <h1 className="serif text-2xl font-bold tracking-tight text-[#1A1A1A] group-hover:text-[#2A3C24] transition-colors">
                    San Kala
                </h1>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mt-0.5 group-hover:text-[#2A3C24] transition-colors">
                    S.P.K.S. — Portfolio
                </p>
            </div>
            <div className="flex gap-6 text-[#1A1A1A]">
                <a href="https://github.com/spsanps" target="_blank" rel="noreferrer" className="hover:text-[#2A3C24] hover:scale-110 transition-all"><Github size={20} strokeWidth={1.5} /></a>
                <a href="https://linkedin.com/in/sanjayanps" target="_blank" rel="noreferrer" className="hover:text-[#2A3C24] hover:scale-110 transition-all"><Linkedin size={20} strokeWidth={1.5} /></a>
                <a href="mailto:sanjayanps@gmail.com" className="hover:text-[#2A3C24] hover:scale-110 transition-all"><Mail size={20} strokeWidth={1.5} /></a>
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
                    <a 
                        href="#publications"
                        className="group flex items-center gap-4 bg-[#1A1A1A] text-[#F5F2EB] px-8 py-4 rounded-lg hover:bg-[#2A3C24] transition-all duration-300 mt-8"
                    >
                        <span className="font-medium tracking-wide">Explore Work</span>
                        <ArrowDown className="group-hover:translate-y-1 transition-transform" size={18} />
                    </a>
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
                    {experimentsData.map((exp) => (
                        <div key={exp.id} className="bg-white rounded-xl overflow-hidden hover-card cursor-pointer group flex flex-col h-full border border-gray-100">
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
                        </div>
                    ))}
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
                    {notesData.map((note) => (
                        <div key={note.id} className="bg-[#364930] p-8 rounded-xl hover:bg-[#42583C] transition-all cursor-pointer group border border-[#8A9A85]/20">
                            <span className="text-xs text-[#8A9A85] font-mono mb-4 block">{note.date}</span>
                            <h3 className="text-xl font-bold serif mb-3 group-hover:underline decoration-[#8A9A85] underline-offset-4">{note.title}</h3>
                            <p className="text-[#D1D9CE] text-sm leading-relaxed mb-6">
                                {note.excerpt}
                            </p>
                            <div className="flex items-center gap-2 text-sm font-medium text-[#8A9A85] group-hover:text-white transition-colors">
                                Read Entry <ArrowUpRight size={14} />
                            </div>
                        </div>
                    ))}
                    
                    {/* Medium CTA */}
                    <a href="#" className="border border-[#8A9A85]/50 p-8 rounded-xl hover:bg-[#1A2616] transition-all flex flex-col justify-center items-center text-center opacity-70 hover:opacity-100 group">
                        <PenTool size={32} className="mb-4 text-[#8A9A85]" />
                        <h3 className="text-lg font-medium serif">View Archive</h3>
                        <p className="text-xs mt-2 text-[#8A9A85]">All writings on Medium</p>
                    </a>
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
    </div>
  );
}