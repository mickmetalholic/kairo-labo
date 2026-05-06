import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import {
  getKairoMetadata,
  type KairoMetadata,
  repoRoot,
} from '@kairo-labo/kairo-core';
import { TerminalDashboard } from './dashboard.ts';
import type {
  KairoStatus,
  LocalKairo,
  LogSource,
  RuntimeLog,
  RuntimeSnapshot,
} from './types.ts';

interface RuntimeState {
  child?: ChildProcessWithoutNullStreams;
  exitCode?: number | null;
  port: number;
  status: KairoStatus;
}

export interface KairoServerHandle {
  close: () => Promise<void>;
  emitExternalLog: (
    source: LogSource,
    stream: 'stderr' | 'stdout',
    chunk: Buffer,
  ) => void;
  server: Server;
}

export interface KairoServerOptions {
  dashboard?: TerminalDashboard;
  host?: string;
  port?: number;
  subtitle?: string;
}

const clients = new Set<ServerResponse>();
const logs: RuntimeLog[] = [];
const runtime = new Map<string, RuntimeState>();

export async function startKairoServer(
  options: KairoServerOptions = {},
): Promise<KairoServerHandle> {
  const host = options.host ?? '127.0.0.1';
  const port = options.port ?? Number(process.env.KAIRO_SERVER_PORT ?? '5174');
  const dashboard =
    options.dashboard ??
    new TerminalDashboard({
      host,
      port,
      subtitle: options.subtitle,
    });
  const server = createServer(async (request, response) => {
    try {
      await route({ dashboard, host, port, request, response });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown server error.';
      writeJson(response, 500, { error: message });
      emitLog(dashboard, {
        message,
        source: 'server',
        stream: 'error',
        type: 'log',
      });
    }
  });

  await new Promise<void>((resolvePromise) => {
    server.listen(port, host, resolvePromise);
  });

  dashboard.start();
  emitLog(dashboard, {
    message: `Listening on http://${host}:${port}`,
    source: 'server',
    stream: 'info',
    type: 'log',
  });

  return {
    close: () =>
      new Promise<void>((resolvePromise) => {
        for (const state of runtime.values()) {
          if (state.child) {
            killProcessTree(state.child);
          }
        }

        server.close(() => {
          dashboard.stop();
          resolvePromise();
        });
      }),
    emitExternalLog: (source, stream, chunk) => {
      emitProcessOutput(dashboard, source, stream, chunk);
    },
    server,
  };
}

interface RouteContext {
  dashboard: TerminalDashboard;
  host: string;
  port: number;
  request: IncomingMessage;
  response: ServerResponse;
}

