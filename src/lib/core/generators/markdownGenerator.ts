import type { AppStrings } from '../i18n/strings';
import type { ProjectConfig } from '../models/types';

// Originally ported from base_template.dart. The output now intentionally differs from
// that reference: table cells are escaped, blank entries are skipped, and blocks are
// separated by exactly one blank line.

const isFilled = (value: string): boolean => value.trim().length > 0;

// A table cell must stay on one line and must not contain an unescaped pipe.
function cell(value: string): string {
	return value
		.replace(/\r\n|\r|\n/g, ' ')
		.replace(/\|/g, '\\|')
		.trim();
}

// Inline code span that survives backticks inside the command.
function codeSpan(value: string): string {
	const text = cell(value);
	const longestRun = Math.max(0, ...(text.match(/`+/g) ?? []).map((run) => run.length));
	const fence = '`'.repeat(longestRun + 1);
	const pad = longestRun > 0 ? ' ' : '';
	return `${fence}${pad}${text}${pad}${fence}`;
}

export function generateMarkdown(config: ProjectConfig, s: AppStrings): string {
	const lines: string[] = [];

	// Adds one blank line unless the previous line is already blank, so optional
	// blocks never produce a run of blank lines.
	const blank = () => {
		if (lines.length > 0 && lines[lines.length - 1] !== '') lines.push('');
	};
	const section = (title: string) => {
		blank();
		lines.push(`## ${title}`);
		blank();
	};
	const bullets = (title: string, items: string[]) => {
		const filled = items.filter(isFilled);
		if (filled.length === 0) return;
		section(title);
		for (const item of filled) lines.push(`- ${item.trim()}`);
	};

	lines.push(`# ${config.projectName}`);
	section(s.mdProjectOverview);
	if (isFilled(config.description)) lines.push(config.description.trimEnd());

	const techStack = config.techStack.filter(
		(e) => isFilled(e.category) || isFilled(e.technology) || isFilled(e.versionOrNotes)
	);
	if (techStack.length > 0) {
		section(s.mdTechStack);
		lines.push(`| ${s.mdTechCategory} | ${s.mdTechTechnology} | ${s.mdTechVersionNotes} |`);
		lines.push('|----------|------------|-----------------|');
		for (const e of techStack) {
			lines.push(`| ${cell(e.category)} | ${cell(e.technology)} | ${cell(e.versionOrNotes)} |`);
		}
	}

	const setupCommands = config.setupCommands.filter((c) => isFilled(c.command));
	if (setupCommands.length > 0) {
		section(s.mdSetupCommands);
		lines.push(`| ${s.mdSetupCommand} | ${s.mdSetupDescription} |`);
		lines.push('|---------|-------------|');
		for (const cmd of setupCommands) {
			lines.push(`| ${codeSpan(cmd.command)} | ${cell(cmd.description)} |`);
		}
	}

	bullets(s.mdCoreFeatures, config.coreFeatures);

	const phases = config.phases
		.map((phase) => ({ ...phase, tasks: phase.tasks.filter(isFilled) }))
		.filter(
			(phase) => isFilled(phase.name) || isFilled(phase.description) || phase.tasks.length > 0
		);
	if (phases.length > 0) {
		section(s.mdPhases);
		phases.forEach((phase, i) => {
			if (i > 0) blank();
			const name = phase.name.trim();
			lines.push(`### ${s.mdPhaseLabel} ${i + 1}${name.length > 0 ? `: ${name}` : ''}`);
			blank();
			if (isFilled(phase.description)) {
				lines.push(phase.description.trim());
				blank();
			}
			for (const task of phase.tasks) lines.push(`- ${task.trim()}`);
		});
	}

	bullets(s.mdAcceptanceCriteria, config.acceptanceCriteria);
	bullets(s.mdWhatToDo, config.whatToDo);
	bullets(s.mdWhatNotToDo, config.whatNotToDo);

	const refs = config.documentationReferences.filter((r) => isFilled(r.title) || isFilled(r.url));
	if (refs.length > 0) {
		section(s.mdDocumentationReferences);
		for (const ref of refs) {
			const url = ref.url.trim();
			lines.push(`### ${isFilled(ref.title) ? ref.title.trim() : url}`);
			blank();
			if (isFilled(ref.description)) {
				lines.push(ref.description.trim());
				blank();
			}
			if (url.length > 0) {
				lines.push(`[${url}](${url})`);
				blank();
			}
		}
	}

	return lines.join('\n').trimEnd();
}
