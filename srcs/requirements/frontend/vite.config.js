import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [
                    [
                        'babel-plugin-styled-components',
                        {
                            displayName: true,
                            fileName: false
                        }
                    ]
                ]
            }
        })
    ],
    server: {
        host: true,
        port: 5173,
        strictPort: true,
        watch: {
            usePolling: true,
        },
        hmr: {
            clientPort: 8443,
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