async function route(context: RouteContext): Promise<void> {
  const { request, response } = context;
  const url = new URL(request.url ?? '/', `http://${request.headers.host}`);

  if (request.method === 'GET' && url.pathname === '/api/health') {
    writeJson(response, 200, {
      ok: true,
      repoRoot,
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/kairos') {
    writeJson(response, 200, await getSnapshot(context));
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/events') {
    openEventStream(response);
    return;
  }

  const match = url.pathname.match(/^\/api\/kairos\/([^/]+)\/([^/]+)$/);

  if (request.method === 'POST' && match) {
    const [, kairoId, action] = match;

    if (action === 'start') {
      await startKairo(context, kairoId);
      writeJson(response, 202, await getSnapshot(context));
      return;
    }

    if (action === 'stop') {
      await stopKairo(kairoId);
      writeJson(response, 202, await getSnapshot(context));
      return;
    }

    if (action === 'open') {
      const body = await readJsonBody<{ target?: string }>(request);
      await openKairoTarget(context, kairoId, body.target ?? 'cursorEntry');
      writeJson(response, 202, { ok: true });
      return;
    }
  }

  writeJson(response, 404, { error: 'Not found.' });
}

async function startKairo(
  context: RouteContext,
  kairoId: string,
): Promise<void> {
  const kairos = await getKairoMetadata();
  const kairo = findKairo(kairos, kairoId);
  const state = ensureRuntimeState(kairo);

  if (kairo.kind !== 'frontend') {
    throw new Error(
      `${kairo.id} is not a frontend kairo. Copy its run command instead.`,
    );
  }

  if (state.child) {
    emitLog(context.dashboard, {
      kairoId,
      message: `${kairo.id} is already ${state.status}.`,
      source: 'server',
      stream: 'info',
      type: 'log',
    });
    return;
  }

  void runKairoLifecycle(context, kairo, state);
}

async function runKairoLifecycle(
  context: RouteContext,
  kairo: KairoMetadata,
  state: RuntimeState,
): Promise<void> {
  try {
    if (!existsSync(join(kairo.paths.folder, 'node_modules'))) {
      setStatus(kairo.id, state, 'installing');
      await runCommand(context.dashboard, kairo, state, [
        'pnpm',
        'install',
        '--ignore-workspace',
      ]);
    }

    if (state.status === 'stopping') {
      return;
    }

    setStatus(kairo.id, state, 'starting');
    const child = spawn(
      ...resolveSpawnCommand([
        'pnpm',
        'dev',
        '--host',
        context.host,
        '--port',
        String(state.port),
        '--strictPort',
      ]),
      {
        cwd: kairo.paths.folder,
      },
    );

    state.child = child;
    attachOutput(context.dashboard, kairo.id, child);

    child.on('exit', (code) => {
      state.child = undefined;
      state.exitCode = code;
      setStatus(
        kairo.id,
        state,
        code === 0 || state.status === 'stopping' ? 'stopped' : 'failed',
      );
    });

    await waitForPreview(`http://${context.host}:${state.port}`, state);

    if (state.child === child && state.status === 'starting') {
      setStatus(kairo.id, state, 'running');
    }
  } catch (error) {
    if (state.child) {
      killProcessTree(state.child);
    }

    setStatus(kairo.id, state, 'failed');
    emitLog(context.dashboard, {
      kairoId: kairo.id,
      message:
        error instanceof Error ? error.message : 'Failed to start kairo.',
      source: 'server',
      stream: 'error',
      type: 'log',
    });
  }
}

async function waitForPreview(
  previewUrl: string,
  state: RuntimeState,
): Promise<void> {
  const timeoutMs = 30_000;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (!state.child) {
      throw new Error(`Kairo process exited before ${previewUrl} was ready.`);
    }

    if (state.status === 'stopping') {
      return;
    }

    try {
      const response = await fetch(previewUrl, {
        cache: 'no-store',
      });

      if (response.ok) {
        return;
      }
    } catch {
      // Vite is still booting. Keep polling until timeout or process exit.
    }

    await delay(250);
  }

  throw new Error(`Timed out waiting for ${previewUrl}.`);
}

async function runCommand(
  dashboard: TerminalDashboard,
  kairo: KairoMetadata,
  state: RuntimeState,
  command: string[],
): Promise<void> {
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(...resolveSpawnCommand(command), {
      cwd: kairo.paths.folder,
    });

    state.child = child;
    attachOutput(dashboard, kairo.id, child);

    child.on('error', rejectPromise);
    child.on('exit', (code) => {
      state.child = undefined;

      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(
        new Error(
          `${command.join(' ')} failed for ${kairo.id} with exit code ${code ?? 'unknown'}.`,
        ),
      );
    });
  });
}

async function stopKairo(kairoId: string): Promise<void> {
  const kairos = await getKairoMetadata();
  const kairo = findKairo(kairos, kairoId);
  const state = ensureRuntimeState(kairo);

  if (!state.child) {
    setStatus(kairo.id, state, 'stopped');
    return;
  }

  setStatus(kairo.id, state, 'stopping');
  killProcessTree(state.child);
}

async function openKairoTarget(
  context: RouteContext,
  kairoId: string,
  target: string,
): Promise<void> {
  const kairos = await getKairoMetadata();
  const kairo = findKairo(kairos, kairoId);

  if (target === 'terminalFolder') {
    await openTerminal(kairo.paths.folder);
    return;
  }

  if (target === 'folder') {
    openExternal(kairo.paths.folder);
    return;
  }

  const localKairo = toLocalKairo(context, kairo, ensureRuntimeState(kairo));
  const url = localKairo.editorLinks[target as keyof LocalKairo['editorLinks']];

  if (!url) {
    throw new Error(`Unknown open target: ${target}`);
  }

  openExternal(url);
}

function attachOutput(
  dashboard: TerminalDashboard,
  kairoId: string,
  child: ChildProcessWithoutNullStreams,
): void {
  child.stdout.on('data', (chunk: Buffer) => {
    emitProcessOutput(dashboard, kairoId, 'stdout', chunk);
  });

  child.stderr.on('data', (chunk: Buffer) => {
    emitProcessOutput(dashboard, kairoId, 'stderr', chunk);
  });
}

function emitProcessOutput(
  dashboard: TerminalDashboard,
  source: LogSource | string,
  stream: 'stderr' | 'stdout',
  chunk: Buffer,
): void {
  for (const line of chunk.toString('utf8').split(/\r?\n/)) {
    if (line.trim().length === 0) {
      continue;
    }

    const knownSource =
      source === 'client' || source === 'server' || source === 'system'
        ? source
        : 'server';

    emitLog(dashboard, {
      kairoId: knownSource === 'server' ? source : undefined,
      message: line,
      source: knownSource,
      stream,
      type: 'log',
    });
  }
}

async function getSnapshot(context: RouteContext): Promise<RuntimeSnapshot> {
  const kairos = await getKairoMetadata();

  return {
    kairos: kairos.map((kairo) =>
      toLocalKairo(context, kairo, ensureRuntimeState(kairo)),
    ),
    ok: true,
  };
}

