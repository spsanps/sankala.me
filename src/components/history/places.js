// The four places on /history, newest first. A milestone belongs to the place whose period
// contains its date (YYYY-MM); anything newer than every start falls into the first place.
// Window views are drawn with the Four frames kit: node scripts/publishing/render-site-art.mjs
export const places = [
  { id: 'san-jose', name: 'San Jose', years: '2024 – now', line: 'Applied AI research at eBay.', from: '2024-04',
    alt: 'A window onto the Santa Clara valley: tiled roofs, a palm, and Mt Hamilton with the Lick Observatory domes.' },
  { id: 'san-diego', name: 'San Diego', years: '2022 – 2024', line: 'MS in computer science at UC San Diego.', from: '2022-09',
    alt: 'A window onto UC San Diego: the Geisel Library among eucalyptus.' },
  { id: 'bengaluru', name: 'Bengaluru', years: '2019 – 2022', line: 'Chip design at Texas Instruments.', from: '2019-06',
    alt: 'A window onto Bengaluru in late afternoon: apartment blocks, a flowering gulmohar tree and two kites.' },
  { id: 'surathkal', name: 'Surathkal', years: '2015 – 2019', line: 'Electrical engineering at NIT Karnataka.', from: '0000-00',
    alt: 'A window at night onto the Arabian Sea at Surathkal: palms and the lighthouse.' },
];

export function placeFor(date = '') {
  return places.find(place => date >= place.from) || places[places.length - 1];
}
