// The site's main navigation. The history page is called Timeline (its URL stays /history);
// change historyLabel here and the menu follows.
export const historyLabel = 'Timeline';

export const mainNav = [
  { to: '/work', label: 'Writing & Projects' },
  { to: '/history', label: historyLabel },
  { to: '/about', label: 'About' },
  { to: '/resume', label: 'CV' },
];

// Every route that shows the Work page, so "Work" stays highlighted on all of them and on essays.
export const workPaths = ['/work', '/writing', '/projects', '/research', '/notes', '/lab'];
export const isWorkPath = pathname => workPaths.includes(pathname) || pathname.startsWith('/notes/') || pathname.startsWith('/essays/') || pathname.startsWith('/lab/');
