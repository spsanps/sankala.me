import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, ArrowDown, ArrowRight, ArrowUpRight, PenTool, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { publicationsData, experimentsData, notesData } from '../data/content';

// Timeline data - automatically alternates left/right based on array index
const timelineData = [
  {
    year: "2025",
    month: "December",
    location: "San Diego, CA",
    category: "Competition Win",
    categoryColor: "#2A3C24",
    dotColor: "#2A3C24",
    title: "1st Place at NeurIPS EAI Challenge",
    description: "Won first place globally in the Embodied Agent Interface (EAI) Challenge at NeurIPS 2025 Foundation Models Meet Embodied Agents Workshop. Built systems that use LLMs to power embodied agents (robots) to reason about physical tasks.",
    image: "/images/awards/uist-2023-presentation.jpg",
    imageAlt: "EAI Challenge Presentation",
    links: [
      { label: "Paper", url: "https://openreview.net/pdf?id=gABfrJI5ni" },
      { label: "Challenge Site", url: "https://foundation-models-meet-embodied-agents.github.io/eai_challenge/" }
    ]
  },
  {
    year: "2024",
    month: "April",
    location: "San Jose, CA",
    category: "Career",
    categoryColor: "gray-400",
    dotColor: "gray-400",
    title: "Joined eBay",
    description: "Applied Researcher on the Knowledge Extraction team, building and researching production-grade LLM systems for information extraction at scale. Promoted in Oct 2025.",
    image: "/images/locations/ebay-headquarters.jpg",
    imageAlt: "eBay Headquarters",
    links: []
  },
  {
    year: "2024",
    month: "March",
    location: "San Diego, CA",
    category: "Education",
    categoryColor: "gray-400",
    dotColor: "#8A9A85",
    title: "Graduated from UCSD",
    description: "Master of Science in Computer Science at University of California San Diego. Research in Prof. Julian McAuley's group on AI music and LLMs. Teaching Assistant for graduate course on Recommender Systems and Data Mining.",
    image: "/images/team/ucsd-research-group-2023.jpg",
    imageAlt: "UCSD Research Group",
    links: []
  },
  {
    year: "2023",
    month: "October",
    location: "San Francisco, CA",
    category: "Publication",
    categoryColor: "#8A9A85",
    dotColor: "#8A9A85",
    title: "ZINify: Research to Zines",
    description: "Honorable Mention at UIST 2023 Student Innovation Contest. Early agentic systems (before agents were mainstream) using Claude 2 to transform research papers into visual zines.",
    image: "/images/awards/uist-2023-award-ceremony.jpg",
    imageAlt: "UIST 2023 Award Ceremony",
    links: [
      { label: "Paper", url: "https://dl.acm.org/doi/abs/10.1145/3586182.3625118" },
      { label: "Demo", url: "https://jaidevshriram.com/zinify-uist/" }
    ]
  },
  {
    year: "2023",
    month: "October",
    location: "San Diego, CA",
    category: "Entrepreneurship",
    categoryColor: "gray-400",
    dotColor: "#8A9A85",
    title: "UCSD StartR Rady Accelerator",
    description: "Accepted into UCSD StartR Rady FAWI23 accelerator program. My foray into entrepreneurship—learned a lot about startups and building products. Worked on a writing assistant for novelists, but it didn't pan out.",
    image: null,
    links: [
      { label: "Post-mortem", url: "/notes/startr-postmortem" }
    ]
  },
  {
    year: "2023",
    month: "June",
    location: "San Jose, CA",
    category: "Career",
    categoryColor: "#8A9A85",
    dotColor: "#8A9A85",
    title: "eBay Research Intern",
    description: "AI Applied Research Intern on the Knowledge Extraction team. First exposure to industry research and information extraction at scale.",
    image: "/images/locations/ebay-intern.jpg",
    imageAlt: "eBay Internship",
    links: []
  },
  {
    year: "2023",
    month: "January",
    location: "San Diego, CA",
    category: "Competition Win",
    categoryColor: "#8A9A85",
    dotColor: "#8A9A85",
    title: "1st Place: eBay ML Challenge",
    description: "Placed first out of 591 teams in named entity extraction from product titles using DeBERTa V3 with K-fold ensembling. This win led to a summer 2023 research internship at eBay.",
    image: null,
    links: [
      { label: "Winner Announcement", url: "https://innovation.ebayinc.com/stories/ebay-announces-winners-of-4th-annual-machine-learning-challenge/" }
    ]
  },
  {
    year: "2022",
    month: "September",
    location: "San Diego, CA",
    category: "Education",
    categoryColor: "gray-400",
    dotColor: "#8A9A85",
    title: "Started MS at UC San Diego",
    description: "Started Master of Science in Computer Science at University of California San Diego. Transitioned from hardware engineering to machine learning research.",
    image: "/images/education/ucsd-start.jpg",
    imageAlt: "UCSD Geisel Library",
    links: []
  },
  {
    year: "2019",
    month: "July",
    location: "Bangalore, India",
    category: "Career",
    categoryColor: "gray-400",
    dotColor: "#8A9A85",
    title: "Texas Instruments",
    description: "ASIC Digital Design Engineer. Spent COVID era here exploring chip design and finding a newfound respect for silicon.",
    image: null,
    links: []
  },
  {
    year: "2019",
    month: "May",
    location: "Karnataka, India",
    category: "Education",
    categoryColor: "gray-400",
    dotColor: "#8A9A85",
    title: "Undergrad in Electrical Engineering",
    description: "National Institute of Technology Karnataka, Electrical Engineering. Got into deep learning through Kaggle—Silver and Bronze medals. Major thesis on LSTM-based power quality event classification won best paper at IEEE conference. Explored my interest in astronomy and space through the Amateur Astronomy Club.",
    image: "/images/education/nitk-lab.jpg",
    imageAlt: "NITK Lab",
    links: []
  }
];

