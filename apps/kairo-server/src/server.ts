import { getKairoMetadata } from '@kairo-labo/kairo-core';
import { startKairoServer } from './app.ts';

const args = new Set(process.argv.slice(2));

if (args.has('--help')) {
  printHelp();
  process.exit(0);
}

if (args.has('--check')) {
  const kairos = await getKairoMetadata();
  console.log(`kairo-server check ok (${kairos.length} kairos)`);
  process.exit(0);
}

const handle = await startKairoServer({
  subtitle: 'standalone local controller',
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    void handle.close().then(() => {
      process.exit(0);
    });
  });
}

function printHelp(): void {
  console.log('Usage: kairo-server [--check] [--help]');
}
