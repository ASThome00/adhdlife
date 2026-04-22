import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Tauri expects a fixed port during dev
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // Watch the Rust source too so HMR works across the stack
      ignored: ['**/src-tauri/**'],
    },
  },

  // Vite outputs to dist/ which Tauri bundles
  build: {
    target:    process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify:    !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },

  // Don't clear the screen so Tauri output is visible
  clearScreen: false,
}))
