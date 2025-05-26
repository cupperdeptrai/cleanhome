import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['recharts', '@react-aria/interactions'],
    exclude: ['lucide-react'],
    esbuildOptions: {
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@react-aria/interactions': path.resolve(__dirname, 'node_modules/@react-aria/interactions/dist/module.js'),
    },
  }
})
