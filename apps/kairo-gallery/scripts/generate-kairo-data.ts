import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { getKairoMetadata, repoRoot } from '@kairo-labo/kairo-core';

const outputPath = join(repoRoot, 'apps/kairo-gallery/public/kairo-data.json');

const kairos = await getKairoMetadata();
const nextContent = renderKairoData(kairos);
const currentContent = await readFile(outputPath, 'utf8').catch(() => '');

await mkdir(dirname(outputPath), { recursive: true });

if (currentContent !== nextContent) {
  await writeFile(outputPath, nextContent, 'utf8');
}

function renderKairoData(
  kairos: Awaited<ReturnType<typeof getKairoMetadata>>,
): string {
  return `${JSON.stringify(
    {
      kairos: kairos.map(
        ({ description, id, kind, runCommand, templateId, templateLabel }) => ({
          description,
          id,
          kind,
          ...(templateId === 'go' ? {} : { runCommand }),
          templateId,
          templateLabel,
        }),
      ),
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  )}\n`;
}
