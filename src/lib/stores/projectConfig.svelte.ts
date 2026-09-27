import { builtInAgents } from '../core/agents/builtInAgents';
import type {
	AiTarget,
	DocumentationReference,
	ProjectConfig,
	ProjectPhase,
	SectionContent,
	SetupCommand,
	TechStackEntry,
	TemplateSectionKey
} from '../core/models/types';

export function emptyConfig(): ProjectConfig {
	return {
		projectName: '',
		description: '',
		targetAi: builtInAgents[0],
		techStack: [],
		setupCommands: [],
		coreFeatures: [],
		phases: [],
		acceptanceCriteria: [],
		whatToDo: [],
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
	phases = $state<ProjectPhase[]>([]);
	acceptanceCriteria = $state<string[]>([]);
	whatToDo = $state<string[]>([]);
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
			phases: this.phases,
			acceptanceCriteria: this.acceptanceCriteria,
			whatToDo: this.whatToDo,
			whatNotToDo: this.whatNotToDo,
			documentationReferences: this.documentationReferences
		};
	}

	load(config: ProjectConfig) {
		Object.assign(this, config);
	}

	// Append template content to the matching section. Used by ProjectForm so the
	// dispatch logic lives here rather than duplicated across eight apply functions.
	applySection(section: TemplateSectionKey, content: SectionContent) {
		switch (section) {
			case 'description':
				this.description = this.description
					? `${this.description}\n\n${String(content)}`
					: String(content);
				break;
			case 'techStack':
				this.techStack = [...this.techStack, ...structuredClone(content as TechStackEntry[])];
				break;
			case 'setupCommands':
				this.setupCommands = [
					...this.setupCommands,
					...structuredClone(content as SetupCommand[])
				];
				break;
			case 'phases':
				this.phases = [...this.phases, ...structuredClone(content as ProjectPhase[])];
				break;
			case 'documentationReferences':
				this.documentationReferences = [
					...this.documentationReferences,
					...structuredClone(content as DocumentationReference[])
				];
				break;
			case 'coreFeatures':
				this.coreFeatures = [...this.coreFeatures, ...(content as string[])];
				break;
			case 'acceptanceCriteria':
				this.acceptanceCriteria = [...this.acceptanceCriteria, ...(content as string[])];
				break;
			case 'whatToDo':
				this.whatToDo = [...this.whatToDo, ...(content as string[])];
				break;
			case 'whatNotToDo':
				this.whatNotToDo = [...this.whatNotToDo, ...(content as string[])];
				break;
		}
	}

	reset() {
		this.load(emptyConfig());
	}
}

export const projectConfig = new ProjectConfigStore();
