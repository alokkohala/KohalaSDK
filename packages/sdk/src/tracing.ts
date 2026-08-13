import type { Kohala } from "./client";
import { KohalaError } from "./errors";

/** Random per-batch idempotency key (no Node/browser crypto dependency). */
function randomKey(): string {
  const g: any = globalThis as any;
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2)
  );
}

/** A single external-run event reported into Kohala governance. */
export interface KohalaRunEvent {
  type?: "tool_call" | "llm_call" | "log" | "guardrail";
  name?: string;
  inputSummary?: unknown;
  outputSummary?: unknown;
  ok?: boolean;
  errorMessage?: string;
  durationMs?: number;
  /** LLM tokens consumed by this event (metered + counted against quotas). */
  tokens?: number;
}

export interface ExternalRunSummary {
  id: number;
  status: string;
  trigger: string;
  triggerDetail: string | null;
  triggerShape: string | null;
  startedAt: string;
  finishedAt: string | null;
  tokensSpent: number;
  computeMs: number;
  errorMessage: string | null;
  validatorVerdicts: unknown;
}

export interface StartRunOptions {
  framework?: string;
  task?: string;
  idempotencyKey?: string;
}

export interface CompleteRunOptions {
  status: "succeeded" | "failed" | "cancelled";
  errorMessage?: string;
  output?: unknown;
  /** Extra LLM tokens not already reported as events. */
  tokens?: number;
  durationMs?: number;
}

/**
 * KohalaRun — the core tracer over the external-run ingestion API.
 *
 * ```ts
 * const kohala = new Kohala({ apiKey: process.env.KOHALA_API_KEY! });
 * const run = await kohala.tracing.start(agentId, { framework: "langchain" });
 * await run.event({ type: "llm_call", name: "gpt-4o", tokens: 1234 });
 * await run.complete({ status: "succeeded", output: result });
 * ```
 *
 * Events are buffered and flushed in batches; `complete()` flushes any
 * remaining events first. If Kohala denies the run (quota/wallet), `start`
 * throws a KohalaError whose body carries `denied: "wallet" | "per_day_cap"`.
 */
export class KohalaRun {
  private buffer: KohalaRunEvent[] = [];
  /** Batches whose POST failed — retained with their original batchKey. */
  private pending: { events: KohalaRunEvent[]; batchKey: string }[] = [];
  private closed = false;

  constructor(
    private readonly client: Kohala,
    readonly agentId: number | string,
    readonly runId: number,
    /** Flush automatically once this many events are buffered. */
    private readonly flushAt = 20,
  ) {}

  private base(): string {
    return `/api/v1/agents/${encodeURIComponent(String(this.agentId))}/external-runs/${this.runId}`;
  }

  /** Buffer an event; auto-flushes when the buffer reaches `flushAt`. */
  async event(ev: KohalaRunEvent): Promise<void> {
    if (this.closed) return;
    this.buffer.push(ev);
    if (this.buffer.length >= this.flushAt) await this.flush();
  }

  /**
   * Send all buffered events now.
   *
   * If the POST fails, the batch is retained (with its original batchKey) and
   * retried on the next flush — the server dedupes replayed batchKeys, so a
   * lost-response retry never double-bills and a transport failure never
   * silently drops trace steps.
   */
  async flush(): Promise<void> {
    if (this.closed) return;
    if (this.buffer.length > 0) {
      // Per-batch idempotency key: a retried flush of the same batch is a
      // server-side no-op (no duplicate trace entries or billing).
      this.pending.push({
        events: this.buffer.splice(0, this.buffer.length),
        batchKey: randomKey(),
      });
    }
    while (this.pending.length > 0) {
      const batch = this.pending[0];
      await this.client.post(`${this.base()}/events`, { body: batch });
      this.pending.shift();
    }
  }

  /** Close the run. Idempotent server-side; flushes buffered events first. */
  async complete(opts: CompleteRunOptions): Promise<ExternalRunSummary> {
    if (!this.closed) {
      try {
        await this.flush();
      } catch (e) {
        // A cap-exceeded flush already failed the run server-side; the
        // complete below is then an idempotent no-op returning that state.
        // Anything else (network/server error) is a real failure — surface it
        // rather than silently losing the buffered trace.
        const capDenied =
          e instanceof KohalaError &&
          e.status === 429 &&
          (e.details as { denied?: string } | undefined)?.denied === "per_run_cap";
        if (!capDenied) throw e;
      }
    }
    this.closed = true;
    const res = await this.client.post<{ run: ExternalRunSummary }>(
      `${this.base()}/complete`,
      { body: opts },
    );
    return res.run;
  }
}

/** Entry point exposed as `kohala.tracing`. */
export class TracingResource {
  constructor(private readonly client: Kohala) {}

  /** Open an external run for an agent. Throws on quota/wallet denial. */
  async start(
    agentId: number | string,
    opts: StartRunOptions = {},
  ): Promise<KohalaRun> {
    const res = await this.client.post<{ run: ExternalRunSummary }>(
      `/api/v1/agents/${encodeURIComponent(String(agentId))}/external-runs`,
      { body: opts },
    );
    return new KohalaRun(this.client, agentId, res.run.id);
  }

  /** Single-shot: report an already-finished run (webhook-style, n8n/Vellum). */
  report(
    agentId: number | string,
    body: StartRunOptions & CompleteRunOptions & { events?: KohalaRunEvent[] },
  ) {
    return this.client.post<{ run: ExternalRunSummary; reused: boolean }>(
      `/api/v1/agents/${encodeURIComponent(String(agentId))}/external-runs/report`,
      { body },
    );
  }
}
