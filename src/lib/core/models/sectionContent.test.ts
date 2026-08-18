import { describe, expect, it } from 'vitest';
import {
	emptySectionContent,
	isStringListSection,
	sectionLabel,
	templateSectionKeys
} from './sectionContent';
import { strings } from '../i18n/strings';

const en = strings.en;

describe('isStringListSection', () => {
	it('is true for coreFeatures, acceptanceCriteria, whatToDo and whatNotToDo', () => {
		expect(isStringListSection('coreFeatures')).toBe(true);
		expect(isStringListSection('acceptanceCriteria')).toBe(true);
		expect(isStringListSection('whatToDo')).toBe(true);
		expect(isStringListSection('whatNotToDo')).toBe(true);
	});

	it('is false for structured sections', () => {
		expect(isStringListSection('description')).toBe(false);
		expect(isStringListSection('techStack')).toBe(false);
		expect(isStringListSection('setupCommands')).toBe(false);
		expect(isStringListSection('phases')).toBe(false);
		expect(isStringListSection('documentationReferences')).toBe(false);
	});
});

describe('emptySectionContent', () => {
	it('returns an empty string for description', () => {
		expect(emptySectionContent('description')).toBe('');
	});

	it('returns an empty array for every other section', () => {
		for (const key of templateSectionKeys) {
			if (key === 'description') continue;
			expect(emptySectionContent(key)).toEqual([]);
		}
	});
});

describe('sectionLabel', () => {
	it('maps every template section key to its string-table label', () => {
		expect(sectionLabel('description', en)).toBe(en.fieldDescription);
		expect(sectionLabel('techStack', en)).toBe(en.sectionTechStack);
		expect(sectionLabel('setupCommands', en)).toBe(en.sectionSetupCommands);
		expect(sectionLabel('coreFeatures', en)).toBe(en.sectionCoreFeatures);
		expect(sectionLabel('phases', en)).toBe(en.sectionPhases);
		expect(sectionLabel('acceptanceCriteria', en)).toBe(en.sectionAcceptanceCriteria);
		expect(sectionLabel('whatToDo', en)).toBe(en.sectionWhatToDo);
		expect(sectionLabel('whatNotToDo', en)).toBe(en.sectionWhatNotToDo);
		expect(sectionLabel('documentationReferences', en)).toBe(en.sectionDocRefs);
	});

	it('covers every key in templateSectionKeys with no gaps', () => {
		for (const key of templateSectionKeys) {
			expect(() => sectionLabel(key, en)).not.toThrow();
			expect(sectionLabel(key, en)).toBeTruthy();
		}
	});
});
