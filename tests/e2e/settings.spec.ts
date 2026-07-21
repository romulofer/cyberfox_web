import { expect, test } from '@playwright/test';

test.describe('settings — language and custom agents', () => {
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
});
