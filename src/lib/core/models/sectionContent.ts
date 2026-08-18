import type { AppStrings } from '$lib/core/i18n/strings';
import type { SectionContent, TemplateSectionKey } from './types';

// All section keys a template can target, in the order shown in the Templates tab.
export const templateSectionKeys: TemplateSectionKey[] = [
	'description',
	'techStack',
	'setupCommands',
	'coreFeatures',
	'phases',
	'acceptanceCriteria',
	'whatToDo',
	'whatNotToDo',
	'documentationReferences'
];

// The sections whose content is a plain list of strings; they share one
// editor and one empty shape.
const stringListSections: TemplateSectionKey[] = [
	'coreFeatures',
	'acceptanceCriteria',
	'whatToDo',
	'whatNotToDo'
];

export function isStringListSection(section: TemplateSectionKey): boolean {
	return stringListSections.includes(section);
}

// A fresh, empty content value shaped for the given section. Used when creating a
// new template so the matching editor starts blank.
export function emptySectionContent(section: TemplateSectionKey): SectionContent {
	switch (section) {
		case 'description':
			return '';
		case 'techStack':
			return [];
		case 'setupCommands':
			return [];
		case 'phases':
			return [];
		case 'documentationReferences':
			return [];
		default:
			// coreFeatures, acceptanceCriteria, whatToDo, whatNotToDo
			return [];
	}
}

// Human-readable label for a section, used in the template list and selector.
export function sectionLabel(section: TemplateSectionKey, strings: AppStrings): string {
	switch (section) {
		case 'description':
			return strings.fieldDescription;
		case 'techStack':
			return strings.sectionTechStack;
		case 'setupCommands':
			return strings.sectionSetupCommands;
		case 'coreFeatures':
			return strings.sectionCoreFeatures;
		case 'phases':
			return strings.sectionPhases;
		case 'acceptanceCriteria':
			return strings.sectionAcceptanceCriteria;
		case 'whatToDo':
			return strings.sectionWhatToDo;
		case 'whatNotToDo':
			return strings.sectionWhatNotToDo;
		case 'documentationReferences':
			return strings.sectionDocRefs;
	}
}
