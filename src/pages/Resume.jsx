import React from 'react';
import { Download, ArrowUpRight, Mail, Linkedin, Github, ArrowLeft } from 'lucide-react';
import { SiKaggle } from 'react-icons/si';
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

        {/* Header */}
        <header className="mb-24 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div>
                    <h1 className="text-[12vw] md:text-[8rem] leading-[0.8] tracking-tighter mb-6">
                        <span className="serif italic font-light text-[#1A1A1A]">San </span>
                        <span className="font-bold text-[#2A3C24]">Kala<span className="text-[#1A1A1A]">.</span></span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-xl reading-font">
                        Applied AI Researcher • Kaggle Expert • LLM Systems
                    </p>
                </div>
                
                <div className="flex flex-col items-start md:items-end gap-4">
                     <a
                        href="/assets/ML_Resume_Updated___DEC25.pdf"
                        download="Sanjayan_Sreekala_Resume.pdf"
                        className="group flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-[#F5F2EB] rounded-full hover:bg-[#2A3C24] transition-all duration-300"
                    >
                        <span className="text-sm font-medium tracking-wide">Download CV</span>
                        <Download size={16} className="group-hover:translate-y-1 transition-transform"/>
                    </a>
                    
                    <div className="flex gap-4 mt-2">
                        <a href="mailto:san@sankala.me" className="w-10 h-10 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#2A3C24] hover:text-[#F5F2EB] hover:border-transparent transition-all">
                            <Mail size={18} />
                        </a>
                        <a href="https://linkedin.com/in/sanjayanps" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#2A3C24] hover:text-[#F5F2EB] hover:border-transparent transition-all">
                            <Linkedin size={18} />
                        </a>
                        <a href="https://github.com/spsanps" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#2A3C24] hover:text-[#F5F2EB] hover:border-transparent transition-all">
                            <Github size={18} />
                        </a>
                        <a href="https://kaggle.com/spsanps" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#2A3C24] hover:text-[#F5F2EB] hover:border-transparent transition-all">
                            <SiKaggle size={18} />
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
                        <p className="text-sm font-mono text-gray-500 mt-1">Apr 2024 — Present</p>
                    </div>
                    <div className="md:col-span-8">
                        <div className="text-xl text-[#2A3C24] mb-4 reading-font font-medium">Applied Researcher @ Knowledge Extraction</div>
                        <ul className="text-gray-600 leading-relaxed mb-6 text-base space-y-2 reading-font">
                            <li>• Driving multimodal structured data extraction using small multimodal generative models at 100M+ monthly scale, replacing NER dictionary based information extraction</li>
                            <li>• Built synthetic datasets with multimodal open source Large Language Models to evaluate services and train small models</li>
                            <li>• Automated Prompt Engineering Flows with Agents/Workflows increasing iteration velocity</li>
                        </ul>
                        <div className="flex flex-wrap gap-2">
                            {['GenAI', 'LLMs', 'Python', 'Small Language Models', 'NER'].map(tag => (
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
                        <h3 className="text-2xl font-bold text-[#1A1A1A] group-hover:text-[#2A3C24] transition-colors">eBay</h3>
                        <p className="text-sm font-mono text-gray-500 mt-1">Jun 2023 — Sep 2023</p>
                    </div>
                    <div className="md:col-span-8">
                        <div className="text-xl text-[#2A3C24] mb-4 reading-font font-medium">AI Applied Research Intern</div>
                        <ul className="text-gray-600 leading-relaxed mb-6 text-base space-y-2 reading-font">
                            <li>• Fine-tuned BERT models for extracting product attributes from unstructured text</li>
                            <li>• Prototyped LLM-based extraction systems and evaluated synthetic data generation approaches</li>
                        </ul>
                        <div className="flex flex-wrap gap-2">
                            {['BERT', 'PyTorch', 'Huggingface', 'NLP'].map(tag => (
                                <span key={tag} className="px-3 py-1 border border-[#2A3C24]/10 rounded-full text-xs text-[#2A3C24] uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Job 3 */}
                <div className="grid md:grid-cols-12 gap-8 group">
                    <div className="md:col-span-4">
                        <h3 className="text-2xl font-bold text-[#1A1A1A] group-hover:text-[#2A3C24] transition-colors">Texas Instruments</h3>
                        <p className="text-sm font-mono text-gray-500 mt-1">Jul 2019 — Jul 2022</p>
                    </div>
                    <div className="md:col-span-8">
                        <div className="text-xl text-[#2A3C24] mb-4 reading-font font-medium">ASIC Digital Design Engineer</div>
                        <ul className="text-gray-600 leading-relaxed mb-6 text-base space-y-2 reading-font">
                            <li>• ASIC design, Physical Design, and timing closure for Power Management ICs (PG-ed 4 designs)</li>
                        </ul>
                        <div className="flex flex-wrap gap-2">
                            {['ASIC', 'Digital Design', 'Physical Design', 'Verilog'].map(tag => (
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
                <div className="space-y-8 reading-font">
                    <div>
                        <h3 className="text-xl font-bold">University of California San Diego</h3>
                        <p className="text-[#2A3C24] font-medium">MS Computer Science & Engineering</p>
                        <p className="text-sm text-gray-600 mt-2">Specialization: AI/ML</p>
                        <p className="text-xs font-mono text-gray-400 mt-1">Courses: Probabilistic Reasoning, Reinforcement Learning, Deep Generative Models, Recommender Systems</p>
                        <p className="text-sm font-mono text-gray-500 mt-2">Sept 2022 — June 2024</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">National Institute of Technology Karnataka</h3>
                        <p className="text-[#2A3C24] font-medium">B.Tech Electrical & Electronics Engineering</p>
                        <p className="text-sm font-mono text-gray-500 mt-2">May 2015 — May 2019</p>
                    </div>
                </div>
            </section>

            {/* Awards */}
            <section>
                <div className="flex items-baseline gap-4 mb-12 border-b border-[#2A3C24]/20 pb-4">
                    <span className="font-mono text-xs text-[#2A3C24] uppercase tracking-widest">03</span>
                    <h2 className="text-3xl font-bold serif">Honors</h2>
                </div>
                <div className="space-y-6 reading-font">
                    <div className="flex justify-between items-start group">
                        <div>
                            <h3 className="text-lg font-bold group-hover:text-[#2A3C24] transition-colors">1st Place | NeurIPS 2025 EAI Challenge</h3>
                            <p className="text-sm text-gray-600">Winner of the Embodied Agent Interface Challenge (Team: Axis Tilted2) at the FMEA Workshop</p>
                            <p className="text-xs font-mono text-gray-400 mt-1">Dec 2025</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-start group">
                        <div>
                            <h3 className="text-lg font-bold group-hover:text-[#2A3C24] transition-colors">Honorable Mention | UIST 2023</h3>
                            <p className="text-sm text-gray-600">ZINify: Transforming Research Papers into Engaging Zines with LLMs</p>
                            <p className="text-xs font-mono text-gray-400 mt-1">Oct 2023</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-start group">
                        <div>
                            <h3 className="text-lg font-bold group-hover:text-[#2A3C24] transition-colors">1st Place | eBay 2022 University ML Challenge</h3>
                            <p className="text-sm text-gray-600">1st out of 591 teams</p>
                            <p className="text-xs font-mono text-gray-400 mt-1">Jan 2023</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-start group">
                        <div>
                            <h3 className="text-lg font-bold group-hover:text-[#2A3C24] transition-colors">Best Paper Award | IEEE DISCOVER</h3>
                            <p className="text-sm text-gray-600">Power Quality Event Classification Using LSTM</p>
                            <p className="text-xs font-mono text-gray-400 mt-1">Aug 2019</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-start group">
                        <div>
                            <h3 className="text-lg font-bold group-hover:text-[#2A3C24] transition-colors">Kaggle Competitions Expert</h3>
                            <p className="text-sm text-gray-600">Silver Medal: Top 5% (98th/2380 teams) | Bronze Medal: Top 7% (312th/4539 teams)</p>
                            <p className="text-xs font-mono text-gray-400 mt-1">2018</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>

      </div>
    </div>
  );
}
