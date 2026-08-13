import type { Kohala } from "../client";
import type {
  WorkflowDefinition,
  WorkflowInput,
  WorkflowUpdate,
  WorkflowRun,
} from "../types";

/** Durable workflow definitions and their runs. */
export class WorkflowsResource {
  constructor(private readonly client: Kohala) {}

  list() {
    return this.client.get<WorkflowDefinition[]>("/api/v1/workflows");
  }
  get(id: number | string) {
    return this.client.get<WorkflowDefinition>(`/api/v1/workflows/${encodeURIComponent(String(id))}`);
  }
  create(input: WorkflowInput) {
    return this.client.post<WorkflowDefinition>("/api/v1/workflows", {
      body: input,
    });
  }
  update(id: number | string, patch: WorkflowUpdate) {
    return this.client.patch<WorkflowDefinition>(`/api/v1/workflows/${encodeURIComponent(String(id))}`, {
      body: patch,
    });
  }
  delete(id: number | string) {
    return this.client.delete<{ success?: boolean }>(`/api/v1/workflows/${encodeURIComponent(String(id))}`);
  }

  listRuns(id: number | string) {
    return this.client.get<WorkflowRun[]>(`/api/v1/workflows/${encodeURIComponent(String(id))}/runs`);
  }
  run(id: number | string, input?: Record<string, unknown>) {
    return this.client.post<WorkflowRun>(`/api/v1/workflows/${encodeURIComponent(String(id))}/runs`, {
      body: input ?? {},
    });
  }
  getRun(runId: number | string) {
    return this.client.get<WorkflowRun>(`/api/v1/workflow-runs/${encodeURIComponent(String(runId))}`);
  }
}
