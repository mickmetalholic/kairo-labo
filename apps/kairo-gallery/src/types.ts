export type KairoKind = 'command' | 'frontend';
export type KairoTemplateId = 'frontend-typescript' | 'typescript';
export type KairoTemplateLabel = 'Frontend (TypeScript)' | 'TypeScript';

export interface KairoItem {
  description?: string;
  id: string;
  kind: KairoKind;
  runCommand: string;
  templateId: KairoTemplateId;
  templateLabel: KairoTemplateLabel;
}
