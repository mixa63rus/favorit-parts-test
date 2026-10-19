import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base — путь репозитория на GitHub Pages:
// https://<username>.github.io/<repo-name>/
export default defineConfig({
  plugins: [react()],
  base: '/favorit-parts-test/',
})
