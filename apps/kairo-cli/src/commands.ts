import { select } from '@clack/prompts';
import { defineCommand, showUsage } from 'citty';
import {
  DEFAULT_TARGET_DIR,
  DEFAULT_TEMPLATE_ID,
  RESERVED_COMMAND_NAMES,
} from './constants.ts';
import { getExistingKairoNames } from './fs.ts';
import { createKairo, runKairo } from './kairo.ts';
import { unwrapPrompt } from './prompts.ts';
import { printList } from './ui.ts';

export const listCommand = defineCommand({
  meta: {
    name: 'list',
    description: 'Inspect templates and generated kairos.',
  },
  args: {
    dir: {
      type: 'string',
      alias: 'd',
      default: DEFAULT_TARGET_DIR,
      description: 'Override the kairos directory.',
    },
  },
  async run({ args }) {
    printList(await getExistingKairoNames(args.dir));
  },
});

export const newCommand = defineCommand({
  meta: {
    name: 'new',
    description: 'Create a new standalone kairo.',
  },
  args: {
    kairoName: {
      type: 'positional',
      required: false,
      description: 'Kairo name, for example `raf-basic`.',
    },
    dir: {
      type: 'string',
      alias: 'd',
      default: DEFAULT_TARGET_DIR,
      description: 'Override the kairos directory.',
    },
    template: {
      type: 'string',
      alias: 't',
      default: DEFAULT_TEMPLATE_ID,
      description: 'Template id to use.',
    },
  },
  async run({ args }) {
    await createKairo({
      kairoName: args.kairoName,
      targetDir: args.dir,
      templateId: args.template,
    });
  },
});

export const runCommand = defineCommand({
  meta: {
    name: 'run',
    description: 'Install dependencies if needed and start a kairo.',
  },
  args: {
    kairoName: {
      type: 'positional',
      required: false,
      description: 'Kairo name to run.',
    },
    dir: {
      type: 'string',
      alias: 'd',
      default: DEFAULT_TARGET_DIR,
      description: 'Override the kairos directory.',
    },
  },
  async run({ args }) {
    await runKairo({
      kairoName: args.kairoName,
      targetDir: args.dir,
    });
  },
});

export const mainCommand = defineCommand({
  meta: {
    name: 'kairo',
    version: '0.1.0',
    description: 'Create and run standalone kairos from the repo root.',
  },
  args: {
    dir: {
      type: 'string',
      alias: 'd',
      default: DEFAULT_TARGET_DIR,
      description: 'Override the kairos directory.',
    },
    template: {
      type: 'string',
      alias: 't',
      default: DEFAULT_TEMPLATE_ID,
      description: 'Template id to use.',
    },
    kairoName: {
      type: 'positional',
      required: false,
      description: 'Kairo name to create directly.',
    },
  },
  subCommands: {
    list: listCommand,
    new: newCommand,
    run: runCommand,
  },
  async run({ args }) {
    const kairoName = typeof args.kairoName === 'string' ? args.kairoName : '';

    if (kairoName && RESERVED_COMMAND_NAMES.has(kairoName)) {
      return;
    }

    if (kairoName) {
      await createKairo({
        kairoName,
        targetDir: args.dir,
        templateId: args.template,
      });
      return;
    }

    await openInteractiveHome({
      targetDir: args.dir,
      templateId: args.template,
    });
  },
});

interface InteractiveHomeOptions {
  targetDir: string;
  templateId: string;
}

async function openInteractiveHome(
  options: InteractiveHomeOptions,
): Promise<void> {
  const action = unwrapPrompt(
    await select({
      message: 'What do you want to do?',
      options: [
        {
          value: 'create',
          label: 'Create a new kairo',
          hint: 'Scaffold a fresh standalone kairo folder.',
        },
        {
          value: 'run',
          label: 'Run an existing kairo',
          hint: 'Install dependencies if needed, then start Vite.',
        },
        {
          value: 'list',
          label: 'Inspect templates and kairos',
          hint: 'Get a quick workspace snapshot.',
        },
        {
          value: 'help',
          label: 'Show command usage',
          hint: 'Print the reference for every entrypoint.',
        },
      ],
    }),
  );

  if (action === 'create') {
    await createKairo({
      targetDir: options.targetDir,
      templateId: options.templateId,
    });
    return;
  }

  if (action === 'run') {
    await runKairo({
      targetDir: options.targetDir,
    });
    return;
  }

  if (action === 'list') {
    printList(await getExistingKairoNames(options.targetDir));
    return;
  }

  await showUsage(mainCommand);
}
