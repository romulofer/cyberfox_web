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

export interface ProjectConfig {
	projectName: string;
	description: string;
	targetAi: AiTarget;
	techStack: TechStackEntry[];
	setupCommands: SetupCommand[];
	coreFeatures: string[];
	acceptanceCriteria: string[];
	whatNotToDo: string[];
	documentationReferences: DocumentationReference[];
}
