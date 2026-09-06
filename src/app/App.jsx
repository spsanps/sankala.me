import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { routes } from './routes';
const router = createBrowserRouter(routes);
export default function App() {
  return <><RouterProvider router={router} /><Analytics /><SpeedInsights /></>;
}