export default function Home() {
  const [activeSection, setActiveSection] = useState('home');

  // Smooth scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'timeline', 'lab', 'notes'];
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

  // Handle hash navigation on mount and hash changes
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
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
            <div className="max-w-7xl mx-auto px-6 py-4 md:py-6 flex justify-between items-center">
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
                {[
                    { label: 'About', id: 'about' },
                    { label: 'News', id: 'publications' },
                    { label: 'Lab', id: 'lab' },
                    { label: 'Writing', id: 'notes' }
                ].map((item) => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="text-sm font-medium text-[#1A1A1A] hover:text-[#2A3C24] hover:underline decoration-[#2A3C24]/30 underline-offset-4 transition-all"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(item.id).scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        {item.label}
                    </a>
                ))}
                <Link to="/resume" className="text-sm font-medium text-[#1A1A1A] hover:text-[#2A3C24] hover:underline decoration-[#2A3C24]/30 underline-offset-4 transition-all">Resume</Link>
            </div>

            {/* Social Icons (Mobile & Desktop) */}
            <div className="flex gap-4 text-[#1A1A1A] items-center pl-6 border-l border-[#2A3C24]/10">
                <a href="https://github.com/spsanps" target="_blank" rel="noreferrer" className="hover:text-[#2A3C24] hover:scale-110 transition-all"><Github size={18} strokeWidth={1.5} /></a>
                <a href="https://linkedin.com/in/sanjayanps" target="_blank" rel="noreferrer" className="hover:text-[#2A3C24] hover:scale-110 transition-all"><Linkedin size={18} strokeWidth={1.5} /></a>
                <a href="mailto:san@sankala.me" className="hover:text-[#2A3C24] hover:scale-110 transition-all"><Mail size={18} strokeWidth={1.5} /></a>
            </div>
            </div>
        </nav>

        {/* Spacer for fixed header */}
        <div className="h-20 md:h-20"></div>

        {/* --- Section I: Hero (Strong & Nice) --- */}
        <section id="home" className="min-h-screen flex items-center px-6 relative overflow-hidden -mt-12">
            <div className="absolute top-0 right-0 w-[60vw] h-[80vh] bg-gradient-to-b from-[#E3E7E2] to-transparent rounded-bl-[200px] opacity-60 pointer-events-none -z-10"></div>
            
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-end pb-20">
                <div className="md:col-span-8 relative z-10 fade-in-up">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#2A3C24]/20 text-[#2A3C24] text-xs font-medium tracking-wide mb-8 bg-[#F5F2EB]/50 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2A3C24] animate-pulse"></span>
                        San Francisco Bay Area
                    </div>

                    <h1 className="text-[13vw] md:text-[8rem] leading-[0.85] text-[#1A1A1A] tracking-tighter mb-8">
                        <span className="block serif italic font-light text-[#2A3C24]">San</span>
                        <span className="block font-bold">Kala<span className="text-[#2A3C24]">.</span></span>
                    </h1>

                    <p className="max-w-lg text-xl md:text-2xl text-gray-600 leading-relaxed font-light border-l-2 border-[#2A3C24] pl-6 ml-2">
                        AI researcher working on <span className="text-[#2A3C24] font-medium">intelligent agents</span> and <span className="text-[#2A3C24] font-medium">generative information extraction</span>.
                    </p>
                </div>

                <div className="md:col-span-4 flex flex-col items-start md:items-end justify-end space-y-6 fade-in-delayed">
                    <div className="text-right hidden md:block">
                        <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">Current Focus</p>
                        <p className="serif text-xl text-[#2A3C24] italic">GenAI @ eBay</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">Latest Win</p>
                        <a href="#timeline" className="serif text-xl text-[#2A3C24] italic hover:underline cursor-pointer">NeurIPS '25 EAI</a>
                    </div>
                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <a
                            href="#timeline"
                            className="group flex items-center justify-center md:justify-start gap-4 bg-[#1A1A1A] text-[#F5F2EB] px-8 py-4 rounded-lg hover:bg-[#2A3C24] transition-all duration-300 mt-8"
                        >
                            <span className="font-medium tracking-wide">Explore Work</span>
                            <ArrowDown className="group-hover:translate-y-1 transition-transform" size={18} />
                        </a>
                        <div className="flex gap-4 justify-center md:justify-end text-sm font-medium text-gray-500">
                            <a href="#lab" className="hover:text-[#2A3C24] transition-colors">The Lab</a>
                            <span>•</span>
                            <a href="#notes" className="hover:text-[#2A3C24] transition-colors">Writing</a>
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
                                    <img src="/images/profile/headshot-professional.jpg" alt="San Kala" className="w-full h-full object-cover" />
                                </div>
                                <p className="serif text-center mt-2 text-xs italic text-gray-400">San Jose, 2024</p>
                            </div>

                            {/* Photo 2: Event/Award */}
                            <div className="absolute bottom-10 right-10 w-72 aspect-video bg-white p-3 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500 z-20 art-frame">
                                <div className="tape -top-3 right-10"></div>
                                <div className="w-full h-full overflow-hidden relative group">
                                    <img src="/images/awards/uist-2023-award-ceremony.jpg" alt="UIST 2023 Award" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                </div>
                            </div>
                        </div>

                        {/* Content Column */}
                        <div className="md:col-span-7 space-y-12 pt-10">
                            <div>
                                <span className="text-[#2A3C24] font-mono text-xs uppercase tracking-widest mb-4 block">About</span>
                                <h2 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] serif mb-8 leading-[1.1]">
                                    Follow the <br/>
                                    <span className="italic font-light text-[#2A3C24]">reward signal</span>
                                </h2>
                                <div className="space-y-4 text-lg text-gray-700 leading-relaxed max-w-2xl reading-font">
                                    <p>
                                        Pick hard things you want to understand, build until they're real. Started in <span className="text-[#1A1A1A]">Electrical Engineering</span>, found ML through Kaggle, designed <span className="text-[#1A1A1A]">ASICs</span> at <a href="https://www.ti.com/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">Texas Instruments</a>.
                                    </p>
                                    <p>
                                        After DALL·E 3, singularity looked underway—shifted to CS at <a href="https://ucsd.edu/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">UCSD</a>. Now building production <span className="text-[#1A1A1A]">LLM extraction systems</span> at <a href="https://www.ebayinc.com/company/" target="_blank" rel="noopener noreferrer" className="text-[#2A3C24] hover:underline">eBay</a>.
                                    </p>
                                </div>
                            </div>

                            {/* Minimal Timeline */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-[#2A3C24]/20 pt-8">
                                <div>
                                    <a href="https://www.ebayinc.com/company/" target="_blank" rel="noopener noreferrer" className="serif text-xl mb-1 text-[#2A3C24] hover:underline block">eBay</a>
                                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Applied Researcher</p>
                                    <p className="text-sm text-gray-600">San Jose • Present</p>
                                </div>
                                <div>
                                    <a href="https://ucsd.edu/" target="_blank" rel="noopener noreferrer" className="serif text-xl mb-1 text-[#2A3C24] hover:underline block">UCSD</a>
                                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">MS CS (AI/ML)</p>
                                    <p className="text-sm text-gray-600">San Diego • 2024</p>
                                </div>
                                <div>
                                    <a href="https://www.ti.com/" target="_blank" rel="noopener noreferrer" className="serif text-xl mb-1 text-[#2A3C24] hover:underline block">TI</a>
                                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">ASIC Engineer</p>
                                    <p className="text-sm text-gray-600">Bangalore • 2022</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </section>

        {/* --- Section III: Timeline / News --- */}
        <section id="timeline" className="py-32 px-6 bg-[#F5F2EB]">
            <div className="max-w-5xl mx-auto">
                <div className="mb-24 text-center">
                    <h2 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] serif mb-4">News & Milestones</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto reading-font">
                        Recent publications, projects, and career highlights.
                    </p>
                </div>

                {/* Elegant Minimalist Timeline */}
                <div className="relative">
                    {/* Center line */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#2A3C24]/20 via-[#2A3C24]/10 to-transparent transform -translate-x-1/2"></div>

                    <div className="space-y-0">
                        {timelineData.map((item, index) => {
                            const isRight = index % 2 === 0; // Even indices go RIGHT, odd go LEFT
                            const isLast = index === timelineData.length - 1;

                            return (
                                <div
                                    key={index}
                                    className={`relative grid md:grid-cols-2 gap-16 py-12 ${!isLast ? 'border-b border-[#2A3C24]/5' : ''} group`}
                                >
                                    {isRight ? (
                                        // RIGHT SIDE LAYOUT: Date left, Content right
                                        <>
                                            {/* Left: Date & Meta */}
                                            <div className="hidden md:flex flex-col justify-center pr-16 text-right">
                                                <span className={`text-4xl md:text-5xl font-bold serif text-[${item.categoryColor}]/10 group-hover:text-[${item.categoryColor}]/20 transition-colors mb-2`}>
                                                    {item.year}
                                                </span>
                                                <div className="space-y-1">
                                                    <span className="block font-mono text-xs text-[#2A3C24] font-medium">{item.month}</span>
                                                    <span className="block text-xs text-gray-400">{item.location}</span>
                                                </div>
                                            </div>
                                            {/* Center dot */}
                                            <div className={`absolute left-0 md:left-1/2 top-1/2 w-2 h-2 rounded-full bg-[${item.dotColor}] transform md:-translate-x-1/2 -translate-y-1/2 z-10 group-hover:scale-[2] transition-transform`}></div>
                                            {/* Right: Content */}
                                            <div className="pl-6 md:pl-16">
                                                <span className={`inline-block text-[9px] uppercase tracking-[0.15em] font-bold text-[${item.categoryColor}] mb-3`}>
                                                    {item.category}
                                                </span>
                                                <h3 className="text-3xl md:text-4xl font-bold serif mb-4 text-[#1A1A1A] leading-tight group-hover:text-[#2A3C24] transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-gray-600 reading-font leading-relaxed text-base mb-6">
                                                    {item.description}
                                                </p>
                                                {item.image && (
                                                    <div className="w-full md:w-80 aspect-video overflow-hidden rounded-lg border-2 border-[#2A3C24]/10 group-hover:border-[#2A3C24]/30 transition-colors mb-6">
                                                        <img src={item.image} alt={item.imageAlt} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                                    </div>
                                                )}
                                                {item.links.length > 0 && (
                                                    <div className="flex gap-4 flex-wrap">
                                                        {item.links.map((link, i) => (
                                                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#2A3C24] font-medium hover:underline inline-flex items-center gap-1.5">
                                                                {link.label} <ArrowUpRight size={13} />
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        // LEFT SIDE LAYOUT: Content left, Date right
                                        <>
                                            {/* Left: Content */}
                                            <div className="pl-6 md:pl-0 md:pr-16 md:text-right order-2 md:order-1">
                                                <span className={`inline-block text-[9px] uppercase tracking-[0.15em] font-bold text-${item.categoryColor} mb-3`}>
                                                    {item.category}
                                                </span>
                                                <h3 className="text-3xl md:text-4xl font-bold serif mb-4 text-[#1A1A1A] leading-tight group-hover:text-[#2A3C24] transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-gray-600 reading-font leading-relaxed text-base mb-6">
                                                    {item.description}
                                                </p>
                                                {item.image && (
                                                    <div className="mb-6 mt-6 md:flex md:justify-end">
                                                        <div className="w-full md:w-80 aspect-video overflow-hidden rounded-lg border-2 border-[#2A3C24]/10 group-hover:border-[#2A3C24]/30 transition-colors">
                                                            <img src={item.image} alt={item.imageAlt} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                                        </div>
                                                    </div>
                                                )}
                                                {item.links.length > 0 && (
                                                    <div className="flex gap-4 flex-wrap md:justify-end">
                                                        {item.links.map((link, i) => (
                                                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#2A3C24] font-medium hover:underline inline-flex items-center gap-1.5">
                                                                {link.label} <ArrowUpRight size={13} />
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Center dot */}
                                            <div className={`absolute left-0 md:left-1/2 top-1/2 w-2 h-2 rounded-full bg-[${item.dotColor}] transform md:-translate-x-1/2 -translate-y-1/2 z-10 group-hover:scale-[2] transition-transform`}></div>
                                            {/* Right: Date */}
                                            <div className="hidden md:flex flex-col justify-center pl-16 text-left order-1 md:order-2">
                                                <span className={`text-4xl md:text-5xl font-bold serif text-[${item.categoryColor}]/10 group-hover:text-[${item.categoryColor}]/20 transition-colors mb-2`}>
                                                    {item.year}
                                                </span>
                                                <div className="space-y-1">
                                                    <span className="block font-mono text-xs text-[#2A3C24] font-medium">{item.month}</span>
                                                    <span className="block text-xs text-gray-400">{item.location}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-20 text-center pt-12 border-t border-[#2A3C24]/10">
                    <Link to="/resume" className="inline-flex items-center gap-2 text-[#2A3C24] font-semibold hover:underline text-base">
                        View Full Resume & CV <ArrowRight size={16} />
                    </Link>
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
                {previewExperiments.length > 0 ? (
                    <>
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
                    </>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-xl text-gray-500 serif italic">Coming Soon</p>
                        <p className="text-gray-400 mt-4 max-w-md mx-auto reading-font">
                            New experiments and technical explorations will be shared here.
                        </p>
                    </div>
                )}
            </div>
        </section>

        {/* --- Section V: Writing (Essays & Notes) --- */}
        <section id="notes" className="py-32 px-6 bg-[#2A3C24] text-[#F5F2EB]">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold serif mb-4">
                        Writing
                    </h2>
                    <p className="text-lg text-[#D1D9CE] max-w-2xl mx-auto">
                        Long-form essays, technical deep dives, and shorter notes on AI, robotics, and other explorations.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {previewNotes.map((note) => {
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
                    
                    {/* View All CTA */}
                    <Link to="/notes" className="border border-[#8A9A85]/50 p-8 rounded-xl hover:bg-[#1A2616] transition-all flex flex-col justify-center items-center text-center opacity-70 hover:opacity-100 group">
                        <PenTool size={32} className="mb-4 text-[#8A9A85]" />
                        <h3 className="text-lg font-medium serif">View Archive</h3>
                        <p className="text-xs mt-2 text-[#8A9A85]">Read all writing</p>
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
                    <a href="mailto:san@sankala.me" className="text-sm hover:text-[#F5F2EB] uppercase tracking-widest transition-colors">Contact</a>
                </div>
            </div>
        </footer>
      </div>
    </>
  );
}
