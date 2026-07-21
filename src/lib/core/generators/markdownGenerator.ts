import type { AppStrings } from '../i18n/strings';
import type { ProjectConfig } from '../models/types';

// Byte-for-byte port of base_template.dart: each push = one Dart writeln.
export function generateMarkdown(config: ProjectConfig, s: AppStrings): string {
	const lines: string[] = [];

	lines.push(`# ${config.projectName}`);
	lines.push('');
	lines.push(`## ${s.mdProjectOverview}`);
	lines.push('');
	if (config.description.length > 0) lines.push(config.description);

	if (config.techStack.length > 0) {
		lines.push('');
		lines.push(`## ${s.mdTechStack}`);
		lines.push('');
		lines.push(`| ${s.mdTechCategory} | ${s.mdTechTechnology} | ${s.mdTechVersionNotes} |`);
		lines.push('|----------|------------|-----------------|');
		for (const e of config.techStack) {
			lines.push(`| ${e.category} | ${e.technology} | ${e.versionOrNotes} |`);
		}
	}

	if (config.setupCommands.length > 0) {
		lines.push('');
		lines.push(`## ${s.mdSetupCommands}`);
		lines.push('');
		lines.push(`| ${s.mdSetupCommand} | ${s.mdSetupDescription} |`);
		lines.push('|---------|-------------|');
		for (const cmd of config.setupCommands) {
			lines.push(`| \`${cmd.command}\` | ${cmd.description} |`);
		}
	}

	if (config.coreFeatures.length > 0) {
		lines.push('');
		lines.push('');
		lines.push(`## ${s.mdCoreFeatures}`);
		lines.push('');
		for (const f of config.coreFeatures) {
			lines.push(`- ${f}`);
		}
	}

	if (config.acceptanceCriteria.length > 0) {
		lines.push('');
		lines.push(`## ${s.mdAcceptanceCriteria}`);
		lines.push('');
		for (const c of config.acceptanceCriteria) {
			lines.push(`- ${c}`);
		}
	}

	if (config.whatNotToDo.length > 0) {
		lines.push('');
		lines.push(`## ${s.mdWhatNotToDo}`);
		lines.push('');
		for (const w of config.whatNotToDo) {
			lines.push(`- ${w}`);
		}
	}

	if (config.documentationReferences.length > 0) {
		lines.push('');
		lines.push(`## ${s.mdDocumentationReferences}`);
		lines.push('');
		for (const ref of config.documentationReferences) {
			lines.push(`### ${ref.title}`);
			lines.push('');
			if (ref.description.length > 0) {
				lines.push(ref.description);
				lines.push('');
			}
			lines.push(`[${ref.url}](${ref.url})`);
			lines.push('');
		}
	}

	return lines.join('\n').trimEnd();
}
