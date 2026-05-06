import { useEffect, useState } from 'react';
import type { KairoItem } from './types';

interface KairoDataPayload {
  kairos: KairoItem[];
  generatedAt: string;
}

interface KairoDataState extends KairoDataPayload {
  status: 'failed' | 'loading' | 'ready';
}

const initialState: KairoDataState = {
  kairos: [],
  generatedAt: 'loading',
  status: 'loading',
};

export function useKairoData(): KairoDataState {
  const [state, setState] = useState<KairoDataState>(initialState);

  useEffect(() => {
    let mounted = true;

    async function loadKairoData(): Promise<void> {
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}kairo-data.json`,
          {
            cache: 'no-store',
          },
        );

        if (!response.ok) {
          throw new Error('Kairo data unavailable.');
        }

        const payload = (await response.json()) as KairoDataPayload;

        if (!mounted) {
          return;
        }

        setState({
          kairos: payload.kairos,
          generatedAt: payload.generatedAt,
          status: 'ready',
        });
      } catch {
        if (!mounted) {
          return;
        }

        setState({
          kairos: [],
          generatedAt: 'unavailable',
          status: 'failed',
        });
      }
    }

    void loadKairoData();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
