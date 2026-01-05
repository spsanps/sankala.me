import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import LabEntry from './pages/LabEntry';
import NoteEntry from './pages/NoteEntry';
import EssayEntry from './pages/EssayEntry';
import InteractiveEssay from './pages/InteractiveEssay';
import GPT7Essay from './pages/GPT7Essay';
import Resume from './pages/Resume';
import LabIndex from './pages/LabIndex';
import NotesIndex from './pages/NotesIndex';

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
        path: "essays/:slug",
        element: <EssayEntry />,
      },
      {
        path: "essays/:slug/interactive",
        element: <InteractiveEssay />,
      },
      {
        path: "essays/gpt7-will-have-arms",
        element: <GPT7Essay />,
      },
      {
        path: "resume",
        element: <Resume />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
