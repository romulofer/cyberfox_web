import * as v from 'valibot';
import { builtInAgents } from '../agents/builtInAgents';
import type { Language } from '../i18n/strings';
import { templateSectionKeys } from './sectionContent';
import type {
	AiTarget,
	DocumentationReference,
	ProjectConfig,
	ProjectPhase,
	SectionContent,
	SectionTemplate,
	SetupCommand,
	TechStackEntry,
	TemplateSectionKey
} from './types';

// Runtime validation for every payload that crosses a trust boundary: share links,
// localStorage, the templates API. The parsers are lenient on purpose: a malformed
// item is dropped or filled with defaults instead of failing the whole payload, but
// a value with the wrong top-level shape is rejected (returns null). Unknown keys
// are always dropped, so nothing outside the schema can reach the stores.

const MAX_ID_LENGTH = 100;
const MAX_NAME_LENGTH = 200;
const MAX_FILENAME_LENGTH = 255;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// An object schema that rejects arrays and null, which valibot's `object` would accept.
function record<const Entries extends v.ObjectEntries>(entries: Entries) {
	return v.pipe(v.custom<Record<string, unknown>>(isRecord), v.object(entries));
}

// An array whose invalid entries are dropped instead of failing the whole array.
function lenientArray<const Item extends v.GenericSchema>(item: Item) {
	return v.pipe(
		v.array(v.unknown()),
		v.transform((entries) =>
			entries.flatMap((entry) => {
				const result = v.safeParse(item, entry);
				return result.success ? [result.output as v.InferOutput<Item>] : [];
			})
		)
	);
}

const text = v.fallback(v.string(), '');

const TechStackEntrySchema = record({
	category: text,
	technology: text,
	versionOrNotes: text
});

const SetupCommandSchema = record({ command: text, description: text });

const DocumentationReferenceSchema = record({ title: text, url: text, description: text });

const ProjectPhaseSchema = record({
	name: text,
	description: text,
	tasks: v.fallback(lenientArray(v.string()), () => [])
});

const AiTargetSchema = record({
	name: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(MAX_NAME_LENGTH)),
	filename: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(MAX_FILENAME_LENGTH))
});

const ProjectConfigSchema = record({
	projectName: v.optional(v.string(), ''),
	description: v.optional(v.string(), ''),
	targetAi: v.optional(AiTargetSchema, () => ({ ...builtInAgents[0] })),
	techStack: v.optional(lenientArray(TechStackEntrySchema), () => []),
	setupCommands: v.optional(lenientArray(SetupCommandSchema), () => []),
	coreFeatures: v.optional(lenientArray(v.string()), () => []),
	phases: v.optional(lenientArray(ProjectPhaseSchema), () => []),
	acceptanceCriteria: v.optional(lenientArray(v.string()), () => []),
	whatToDo: v.optional(lenientArray(v.string()), () => []),
	whatNotToDo: v.optional(lenientArray(v.string()), () => []),
	documentationReferences: v.optional(lenientArray(DocumentationReferenceSchema), () => [])
});

// Compile-time check that the schemas produce the shapes the app already uses.
type Assert<T extends true> = T;
type Extends<A, B> = A extends B ? true : false;
export type _SchemaMatchesTypes = [
	Assert<Extends<v.InferOutput<typeof TechStackEntrySchema>, TechStackEntry>>,
	Assert<Extends<v.InferOutput<typeof SetupCommandSchema>, SetupCommand>>,
	Assert<Extends<v.InferOutput<typeof DocumentationReferenceSchema>, DocumentationReference>>,
	Assert<Extends<v.InferOutput<typeof ProjectPhaseSchema>, ProjectPhase>>,
	Assert<Extends<v.InferOutput<typeof AiTargetSchema>, AiTarget>>,
	Assert<Extends<v.InferOutput<typeof ProjectConfigSchema>, ProjectConfig>>
];

