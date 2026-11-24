import { expect, test } from '@playwright/test';

// Share links are untrusted input. None of these payloads may break the page.
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

function link(json: string): string {
	return `/#c=${Buffer.from(json, 'utf8').toString('base64url')}`;
}

const hostilePayloads: [string, string][] = [
	['prototype key', '{"__proto__":{"polluted":true},"projectName":"Hostile"}'],
	['config key', '{"config":5,"projectName":"Hostile"}'],
	['null list item', '{"techStack":[null],"projectName":"Hostile"}'],
	['phase without tasks', '{"phases":[{"name":"a","description":""}],"projectName":"Hostile"}'],
	[
		'non-string tasks',
		'{"phases":[{"name":"a","description":"","tasks":[5,null]}],"projectName":"Hostile"}'
	],
	['unknown keys', '{"evil":"payload","projectName":"Hostile"}']
];

test.describe('hostile share links', () => {
	for (const [label, json] of hostilePayloads) {
		test(`${label} still renders the editor and preview`, async ({ page }) => {
			const errors: string[] = [];
			page.on('pageerror', (error) => errors.push(error.message));

			await page.goto(link(json));

			await expect(page.getByTestId('project-name')).toHaveValue('Hostile');
			await expect(page.getByTestId('preview').locator('h1')).toHaveText('Hostile');
			expect(errors).toEqual([]);

			// The page stays interactive after loading the link.
			await page.getByTestId('project-name').fill('Still works');
			await expect(page.getByTestId('preview').locator('h1')).toHaveText('Still works');
		});
	}

	test('a payload with the wrong shape opens an empty editor', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));

		await page.goto(link('{"projectName":5}'));

		await expect(page.getByTestId('project-name')).toHaveValue('');
		expect(errors).toEqual([]);
	});
});
