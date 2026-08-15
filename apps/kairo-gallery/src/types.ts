export type KairoKind = 'command' | 'frontend';
export type KairoTemplateId = 'frontend-typescript' | 'typescript' | 'go';
export type KairoTemplateLabel = 'Frontend (TypeScript)' | 'TypeScript' | 'Go';

export interface KairoItem {
  description?: string;
  id: string;
  kind: KairoKind;
  runCommand: string;
  templateId: KairoTemplateId;
  templateLabel: KairoTemplateLabel;
}
