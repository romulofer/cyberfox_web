import { defineConfig } from '@playwright/test';

// E2E runs against the production static build to catch prerender/base-path issues.
export default defineConfig({
	testDir: 'tests/e2e',
	webServer: {
		command: 'bun run build && bun run preview --port 4173',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	use: {
		baseURL: 'http://localhost:4173'
	}
});
