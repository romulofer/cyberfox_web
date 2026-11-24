import { expect, test } from '@playwright/test';

test.describe('settings: language and custom agents', () => {
	test('language switch changes preview heading and persists', async ({ page }) => {
		await page.goto('/settings');
		await page.getByLabel('Português (Brasil)').check();

		await page.goto('/');
		await expect(page.getByTestId('preview')).toContainText('Visão Geral do Projeto');

		await page.reload();
		await expect(page.getByTestId('preview')).toContainText('Visão Geral do Projeto');
	});

	test('custom agent appears in the selector and persists', async ({ page }) => {
		await page.goto('/settings');
		await page.getByTestId('agent-name-input').fill('My Agent');
		await page.getByTestId('agent-filename-input').fill('MYAGENT.md');
		await page.getByTestId('add-agent').click();

		await page.goto('/');
		await expect(page.getByTestId('agent-select')).toContainText('My Agent');
		await page.getByTestId('agent-select').selectOption('MYAGENT.md');

		// Custom agents persist in settings; the option survives a reload.
		await page.reload();
		await expect(page.getByTestId('agent-select')).toContainText('My Agent');
		await expect(
			page.getByTestId('agent-select').locator('option[value="MYAGENT.md"]')
		).toHaveCount(1);
	});

	test('custom agent can be removed', async ({ page }) => {
		await page.goto('/settings');
		await page.getByTestId('agent-name-input').fill('Temp');
		await page.getByTestId('agent-filename-input').fill('TEMP.md');
		await page.getByTestId('add-agent').click();
		await expect(page.locator('code', { hasText: 'TEMP.md' })).toBeVisible();

		await page.getByTestId('remove-agent').last().click();
		await expect(page.locator('code', { hasText: 'TEMP.md' })).toHaveCount(0);
	});

	test('Enter submits the custom-agent form', async ({ page }) => {
		await page.goto('/settings');
		await page.getByTestId('agent-name-input').fill('Keyboard Agent');
		await page.getByTestId('agent-filename-input').fill('KEYBOARD.md');
		await page.getByTestId('agent-filename-input').press('Enter');

		await expect(page.locator('code', { hasText: 'KEYBOARD.md' })).toBeVisible();
	});

	test('a duplicate agent filename shows an error and does not break the form', async ({
		page
	}) => {
		await page.goto('/settings');
		await page.getByTestId('agent-name-input').fill('Impostor');
		await page.getByTestId('agent-filename-input').fill('AGENTS.md');
		await page.getByTestId('add-agent').click();

		await expect(page.getByTestId('agent-error')).toBeVisible();
		await expect(page.getByTestId('agent-name-input')).toHaveValue('Impostor');

		await page.goto('/');
		await expect(page.getByTestId('agent-select').locator('option[value="AGENTS.md"]')).toHaveCount(
			1
		);
	});

	test('an unknown stored language falls back to the default', async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem(
				'cyberfox_web.settings.v1',
				JSON.stringify({ language: 'fr', theme: 'neon', customAgents: [] })
			);
		});
		await page.goto('/');
		await page.getByTestId('project-name').fill('P');
		await expect(page.getByTestId('preview')).toContainText('Visão Geral do Projeto');
	});

	test('an agent from a shared link stays selectable', async ({ page }) => {
		const config = {
			projectName: 'Shared',
			targetAi: { name: 'Elsewhere', filename: 'ELSEWHERE.md' }
		};
		const hash = Buffer.from(JSON.stringify(config), 'utf8').toString('base64url');
		await page.goto(`/#c=${hash}`);
		await expect(page.getByTestId('agent-select')).toHaveValue('ELSEWHERE.md');
	});
});
