import type { Kohala } from "../client";
import type { Koan } from "../types";

export interface KoanEmbedOptions {
  view?: "detail" | "card";
}

/** Public Koan reads and embed-URL helpers. */
export class KoansResource {
  constructor(private readonly client: Kohala) {}

  /** Fetch a single public Koan by slug. */
  get(slug: string) {
    return this.client.get<Koan>(`/api/koans/${encodeURIComponent(slug)}`);
  }

  /**
   * Absolute URL of a Koan's rendered visualization, suitable for an iframe
   * `src`. Pass `{ view: "detail" }` for the full-page layout.
   */
  embedUrl(slug: string, options: KoanEmbedOptions = {}): string {
    const query = options.view ? { view: options.view } : undefined;
    return this.client.url(
      `/api/koans/${encodeURIComponent(slug)}/render`,
      query,
    );
  }
}
