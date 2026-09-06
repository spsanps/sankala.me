import { Navigate } from 'react-router-dom';
import PersonalLayout from './PersonalLayout';
import Layout from './Layout';
import Home from '../pages/home/Home';
import NotesIndex from '../pages/notes/NotesIndex';
import NoteEntry from '../pages/notes/NoteEntry';
import History from '../pages/history/History';
import Research from '../pages/research/Research';
import About from '../pages/about/About';
import Resume from '../pages/resume/Resume';
import LabIndex from '../pages/lab/LabIndex';
import NotFound from '../pages/not-found/NotFound';

export const routes = [
  { element: <PersonalLayout />, children: [
    { path: '/', element: <Home /> },
    { path: '/notes', element: <NotesIndex /> },
    { path: '/notes/:slug', element: <NoteEntry /> },
    { path: '/history', element: <History /> },
    { path: '/research', element: <Research /> },
    { path: '/about', element: <About /> },
    { path: '/resume', element: <Resume /> },
    { path: '/lab', element: <LabIndex /> },
    { path: '/work', element: <Navigate to="/notes" replace /> },
    { path: '/worlds', element: <Navigate to="/lab" replace /> },
    { path: '*', element: <NotFound /> },
  ] },
  { element: <Layout />, children: [
    { path: '/essays/gpt7-will-have-arms', lazy: async () => ({ Component: (await import('../pages/essays/gpt7-will-have-arms/GPT7Essay')).default }) },
    { path: '/notes/eai-challenge', lazy: async () => ({ Component: (await import('../pages/notes/eai-challenge/EAIWriteup')).default }) },
    { path: '/lab/:id', lazy: async () => ({ Component: (await import('../pages/lab/LabEntry')).default }) },
  ] },
];
