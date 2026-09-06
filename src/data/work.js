import { notesData } from './site-content.js';
export { default as topics } from './topics.js';

export const formatNames = { research: 'Research', writing: 'Essay / note', film: 'Film', experiment: 'Experiment' };
const classification = {
  'another-sky': [['worlds'], ['experiment'], '2026-09'],
  'gpt7-will-have-arms': [['ai'], ['writing', 'film'], '2025-12'],
  'eai-challenge': [['ai'], ['writing', 'research'], '2026-07'],
  'a-clauiet-life': [['worlds'], ['experiment'], '2026-01'],
  'dyson-swarm': [['worlds'], ['experiment'], '2024'],
  'startr-postmortem': [['making'], ['writing'], '2025-12'],
};
export const works = [
  ...notesData.map(note => ({
    slug: note.slug, title: note.title, date: note.date, description: note.excerpt,
    url: note.externalUrl || note.essayRoute || `/notes/${note.slug}`,
    topics: classification[note.slug][0], formats: classification[note.slug][1],
    sortDate: classification[note.slug][2],
  })),
  { slug: 'zinify', title: 'ZINify: research to zines', date: '2023', sortDate: '2023',
    description: 'Turning research papers into visual zines with language models. UIST 2023 Student Innovation Contest Honorable Mention.',
    url: '/research#zinify', topics: ['ai', 'making'], formats: ['research'] },
  { slug: 'power-quality', title: 'Power quality event classification with LSTMs', date: '2019', sortDate: '2019',
    description: 'Using recurrent neural networks to classify disturbances in electrical signals. IEEE DISCOVER 2019 Best Paper Award.',
    url: '/research#power-quality', topics: ['ai'], formats: ['research'] },
].sort((a,b) => b.sortDate.localeCompare(a.sortDate));
