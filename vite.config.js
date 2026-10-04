import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pages under public/ are served as they are (the IROS model page loads three.js through its own import map),
  // so the dependency scanner leaves them alone.
  optimizeDeps: { entries: ['**/*.html', '!public/**'] },
})
