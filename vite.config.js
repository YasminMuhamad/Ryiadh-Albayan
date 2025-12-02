import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // React Compiler disabled to avoid missing runtime issues during dev.
      // Re-enable later if you add the compiler runtime package.
    }),
  ],
})
