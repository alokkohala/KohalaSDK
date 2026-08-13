import type { KohalaRun } from "../tracing";

/**
 * Vercel AI SDK language-model middleware (structural — no dependency on
 * the `ai` package). Wrap your model:
 *
 * ```ts
 * import { wrapLanguageModel } from "ai";
 * const run = await kohala.tracing.start(agentId, { framework: "vercel-ai" });
 * const model = wrapLanguageModel({
 *   model: openai("gpt-4o"),
 *   middleware: kohalaVercelAiMiddleware(run),
 * });
 * ```
 *
 * Reports each generate/stream call as an `llm_call` with usage tokens.
 */
export function kohalaVercelAiMiddleware(run: KohalaRun) {
  const tokensOf = (usage: any): number | undefined => {
    if (!usage) return undefined;
    const total =
      usage.totalTokens ??
      (usage.promptTokens ?? usage.inputTokens ?? 0) +
        (usage.completionTokens ?? usage.outputTokens ?? 0);
    return typeof total === "number" && total > 0 ? total : undefined;
  };
  return {
    middlewareVersion: "v2" as const,
    async wrapGenerate({ doGenerate, params, model }: any) {
      const t = Date.now();
      try {
        const result = await doGenerate();
        await run.event({
          type: "llm_call",
          name: model?.modelId ?? "llm",
          inputSummary:
            typeof params?.prompt === "string"
              ? params.prompt.slice(0, 500)
              : undefined,
          outputSummary:
            typeof result?.text === "string"
              ? result.text.slice(0, 500)
              : undefined,
          ok: true,
          durationMs: Date.now() - t,
          tokens: tokensOf(result?.usage),
        });
        return result;
      } catch (err: any) {
        await run.event({
          type: "llm_call",
          name: model?.modelId ?? "llm",
          ok: false,
          errorMessage: String(err?.message ?? err).slice(0, 500),
          durationMs: Date.now() - t,
        });
        throw err;
      }
    },
    async wrapStream({ doStream, model }: any) {
      const t = Date.now();
      const { stream, ...rest } = await doStream();
      const self = this;
      const transformed = stream.pipeThrough(
        new TransformStream({
          async transform(chunk: any, controller: any) {
            controller.enqueue(chunk);
            if (chunk?.type === "finish") {
              await run.event({
                type: "llm_call",
                name: model?.modelId ?? "llm",
                ok: true,
                durationMs: Date.now() - t,
                tokens: tokensOf(chunk?.usage),
              });
            }
          },
        }),
      );
      void self;
      return { stream: transformed, ...rest };
    },
  };
}
