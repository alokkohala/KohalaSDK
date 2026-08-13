import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Agent,
  AgentHealth,
  AgentKoans,
  AgentRunList,
  Koan,
} from "@kohala/sdk";
import { useKohala } from "./context";

export interface AsyncState<T> {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
  refetch: () => void;
}

function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    fn().then(
      (res) => {
        if (!cancelled && mounted.current) {
          setData(res);
          setLoading(false);
        }
      },
      (err) => {
        if (!cancelled && mounted.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      },
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);
  return { data, error, loading, refetch };
}

export function useAgents(): AsyncState<Agent[]> {
  const k = useKohala();
  return useAsync(() => k.agents.list(), []);
}

export function useAgent(id: number | string): AsyncState<Agent> {
  const k = useKohala();
  return useAsync(() => k.agents.get(id), [id]);
}

export function useAgentRuns(
  id: number | string,
  params?: { limit?: number; offset?: number },
): AsyncState<AgentRunList> {
  const k = useKohala();
  return useAsync(() => k.runs.list(id, params), [id, params?.limit, params?.offset]);
}

export function useAgentHealth(
  id: number | string,
  days?: number,
): AsyncState<{ health: AgentHealth | null; days: number }> {
  const k = useKohala();
  return useAsync(() => k.agents.health(id, { days }), [id, days]);
}

export function useAgentKoans(id: number | string): AsyncState<AgentKoans> {
  const k = useKohala();
  return useAsync(() => k.agents.listKoans(id), [id]);
}

export function useKoan(slug: string): AsyncState<Koan> {
  const k = useKohala();
  return useAsync(() => k.koans.get(slug), [slug]);
}
