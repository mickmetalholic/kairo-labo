import type { KairoItem } from './types';

export type KairoStatus =
  | 'failed'
  | 'idle'
  | 'installing'
  | 'running'
  | 'starting'
  | 'stopped'
  | 'stopping';

export type OpenTarget = 'cursorEntry' | 'folder' | 'terminalFolder';

export interface RuntimeLog {
  kairoId?: string;
  message: string;
  source: 'client' | 'server' | 'system';
  stream: 'error' | 'info' | 'stderr' | 'stdout';
  timestamp: string;
  type: 'log' | 'status';
}

export interface LocalKairo extends KairoItem {
  editorLinks: {
    cursorEntry: string;
  };
  paths: {
    entry: string;
    folder: string;
  };
  previewUrl: string;
  status: KairoStatus;
}

export interface RuntimeSnapshot {
  kairos: LocalKairo[];
  ok: true;
}
