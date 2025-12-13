import React from 'react';
import { Download, ArrowUpRight, Mail, Linkedin, Github } from 'lucide-react';

export default function Resume() {
  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1A1A] pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-24 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div>
                    <h1 className="text-[12vw] md:text-[8rem] leading-[0.8] font-bold serif text-[#1A1A1A] tracking-tighter mb-6">
                        San Kala<span className="text-[#2A3C24]">.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-[#2A3C24] font-light serif italic max-w-xl">
                        Applied AI Researcher bridging the gap between circuit-level logic and embodied intelligence.
                    </p>
                </div>
                
                <div className="flex flex-col items-start md:items-end gap-4">
                     <button 
                        onClick={() => window.print()}
                        className="group flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-[#F5F2EB] rounded-full hover:bg-[#2A3C24] transition-all duration-300"
                    >
                        <span className="text-sm font-medium tracking-wide">Download CV</span>
                        <Download size={16} className="group-hover:translate-y-1 transition-transform"/>
                    </button>
                    
                    <div className="flex gap-4 mt-2">
                        <a href="mailto:sanjayanps@gmail.com" className="w-10 h-10 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#2A3C24] hover:text-[#F5F2EB] hover:border-transparent transition-all">
                            <Mail size={18} />
                        </a>
                        <a href="https://linkedin.com/in/sanjayanps" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#2A3C24] hover:text-[#F5F2EB] hover:border-transparent transition-all">
                            <Linkedin size={18} />
                        </a>
                        <a href="https://github.com/spsanps" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#2A3C24] hover:text-[#F5F2EB] hover:border-transparent transition-all">
                            <Github size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </header>

        {/* Section: Experience */}
        <section className="mb-20">
            <div className="flex items-baseline gap-4 mb-12 border-b border-[#2A3C24]/20 pb-4">
                <span className="font-mono text-xs text-[#2A3C24] uppercase tracking-widest">01</span>
                <h2 className="text-3xl font-bold serif">Experience</h2>
            </div>

            <div className="space-y-16">
                {/* Job 1 */}
                <div className="grid md:grid-cols-12 gap-8 group">
                    <div className="md:col-span-4">
                        <h3 className="text-2xl font-bold text-[#1A1A1A] group-hover:text-[#2A3C24] transition-colors">eBay</h3>
                        <p className="text-sm font-mono text-gray-500 mt-1">2023 — Present</p>
                    </div>
                    <div className="md:col-span-8">
                        <div className="text-xl serif italic text-[#2A3C24] mb-4">Applied Researcher</div>
                        <p className="text-gray-600 leading-relaxed mb-6 text-lg font-light">
                            Leading the development of GenAI extraction pipelines processing millions of listings daily. 
                            Replaced legacy NER systems with fine-tuned SLMs (Small Language Models), reducing inference costs by 40%.
                            Published internal research on "RAG at Scale" for e-commerce applications.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['GenAI', 'LLMs', 'Python', 'Search'].map(tag => (
                                <span key={tag} className="px-3 py-1 border border-[#2A3C24]/10 rounded-full text-xs text-[#2A3C24] uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Job 2 */}
                <div className="grid md:grid-cols-12 gap-8 group">
                    <div className="md:col-span-4">
                        <h3 className="text-2xl font-bold text-[#1A1A1A] group-hover:text-[#2A3C24] transition-colors">McAuley Lab</h3>
                        <p className="text-sm font-mono text-gray-500 mt-1">2021 — 2023</p>
                    </div>
                    <div className="md:col-span-8">
                        <div className="text-xl serif italic text-[#2A3C24] mb-4">Graduate Researcher</div>
                        <p className="text-gray-600 leading-relaxed mb-6 text-lg font-light">
                            Researched personalized recommendation systems using Graph Neural Networks.
                            Co-authored "ZINify", a system for transforming technical papers into accessible formats.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['GNNs', 'HCI', 'Research', 'PyTorch'].map(tag => (
                                <span key={tag} className="px-3 py-1 border border-[#2A3C24]/10 rounded-full text-xs text-[#2A3C24] uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Section: Education & Awards (Grid Layout) */}
        <div className="grid md:grid-cols-2 gap-16 mb-20">
            
            {/* Education */}
            <section>
                <div className="flex items-baseline gap-4 mb-12 border-b border-[#2A3C24]/20 pb-4">
                    <span className="font-mono text-xs text-[#2A3C24] uppercase tracking-widest">02</span>
                    <h2 className="text-3xl font-bold serif">Education</h2>
                </div>
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold">UC San Diego</h3>
                        <p className="serif italic text-[#2A3C24]">MS Computer Science</p>
                        <p className="text-sm font-mono text-gray-500 mt-1">2021 — 2023</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">NIT Karnataka</h3>
                        <p className="serif italic text-[#2A3C24]">B.Tech Electrical & Electronics</p>
                        <p className="text-sm font-mono text-gray-500 mt-1">2015 — 2019</p>
                    </div>
                </div>
            </section>

            {/* Awards */}
            <section>
                <div className="flex items-baseline gap-4 mb-12 border-b border-[#2A3C24]/20 pb-4">
                    <span className="font-mono text-xs text-[#2A3C24] uppercase tracking-widest">03</span>
                    <h2 className="text-3xl font-bold serif">Honors</h2>
                </div>
                <div className="space-y-6">
                    <div className="flex justify-between items-start group">
                        <div>
                            <h3 className="text-lg font-bold group-hover:text-[#2A3C24] transition-colors">NeurIPS 2025</h3>
                            <p className="text-gray-600">EAI Challenge Winner</p>
                        </div>
                        <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#2A3C24]" />
                    </div>
                    <div className="flex justify-between items-start group">
                        <div>
                            <h3 className="text-lg font-bold group-hover:text-[#2A3C24] transition-colors">UIST 2023</h3>
                            <p className="text-gray-600">Honorable Mention</p>
                        </div>
                        <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#2A3C24]" />
                    </div>
                    <div className="flex justify-between items-start group">
                        <div>
                            <h3 className="text-lg font-bold group-hover:text-[#2A3C24] transition-colors">eBay Hackathon</h3>
                            <p className="text-gray-600">1st Place (Global)</p>
                        </div>
                        <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#2A3C24]" />
                    </div>
                </div>
            </section>
        </div>

        {/* Section: Skills (Minimal List) */}
        <section>
            <div className="flex items-baseline gap-4 mb-12 border-b border-[#2A3C24]/20 pb-4">
                <span className="font-mono text-xs text-[#2A3C24] uppercase tracking-widest">04</span>
                <h2 className="text-3xl font-bold serif">Technical Arsenal</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Languages</h4>
                    <ul className="space-y-2 text-lg text-[#1A1A1A]">
                        <li>Python</li>
                        <li>C++</li>
                        <li>JavaScript</li>
                        <li>SQL</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Frameworks</h4>
                    <ul className="space-y-2 text-lg text-[#1A1A1A]">
                        <li>PyTorch</li>
                        <li>TensorFlow</li>
                        <li>React</li>
                        <li>Node.js</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Tools</h4>
                    <ul className="space-y-2 text-lg text-[#1A1A1A]">
                        <li>Docker</li>
                        <li>Kubernetes</li>
                        <li>AWS</li>
                        <li>Git</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Domains</h4>
                    <ul className="space-y-2 text-lg text-[#1A1A1A]">
                        <li>GenAI</li>
                        <li>NLP</li>
                        <li>Computer Vision</li>
                        <li>Robotics</li>
                    </ul>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
}
