// Minimal templates persistence API for the self-hosted deployment. Stores the
// whole template collection as a JSON document on a mounted volume so templates
// live in the container/host, not the browser. No framework, no npm deps — just
// Bun built-ins. The static frontend talks to this through the nginx /api proxy.
//
// Routes:
//   GET  /templates  -> SectionTemplate[]        (empty array if none yet)
//   PUT  /templates  <- SectionTemplate[]        (replaces the whole collection)
//   GET  /health     -> { ok: true }

const DATA_DIR = process.env.DATA_DIR ?? '/data';
const DATA_FILE = `${DATA_DIR}/templates.json`;
const PORT = Number(process.env.PORT ?? 8787);

const VALID_SECTIONS = new Set([
	'description',
	'techStack',
	'setupCommands',
	'coreFeatures',
	'phases',
	'acceptanceCriteria',
	'whatNotToDo',
	'documentationReferences'
]);

function isTemplate(value: unknown): boolean {
	if (!value || typeof value !== 'object') return false;
	const record = value as Record<string, unknown>;
	return (
		typeof record.id === 'string' &&
		typeof record.name === 'string' &&
		typeof record.section === 'string' &&
		VALID_SECTIONS.has(record.section) &&
		'content' in record
	);
}

async function readAll(): Promise<unknown[]> {
	try {
		const file = Bun.file(DATA_FILE);
		if (!(await file.exists())) return [];
		const data = await file.json();
		return Array.isArray(data) ? data : [];
	} catch {
		return [];
	}
}

async function writeAll(items: unknown[]): Promise<void> {
	await Bun.write(DATA_FILE, JSON.stringify(items, null, 2));
}

const CORS = {
	'access-control-allow-origin': '*',
	'access-control-allow-methods': 'GET, PUT, OPTIONS',
	'access-control-allow-headers': 'content-type'
};

function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json', ...CORS }
	});
}

Bun.serve({
	port: PORT,
	async fetch(req) {
		const { pathname } = new URL(req.url);

		if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
		if (pathname === '/health') return json({ ok: true });

		if (pathname === '/templates') {
			if (req.method === 'GET') return json(await readAll());
			if (req.method === 'PUT') {
				const body = await req.json().catch(() => null);
				if (!Array.isArray(body)) return json({ error: 'expected a JSON array' }, 400);
				const clean = body.filter(isTemplate);
				await writeAll(clean);
				return json({ ok: true, count: clean.length });
			}
			return json({ error: 'method not allowed' }, 405);
		}

		return json({ error: 'not found' }, 404);
	}
});

console.log(`templates api listening on :${PORT} (data file: ${DATA_FILE})`);
