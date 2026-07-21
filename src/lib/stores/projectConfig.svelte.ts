import { builtInAgents } from '../core/agents/builtInAgents';
import type {
	AiTarget,
	DocumentationReference,
	ProjectConfig,
	SetupCommand,
	TechStackEntry
} from '../core/models/types';

export function emptyConfig(): ProjectConfig {
	return {
		projectName: '',
		description: '',
		targetAi: builtInAgents[0],
		techStack: [],
		setupCommands: [],
		coreFeatures: [],
		acceptanceCriteria: [],
		whatNotToDo: [],
		documentationReferences: []
	};
}

export class ProjectConfigStore {
	projectName = $state('');
	description = $state('');
	targetAi = $state<AiTarget>(builtInAgents[0]);
	techStack = $state<TechStackEntry[]>([]);
	setupCommands = $state<SetupCommand[]>([]);
	coreFeatures = $state<string[]>([]);
	acceptanceCriteria = $state<string[]>([]);
	whatNotToDo = $state<string[]>([]);
	documentationReferences = $state<DocumentationReference[]>([]);

	get config(): ProjectConfig {
		return {
			projectName: this.projectName,
			description: this.description,
			targetAi: this.targetAi,
			techStack: this.techStack,
			setupCommands: this.setupCommands,
			coreFeatures: this.coreFeatures,
			acceptanceCriteria: this.acceptanceCriteria,
			whatNotToDo: this.whatNotToDo,
			documentationReferences: this.documentationReferences
		};
	}

	load(config: ProjectConfig) {
		this.projectName = config.projectName;
		this.description = config.description;
		this.targetAi = config.targetAi;
		this.techStack = config.techStack;
		this.setupCommands = config.setupCommands;
		this.coreFeatures = config.coreFeatures;
		this.acceptanceCriteria = config.acceptanceCriteria;
		this.whatNotToDo = config.whatNotToDo;
		this.documentationReferences = config.documentationReferences;
	}

	reset() {
		this.load(emptyConfig());
	}
}

export const projectConfig = new ProjectConfigStore();
