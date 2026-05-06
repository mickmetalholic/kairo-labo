import type { KairoMetadata } from '@kairo-labo/kairo-core';

export type KairoStatus =
  | 'failed'
  | 'idle'
  | 'installing'
  | 'running'
  | 'starting'
  | 'stopped'
  | 'stopping';

export type LogSource = 'client' | 'server' | 'system';

export interface RuntimeLog {
  kairoId?: string;
  message: string;
  source: LogSource;
  stream: 'error' | 'info' | 'stderr' | 'stdout';
  timestamp: string;
  type: 'log' | 'status';
}

export interface LocalKairo extends KairoMetadata {
  editorLinks: {
    cursorEntry: string;
  };
  previewUrl: string;
  status: KairoStatus;
}

export interface RuntimeSnapshot {
  kairos: LocalKairo[];
  ok: true;
}
