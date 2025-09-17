import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
	const isProduction = mode === 'production';
	
	return {
		plugins: [react()],
		server: {
			cors: true,
			host: isProduction ? '0.0.0.0' : 'localhost',
			port: 5173,
			headers: {
				'Cross-Origin-Embedder-Policy': 'credentialless',
			},
			allowedHosts: isProduction ? ['all'] : ['localhost', '127.0.0.1'],
			proxy: {
				'/api': {
					target: isProduction ? 'https://mods.eumarko.com' : 'http://localhost:3001',
					changeOrigin: true,
					secure: isProduction,
				},
				'/uploads': {
					target: isProduction ? 'https://mods.eumarko.com' : 'http://localhost:3001',
					changeOrigin: true,
					secure: isProduction,
				},
			},
		},
		build: {
			outDir: 'dist',
			assetsDir: 'assets',
			sourcemap: !isProduction, // Desabilitar source maps em produção
			minify: isProduction, // Habilitar minificação em produção
			rollupOptions: {
				output: {
					manualChunks: {
						vendor: ['react', 'react-dom'],
						router: ['react-router-dom'],
						ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
					},
				},
			},
			chunkSizeWarningLimit: isProduction ? 1000 : 2000,
			cssCodeSplit: isProduction,
			reportCompressedSize: isProduction,
		},
		preview: {
			port: 5173,
			host: isProduction ? '0.0.0.0' : 'localhost',
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
};
});
