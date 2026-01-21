import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: true,      // Docker dışından erişim için şart
		port: 5173,      // Port numarası
		watch: {
			usePolling: true, // Dosyaları sürekli kontrol et
		}
	}
})
