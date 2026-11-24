import type { ProjectConfig } from '../core/models/types';
import { parseProjectConfig } from '../core/models/schema';

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

// Share links are untrusted input: the payload is validated and normalized by the
// shared schema, which drops unknown keys and malformed items, so a hostile or
// outdated link can never put the stores in an unusable state.
export function decodeConfig(encoded: string): ProjectConfig | null {
	try {
		return parseProjectConfig(JSON.parse(fromBase64Url(encoded)));
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
