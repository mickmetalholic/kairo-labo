import { spawn } from 'node:child_process';

export async function runProcess(
  command: string[],
  cwd: string,
): Promise<void> {
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(...resolveSpawnCommand(command), {
      cwd,
      stdio: 'inherit',
    });

    child.on('error', (error) => {
      rejectPromise(error);
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(
        new Error(
          `Command failed (${command.join(' ')}), exit code ${code ?? 'unknown'}.`,
        ),
      );
    });
  });
}

function resolveSpawnCommand(command: string[]): [string, string[]] {
  if (process.platform !== 'win32') {
    return [command[0], command.slice(1)];
  }

  return ['cmd.exe', ['/d', '/s', '/c', ...command]];
}
