import { useCallback, useEffect, useState } from 'react';
import type {
  LocalKairo,
  OpenTarget,
  RuntimeLog,
  RuntimeSnapshot,
} from './local-controller';

export type ControllerStatus = 'checking' | 'offline' | 'online';

type ControllerEvent = RuntimeLog | { type: 'snapshot' };

export interface LocalController {
  kairos: LocalKairo[];
  openKairo: (kairoId: string, target: OpenTarget) => Promise<void>;
  startKairo: (kairoId: string) => Promise<void>;
  status: ControllerStatus;
  stopKairo: (kairoId: string) => Promise<void>;
}

export function useLocalController(): LocalController {
  const [status, setStatus] = useState<ControllerStatus>('checking');
  const [kairos, setKairos] = useState<LocalKairo[]>([]);

  const loadSnapshot = useCallback(async () => {
    const response = await fetch('/api/kairos', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Local controller unavailable.');
    }

    const snapshot = (await response.json()) as RuntimeSnapshot;
    setKairos(snapshot.kairos);
  }, []);

  useEffect(() => {
    let events: EventSource | undefined;
    let mounted = true;

    async function connect(): Promise<void> {
      try {
        const health = await fetch('/api/health', { cache: 'no-store' });

        if (!health.ok) {
          throw new Error('Local controller unavailable.');
        }

        if (!mounted) {
          return;
        }

        setStatus('online');
        await loadSnapshot();

        events = new EventSource('/api/events');
        events.onmessage = (event) => {
          const payload = JSON.parse(event.data) as ControllerEvent;

          if (payload.type === 'snapshot') {
            return;
          }

          if (payload.type === 'status') {
            void loadSnapshot();
          }
        };
      } catch {
        if (mounted) {
          setStatus('offline');
        }
      }
    }

    void connect();

    return () => {
      mounted = false;
      events?.close();
    };
  }, [loadSnapshot]);

  const postKairoAction = useCallback(
    async (kairoId: string, action: string, body?: unknown) => {
      const response = await fetch(`/api/kairos/${kairoId}/${action}`, {
        body: body ? JSON.stringify(body) : undefined,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} ${kairoId}.`);
      }

      await loadSnapshot();
    },
    [loadSnapshot],
  );

  return {
    kairos,
    openKairo: (kairoId, target) =>
      postKairoAction(kairoId, 'open', { target }),
    startKairo: (kairoId) => postKairoAction(kairoId, 'start'),
    status,
    stopKairo: (kairoId) => postKairoAction(kairoId, 'stop'),
  };
}
