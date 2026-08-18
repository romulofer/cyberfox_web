import { expect, test, type Page } from '@playwright/test';

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

// Creates a Core Features template named `name` holding a single feature value.
async function createCoreFeaturesTemplate(page: Page, name: string, feature: string) {
	await page.goto('/templates');
	await page.getByTestId('template-new').click();
	await page.getByTestId('template-section-select').selectOption('coreFeatures');
	await page.getByTestId('template-name-input').fill(name);

	const editor = page.getByTestId('template-editor');
	await editor.getByRole('button', { name: '➕ Add' }).click();
	await editor.getByLabel('Core Features 1').fill(feature);

	await page.getByTestId('template-save').click();
}

test.describe('templates tab: CRUD (self-hosted / dev only)', () => {
	test('the header link opens the manage templates page', async ({ page }) => {
		await page.goto('/');
		await page.getByTestId('templates-link').click();
		await expect(page.getByRole('heading', { name: 'Manage Templates' })).toBeVisible();
	});

	test('creating a template lists it with its section', async ({ page }) => {
		await createCoreFeaturesTemplate(page, 'Basics', 'Auth');

		const item = page.getByTestId('template-item').filter({ hasText: 'Basics' });
		await expect(item).toBeVisible();
		await expect(item).toContainText('Core Features');
	});

	test('an existing template can be edited', async ({ page }) => {
		await createCoreFeaturesTemplate(page, 'Basics', 'Auth');

		await page
			.getByTestId('template-item')
			.filter({ hasText: 'Basics' })
			.getByTestId('template-edit')
			.click();

		// The section is locked while editing.
		await expect(page.getByTestId('template-section-select')).toBeDisabled();
		await page.getByTestId('template-name-input').fill('Essentials');
		await page.getByTestId('template-save').click();

		await expect(page.getByTestId('template-item').filter({ hasText: 'Essentials' })).toBeVisible();
		await expect(page.getByText('Basics', { exact: true })).toHaveCount(0);
	});

	test('a template can be deleted', async ({ page }) => {
		await createCoreFeaturesTemplate(page, 'Basics', 'Auth');

		await page
			.getByTestId('template-item')
			.filter({ hasText: 'Basics' })
			.getByTestId('template-delete')
			.click();

		await expect(page.getByText('No saved templates')).toBeVisible();
	});

	test('a created template can be applied in the project form', async ({ page }) => {
		await createCoreFeaturesTemplate(page, 'Basics', 'Auth');

		await page.goto('/');
		await page.getByTestId('apply-select-coreFeatures').selectOption({ label: 'Basics' });
		await page.getByTestId('apply-template-coreFeatures').click();

		const core = page.locator('fieldset').filter({ hasText: 'Core Features' });
		await expect(core.getByLabel('Core Features 1')).toHaveValue('Auth');
	});
});
