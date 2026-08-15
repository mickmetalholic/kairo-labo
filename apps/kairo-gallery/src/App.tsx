import {
  ArrowUpRight,
  BookOpenText,
  Box,
  Check,
  CircleDot,
  Clipboard,
  Code2,
  FolderOpen,
  FolderPlus,
  MonitorPlay,
  Play,
  Sparkles,
  Square,
  TerminalSquare,
} from 'lucide-react';
import { useState } from 'react';
import { type SimpleIcon, siGo, siTypescript, siVite } from 'simple-icons';
import logoDarkUrl from '../../../assets/logo-dark.png';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { getLogseqUrl } from './kairo-links';
import type { KairoItem, KairoTemplateId } from './types';
import { useKairoData } from './use-kairo-data';
import {
  type LocalController,
  useLocalController,
} from './use-local-controller';

export function App(): React.ReactNode {
  const controller = useLocalController();
  const kairoData = useKairoData();
  const kairos =
    kairoData.kairos.length > 0 ? kairoData.kairos : controller.kairos;

  return (
    <main className="min-h-screen select-none overflow-hidden bg-[#050b12] text-slate-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#050b12_0%,#09121a_50%,#070b10_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(66,217,238,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(66,217,238,0.045)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#42d9ee]/70 to-transparent" />
      </div>

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-2">
            <Badge>{kairos.length} kairos</Badge>
            <ControllerStatusBadge status={controller.status} />
          </div>
        </header>

        <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(22rem,0.78fr)]">
          <div className="space-y-7">
            <Badge className="border-[#d7aa5f]/25 bg-[#d7aa5f]/10 text-[#f0ca83]">
              <Sparkles className="mr-2 size-3.5" />
              polished learning traces
            </Badge>
            <div className="space-y-5">
              <h1 className="font-display text-5xl font-black leading-[0.92] tracking-[-0.07em] text-balance sm:text-7xl lg:text-8xl">
                Small kairos,
                <span className="block text-[#42d9ee]">clear thinking.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Build tiny standalone experiments, run them locally, and keep
                the notes one click away.
              </p>
            </div>
          </div>
          <img
            alt="Kairo Labo"
            className="w-full object-contain mix-blend-screen [mask-image:radial-gradient(ellipse_at_center,black_58%,transparent_78%)]"
            src={logoDarkUrl}
          />
        </section>

        <RepoGuide />

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {kairos.map((kairo) => (
            <KairoCard controller={controller} kairo={kairo} key={kairo.id} />
          ))}
        </section>

        {kairos.length === 0 ? (
          <Card className="border-dashed text-center">
            <Box className="mx-auto mb-4 size-10 text-[#42d9ee]" />
            <h2 className="font-display text-2xl font-black">No kairos yet</h2>
            <p className="mx-auto mt-2 max-w-md text-slate-400">
              {kairoData.status === 'failed'
                ? 'Kairo data is generated during dev and build. Run pnpm gallery locally or rebuild the Pages artifact.'
                : 'Run '}
              {kairoData.status === 'failed' ? null : (
                <span className="font-mono text-[#a8f4fb]">pnpm kairo new</span>
              )}
              {kairoData.status === 'failed'
                ? null
                : ' to create the first standalone experiment.'}
            </p>
            <div className="mx-auto mt-5 max-w-sm">
              <CommandKairoAction command="pnpm kairo new my-kairo" />
            </div>
          </Card>
        ) : null}
      </section>
    </main>
  );
}

interface ControllerStatusBadgeProps {
  status: LocalController['status'];
}

