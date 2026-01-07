export const publicationsData = [
    {
      id: 1,
      title: "Axis Tilted2: Embodied Agents",
      venue: "NeurIPS 2025 Winner",
      year: "2025",
      description: "1st place in the Embodied Agent Interface challenge. Designed agents that reason about physical tasks in simulated environments, evaluated on goal interpretation, subgoal decomposition, and action sequencing.",
      tags: ["Reinforcement Learning", "LLMs", "Robotics"],
      color: "bg-[#E8E6DE]"
    },
    {
      id: 2,
      title: "ZINify: Research to Zines",
      venue: "UIST 2023 Honorable Mention",
      year: "2023",
      description: "Won Honorable Mention (People's Choice). Automatically converts academic papers into visual zines using LLMs and text-to-image models. Makes research more engaging and helps papers stand out.",
      tags: ["HCI", "Generative AI", "Visualization"],
      color: "bg-[#E3E7E2]"
    }
  ];

export const experimentsData = [
  // Lab content coming soon - placeholder experiments removed
];

export const notesData = [
    {
      id: 1,
      type: "essay",
      slug: "gpt7-will-have-arms",
      date: "Dec 2025",
      title: "GPT-7 Will Have Arms",
      excerpt: "The Coming Convergence of Foundation Models and Robotics",
      readTime: "28 min read",
      tags: ["AI", "Robotics", "Economics", "Foundation Models"],
      // This links to the essay in essaysData - use /essays/ route
      isEssayLink: true,
      essayRoute: "/essays/gpt7-will-have-arms"
    },
    {
      id: 3,
      type: "toy",
      slug: "a-clauiet-life",
      date: "Jan 2026",
      title: "A Clauiet Life",
      excerpt: "What if Claude had a quiet life as a bee? A meditative pixel simulation made entirely with Claude Code.",
      readTime: "Interactive",
      tags: ["Claude", "Generative Art", "Simulation"],
      isExternalLink: true,
      externalUrl: "/toys/bee-sim/index.html"
    },
    {
      id: 2,
      type: "note",
      slug: "startr-postmortem",
      date: "Dec 2025",
      title: "StartR Accelerator: A Post-Mortem",
      excerpt: "Lessons learned from building a writing assistant for novelists that didn't make it to market.",
      readTime: "5 min read",
      tags: ["Entrepreneurship", "Product", "Failure"],
      originalDate: "Oct 2023",
      content: `
# StartR Accelerator: A Post-Mortem

*Originally pitched Oct 2023, published Dec 2025*

Fall 2023, I got accepted into UCSD's StartR Rady accelerator with "Glyp"—an AI platform for long-form content writing, targeting novelists and creative writers.

## The Pitch

I'd kept this digital notebook for years—random story ideas, settings, character concepts. When ChatGPT came out, I started using it to flesh out chapters from these notes. It worked surprisingly well. Since I was already doing LLM research at UCSD, building a product around this felt like a natural extension of what I was already thinking about.

The vision for Glyp went beyond being just another AI writing assistant. I wanted to build a platform where people could share, edit, and collaborate on AI-written content. The idea was that if AI made writing more accessible, you could bring readers into the creative process itself—not just as consumers but as participants. Democratizing storytelling, basically.

Looking back, I think I was excited about the technology and assumed the product would follow. That's not how it works.

## What Went Wrong

I had this sense that AI + products was going to be huge in 2023, and I wasn't wrong about that—but I completely misread where the action would actually be. For B2C, the momentum was in mobile apps like [Cal AI](https://cal.ai/), while I was still optimizing for web. Wrong medium, wrong form factor. By the time I realized this, competitors had already established themselves.

I also wasn't really in [founder mode](https://paulgraham.com/foundermode.html). Instead of executing on one clear direction, I kept getting pulled toward different ideas—tweaking features, exploring new angles, second-guessing the core product. No real conviction, no committed path forward.

Meanwhile, competitors like [Sudowrite](https://sudowrite.com/) and [Jenni AI](https://jenni.ai/) had picked specific niches and stuck with them. Watching their progress over the same timeframe taught me more about what building a product actually involves than any course could—getting users, growing users, keeping users, making money. I was worrying about the wrong things entirely. I kept thinking about features when I should have been thinking about distribution.

Later [Rohan](https://www.linkedin.com/in/rohan-mishra-cs/) and I tried pivoting to video content with [Glyp Podcasts](https://www.youtube.com/@glyp.podcasts), thinking it was a larger TAM play. Same fundamental problems though—too late, poorly executed, no real conviction behind the pivot. Just trying things instead of building toward something.

## What I Learned

Making something that works isn't the same as making something people use. You can build the best product in the world, but if nobody knows it exists or doesn't understand why they need it, it doesn't matter. Distribution matters way more than features. This sounds obvious when you say it, but you don't really internalize it until you've built something nobody finds.

The competitors who succeeded weren't necessarily smarter or more technical than I was. They were just more focused. They picked something specific, committed to it, and executed consistently. I was trying to figure out what to build while they were already building.

This was my first real attempt at entrepreneurship. It didn't work out, but I'd do it again. You learn different things from failing at your own thing than you do from anything else—about yourself, about building products, about what actually matters when you're trying to create something people want.
      `
    }
  ];

export const essaysData = [
  {
    id: 1001,
    slug: "gpt7-will-have-arms",
    title: "GPT-7 Will Have Arms",
    subtitle: "The Coming Convergence of Foundation Models and Robotics",
    secondarySubtitle: "& Why the Scaling Believers Should Apply Their Own Logic to Robotics",
    date: "December 2025",
    author: "San Sankala",
    readTime: "28 min read",
    tags: ["AI", "Robotics", "Economics", "Foundation Models"],
    category: "deep-dive",
    color: "bg-[#F5F2EB]",

    // Reference to essay content - will be imported dynamically
    getContent: async () => {
      const { gpt7EssayContent } = await import('./essays/gpt7-content.js');
      return gpt7EssayContent;
    }
  }
];