function toLocalKairo(
  context: RouteContext,
  kairo: KairoMetadata,
  state: RuntimeState,
): LocalKairo {
  return {
    ...kairo,
    editorLinks: {
      cursorEntry: createEditorUrl('cursor', kairo.paths.entry),
    },
    previewUrl: `http://${context.host}:${state.port}`,
    status: state.status,
  };
}

function ensureRuntimeState(kairo: KairoMetadata): RuntimeState {
  const existing = runtime.get(kairo.id);

  if (existing) {
    return existing;
  }

  const state: RuntimeState = {
    port: 5300 + runtime.size,
    status: 'idle',
  };

  runtime.set(kairo.id, state);
  return state;
}

function findKairo(kairos: KairoMetadata[], kairoId: string): KairoMetadata {
  const kairo = kairos.find((item) => item.id === kairoId);

  if (!kairo) {
    throw new Error(`Unknown kairo: ${kairoId}`);
  }

  return kairo;
}

function setStatus(
  kairoId: string,
  state: RuntimeState,
  status: KairoStatus,
): void {
  state.status = status;

  emitEvent({
    kairoId,
    message: `status -> ${status}`,
    source: 'server',
    stream: 'info',
    type: 'status',
  });
}

function openEventStream(response: ServerResponse): void {
  response.writeHead(200, {
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
  });
  clients.add(response);
  response.write(`data: ${JSON.stringify({ type: 'snapshot' })}\n\n`);
  response.on('close', () => {
    clients.delete(response);
  });
}

function emitLog(
  dashboard: TerminalDashboard,
  entry: Omit<RuntimeLog, 'timestamp'>,
): void {
  const log: RuntimeLog = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  logs.push(log);

  if (logs.length > 300) {
    logs.shift();
  }

  dashboard.addLog(log);

  emitEvent(log);
}

function emitEvent(entry: Omit<RuntimeLog, 'timestamp'>): void {
  const log: RuntimeLog = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  for (const client of clients) {
    client.write(`data: ${JSON.stringify(log)}\n\n`);
  }
}

function writeJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown,
): void {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
  });
  response.end(JSON.stringify(payload));
}

async function readJsonBody<T>(request: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {} as T;
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
}

function createEditorUrl(editor: 'cursor', path: string): string {
  return encodeURI(`${editor}://file/${path.replaceAll('\\', '/')}`);
}

async function openTerminal(folderPath: string): Promise<void> {
  if (await commandExists('ghostty')) {
    spawnDetached('ghostty', ['--working-directory', folderPath]);
    return;
  }

  if (process.platform === 'darwin' && (await canOpenMacApp('iTerm'))) {
    spawnDetached('open', ['-a', 'iTerm', folderPath]);
    return;
  }

  if (process.platform === 'win32' && (await commandExists('wt.exe'))) {
    spawnDetached('wt.exe', ['-d', folderPath]);
    return;
  }

  openFallbackTerminal(folderPath);
}

async function commandExists(command: string): Promise<boolean> {
  const checkCommand: [string, string[]] =
    process.platform === 'win32'
      ? ['where.exe', [command]]
      : ['sh', ['-lc', `command -v ${command}`]];

  return exitsSuccessfully(checkCommand[0], checkCommand[1]);
}

async function canOpenMacApp(appName: string): Promise<boolean> {
  return exitsSuccessfully('open', ['-Ra', appName]);
}

function exitsSuccessfully(command: string, args: string[]): Promise<boolean> {
  return new Promise((resolvePromise) => {
    const child = spawn(command, args, {
      stdio: 'ignore',
    });

    child.on('error', () => {
      resolvePromise(false);
    });
    child.on('exit', (code) => {
      resolvePromise(code === 0);
    });
  });
}

function openFallbackTerminal(folderPath: string): void {
  if (process.platform === 'win32') {
    spawnDetached('cmd.exe', [
      '/d',
      '/s',
      '/c',
      'start',
      '',
      'cmd.exe',
      '/k',
      'cd',
      '/d',
      folderPath,
    ]);
    return;
  }

  if (process.platform === 'darwin') {
    spawnDetached('open', ['-a', 'Terminal', folderPath]);
    return;
  }

  spawnDetached('x-terminal-emulator', ['--working-directory', folderPath]);
}

function spawnDetached(command: string, args: string[]): void {
  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
  });

  child.unref();
}

function openExternal(target: string): void {
  let command = 'xdg-open';
  let args = [target];

  if (process.platform === 'win32') {
    command = 'cmd';
    args = ['/c', 'start', '', target];
  }

  if (process.platform === 'darwin') {
    command = 'open';
  }

  spawnDetached(command, args);
}

function killProcessTree(child: ChildProcessWithoutNullStreams): void {
  if (!child.pid) {
    child.kill();
    return;
  }

  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
      stdio: 'ignore',
    });
    return;
  }

  child.kill('SIGTERM');
}

function resolveSpawnCommand(command: string[]): [string, string[]] {
  if (process.platform !== 'win32') {
    return [command[0], command.slice(1)];
  }

  return ['cmd.exe', ['/d', '/s', '/c', ...command]];
}
