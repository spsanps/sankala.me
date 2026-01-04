import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import LabEntry from './pages/LabEntry';
import NoteEntry from './pages/NoteEntry';
import InteractiveEssay from './pages/InteractiveEssay';
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
        // Main essay route - now serves interactive version
        path: "essays/:slug",
        element: <InteractiveEssay />,
      },
      {
        // Keep /interactive working for any old links
        path: "essays/:slug/interactive",
        element: <InteractiveEssay />,
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
