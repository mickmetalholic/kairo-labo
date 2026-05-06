import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type KairoKind = 'command' | 'frontend';
export type KairoTemplateId = 'frontend-typescript' | 'typescript';
export type KairoTemplateLabel = 'Frontend (TypeScript)' | 'TypeScript';

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

  return {
    description: normalizeDescription(manifest.description),
    id,
    kind,
    paths: {
      entry: resolveKairoEntry(folderPath, kind),
      folder: folderPath,
    },
    runCommand: `pnpm kairo run ${id}`,
    templateId: resolveKairoTemplateId(kind),
    templateLabel: resolveKairoTemplateLabel(kind),
  };
}

function normalizeDescription(
  description: string | undefined,
): string | undefined {
  const trimmedDescription = description?.trim();

  return trimmedDescription ? trimmedDescription : undefined;
}

function resolveKairoEntry(folderPath: string, kind: KairoKind): string {
  return join(folderPath, 'src', kind === 'frontend' ? 'main.ts' : 'index.ts');
}

function resolveKairoTemplateId(kind: KairoKind): KairoTemplateId {
  return kind === 'frontend' ? 'frontend-typescript' : 'typescript';
}

function resolveKairoTemplateLabel(kind: KairoKind): KairoTemplateLabel {
  return kind === 'frontend' ? 'Frontend (TypeScript)' : 'TypeScript';
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
