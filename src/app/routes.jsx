import { Navigate } from 'react-router-dom';
import PersonalLayout from './PersonalLayout';
import Layout from './Layout';
import Home from '../pages/home/Home';
import NoteEntry from '../pages/notes/NoteEntry';
import PoemPage from '../pages/notes/nobody-owes-anything-now/PoemPage';
import History from '../pages/history/History';
import About from '../pages/about/About';
import Resume from '../pages/resume/Resume';
import Work from '../pages/work/Work';
import NotFound from '../pages/not-found/NotFound';

export const routes = [
  { element: <PersonalLayout />, children: [
    { path: '/', element: <Home /> },
    // One Work page; the old index routes show it pre-filtered, so their links keep working.
    { path: '/work', element: <Work /> },
    { path: '/notes', element: <Work /> },
    { path: '/writing', element: <Work preset="writing" /> },
    { path: '/projects', element: <Work preset="projects" /> },
    { path: '/notes/:slug', element: <NoteEntry /> },
    // Essays with their own hand-made figure; the figure code loads only on these pages.
    { path: '/notes/zinify', lazy: async () => ({ Component: (await import('../pages/notes/zinify/ZinifyEssay')).default }) },
    { path: '/notes/power-quality', lazy: async () => ({ Component: (await import('../pages/notes/power-quality/PowerQualityEssay')).default }) },
    { path: '/notes/its-just-possible', lazy: async () => ({ Component: (await import('../pages/notes/its-just-possible/ItsJustPossibleEssay')).default }) },
    // The poem is light (its figure's code loads only when on screen), so its page and styles
    // come with the site and the prerendered HTML is typeset from the first paint.
    { path: '/notes/nobody-owes-anything-now', element: <PoemPage /> },
    { path: '/history', element: <History /> },
    { path: '/research', element: <Work preset="research" /> },
    { path: '/about', element: <About /> },
    { path: '/resume', element: <Resume /> },
    { path: '/lab', element: <Work preset="projects" /> },
    { path: '/worlds', element: <Navigate to="/lab" replace /> },
    { path: '*', element: <NotFound /> },
  ] },
  { element: <Layout />, children: [
    { path: '/essays/gpt7-will-have-arms', lazy: async () => ({ Component: (await import('../pages/essays/gpt7-will-have-arms/GPT7Essay')).default }) },
    { path: '/notes/eai-challenge', lazy: async () => ({ Component: (await import('../pages/notes/eai-challenge/EAIWriteup')).default }) },
    { path: '/lab/:id', lazy: async () => ({ Component: (await import('../pages/lab/LabEntry')).default }) },
  ] },
];
