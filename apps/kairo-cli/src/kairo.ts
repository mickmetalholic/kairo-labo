import { readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cancel, confirm } from '@clack/prompts';
import pc from 'picocolors';
import yoctoSpinner from 'yocto-spinner';
import { DEFAULT_TEMPLATE_ID, KAIRO_NAME_PATTERN } from './constants.ts';
import {
  copyTemplateDirectory,
  getExistingKairoNames,
  pathExists,
} from './fs.ts';
import { runProcess } from './process.ts';
import {
  promptForExistingKairoName,
  promptForKairoName,
  promptForTargetDir,
  promptForTemplateId,
  unwrapPrompt,
} from './prompts.ts';
import { getTemplate, resolveTemplateSourceDir } from './templates.ts';
import type { CreateKairoOptions, RunKairoOptions } from './types.ts';
import { logger, printKairoSummary, printNextSteps } from './ui.ts';

export async function createKairo(options: CreateKairoOptions): Promise<void> {
  const templateId =
    options.kairoName === undefined
      ? await promptForTemplateId(options.templateId ?? DEFAULT_TEMPLATE_ID)
      : (options.templateId ?? DEFAULT_TEMPLATE_ID);
  const kairoName =
    options.kairoName ??
    (await promptForKairoName('Name for the new kairo', 'raf-basic'));
  const targetDir =
    options.kairoName === undefined
      ? await promptForTargetDir(options.targetDir)
      : options.targetDir;

  validateKairoName(kairoName);

  const template = getTemplate(templateId);

  if (!template) {
    throw new Error(
      `Unknown template \`${templateId}\`. Use \`pnpm kairo list\` to inspect available templates.`,
    );
  }

  const outputDir = resolve(targetDir, kairoName);

  if (pathExists(outputDir)) {
    throw new Error(
      `Kairo directory already exists: ${relative(process.cwd(), outputDir)}`,
    );
  }

  if (options.kairoName === undefined) {
    const shouldContinue = unwrapPrompt(
      await confirm({
        message: 'Create this kairo?',
        initialValue: true,
        active: 'Yes',
        inactive: 'No',
      }),
    );

    if (!shouldContinue) {
      cancel('Creation cancelled.');
      process.exit(0);
    }
  }

  printKairoSummary(templateId, kairoName, join(targetDir, kairoName));

  const copySpinner = yoctoSpinner({
    text: `Scaffolding ${relative(process.cwd(), outputDir)}`,
  }).start();

  try {
    const replacements = await createReplacements(kairoName);
    const templateDir = resolveTemplateSourceDir(template);

    await copyTemplateDirectory(templateDir, outputDir, replacements);
    copySpinner.success(`Created ${kairoName}`);
  } catch (error) {
    copySpinner.error('Scaffolding failed');
    throw error;
  }

  printNextSteps(outputDir, kairoName, templateId);
}

export async function runKairo(options: RunKairoOptions): Promise<void> {
  const kairoNames = await getExistingKairoNames(options.targetDir);
  const kairoName =
    options.kairoName ?? (await promptForExistingKairoName(kairoNames));

  validateKairoName(kairoName);

  const outputDir = resolve(options.targetDir, kairoName);

  if (!pathExists(outputDir)) {
    throw new Error(
      `Kairo directory was not found: ${relative(process.cwd(), outputDir)}`,
    );
  }

  if (pathExists(join(outputDir, 'go.mod'))) {
    logger.success(`Starting ${pc.bold(kairoName)}...`);
    await runProcess(['go', 'run', '.'], outputDir);
    return;
  }

  const packageJsonPath = join(outputDir, 'package.json');

  if (!pathExists(packageJsonPath)) {
    throw new Error(
      `Cannot run ${kairoName} because ${relative(process.cwd(), packageJsonPath)} is missing.`,
    );
  }

  if (!pathExists(join(outputDir, 'node_modules'))) {
    logger.info(`Installing dependencies for ${pc.bold(kairoName)}...`);
    await runProcess(['pnpm', 'install', '--ignore-workspace'], outputDir);
  }

  logger.success(`Starting ${pc.bold(kairoName)}...`);
  await runProcess(['pnpm', 'dev'], outputDir);
}

export function validateKairoName(kairoName: string): void {
  if (!KAIRO_NAME_PATTERN.test(kairoName)) {
    throw new Error(
      'Kairo name must be lowercase kebab-case, for example `raf-basic`.',
    );
  }
}

async function createReplacements(
  kairoName: string,
): Promise<Record<string, string>> {
  return {
    __KAIRO_NAME__: kairoName,
    __KAIRO_SLUG__: kairoName,
    __KAIRO_TITLE__: toTitleCase(kairoName),
    __VITE_VERSION__: await getWorkspaceCatalogVersion('vite'),
  };
}

async function getWorkspaceCatalogVersion(
  packageName: string,
): Promise<string> {
  const workspacePath = fileURLToPath(
    new URL('../../../pnpm-workspace.yaml', import.meta.url),
  );
  const workspace = await readFile(workspacePath, 'utf8');
  const match = workspace.match(
    new RegExp(`^\\s{2}${packageName}:\\s*["']?([^\\s"']+)["']?$`, 'm'),
  );

  if (!match?.[1]) {
    throw new Error(
      `Missing ${packageName} version in pnpm workspace catalog.`,
    );
  }

  return match[1];
}

function toTitleCase(value: string): string {
  return value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}
