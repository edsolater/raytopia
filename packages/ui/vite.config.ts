import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // build: { target: 'es2020' }, // let use Bigint 10n
  // optimizeDeps: {
  //   esbuildOptions: {
  //     target: 'es2020'
  //   }
  // },
  define: {
    'process.env': {}
  },
  plugins: [react()]
})
