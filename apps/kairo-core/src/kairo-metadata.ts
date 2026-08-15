import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type KairoKind = 'command' | 'frontend';
export type KairoTemplateId = 'frontend-typescript' | 'typescript' | 'go';
export type KairoTemplateLabel = 'Frontend (TypeScript)' | 'TypeScript' | 'Go';

interface KairoPackageJson {
  dependencies?: Record<string, string>;
  description?: string;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

export interface KairoMetadata {
  description?: string;
  id: string;
  kind: KairoKind;
  paths: {
    entry: string;
    folder: string;
  };
  runCommand: string;
  templateId: KairoTemplateId;
  templateLabel: KairoTemplateLabel;
}

export const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
export const kairosDir = join(repoRoot, 'kairos');

export async function getKairoMetadata(): Promise<KairoMetadata[]> {
  const entries = await readdir(kairosDir, { withFileTypes: true }).catch(
    () => [],
  );
  const kairoDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((first, second) => first.localeCompare(second));

  return Promise.all(kairoDirs.map(createKairo));
}

async function createKairo(id: string): Promise<KairoMetadata> {
  const folderPath = join(kairosDir, id);
  const manifest = await readKairoManifest(id);

  const kind = isFrontendKairo(manifest) ? 'frontend' : 'command';
  const templateId = resolveKairoTemplateId(folderPath, kind);
  const description = normalizeDescription(
    manifest.description ?? (await readKairoReadmeDescription(folderPath)),
  );

  return {
    description,
    id,
    kind,
    paths: {
      entry: resolveKairoEntry(folderPath, kind, templateId),
      folder: folderPath,
    },
    runCommand: `pnpm kairo run ${id}`,
    templateId,
    templateLabel: resolveKairoTemplateLabel(templateId),
  };
}

function normalizeDescription(
  description: string | undefined,
): string | undefined {
  const trimmedDescription = description?.trim();

  return trimmedDescription ? trimmedDescription : undefined;
}

function resolveKairoEntry(
  folderPath: string,
  kind: KairoKind,
  templateId: KairoTemplateId,
): string {
  if (templateId === 'go') {
    return join(folderPath, 'main.go');
  }

  return join(folderPath, 'src', kind === 'frontend' ? 'main.ts' : 'index.ts');
}

function resolveKairoTemplateId(
  folderPath: string,
  kind: KairoKind,
): KairoTemplateId {
  if (kind === 'frontend') {
    return 'frontend-typescript';
  }

  return existsSync(join(folderPath, 'go.mod')) ? 'go' : 'typescript';
}

function resolveKairoTemplateLabel(
  templateId: KairoTemplateId,
): KairoTemplateLabel {
  if (templateId === 'frontend-typescript') {
    return 'Frontend (TypeScript)';
  }

  return templateId === 'go' ? 'Go' : 'TypeScript';
}

async function readKairoManifest(id: string): Promise<KairoPackageJson> {
  const manifestPath = join(kairosDir, id, 'package.json');
  const raw = await readFile(manifestPath, 'utf8').catch(() => '{}');

  try {
    return JSON.parse(raw) as KairoPackageJson;
  } catch {
    return {};
  }
}

async function readKairoReadmeDescription(
  folderPath: string,
): Promise<string | undefined> {
  const readme = await readFile(join(folderPath, 'README.md'), 'utf8').catch(
    () => '',
  );
  const descriptionBlock = readme
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .find((block) => {
      const firstLine = block.split(/\r?\n/, 1)[0] ?? '';

      return (
        block.length > 0 &&
        !firstLine.startsWith('#') &&
        !firstLine.startsWith('```') &&
        !firstLine.startsWith('-') &&
        !/^\d+\./.test(firstLine)
      );
    });

  return descriptionBlock?.replaceAll(/\s+/g, ' ');
}

function isFrontendKairo(manifest: KairoPackageJson): boolean {
  const dependencies = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
  };

  return Boolean(
    dependencies.vite ||
      manifest.scripts?.dev?.includes('vite') ||
      manifest.scripts?.preview?.includes('vite'),
  );
}