function ControllerStatusBadge({
  status,
}: ControllerStatusBadgeProps): React.ReactNode {
  const isOnline = status === 'online';
  const label =
    status === 'checking'
      ? 'Checking controls'
      : isOnline
        ? 'Local controls on'
        : 'Static view';
  const description = isOnline
    ? 'Run kairos and open local tools from this page.'
    : 'Start pnpm gallery locally to enable run, terminal, and folder actions.';

  return (
    <div className="group/status relative">
      <Badge
        className={
          isOnline
            ? 'border-emerald-200/20 bg-emerald-200/10 text-emerald-100'
            : 'border-slate-200/10 bg-white/[0.04] text-slate-300'
        }
      >
        <CircleDot className="mr-2 size-3" />
        {label}
      </Badge>
      <div className="pointer-events-none absolute right-0 top-9 z-30 w-64 rounded-xl border border-white/10 bg-[#07121b]/95 p-3 text-left opacity-0 shadow-2xl shadow-black/35 backdrop-blur transition duration-150 group-hover/status:translate-y-1 group-hover/status:opacity-100">
        <p className="font-mono text-xs font-semibold text-[#a8f4fb]">
          {label}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function RepoGuide(): React.ReactNode {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <p className="font-display text-xl font-black tracking-tight text-white">
          Use this repo
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          Keep each kairo small, run it locally, then connect the code back to
          its note.
        </p>
      </div>
      <div className="grid gap-px bg-white/10 md:grid-cols-4">
        <GuideStep
          command="pnpm gallery"
          description="Start the index with the local controller."
          icon={TerminalSquare}
          label="Open gallery"
        />
        <GuideStep
          command="pnpm kairo new [name]"
          description="Create a standalone kairo from a template."
          icon={FolderPlus}
          label="Create"
        />
        <GuideStep
          command="pnpm kairo run [name]"
          description="Run a kairo from the repo root."
          icon={Play}
          label="Run"
        />
        <GuideStep
          command="Open note"
          description="Jump from each kairo card into its Logseq page."
          icon={BookOpenText}
          label="Study"
        />
      </div>
    </Card>
  );
}

interface GuideStepProps {
  command: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function GuideStep({
  command,
  description,
  icon: Icon,
  label,
}: GuideStepProps): React.ReactNode {
  return (
    <div className="bg-[#0b1620]/88 p-5">
      <div className="flex items-center gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full border border-[#42d9ee]/20 bg-[#42d9ee]/10 text-[#a8f4fb]">
          <Icon className="size-4" />
        </div>
        <p className="font-semibold text-slate-100">{label}</p>
      </div>
      <code className="mt-4 block overflow-x-auto whitespace-nowrap font-mono text-sm text-[#a8f4fb]">
        {command}
      </code>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

interface KairoCardProps {
  controller: LocalController;
  kairo: KairoItem;
}

interface TemplateLabelProps {
  kairo: KairoItem;
}

const templateIcons: Record<KairoTemplateId, SimpleIcon> = {
  go: siGo,
  'frontend-typescript': siVite,
  typescript: siTypescript,
};

const templateDescriptions: Record<KairoTemplateId, string> = {
  go: 'Go learning kairo with a terminal workflow.',
  'frontend-typescript': 'Frontend kairo built with Vite.',
  typescript: 'Command kairo built with TypeScript.',
};

function TemplateLabel({ kairo }: TemplateLabelProps): React.ReactNode {
  const icon = templateIcons[kairo.templateId];
  const description = templateDescriptions[kairo.templateId];

  return (
    <span
      aria-label={kairo.templateLabel}
      className="group/template relative grid size-8 shrink-0 place-items-center rounded-full border border-[#42d9ee]/20 bg-[#42d9ee]/10 text-[#a8f4fb]"
      role="img"
      style={{ color: `#${icon.hex}` }}
    >
      <svg
        aria-hidden="true"
        className="size-4"
        fill="currentColor"
        role="presentation"
        viewBox="0 0 24 24"
      >
        <path d={icon.path} />
      </svg>
      <span className="pointer-events-none absolute right-0 top-10 z-20 w-56 rounded-xl border border-white/10 bg-[#07121b]/95 p-3 text-left opacity-0 shadow-2xl shadow-black/35 backdrop-blur transition duration-150 group-hover/template:translate-y-1 group-hover/template:opacity-100 group-focus-visible/template:translate-y-1 group-focus-visible/template:opacity-100">
        <span className="block font-mono text-xs font-semibold text-[#a8f4fb]">
          {kairo.templateLabel}
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate-400">
          {description}
        </span>
      </span>
    </span>
  );
}

function KairoCard({ controller, kairo }: KairoCardProps): React.ReactNode {
  const localKairo = controller.kairos.find((item) => item.id === kairo.id);
  const isOnline = controller.status === 'online';
  const isRunning = localKairo?.status === 'running';
  const isBusy =
    localKairo?.status === 'installing' ||
    localKairo?.status === 'starting' ||
    localKairo?.status === 'stopping';
  const canShowLocalTools = Boolean(localKairo);

  return (
    <Card
      className={`group relative min-h-72 overflow-hidden transition duration-500 hover:border-[#42d9ee]/35 hover:bg-white/[0.07] ${
        isRunning ? 'border-emerald-300/30 bg-emerald-300/[0.045]' : ''
      }`}
    >
      <div
        className={`absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent opacity-0 transition group-hover:opacity-100 ${
          isRunning ? 'via-emerald-300/80 opacity-100' : 'via-[#42d9ee]/70'
        }`}
      />
      <div className="flex h-full flex-col justify-between gap-8">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <Badge>{kairo.id}</Badge>
            <div className="flex items-center gap-2">
              <TemplateLabel kairo={kairo} />
            </div>
          </div>
          {kairo.description ? (
            <p className="leading-7 text-slate-300">{kairo.description}</p>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <Button asChild className="w-full">
              <a href={getLogseqUrl(kairo.id)}>
                Open note
                <ArrowUpRight className="size-4" />
              </a>
            </Button>

            {kairo.kind === 'frontend' ? (
              <FrontendKairoAction
                controller={controller}
                kairo={kairo}
                isBusy={isBusy}
                isOnline={isOnline}
                isRunning={isRunning}
                localKairo={localKairo}
              />
            ) : kairo.runCommand ? (
              <CommandKairoAction command={kairo.runCommand} />
            ) : null}
          </div>
          {canShowLocalTools && localKairo ? (
            <div className="grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-2">
              <Button
                onClick={() =>
                  void controller.openKairo(kairo.id, 'cursorEntry')
                }
                size="sm"
                variant="ghost"
              >
                <Code2 className="size-4" />
                Cursor
              </Button>
              <Button
                onClick={() =>
                  void controller.openKairo(kairo.id, 'terminalFolder')
                }
                size="sm"
                variant="ghost"
              >
                <TerminalSquare className="size-4" />
                Terminal
              </Button>
              <Button
                onClick={() => void controller.openKairo(kairo.id, 'folder')}
                size="sm"
                variant="ghost"
              >
                <FolderOpen className="size-4" />
                Folder
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      {isRunning && localKairo ? (
        <a
          aria-label="Open preview"
          className="absolute bottom-6 left-6 right-6 inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 text-sm font-semibold text-slate-100 transition hover:border-[#42d9ee]/60 hover:bg-[#42d9ee]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42d9ee] sm:left-auto sm:w-[calc((100%-3.5rem)/2)]"
          href={localKairo.previewUrl}
          rel="noreferrer"
          target="_blank"
          title="Open preview"
        >
          <MonitorPlay className="size-4" />
          Preview
        </a>
      ) : null}
    </Card>
  );
}

interface FrontendKairoActionProps {
  controller: LocalController;
  kairo: KairoItem;
  isBusy: boolean;
  isOnline: boolean;
  isRunning: boolean;
  localKairo?: LocalController['kairos'][number];
}

function FrontendKairoAction({
  controller,
  kairo,
  isBusy,
  isOnline,
  isRunning,
  localKairo,
}: FrontendKairoActionProps): React.ReactNode {
  if (isRunning && localKairo) {
    return (
      <button
        className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/12 px-4 text-sm font-semibold text-emerald-100 transition hover:border-red-300/45 hover:bg-red-300/12 hover:text-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        onClick={() => void controller.stopKairo(kairo.id)}
        type="button"
      >
        <Square className="size-4" />
        Stop local frontend
      </button>
    );
  }

  if (!isOnline || !localKairo) {
    return kairo.runCommand ? (
      <CommandKairoAction command={kairo.runCommand} />
    ) : null;
  }

  const busyLabel = getBusyActionLabel(localKairo.status);

  if (busyLabel) {
    return (
      <button
        className="flex h-11 w-full cursor-default items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 text-sm font-semibold text-slate-100 opacity-50"
        disabled
        type="button"
      >
        <CircleDot className="size-4" />
        {busyLabel}
      </button>
    );
  }

  return (
    <button
      className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 text-sm font-semibold text-slate-100 transition hover:border-[#42d9ee]/60 hover:bg-[#42d9ee]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42d9ee] disabled:pointer-events-none disabled:cursor-default disabled:opacity-50"
      disabled={!isOnline || isBusy}
      onClick={() => void controller.startKairo(kairo.id)}
      type="button"
    >
      <Play className="size-4" />
      Run local frontend
    </button>
  );
}

function getBusyActionLabel(
  status: LocalController['kairos'][number]['status'],
): string | undefined {
  if (status === 'installing') {
    return 'Installing dependencies';
  }

  if (status === 'starting') {
    return 'Starting local frontend';
  }

  if (status === 'stopping') {
    return 'Stopping local frontend';
  }

  return undefined;
}

interface CommandKairoActionProps {
  command: string;
}

function CommandKairoAction({
  command,
}: CommandKairoActionProps): React.ReactNode {
  const [copied, setCopied] = useState(false);

  async function copyCommand(): Promise<void> {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <div className="flex h-11 items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] py-0 pl-4 pr-2">
      <code
        className="min-w-0 flex-1 select-text truncate font-mono text-sm text-[#a8f4fb]"
        title={command}
      >
        {command}
      </code>
      <button
        aria-label={copied ? 'Copied command' : 'Copy command'}
        className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-[#42d9ee]/50 hover:bg-[#42d9ee]/10 hover:text-[#a8f4fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42d9ee]"
        onClick={() => void copyCommand()}
        title={copied ? 'Copied' : 'Copy command'}
        type="button"
      >
        {copied ? (
          <Check className="size-3.5" />
        ) : (
          <Clipboard className="size-3.5" />
        )}
      </button>
    </div>
  );
}
