import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const commitStagedSkill = path.join(
  repoRoot,
  '.claude',
  'skills',
  'commit-staged',
  'SKILL.md',
);

const skillPairs = [
  {
    source: commitStagedSkill,
    target: path.join(
      repoRoot,
      '.cursor',
      'skills',
      'commit-staged',
      'SKILL.md',
    ),
  },
  {
    source: commitStagedSkill,
    target: path.join(
      repoRoot,
      '.codex',
      'skills',
      'commit-staged',
      'SKILL.md',
    ),
  },
];

const ensureParentDir = async (filePath) => {
  await mkdir(path.dirname(filePath), { recursive: true });
};

const syncSkill = async ({ source, target }) => {
  const content = await readFile(source, 'utf8');
  await ensureParentDir(target);
  await writeFile(target, content, 'utf8');
  const targetLabel = path.relative(repoRoot, target);
  return `${path.relative(repoRoot, source)} -> ${targetLabel}`;
};

const run = async () => {
  const results = await Promise.all(skillPairs.map(syncSkill));
  for (const item of results) {
    console.log(`synced: ${item}`);
  }
};

run().catch((error) => {
  console.error('[sync-skills] failed:', error);
  process.exitCode = 1;
});
