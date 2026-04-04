import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
			host: "localhost",
			protocol: "wss",
		},
		fs: {
		strict: false,
		}
	},
	optimizeDeps: {
		esbuildOptions: {
			sourcemap: false
		}
	},
	build: {
		sourcemap: false
	}
})
