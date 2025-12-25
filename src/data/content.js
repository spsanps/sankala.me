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
      date: "Dec 2024",
      title: "GPT-7 Will Have Arms",
      excerpt: "The Coming Convergence of Foundation Models and Robotics",
      readTime: "45 min read",
      tags: ["AI", "Robotics", "Geopolitics", "Foundation Models"],
      // This links to the essay in essaysData - use /essays/ route
      isEssayLink: true,
      essayRoute: "/essays/gpt7-will-have-arms"
    }
  ];

export const essaysData = [
  {
    id: 1001,
    slug: "gpt7-will-have-arms",
    title: "GPT-7 Will Have Arms",
    subtitle: "The Coming Convergence of Foundation Models and Robotics",
    date: "December 2025",
    author: "San Sankala",
    readTime: "45 min read",
    tags: ["AI", "Robotics", "Geopolitics", "Foundation Models"],
    category: "deep-dive",
    color: "bg-[#F5F2EB]",

    // Reference to essay content - will be imported dynamically
    getContent: async () => {
      const { gpt7EssayContent } = await import('./essays/gpt7-content.js');
      return gpt7EssayContent;
    }
  }
];
