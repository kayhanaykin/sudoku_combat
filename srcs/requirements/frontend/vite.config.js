import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    hmr: {
      clientPort: 8443,
      host: ["localhost", "ekay.42.fr"],
      protocol: "wss",
    }
  }
})
