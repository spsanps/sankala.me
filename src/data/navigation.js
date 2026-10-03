// The site's main navigation. San is still choosing the name of the history page
// (History, News or Timeline); change historyLabel here and the menu follows.
export const historyLabel = 'History';

export const mainNav = [
  { to: '/work', label: 'Work' },
  { to: '/history', label: historyLabel },
  { to: '/about', label: 'About' },
  { to: '/resume', label: 'CV' },
];

// Every route that shows the Work page, so "Work" stays highlighted on all of them and on essays.
export const workPaths = ['/work', '/writing', '/projects', '/research', '/notes', '/lab'];
export const isWorkPath = pathname => workPaths.includes(pathname) || pathname.startsWith('/notes/') || pathname.startsWith('/essays/') || pathname.startsWith('/lab/');