// Returns a complete, normalized config, or null when the input is not a config.
export function parseProjectConfig(input: unknown): ProjectConfig | null {
	const result = v.safeParse(ProjectConfigSchema, input);
	return result.success ? result.output : null;
}

const sectionContentSchemas: Record<
	TemplateSectionKey,
	v.GenericSchema<unknown, SectionContent>
> = {
	description: v.string(),
	techStack: lenientArray(TechStackEntrySchema),
	setupCommands: lenientArray(SetupCommandSchema),
	coreFeatures: lenientArray(v.string()),
	phases: lenientArray(ProjectPhaseSchema),
	acceptanceCriteria: lenientArray(v.string()),
	whatToDo: lenientArray(v.string()),
	whatNotToDo: lenientArray(v.string()),
	documentationReferences: lenientArray(DocumentationReferenceSchema)
};

// Validates and normalizes template content against the shape its section requires.
export function parseSectionContent(
	section: TemplateSectionKey,
	content: unknown
): SectionContent | null {
	const schema = sectionContentSchemas[section];
	if (!schema) return null;
	const result = v.safeParse(schema, content);
	return result.success ? result.output : null;
}

const TemplateEnvelopeSchema = record({
	id: v.pipe(v.string(), v.minLength(1), v.maxLength(MAX_ID_LENGTH)),
	name: v.pipe(v.string(), v.minLength(1), v.maxLength(MAX_NAME_LENGTH)),
	section: v.picklist(templateSectionKeys),
	content: v.unknown()
});

export function parseTemplate(input: unknown): SectionTemplate | null {
	const envelope = v.safeParse(TemplateEnvelopeSchema, input);
	if (!envelope.success) return null;
	const { id, name, section, content } = envelope.output;
	const parsedContent = parseSectionContent(section, content);
	if (parsedContent === null) return null;
	return { id, section, name, content: parsedContent };
}

// Parses a list of templates. Invalid entries and duplicate ids are dropped; a
// non-array input returns null so callers can tell "no data" from "empty list".
export function parseTemplates(input: unknown): SectionTemplate[] | null {
	if (!Array.isArray(input)) return null;
	const seen = new Set<string>();
	const templates: SectionTemplate[] = [];
	for (const entry of input) {
		const template = parseTemplate(entry);
		if (!template || seen.has(template.id)) continue;
		seen.add(template.id);
		templates.push(template);
	}
	return templates;
}

// Agent filenames are compared case-insensitively: two agents that only differ in
// case would write the same file on case-insensitive file systems.
export function agentFilenameKey(filename: string): string {
	return filename.trim().toLowerCase();
}

export type PersistedSettings = {
	language: Language;
	theme: 'light' | 'dark';
	customAgents: AiTarget[];
};

const LanguageSchema = v.picklist(['ptBR', 'en'] as const satisfies readonly Language[]);
const ThemeSchema = v.picklist(['light', 'dark'] as const);

// Reads whatever was stored under the settings key. Each field is validated on its
// own, so one bad value never discards the others. Custom agents that are invalid or
// reuse a filename (of a built-in agent or an earlier custom one) are dropped.
export function parseSettings(input: unknown): Partial<PersistedSettings> {
	if (!isRecord(input)) return {};
	const settings: Partial<PersistedSettings> = {};

	const language = v.safeParse(LanguageSchema, input.language);
	if (language.success) settings.language = language.output;

	const theme = v.safeParse(ThemeSchema, input.theme);
	if (theme.success) settings.theme = theme.output;

	const agents = v.safeParse(lenientArray(AiTargetSchema), input.customAgents);
	if (agents.success) {
		const taken = new Set(builtInAgents.map((agent) => agentFilenameKey(agent.filename)));
		settings.customAgents = agents.output.filter((agent) => {
			const key = agentFilenameKey(agent.filename);
			if (taken.has(key)) return false;
			taken.add(key);
			return true;
		});
	}
	return settings;
}
