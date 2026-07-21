export type Language = 'ptBR' | 'en';

export interface AppStrings {
	// General
	saving: string;
	add: string;
	saveFileLabel: (filename: string) => string;
	copy: string;
	copied: string;
	previewPlaceholder: string;

	// Form — Project section
	sectionProject: string;
	fieldName: string;
	fieldDescription: string;
	fieldTargetAi: string;

	// Form — Tech Stack section
	sectionTechStack: string;
	fieldCategory: string;
	hintCategory: string;
	fieldTechnology: string;
	hintTechnology: string;
	fieldVersionNotes: string;
	hintVersionNotes: string;

	// Form — Setup Commands section
	sectionSetupCommands: string;
	fieldCommand: string;
	hintCommand: string;
	fieldCommandDescription: string;
	hintCommandDescription: string;

	// Form — Core Features section
	sectionCoreFeatures: string;
	fieldFeature: string;
	hintFeature: string;

	// Form — Acceptance Criteria section
	sectionAcceptanceCriteria: string;
	fieldCriterion: string;
	hintCriterion: string;

	// Form — What Not To Do section
	sectionWhatNotToDo: string;
	fieldProhibition: string;
	hintProhibition: string;

	// Form — Documentation References section
	sectionDocRefs: string;
	fieldDocTitle: string;
	fieldDocUrl: string;
	fieldDocDescriptionOptional: string;

	// Clear entries dialog
	clearDialogTitle: string;
	clearDialogContent: string;
	clearDialogConfirm: string;
	clearDialogCancel: string;

	// Settings page — language
	settingsTitle: string;
	settingsLanguage: string;
	languagePtBR: string;
	languageEn: string;
	settingsTheme: string;
	themeLight: string;
	themeDark: string;

	// Generated markdown headings
	mdProjectOverview: string;
	mdTechStack: string;
	mdTechCategory: string;
	mdTechTechnology: string;
	mdTechVersionNotes: string;
	mdSetupCommands: string;
	mdSetupCommand: string;
	mdSetupDescription: string;
	mdCoreFeatures: string;
	mdAcceptanceCriteria: string;
	mdWhatNotToDo: string;
	mdDocumentationReferences: string;

	// Settings page — custom agents
	sectionCustomAgents: string;
	fieldAgentName: string;
	hintAgentName: string;
	fieldAgentFilename: string;
	hintAgentFilename: string;
}

const ptBR: AppStrings = {
	saving: 'Salvando...',
	add: 'Adicionar',
	saveFileLabel: (f) => `Salvar ${f}`,
	copy: 'Copiar',
	copied: 'Copiado!',
	previewPlaceholder: 'O preview aparecerá aqui conforme você preenche o formulário.',
	sectionProject: 'Projeto',
	fieldName: 'Nome',
	fieldDescription: 'Descrição',
	fieldTargetAi: 'Agente de IA alvo',
	sectionTechStack: 'Tech Stack',
	fieldCategory: 'Categoria',
	hintCategory: 'Frontend, Backend, Database…',
	fieldTechnology: 'Tecnologia',
	hintTechnology: 'Flutter, PostgreSQL…',
	fieldVersionNotes: 'Versão / Notas',
	hintVersionNotes: '3.10, gerenciado via Docker…',
	sectionSetupCommands: 'Comandos de Setup',
	fieldCommand: 'Comando',
	hintCommand: 'flutter pub get',
	fieldCommandDescription: 'Descrição',
	hintCommandDescription: 'Instalar dependências',
	sectionCoreFeatures: 'Funcionalidades Principais',
	fieldFeature: 'Funcionalidade',
	hintFeature: 'Autenticação com JWT',
	sectionAcceptanceCriteria: 'Critérios de Aceite',
	fieldCriterion: 'Critério',
	hintCriterion: 'Testes de integração passando',
	sectionWhatNotToDo: 'O Que Não Fazer',
	fieldProhibition: 'Proibição / Anti-padrão',
	hintProhibition: 'Nunca commitar secrets',
	sectionDocRefs: 'Documentações de Referência',
	fieldDocTitle: 'Título',
	fieldDocUrl: 'URL',
	fieldDocDescriptionOptional: 'Descrição (opcional)',
	clearDialogTitle: 'Limpar entradas?',
	clearDialogContent: 'Deseja limpar todos os campos para começar um novo arquivo?',
	clearDialogConfirm: 'Limpar',
	clearDialogCancel: 'Manter',
	settingsTitle: 'Configurações',
	settingsLanguage: 'Idioma',
	languagePtBR: 'Português (Brasil)',
	languageEn: 'English',
	settingsTheme: 'Tema',
	themeLight: 'Claro',
	themeDark: 'Escuro',
	mdProjectOverview: 'Visão Geral do Projeto',
	mdTechStack: 'Tech Stack',
	mdTechCategory: 'Categoria',
	mdTechTechnology: 'Tecnologia',
	mdTechVersionNotes: 'Versão / Notas',
	mdSetupCommands: 'Comandos de Setup',
	mdSetupCommand: 'Comando',
	mdSetupDescription: 'Descrição',
	mdCoreFeatures: 'Funcionalidades Principais',
	mdAcceptanceCriteria: 'Critérios de Aceite',
	mdWhatNotToDo: 'O Que Não Fazer',
	mdDocumentationReferences: 'Documentações de Referência',
	sectionCustomAgents: 'Agentes Personalizados',
	fieldAgentName: 'Nome do agente',
	hintAgentName: 'Meu Agente',
	fieldAgentFilename: 'Nome do arquivo',
	hintAgentFilename: 'MEUAGENTE.md'
};

