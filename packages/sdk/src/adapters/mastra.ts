import type { KohalaRun } from "../tracing";

/**
 * Mastra hook (structural — no dependency on @mastra/core). Mastra agents
 * expose `onStepFinish` on generate/stream options; pass the returned
 * callback there:
 *
 * ```ts
 * const run = await kohala.tracing.start(agentId, { framework: "mastra" });
 * const result = await agent.generate(prompt, {
 *   onStepFinish: kohalaMastraOnStepFinish(run),
 * });
 * await run.complete({ status: "succeeded", output: result.text });
 * ```
 *
 * Each finished step reports one `llm_call` (with usage tokens) plus a
 * `tool_call` per tool invocation in the step.
 */
export function kohalaMastraOnStepFinish(run: KohalaRun) {
  return async (step: any) => {
    const usage = step?.usage ?? {};
    const tokens =
      (usage.totalTokens ??
        (usage.promptTokens ?? 0) + (usage.completionTokens ?? 0)) ||
      undefined;
    await run.event({
      type: "llm_call",
      name: step?.stepType ?? "step",
      outputSummary:
        typeof step?.text === "string" ? step.text.slice(0, 500) : undefined,
      ok: true,
      tokens: typeof tokens === "number" && tokens > 0 ? tokens : undefined,
    });
    const calls = Array.isArray(step?.toolCalls) ? step.toolCalls : [];
    const results = Array.isArray(step?.toolResults) ? step.toolResults : [];
    for (const call of calls) {
      const result = results.find(
        (r: any) => r?.toolCallId === call?.toolCallId,
      );
      await run.event({
        type: "tool_call",
        name: call?.toolName ?? "tool",
        inputSummary: call?.args,
        outputSummary: result?.result,
        ok: true,
      });
    }
  };
}
