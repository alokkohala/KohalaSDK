import { Kohala, type KohalaOptions } from "@kohala/sdk";

/**
 * Build a Kohala client on the server. Reads `KOHALA_API_KEY` (and optional
 * `KOHALA_BASE_URL`) from the environment when not passed explicitly. Call this
 * from Server Components, Route Handlers, or `getServerSideProps` — never in the
 * browser, so your key stays private.
 */
export function createKohala(options?: Partial<KohalaOptions>): Kohala {
  const apiKey = options?.apiKey ?? process.env.KOHALA_API_KEY;
  if (!apiKey) {
    throw new Error(
      "createKohala: set KOHALA_API_KEY in the environment or pass { apiKey }.",
    );
  }
  const baseUrl = options?.baseUrl ?? process.env.KOHALA_BASE_URL;
  return new Kohala({ ...options, apiKey, baseUrl });
}

/**
 * Absolute embed URL for a Koan, usable as an iframe `src` from server or
 * client without a client instance. Falls back to `KOHALA_BASE_URL` then the
 * public origin.
 */
export function koanEmbedUrl(
  slug: string,
  opts: { view?: "detail" | "card"; baseUrl?: string } = {},
): string {
  const base = (
    opts.baseUrl ??
    process.env.KOHALA_BASE_URL ??
    "https://kohala.ai"
  ).replace(/\/+$/, "");
  const q = opts.view ? `?view=${encodeURIComponent(opts.view)}` : "";
  return `${base}/api/koans/${encodeURIComponent(slug)}/render${q}`;
}
