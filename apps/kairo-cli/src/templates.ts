import { fileURLToPath } from 'node:url';

export interface TemplateDefinition {
  id: string;
  label: string;
  description: string;
  sourceDir: string;
}

export const templates: TemplateDefinition[] = [
  {
    id: 'frontend-typescript',
    label: 'Frontend (TypeScript)',
    description:
      'Standalone Vite + TypeScript + DOM starter for frontend kairos.',
    sourceDir: 'frontend-typescript',
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    description:
      'Standalone Node + TypeScript starter for command and algorithm kairos.',
    sourceDir: 'typescript',
  },
];

export function getTemplate(id: string): TemplateDefinition | undefined {
  return templates.find((template) => template.id === id);
}

export function resolveTemplateSourceDir(template: TemplateDefinition): string {
  return fileURLToPath(
    new URL(`../templates/${template.sourceDir}/`, import.meta.url),
  );
}
