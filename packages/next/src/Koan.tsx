"use client";

import type { CSSProperties } from "react";

export interface KoanProps {
  /** Slug of the Koan to embed. */
  slug: string;
  /** Iframe layout — "detail" for the full-page layout, "card" for the compact card. */
  view?: "detail" | "card";
  /**
   * Base URL of your Kohala deployment. Pass the value of
   * `process.env.KOHALA_BASE_URL` from a Server Component via props — do not
   * read `process.env` directly in a Client Component.
   * Defaults to `https://kohala.ai` (the public Kohala cloud).
   */
  baseUrl?: string;
  /** Inline styles forwarded to the iframe element. */
  style?: CSSProperties;
  /** Class name forwarded to the iframe element. */
  className?: string;
}

/**
 * Client Component — renders a Kohala Koan visualization in a responsive
 * iframe. Pass `baseUrl` down from a Server Component to keep env variables
 * server-side.
 *
 * ```tsx
 * // app/page.tsx  (Server Component)
 * import { Koan } from "@kohala/next";
 *
 * export default function Page() {
 *   return <Koan slug="my-koan" baseUrl={process.env.KOHALA_BASE_URL} />;
 * }
 * ```
 */
export function Koan({
  slug,
  view,
  baseUrl = "https://kohala.ai",
  style,
  className,
}: KoanProps) {
  const base = baseUrl.replace(/\/+$/, "");
  const q = view ? `?view=${encodeURIComponent(view)}` : "";
  const src = `${base}/api/koans/${encodeURIComponent(slug)}/render${q}`;
  return (
    <iframe
      src={src}
      title={`Kohala Koan: ${slug}`}
      style={{ border: "none", width: "100%", ...style }}
      className={className}
    />
  );
}
