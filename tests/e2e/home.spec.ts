import { expect, test } from '@playwright/test';

// Seed English before the app's store initializes so label assertions are stable.
test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		const key = 'cyberfox_web.settings.v1';
		if (!localStorage.getItem(key)) {
			localStorage.setItem(
				key,
				JSON.stringify({ language: 'en', theme: 'light', customAgents: [] })
			);
		}
	});
});

test.describe('home — form and live preview', () => {
	test('defaults to Claude Code and previews the project name live', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('agent-select')).toHaveValue('CLAUDE.md');

		await page.getByTestId('project-name').fill('My Project');
		await expect(page.getByTestId('preview').locator('h1')).toHaveText('My Project');
	});

	test('adding a tech stack row is reflected in the preview', async ({ page }) => {
		await page.goto('/');
		await page.getByTestId('project-name').fill('P');

		await page.getByRole('button', { name: '+ Add' }).first().click();
		await page.getByLabel('Category', { exact: true }).fill('Frontend');
		await page.getByLabel('Technology', { exact: true }).fill('Svelte');

		const preview = page.getByTestId('preview');
		await expect(preview).toContainText('Tech Stack');
		await expect(preview.locator('td', { hasText: 'Svelte' })).toBeVisible();
	});

	test('download uses the selected agent canonical filename', async ({ page }) => {
		await page.goto('/');
		await page.getByTestId('project-name').fill('P');

		const downloadClaude = page.waitForEvent('download');
		await page.getByTestId('download').click();
		expect((await downloadClaude).suggestedFilename()).toBe('CLAUDE.md');

		await page.getByTestId('agent-select').selectOption('AGENTS.md');
		const downloadDevin = page.waitForEvent('download');
		await page.getByTestId('download').click();
		expect((await downloadDevin).suggestedFilename()).toBe('AGENTS.md');
	});

	test('copy writes the markdown to the clipboard', async ({ page, context }) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.goto('/');
		await page.getByTestId('project-name').fill('Copied Project');

		await page.getByTestId('copy').click();
		const clipboard = await page.evaluate(() => navigator.clipboard.readText());
		expect(clipboard).toContain('# Copied Project');
	});

	test('config round-trips through a shareable URL', async ({ page, context }) => {
		await page.goto('/');
		await page.getByTestId('project-name').fill('Shared Project');
		await expect(page).toHaveURL(/#c=/);

		const shared = page.url();
		const other = await context.newPage();
		await other.goto(shared);
		await expect(other.getByTestId('project-name')).toHaveValue('Shared Project');
	});

	test('dark mode toggle persists across reload', async ({ page }) => {
		await page.goto('/');
		await page.getByTestId('theme-toggle').click();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

		await page.reload();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	});
});
