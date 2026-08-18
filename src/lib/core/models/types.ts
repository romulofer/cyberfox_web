export interface TechStackEntry {
	category: string;
	technology: string;
	versionOrNotes: string;
}

export interface SetupCommand {
	command: string;
	description: string;
}

export interface DocumentationReference {
	title: string;
	url: string;
	description: string;
}

export interface AiTarget {
	name: string;
	filename: string;
}

export interface ProjectPhase {
	name: string;
	description: string;
	tasks: string[];
}

export interface ProjectConfig {
	projectName: string;
	description: string;
	targetAi: AiTarget;
	techStack: TechStackEntry[];
	setupCommands: SetupCommand[];
	coreFeatures: string[];
	phases: ProjectPhase[];
	acceptanceCriteria: string[];
	whatToDo: string[];
	whatNotToDo: string[];
	documentationReferences: DocumentationReference[];
}

// Sections whose content the user can save and reuse as a template. The title
// (project name) is intentionally excluded — templates cover repeatable content.
export type TemplateSectionKey =
	| 'description'
	| 'techStack'
	| 'setupCommands'
	| 'coreFeatures'
	| 'phases'
	| 'acceptanceCriteria'
	| 'whatToDo'
	| 'whatNotToDo'
	| 'documentationReferences';

export type SectionContent =
	string | string[] | TechStackEntry[] | SetupCommand[] | ProjectPhase[] | DocumentationReference[];

export interface SectionTemplate {
	id: string;
	section: TemplateSectionKey;
	name: string;
	content: SectionContent;
}
