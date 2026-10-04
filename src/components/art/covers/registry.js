// One code-drawn cover per work, keyed by the work slugs in src/data/work.js.
// Static prints of every cover live in public/images/covers/ (npm run render:covers).
export const coverLoaders = {
  'capricious-god': () => import('./capricious-god.js'),
  'another-sky': () => import('./another-sky.js'),
  'eai-challenge': () => import('./eai-challenge.js'),
  'a-clauiet-life': () => import('./a-clauiet-life.js'),
  'gpt7-will-have-arms': () => import('./gpt7-will-have-arms.js'),
  'startr-postmortem': () => import('./startr-postmortem.js'),
  'dyson-swarm': () => import('./dyson-swarm.js'),
  'zinify': () => import('./zinify.js'),
  'power-quality': () => import('./power-quality.js'),
  'nobody-owes-anything-now': () => import('./nobody-owes-anything-now.js'),
  'its-just-possible': () => import('./its-just-possible.js'),
  'iros-2026-origami': () => import('./iros-2026-origami.js'),
};

export const coverDescriptions = {
  'capricious-god': 'A gouache film poster: a giant red eye on a dark ground, with a small green figure standing on its lower lid.',
  'another-sky': 'An art-deco travel poster looking down the inside of an O’Neill cylinder, fields and windows curving toward a far sun.',
  'eai-challenge': 'A Swiss-style poster in yellow and black: a score climbing in steps toward the evaluator’s line.',
  'a-clauiet-life': 'A woodblock print of cosmos flowers on washi paper, with a small bee.',
  'gpt7-will-have-arms': 'A cobalt linocut paperback cover of a folded-paper robot with six arms.',
  'startr-postmortem': 'A letterpress broadside for Glyp, a writing assistant for novelists, annotated “post-mortem” in blue pencil.',
  'dyson-swarm': 'A screenprint of solar collectors orbiting an orange sun while Mercury is taken apart.',
  'zinify': 'A pink and blue risograph zine cover: a research paper turning into a zine.',
  'power-quality': 'A technical journal cover with an oscilloscope showing a sagging waveform.',
  'iros-2026-origami': 'A page of origami instructions, step 2 of 5: a square sheet with both top corners folded to the centre, a robot hand pressing the centre crease while the other pins the sheet, with dashed and dot-dash fold lines and curved arrows.',
  'nobody-owes-anything-now': 'A sgraffito slab, white slip scratched through to red clay: a ring of land seen end-on, with a house marked POTTERY at the bottom, an orchard hanging overhead, and a cup in the middle.',
  'its-just-possible': 'An airline seatback moving map: a glowing route from San Jose toward Pittsburgh with a small plane partway, the title where the destination would be named, and a data panel reading Track 1 #1 and Track 2 #1.',
};

export const hasCover = slug => Object.prototype.hasOwnProperty.call(coverLoaders, slug);
export const coverImage = (slug, size = '') => `/images/covers/${slug}${size ? '-' + size : ''}.webp`;
// Share cards: every cover except GPT-7, whose essay keeps its existing share image.
export const coverSocialImage = slug => hasCover(slug) && slug !== 'gpt7-will-have-arms' ? `/images/covers/${slug}-social.jpg` : null;
