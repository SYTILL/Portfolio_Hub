import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from GitHub Pages at https://sytill.github.io/Portfolio_Hub/
export default defineConfig({
  base: '/Portfolio_Hub/',
  plugins: [react()],
})
