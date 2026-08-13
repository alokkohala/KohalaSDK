import type { Kohala } from "../client";
import type { AgentRun, AgentRunList } from "../types";

export type ListRunsParams = {
  limit?: number;
  offset?: number;
  /** Restrict to runs that aborted on the per-run repair cap. */
  errorPrefix?: "per-run-cap";
};

/** Agent-run history and manual triggers. */
export class RunsResource {
  constructor(private readonly client: Kohala) {}

  list(agentId: number | string, params?: ListRunsParams) {
    return this.client.get<AgentRunList>(
      `/api/v1/agents/${encodeURIComponent(String(agentId))}/agent-runs`,
      { query: params },
    );
  }
  get(agentId: number | string, runId: number | string) {
    return this.client.get<AgentRun>(
      `/api/v1/agents/${encodeURIComponent(String(agentId))}/agent-runs/${encodeURIComponent(String(runId))}`,
    );
  }
  /**
   * Queue a manual shift now. Returns as soon as the run is queued (HTTP 202);
   * poll `list()` to watch it move through pending → running → done.
   */
  trigger(agentId: number | string, options?: { note?: string }) {
    return this.client.post<{ queued: boolean }>(
      `/api/v1/agents/${encodeURIComponent(String(agentId))}/agent-runs/manual`,
      { body: options ?? {} },
    );
  }
  retry(agentId: number | string, runId: number | string) {
    return this.client.post<Record<string, unknown>>(
      `/api/v1/agents/${encodeURIComponent(String(agentId))}/agent-runs/${encodeURIComponent(String(runId))}/retry`,
      { body: {} },
    );
  }
}
