import type { ProjectConfig } from '../core/models/types';
import { emptyConfig } from './projectConfig.svelte';

// Serialize the project config into the URL hash so a configuration can be
// linked and bookmarked. Encoded as base64url(JSON) under the `c` hash param.

function toBase64Url(input: string): string {
	const bytes = new TextEncoder().encode(input);
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): string {
	const padded = input.replace(/-/g, '+').replace(/_/g, '/');
	const binary = atob(padded);
	const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

export function encodeConfig(config: ProjectConfig): string {
	return toBase64Url(JSON.stringify(config));
}

export function decodeConfig(encoded: string): ProjectConfig | null {
	try {
		const parsed = JSON.parse(fromBase64Url(encoded)) as Partial<ProjectConfig>;
		if (typeof parsed !== 'object' || parsed === null) return null;
		return { ...emptyConfig(), ...parsed };
	} catch {
		return null;
	}
}

export function readConfigFromHash(hash: string): ProjectConfig | null {
	const params = new URLSearchParams(hash.replace(/^#/, ''));
	const encoded = params.get('c');
	return encoded ? decodeConfig(encoded) : null;
}

export function configHash(config: ProjectConfig): string {
	return `#c=${encodeConfig(config)}`;
}
