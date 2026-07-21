import type { AiTarget } from '../models/types';

// Built-in agents with their canonical output filenames.
export const builtInAgents: AiTarget[] = [
	{ name: 'Claude Code', filename: 'CLAUDE.md' },
	{ name: 'Cursor', filename: '.cursorrules' },
	{ name: 'Windsurf', filename: '.windsurfrules' },
	{ name: 'Cline', filename: '.clinerules' },
	{ name: 'GitHub Copilot', filename: 'copilot-instructions.md' },
	{ name: 'Aider', filename: 'CONVENTIONS.md' },
	{ name: 'Devin', filename: 'AGENTS.md' }
];
