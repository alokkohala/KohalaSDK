import { inject, onMounted, ref, type Ref } from "vue";
import type {
  Agent,
  AgentHealth,
  AgentKoans,
  AgentRunList,
  Koan,
  Kohala,
} from "@kohala/sdk";
import { kohalaKey } from "./plugin";

export function useKohala(): Kohala {
  const client = inject(kohalaKey);
  if (!client) {
    throw new Error(
      "useKohala: install the Kohala plugin first with app.use(createKohala(...)).",
    );
  }
  return client;
}

export interface AsyncState<T> {
  data: Ref<T | undefined>;
  error: Ref<Error | undefined>;
  loading: Ref<boolean>;
  refetch: () => Promise<void>;
}

function useAsync<T>(fn: () => Promise<T>): AsyncState<T> {
  const data = ref<T | undefined>(undefined) as Ref<T | undefined>;
  const error = ref<Error | undefined>(undefined) as Ref<Error | undefined>;
  const loading = ref(true);

  async function run() {
    loading.value = true;
    error.value = undefined;
    try {
      data.value = await fn();
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
    } finally {
      loading.value = false;
    }
  }

  onMounted(run);
  return { data, error, loading, refetch: run };
}

export function useAgents(): AsyncState<Agent[]> {
  const k = useKohala();
  return useAsync(() => k.agents.list());
}

export function useAgent(id: number | string): AsyncState<Agent> {
  const k = useKohala();
  return useAsync(() => k.agents.get(id));
}

export function useAgentRuns(
  id: number | string,
  params?: { limit?: number; offset?: number },
): AsyncState<AgentRunList> {
  const k = useKohala();
  return useAsync(() => k.runs.list(id, params));
}

export function useAgentHealth(
  id: number | string,
  days?: number,
): AsyncState<{ health: AgentHealth | null; days: number }> {
  const k = useKohala();
  return useAsync(() => k.agents.health(id, { days }));
}

export function useAgentKoans(id: number | string): AsyncState<AgentKoans> {
  const k = useKohala();
  return useAsync(() => k.agents.listKoans(id));
}

export function useKoan(slug: string): AsyncState<Koan> {
  const k = useKohala();
  return useAsync(() => k.koans.get(slug));
}
