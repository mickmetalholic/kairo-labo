import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

export function pathExists(path: string): boolean {
  return existsSync(path);
}

export async function getExistingKairoNames(
  targetDir: string,
): Promise<string[]> {
  const outputDir = resolve(targetDir);

  if (!existsSync(outputDir)) {
    return [];
  }

  const entries = await readdir(outputDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

export async function copyTemplateDirectory(
  sourceDir: string,
  destinationDir: string,
  replacements: Record<string, string>,
): Promise<void> {
  await mkdir(destinationDir, { recursive: true });

  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = join(sourceDir, entry.name);
    const destinationPath = join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      await copyTemplateDirectory(sourcePath, destinationPath, replacements);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const sourceContents = await readFile(sourcePath, 'utf8');
    const renderedContents = replaceTokens(sourceContents, replacements);

    await mkdir(dirname(destinationPath), { recursive: true });
    await writeFile(destinationPath, renderedContents, 'utf8');
  }
}

function replaceTokens(
  source: string,
  replacements: Record<string, string>,
): string {
  let output = source;

  for (const [token, value] of Object.entries(replacements)) {
    output = output.replaceAll(token, value);
  }

  return output;
}
