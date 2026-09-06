import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Layout from './Layout';
import Home from '../pages/home/Home';
import LabEntry from '../pages/lab/LabEntry';
import NoteEntry from '../pages/notes/NoteEntry';
import GPT7Essay from '../pages/essays/gpt7-will-have-arms/GPT7Essay';
import EAIWriteup from '../pages/notes/eai-challenge/EAIWriteup';
import Resume from '../pages/resume/Resume';
import LabIndex from '../pages/lab/LabIndex';
import NotesIndex from '../pages/notes/NotesIndex';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "lab",
        element: <LabIndex />,
      },
      {
        path: "lab/:id",
        element: <LabEntry />,
      },
      {
        path: "notes",
        element: <NotesIndex />,
      },
      {
        path: "notes/:slug",
        element: <NoteEntry />,
      },
      {
        path: "essays/gpt7-will-have-arms",
        element: <GPT7Essay />,
      },
      {
        path: "notes/eai-challenge",
        element: <EAIWriteup />,
      },
      {
        path: "resume",
        element: <Resume />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
