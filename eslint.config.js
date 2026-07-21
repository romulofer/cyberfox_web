import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			'no-unused-vars': ['error', { destructuredArrayIgnorePattern: '^_', argsIgnorePattern: '^_' }]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: { parser: tsParser }
		}
	},
	{
		ignores: ['.svelte-kit/', 'build/', 'node_modules/', 'playwright-report/', 'test-results/']
	}
];
