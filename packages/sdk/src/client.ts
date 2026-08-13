import { KohalaError, type KohalaErrorBody } from "./errors";
import { AgentsResource } from "./resources/agents";
import { RunsResource } from "./resources/runs";
import { WorkflowsResource } from "./resources/workflows";
import { KoansResource } from "./resources/koans";
import { UsersResource } from "./resources/users";
import { TracingResource } from "./tracing";

export interface KohalaOptions {
  /**
   * A `pk_` API key from your Developer tab. Keep it on the server.
   * Optional when `baseUrl` points at your own server-side proxy that
   * attaches the key — the browser-safe pattern.
   */
  apiKey?: string;
  /** API origin. Defaults to `https://kohala.ai`. */
  baseUrl?: string;
  /** Custom fetch implementation. Defaults to the global `fetch` (Node 18+). */
  fetch?: typeof fetch;
  /** Extra headers sent on every request. */
  headers?: Record<string, string>;
}

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface RequestOptions {
  query?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

const DEFAULT_BASE_URL = "https://kohala.ai";

/**
 * The Kohala client — a thin, typed wrapper over the public `/api/v1` REST
 * surface. Every call is metered server-side; the SDK adds no tracking.
 *
 * ```ts
 * const kohala = new Kohala({ apiKey: process.env.KOHALA_API_KEY! });
 * const agents = await kohala.agents.list();
 * ```
 */
export class Kohala {
  readonly baseUrl: string;
  private readonly apiKey: string | null;
  private readonly fetchImpl: typeof fetch;
  private readonly defaultHeaders: Record<string, string>;

  readonly agents: AgentsResource;
  readonly runs: RunsResource;
  readonly workflows: WorkflowsResource;
  readonly koans: KoansResource;
  readonly users: UsersResource;
  readonly tracing: TracingResource;

  constructor(options: KohalaOptions) {
    if (!options || (!options.apiKey && !options.baseUrl)) {
      throw new Error(
        "Kohala: pass `apiKey` (a pk_ key from your Developer tab), or " +
          "`baseUrl` pointing at your own server-side proxy that attaches " +
          "the key (browser-safe pattern).",
      );
    }
    this.apiKey = options.apiKey ?? null;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    const f = options.fetch ?? globalThis.fetch;
    if (typeof f !== "function") {
      throw new Error(
        "Kohala: no global `fetch` available. Pass `fetch` in options or use Node 18+.",
      );
    }
    // Bind to globalThis: an unbound native `fetch` throws "Illegal
    // invocation" in browsers/edge runtimes when invoked with any other
    // `this` (e.g. this client instance via `this.fetchImpl(...)`).
    this.fetchImpl = f.bind(globalThis) as typeof fetch;
    this.defaultHeaders = options.headers ?? {};

    this.agents = new AgentsResource(this);
    this.runs = new RunsResource(this);
    this.workflows = new WorkflowsResource(this);
    this.koans = new KoansResource(this);
    this.users = new UsersResource(this);
    this.tracing = new TracingResource(this);
  }

  /** Build an absolute URL for `path` (which must start with "/"). */
  url(path: string, query?: QueryParams): string {
    const u = new URL(this.baseUrl + path);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
      }
    }
    return u.toString();
  }

  async request<T = unknown>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = this.url(path, options.query);
    const headers: Record<string, string> = {
      // No Authorization header in proxy mode (apiKey omitted) — the
      // server-side proxy at `baseUrl` attaches the credential.
      ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      Accept: "application/json",
      ...this.defaultHeaders,
      ...options.headers,
    };
    let body: string | undefined;
    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }
    const res = await this.fetchImpl(url, {
      method,
      headers,
      body,
      signal: options.signal,
    });
    return this.parse<T>(res);
  }

  private async parse<T>(res: Response): Promise<T> {
    const requestId = res.headers.get("x-request-id") ?? undefined;
    const text = await res.text();
    let data: unknown = undefined;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    if (!res.ok) {
      const b = (data && typeof data === "object" ? data : {}) as KohalaErrorBody;
      const message =
        b.message ||
        b.error ||
        b.reason ||
        `Kohala request failed with status ${res.status}`;
      throw new KohalaError(message, {
        status: res.status,
        code: b.error,
        details: b.details ?? data,
        requestId,
      });
    }
    return data as T;
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>("GET", path, options);
  }
  post<T>(path: string, options?: RequestOptions) {
    return this.request<T>("POST", path, options);
  }
  patch<T>(path: string, options?: RequestOptions) {
    return this.request<T>("PATCH", path, options);
  }
  put<T>(path: string, options?: RequestOptions) {
    return this.request<T>("PUT", path, options);
  }
  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>("DELETE", path, options);
  }
}
