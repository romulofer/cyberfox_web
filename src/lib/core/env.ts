// Feature flag: the section-templates CRUD is available in dev and self-hosted
// (Docker) builds, but disabled on the public GitHub Pages deployment. The CI
// workflow sets VITE_TEMPLATES_ENABLED=false for the GitHub Pages build; dev and
// the Dockerfile leave it unset, so templates stay enabled by default.
export const templatesEnabled = import.meta.env.VITE_TEMPLATES_ENABLED !== 'false';