const en: AppStrings = {
	saving: 'Saving...',
	add: 'Add',
	saveFileLabel: (f) => `Save ${f}`,
	copy: 'Copy',
	copied: 'Copied!',
	previewPlaceholder: 'The preview will appear here as you fill in the form.',
	sectionProject: 'Project',
	fieldName: 'Name',
	fieldDescription: 'Description',
	fieldTargetAi: 'Target AI Agent',
	sectionTechStack: 'Tech Stack',
	fieldCategory: 'Category',
	hintCategory: 'Frontend, Backend, Database…',
	fieldTechnology: 'Technology',
	hintTechnology: 'Flutter, PostgreSQL…',
	fieldVersionNotes: 'Version / Notes',
	hintVersionNotes: '3.10, managed via Docker…',
	sectionSetupCommands: 'Setup Commands',
	fieldCommand: 'Command',
	hintCommand: 'flutter pub get',
	fieldCommandDescription: 'Description',
	hintCommandDescription: 'Install dependencies',
	sectionCoreFeatures: 'Core Features',
	fieldFeature: 'Feature',
	hintFeature: 'JWT Authentication',
	sectionAcceptanceCriteria: 'Acceptance Criteria',
	fieldCriterion: 'Criterion',
	hintCriterion: 'Integration tests passing',
	sectionWhatNotToDo: 'What Not To Do',
	fieldProhibition: 'Prohibition / Anti-pattern',
	hintProhibition: 'Never commit secrets',
	sectionDocRefs: 'Documentation References',
	fieldDocTitle: 'Title',
	fieldDocUrl: 'URL',
	fieldDocDescriptionOptional: 'Description (optional)',
	clearDialogTitle: 'Clear entries?',
	clearDialogContent: 'Do you want to clear all fields to start a new file?',
	clearDialogConfirm: 'Clear',
	clearDialogCancel: 'Keep',
	settingsTitle: 'Settings',
	settingsLanguage: 'Language',
	languagePtBR: 'Português (Brasil)',
	languageEn: 'English',
	settingsTheme: 'Theme',
	themeLight: 'Light',
	themeDark: 'Dark',
	mdProjectOverview: 'Project Overview',
	mdTechStack: 'Tech Stack',
	mdTechCategory: 'Category',
	mdTechTechnology: 'Technology',
	mdTechVersionNotes: 'Version / Notes',
	mdSetupCommands: 'Setup Commands',
	mdSetupCommand: 'Command',
	mdSetupDescription: 'Description',
	mdCoreFeatures: 'Core Features',
	mdAcceptanceCriteria: 'Acceptance Criteria',
	mdWhatNotToDo: 'What Not To Do',
	mdDocumentationReferences: 'Documentation References',
	sectionCustomAgents: 'Custom Agents',
	fieldAgentName: 'Agent name',
	hintAgentName: 'My Agent',
	fieldAgentFilename: 'Filename',
	hintAgentFilename: 'MYAGENT.md'
};

export const strings: Record<Language, AppStrings> = { ptBR, en };
