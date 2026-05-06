import { cancel, isCancel, select, text } from '@clack/prompts';
import { DEFAULT_TARGET_DIR, KAIRO_NAME_PATTERN } from './constants.ts';
import { templates } from './templates.ts';

export async function promptForTemplateId(
  initialValue: string,
): Promise<string> {
  return unwrapPrompt(
    await select({
      message: 'Choose a template',
      initialValue,
      options: templates.map((template) => ({
        value: template.id,
        label: template.label,
        hint: template.description,
      })),
    }),
  );
}

export async function promptForKairoName(
  message: string,
  placeholder: string,
): Promise<string> {
  return unwrapPrompt(
    await text({
      message,
      placeholder,
      validate(value) {
        return KAIRO_NAME_PATTERN.test(value ?? '')
          ? undefined
          : 'Use lowercase kebab-case, for example `raf-basic`.';
      },
    }),
  );
}

export async function promptForTargetDir(
  initialValue: string,
): Promise<string> {
  const value = unwrapPrompt(
    await text({
      message: 'Kairos directory',
      defaultValue: initialValue,
      placeholder: DEFAULT_TARGET_DIR,
      validate(value) {
        return (value?.trim() || initialValue).trim().length > 0
          ? undefined
          : 'Kairos directory cannot be empty.';
      },
    }),
  );

  return value.trim() || initialValue;
}

export async function promptForExistingKairoName(
  kairoNames: string[],
): Promise<string> {
  if (kairoNames.length === 0) {
    throw new Error('No kairos were found yet. Create one first.');
  }

  return unwrapPrompt(
    await select({
      message: 'Choose a kairo to run',
      options: kairoNames.map((kairoName) => ({
        value: kairoName,
        label: kairoName,
        hint: 'Ready to run.',
      })),
    }),
  );
}

export function unwrapPrompt<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel('Cancelled.');
    process.exit(0);
  }

  return value as T;
}
