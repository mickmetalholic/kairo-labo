#!/usr/bin/env node

import { cancel } from '@clack/prompts';
import { runMain } from 'citty';
import { mainCommand } from './commands.ts';
import { RESERVED_COMMAND_NAMES } from './constants.ts';
import { printHero } from './ui.ts';

const rawArgs = process.argv.slice(2);
const normalizedArgs = normalizeArgs(rawArgs);

if (!isHelpRequest(normalizedArgs)) {
  printHero();
}

try {
  await runMain(mainCommand, {
    rawArgs: normalizedArgs,
  });
} catch (error) {
  cancel(formatError(error));
  process.exitCode = 1;
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown CLI error.';
}

function normalizeArgs(args: string[]): string[] {
  if (args[0] === 'help') {
    return ['--help', ...args.slice(1)];
  }

  const entryArgIndex = findEntryArgIndex(args);

  if (entryArgIndex === -1) {
    return args;
  }

  const entryArg = args[entryArgIndex];
  const beforeEntry = args.slice(0, entryArgIndex);
  const afterEntry = args.slice(entryArgIndex + 1);

  if (entryArg === 'help') {
    const helpTarget = afterEntry[0];

    return helpTarget && RESERVED_COMMAND_NAMES.has(helpTarget)
      ? [helpTarget, ...beforeEntry, '--help', ...afterEntry.slice(1)]
      : ['--help', ...beforeEntry, ...afterEntry];
  }

  if (RESERVED_COMMAND_NAMES.has(entryArg)) {
    return entryArgIndex === 0
      ? args
      : [entryArg, ...beforeEntry, ...afterEntry];
  }

  return ['new', ...beforeEntry, entryArg, ...afterEntry];
}

function findEntryArgIndex(args: string[]): number {
  const optionsWithValue = new Set(['--dir', '-d', '--template', '-t']);

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--') {
      return index + 1 < args.length ? index + 1 : -1;
    }

    if (optionsWithValue.has(arg)) {
      index += 1;
      continue;
    }

    if (arg.startsWith('-')) {
      continue;
    }

    return index;
  }

  return -1;
}

function isHelpRequest(args: string[]): boolean {
  return args.includes('--help') || args.includes('-h');
}
