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
	test: {
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.ts', 'tests/unit/**/*.{test,spec}.ts'],
		globals: true
	}
});
