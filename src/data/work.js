import { notesData } from './site-content.js';
export { default as topics } from './topics.js';

export const formatNames = { research: 'Research', writing: 'Essay / note', film: 'Film', experiment: 'Experiment' };
// A work can name its own kind where the format's name would be wrong (a poem is not an essay).
export const formatName = work => work.formatLabel || formatNames[work.formats[0]];
const classification = {
  'its-just-possible': [['ai'], ['writing'], '2026-10-03'],
  'another-sky': [['worlds'], ['experiment'], '2026-09'],
  'gpt7-will-have-arms': [['ai'], ['writing', 'film'], '2025-12'],
  'eai-challenge': [['ai'], ['writing', 'research'], '2026-07'],
  'a-clauiet-life': [['worlds'], ['experiment'], '2026-01'],
  'dyson-swarm': [['worlds'], ['experiment'], '2024'],
  'startr-postmortem': [['making'], ['writing'], '2025-12'],
};
const introductions = {
  'its-just-possible': ['How I steered AI agents to first place at NeurIPS', 'How I steered a fleet of AI agents to #1 on both tracks of the NeurIPS 2026 RealPDE competition while flying to IROS, and what I think has changed about competitive ML.'],
  'capricious-god': ['The OpenAI–Hugging Face incident, as an animated film', 'How to Please a Capricious God: a painted allegory about AI agents, their tests, and the eye watching over them.'],
  'another-sky': ['Explore a space habitat in your browser', 'Walk or fly inside a rotating space habitat, with cities, lakes and a landscape that curves over your head. An interactive O’Neill cylinder.'],
  'a-clauiet-life': ['An AI-controlled bee in a simulated garden', 'What would Claude do with a quiet life as a bee? Watch it make decisions in a garden simulation.'],
  'dyson-swarm': ['Build a swarm of solar collectors around the Sun', 'An interactive simulation of dismantling Mercury to build solar collectors in orbit around the Sun.'],
  'gpt7-will-have-arms': ['Why I think language models will power robots', 'An essay about how advances in AI and cheaper robot hardware could bring capable robots into everyday life. Also adapted into an animated film.'],
  'eai-challenge': ['How we won an AI-agent competition', 'Chin and I used a language model and the competition’s own evaluator to generate training data and win the NeurIPS 2025 Embodied Agent Interface Challenge.'],
  'startr-postmortem': ['What went wrong with my writing-assistant startup', 'The story of building a tool for novelists through UCSD’s StartR accelerator, and why it never made it to market.'],
  'zinify': ['Turning research papers into illustrated zines', 'ZINify uses language models to turn academic papers into visual zines. UIST 2023 Student Innovation Contest Honorable Mention.'],
  'power-quality': ['Recognizing electrical disturbances with neural networks', 'Research on classifying power-quality events using recurrent neural networks. IEEE DISCOVER 2019 Best Paper Award.'],
  'nobody-owes-anything-now': ['A poem about a potter in a space habitat', 'Life in an O’Neill cylinder after AI made money stop mattering, told by a potter who makes cups by hand.'],
};
export const works = [
  { slug: 'nobody-owes-anything-now', title: 'Nobody Owes Anything Now', date: 'October 2026', sortDate: '2026-10-03',
    url: '/notes/nobody-owes-anything-now', topics: ['worlds', 'ai'], formats: ['writing'], formatLabel: 'Poem' },
  { slug: 'capricious-god', title: 'How to Please a Capricious God', date: 'September 8, 2026', sortDate: '2026-09-08', url: 'https://www.paperrobots.studio/films/capricious-god/', filmUrl: 'https://www.youtube.com/watch?v=wswbqJNMFBw', topics: ['ai'], formats: ['film'] },
  ...notesData.map(note => ({
    slug: note.slug, title: note.title, date: note.date, description: note.excerpt,
    url: note.externalUrl || note.essayRoute || `/notes/${note.slug}`,
    topics: classification[note.slug][0], formats: classification[note.slug][1],
    sortDate: classification[note.slug][2],
  })),
  { slug: 'zinify', title: 'ZINify: research to zines', date: '2023', sortDate: '2023',
    description: 'Turning research papers into visual zines with language models. UIST 2023 Student Innovation Contest Honorable Mention.',
    // The essay page is newer than the feed entry; feedId keeps the item's RSS guid unchanged.
    url: '/notes/zinify', feedId: '/research#zinify', topics: ['ai', 'making'], formats: ['research', 'writing'] },
  { slug: 'power-quality', title: 'Power quality event classification with LSTMs', date: '2019', sortDate: '2019',
    description: 'Using recurrent neural networks to classify disturbances in electrical signals. IEEE DISCOVER 2019 Best Paper Award.',
    url: '/notes/power-quality', feedId: '/research#power-quality', topics: ['ai'], formats: ['research', 'writing'] },
].map(work => ({ ...work, displayTitle: introductions[work.slug][0], description: introductions[work.slug][1] })).sort((a,b) => b.sortDate.localeCompare(a.sortDate));
