import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { Kohala, type KohalaOptions } from "@kohala/sdk";

const KohalaContext = createContext<Kohala | null>(null);

export interface KohalaProviderProps {
  /** A pre-built Kohala client. Takes precedence over `options`. */
  client?: Kohala;
  /**
   * Options passed to `new Kohala(...)`. Ignored when `client` is supplied.
   * Keep `apiKey` server-side — use the framework adapter's server helpers to
   * proxy requests rather than shipping a pk_ key to the browser.
   */
  options?: KohalaOptions;
  children: ReactNode;
}

/**
 * Provides a Kohala client to every component in the tree via React context.
 * Wrap your app (or the subtree that needs Kohala) with this provider.
 *
 * Never pass a `pk_` API key here — this code runs in the browser, and a
 * shipped key is a leaked key. Point `baseUrl` at your own server route that
 * proxies to Kohala with the key held server-side (or build the client
 * server-side and pass it via `client`).
 *
 * ```tsx
 * // Your server proxies /api/kohala/* to https://kohala.ai/api/v1/* and
 * // attaches the pk_ key there. The browser never sees it.
 * <KohalaProvider options={{ baseUrl: "/api/kohala" }}>
 *   <App />
 * </KohalaProvider>
 * ```
 */
export function KohalaProvider({
  client,
  options,
  children,
}: KohalaProviderProps) {
  // Memoised so stable `options` objects don't recreate the client on every render.
  const kohala = useMemo(
    () => client ?? new Kohala(options!),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client],
  );
  return (
    <KohalaContext.Provider value={kohala}>{children}</KohalaContext.Provider>
  );
}

/**
 * Returns the Kohala client from the nearest `<KohalaProvider>`.
 * Throws if called outside a provider.
 */
export function useKohala(): Kohala {
  const client = useContext(KohalaContext);
  if (!client) {
    throw new Error(
      "useKohala: no Kohala client found. Wrap your app with <KohalaProvider>.",
    );
  }
  return client;
}
