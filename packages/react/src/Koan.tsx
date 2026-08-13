import type { CSSProperties } from "react";
import { useKohala } from "./context";

export interface KoanProps {
  /** Slug of the Koan to embed. */
  slug: string;
  /** Iframe layout — "detail" for the full-page layout, "card" for the compact card. */
  view?: "detail" | "card";
  /** Inline styles forwarded to the iframe element. */
  style?: CSSProperties;
  /** Class name forwarded to the iframe element. */
  className?: string;
}

/**
 * Renders a Kohala Koan visualization in a responsive iframe.
 * Must be used inside a `<KohalaProvider>`.
 *
 * ```tsx
 * <Koan slug="my-market-overview" view="detail" />
 * ```
 */
export function Koan({ slug, view, style, className }: KoanProps) {
  const k = useKohala();
  return (
    <iframe
      src={k.koans.embedUrl(slug, view ? { view } : {})}
      title={`Kohala Koan: ${slug}`}
      style={{ border: "none", width: "100%", ...style }}
      className={className}
    />
  );
}
