import { createConsola } from 'consola';
import logUpdate from 'log-update';
import pc from 'picocolors';
import type { RuntimeLog } from './types.ts';

interface DashboardState {
  host: string;
  logs: RuntimeLog[];
  port: number;
  subtitle: string;
}

const logger = createConsola({
  fancy: true,
});

export class TerminalDashboard {
  readonly #state: DashboardState;
  readonly #interactive: boolean;

  constructor(options: { host: string; port: number; subtitle?: string }) {
    this.#state = {
      host: options.host,
      logs: [],
      port: options.port,
      subtitle: options.subtitle ?? 'local runtime controller',
    };
    this.#interactive = Boolean(process.stdout.isTTY && !process.env.CI);
  }

  start(): void {
    this.render();
  }

  stop(): void {
    if (this.#interactive) {
      logUpdate.done();
    }
  }

  addLog(log: RuntimeLog): void {
    this.#state.logs.push(log);

    if (this.#state.logs.length > 300) {
      this.#state.logs.shift();
    }

    if (!this.#interactive) {
      logger.log(formatInlineLog(log));
      return;
    }

    this.render();
  }

  render(): void {
    const frame = renderFrame(this.#state);

    if (!this.#interactive) {
      logger.box(frame);
      return;
    }

    logUpdate(frame);
  }
}

function renderFrame(state: DashboardState): string {
  const width = Math.min(process.stdout.columns || 100, 110);
  const bodyWidth = width - 4;
  const address = `http://${state.host}:${state.port}`;
  const logLines =
    state.logs.length === 0
      ? [pc.dim('Waiting for frontend kairo process output...')]
      : state.logs.slice(-16).map(formatPanelLog);

  return [
    top(width),
    row(
      pc.bold(pc.cyan('kairo server')) + pc.dim(`  -  ${state.subtitle}`),
      bodyWidth,
    ),
    row(
      `${pc.dim('API')} ${pc.green(address)}   ${pc.dim('SSE')} ${pc.green('/api/events')}`,
      bodyWidth,
    ),
    divider(width),
    row(pc.bold('Frontend Process Output'), bodyWidth),
    ...logLines.map((line) => row(line, bodyWidth)),
    bottom(width),
  ].join('\n');
}

function formatInlineLog(log: RuntimeLog): string {
  const target = log.kairoId ?? log.source;

  return `${pc.dim(`[${target}]`)} ${log.message}`;
}

function formatPanelLog(log: RuntimeLog): string {
  const time = new Date(log.timestamp).toLocaleTimeString();
  const source = log.kairoId ?? log.source;
  const label =
    log.stream === 'stderr' || log.stream === 'error'
      ? pc.red(source)
      : log.type === 'status'
        ? pc.cyan(source)
        : pc.gray(source);

  return `${pc.dim(time)} ${label} ${colorMessage(log)}`;
}

function colorMessage(log: RuntimeLog): string {
  if (log.stream === 'stderr' || log.stream === 'error') {
    return pc.red(log.message);
  }

  if (log.type === 'status') {
    return pc.cyan(log.message);
  }

  return log.message;
}

function top(width: number): string {
  return `+${'-'.repeat(width - 2)}+`;
}

function divider(width: number): string {
  return `|${'-'.repeat(width - 2)}|`;
}

function bottom(width: number): string {
  return top(width);
}

function row(content: string, bodyWidth: number): string {
  const plain = stripAnsi(content);
  const clipped =
    plain.length > bodyWidth
      ? content.slice(0, Math.max(0, bodyWidth - 1)) + pc.dim('...')
      : content;
  const padding = Math.max(0, bodyWidth - stripAnsi(clipped).length);

  return `| ${clipped}${' '.repeat(padding)} |`;
}

function stripAnsi(value: string): string {
  return value.replace(
    new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g'),
    '',
  );
}
