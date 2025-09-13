import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	server: {
		cors: true,
		host: 'localhost', // Apenas localhost para desenvolvimento
		port: 5173,
		headers: {
			'Cross-Origin-Embedder-Policy': 'credentialless',
		},
		allowedHosts: ['localhost', '127.0.0.1'],
		proxy: {
			'/api': {
				target: 'http://localhost:3001',
				changeOrigin: true,
				secure: false,
			},
		},
	},
	build: {
		// Configurações para desenvolvimento
		outDir: 'dist',
		assetsDir: 'assets',
		sourcemap: true, // Habilitar source maps para desenvolvimento
		minify: false, // Desabilitar minificação para desenvolvimento
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					router: ['react-router-dom'],
					ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
				},
			},
		},
		// Configurações de desenvolvimento
		chunkSizeWarningLimit: 2000,
		cssCodeSplit: false,
		reportCompressedSize: false,
	},
	// Configurações de preview (para desenvolvimento)
	preview: {
		port: 5173,
		host: 'localhost',
		strictPort: true,
	},
	resolve: {
		extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	css: {
		postcss: './postcss.config.js',
		devSourcemap: false,
	},
	// Configurações de otimização
	optimizeDeps: {
		include: ['react', 'react-dom', 'react-router-dom'],
	},
});