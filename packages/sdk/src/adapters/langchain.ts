import type { KohalaRun } from "../tracing";

/**
 * LangChain / LangGraph callback handler (structural — no dependency on the
 * langchain package). Pass the returned object in `callbacks: [...]`:
 *
 * ```ts
 * const run = await kohala.tracing.start(agentId, { framework: "langchain" });
 * const result = await chain.invoke(input, {
 *   callbacks: [kohalaLangChainHandler(run)],
 * });
 * await run.complete({ status: "succeeded", output: result });
 * ```
 *
 * Maps: LLM end → `llm_call` (with token usage when the provider reports it),
 * tool end/error → `tool_call`, chain error → `log`.
 */
export function kohalaLangChainHandler(run: KohalaRun) {
  const started = new Map<string, { name: string; input?: unknown; t: number }>();
  const summarize = (v: unknown) =>
    typeof v === "string" ? v.slice(0, 500) : v;
  return {
    name: "kohala-tracer",
    // LangChain requires these flags on plain-object handlers.
    ignoreLLM: false,
    ignoreChain: false,
    ignoreAgent: false,

    handleLLMStart(llm: any, prompts: string[], runId: string) {
      started.set(runId, {
        name: llm?.id?.at?.(-1) ?? llm?.name ?? "llm",
        input: prompts?.[0],
        t: Date.now(),
      });
    },
    async handleLLMEnd(output: any, runId: string) {
      const s = started.get(runId);
      started.delete(runId);
      const usage =
        output?.llmOutput?.tokenUsage ?? output?.llmOutput?.usage ?? {};
      const tokens =
        (usage.totalTokens ??
          (usage.promptTokens ?? usage.input_tokens ?? 0) +
            (usage.completionTokens ?? usage.output_tokens ?? 0)) || undefined;
      await run.event({
        type: "llm_call",
        name: s?.name ?? "llm",
        inputSummary: summarize(s?.input),
        outputSummary: summarize(
          output?.generations?.[0]?.[0]?.text ?? undefined,
        ),
        ok: true,
        durationMs: s ? Date.now() - s.t : undefined,
        tokens: typeof tokens === "number" && tokens > 0 ? tokens : undefined,
      });
    },
    async handleLLMError(err: any, runId: string) {
      const s = started.get(runId);
      started.delete(runId);
      await run.event({
        type: "llm_call",
        name: s?.name ?? "llm",
        ok: false,
        errorMessage: String(err?.message ?? err).slice(0, 500),
        durationMs: s ? Date.now() - s.t : undefined,
      });
    },
    handleToolStart(tool: any, input: string, runId: string) {
      started.set(runId, {
        name: tool?.id?.at?.(-1) ?? tool?.name ?? "tool",
        input,
        t: Date.now(),
      });
    },
    async handleToolEnd(output: any, runId: string) {
      const s = started.get(runId);
      started.delete(runId);
      await run.event({
        type: "tool_call",
        name: s?.name ?? "tool",
        inputSummary: summarize(s?.input),
        outputSummary: summarize(output),
        ok: true,
        durationMs: s ? Date.now() - s.t : undefined,
      });
    },
    async handleToolError(err: any, runId: string) {
      const s = started.get(runId);
      started.delete(runId);
      await run.event({
        type: "tool_call",
        name: s?.name ?? "tool",
        ok: false,
        errorMessage: String(err?.message ?? err).slice(0, 500),
        durationMs: s ? Date.now() - s.t : undefined,
      });
    },
    async handleChainError(err: any) {
      await run.event({
        type: "log",
        name: "chain_error",
        ok: false,
        errorMessage: String(err?.message ?? err).slice(0, 500),
      });
    },
  };
}
