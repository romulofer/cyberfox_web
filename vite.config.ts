import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

// GitHub Pages subpath, e.g. "/cyberfox_web". Empty for local/dev/Docker.
const base = (process.env.BASE_PATH ?? '') as '' | `/${string}`;

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Static export for GitHub Pages + Docker self-hosting. Fully client-side app.
			adapter: adapter({ fallback: '404.html' }),
			paths: { base }
		})
	],
	// Dev only: forward template API calls to the local backend (bun run server).
	// In production nginx proxies /api; on GitHub Pages the feature is disabled.
	server: {
		proxy: {
			'/api': 'http://localhost:8787'
		}
	},
	// Under Vitest, resolve Svelte's client build instead of its SSR build so
	// @testing-library/svelte can mount components in jsdom.
	resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
	test: {
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.ts', 'tests/unit/**/*.{test,spec}.ts'],
		globals: true,
		setupFiles: ['./vitest-setup.ts']
	}
});
