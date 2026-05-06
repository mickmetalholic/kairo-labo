import { relative } from 'node:path';
import { intro, note, outro } from '@clack/prompts';
import { createConsola } from 'consola';
import pc from 'picocolors';
import { templates } from './templates.ts';

export const logger = createConsola({
  fancy: true,
});

export function printHero(): void {
  intro(
    pc.bold(
      pc.cyan('kairo labo') +
        pc.dim('  ·  polished standalone kairos from your repo root'),
    ),
  );

  note(
    [
      pc.bold(pc.magenta('A small workshop for sharp little kairos.')),
      pc.dim('Modern prompts, modern output, minimal ceremony.'),
    ].join('\n'),
    'Overview',
  );
}

export function printKairoSummary(
  templateId: string,
  kairoName: string,
  targetPath: string,
): void {
  note(
    [
      `${pc.bold('template')}  ${templateId}`,
      `${pc.bold('name')}      ${kairoName}`,
      `${pc.bold('path')}      ${targetPath}`,
    ].join('\n'),
    'Summary',
  );
}

export function printNextSteps(outputDir: string, kairoName: string): void {
  logger.log(pc.dim('Scaffold complete.'));
  note(
    [
      pc.bold('Next steps'),
      '',
      pc.cyan(`cd ${relative(process.cwd(), outputDir)}`),
      pc.cyan('pnpm install'),
      pc.cyan('pnpm dev'),
      '',
      pc.dim('Or from the repo root:'),
      pc.cyan(`pnpm kairo run ${kairoName}`),
    ].join('\n'),
    'Workspace',
  );

  outro(pc.green(`Ready: ${kairoName}`));
}

export function printList(kairoNames: string[]): void {
  const templateLines = templates.map(
    (template) => `${pc.magenta(template.id)}  ${pc.dim(template.description)}`,
  );
  const kairoLines =
    kairoNames.length === 0
      ? [pc.dim('No kairos yet.')]
      : kairoNames.map((kairoName) => `${pc.cyan('•')} ${kairoName}`);

  note(
    [
      pc.bold(pc.cyan('Templates')),
      ...templateLines,
      '',
      pc.bold(pc.cyan('Kairos')),
      ...kairoLines,
    ].join('\n'),
    'Workspace Snapshot',
  );
}
