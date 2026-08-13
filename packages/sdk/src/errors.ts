/** Error body shapes the Kohala API returns on a non-2xx response. */
export interface KohalaErrorBody {
  error?: string;
  message?: string;
  reason?: string;
  details?: unknown;
}

/**
 * Thrown for any non-2xx response from the Kohala API. Carries the HTTP
 * `status`, a machine-readable `code` (the API's `error` field when present),
 * the raw `details`, and the `x-request-id` header when the server set one.
 */
export class KohalaError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly details: unknown;
  readonly requestId: string | undefined;

  constructor(
    message: string,
    opts: { status: number; code?: string; details?: unknown; requestId?: string },
  ) {
    super(message);
    this.name = "KohalaError";
    this.status = opts.status;
    this.code = opts.code;
    this.details = opts.details;
    this.requestId = opts.requestId;
    // Restore the prototype chain for instanceof across transpile targets.
    Object.setPrototypeOf(this, KohalaError.prototype);
  }
}
