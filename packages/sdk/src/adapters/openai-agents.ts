import type { KohalaRun } from "../tracing";

/**
 * OpenAI Agents SDK trace processor (structural — no dependency on
 * @openai/agents). Register it with `setTraceProcessors` /
 * `addTraceProcessor`:
 *
 * ```ts
 * const run = await kohala.tracing.start(agentId, { framework: "openai-agents" });
 * addTraceProcessor(kohalaOpenAIAgentsProcessor(run));
 * ```
 *
 * Maps span types: `generation`/`response` → `llm_call` (with usage tokens
 * when present), `function` → `tool_call`, `guardrail` → `guardrail`,
 * everything else → `log`.
 */
export function kohalaOpenAIAgentsProcessor(run: KohalaRun) {
  const summarize = (v: unknown) =>
    typeof v === "string" ? v.slice(0, 500) : v;
  return {
    async onTraceStart(_trace: any) {},
    async onTraceEnd(_trace: any) {
      await run.flush();
    },
    async onSpanStart(_span: any) {},
    async onSpanEnd(span: any) {
      const data = span?.spanData ?? span?.span_data ?? {};
      const type = data.type ?? "unknown";
      const started =
        Date.parse(span?.startedAt ?? span?.started_at ?? "") || undefined;
      const ended =
        Date.parse(span?.endedAt ?? span?.ended_at ?? "") || undefined;
      const durationMs =
        started && ended && ended >= started ? ended - started : undefined;
      const error = span?.error
        ? String(span.error?.message ?? span.error).slice(0, 500)
        : undefined;
      if (type === "generation" || type === "response") {
        const usage = data.usage ?? {};
        const tokens =
          (usage.total_tokens ??
            (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0)) ||
          undefined;
        await run.event({
          type: "llm_call",
          name: data.model ?? "llm",
          inputSummary: summarize(data.input),
          outputSummary: summarize(data.output),
          ok: !error,
          errorMessage: error,
          durationMs,
          tokens: typeof tokens === "number" && tokens > 0 ? tokens : undefined,
        });
      } else if (type === "function") {
        await run.event({
          type: "tool_call",
          name: data.name ?? "function",
          inputSummary: summarize(data.input),
          outputSummary: summarize(data.output),
          ok: !error,
          errorMessage: error,
          durationMs,
        });
      } else if (type === "guardrail") {
        await run.event({
          type: "guardrail",
          name: data.name ?? "guardrail",
          ok: data.triggered !== true && !error,
          errorMessage: error,
          durationMs,
        });
      } else {
        await run.event({
          type: "log",
          name: String(type),
          ok: !error,
          errorMessage: error,
          durationMs,
        });
      }
    },
    async shutdown() {
      await run.flush();
    },
    async forceFlush() {
      await run.flush();
    },
  };
}
