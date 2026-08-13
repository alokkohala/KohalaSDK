# @kohala/sdk

A typed, isomorphic client for the [Kohala](https://kohala.ai) public REST API.
Build, govern, run, and monetize AI agents from Node.js, edge runtimes, or the
browser (server-side only — never ship your key to a client).

The SDK is a thin wrapper over the `/api/v1` REST surface. Every call is metered
server-side; the SDK adds no client-side tracking.

## Install

```bash
npm install @kohala/sdk
```

Requires Node 18+ (or any runtime with a global `fetch`).

## Quick start

```ts
import { Kohala } from "@kohala/sdk";

const kohala = new Kohala({ apiKey: process.env.KOHALA_API_KEY! });

// List your agents
const agents = await kohala.agents.list();

// Create one
const agent = await kohala.agents.create({
  name: "Weekly digest",
  charter: "Summarize this week's activity and publish a Koan.",
  industry: "software",
  enabled: true,
});

// Trigger a run now (returns as soon as it's queued)
await kohala.runs.trigger(agent.id);

// Read run history
const { runs } = await kohala.runs.list(agent.id, { limit: 10 });

// Embed a Koan in an iframe
const src = kohala.koans.embedUrl("my-koan-slug", { view: "detail" });
```

## Configuration

```ts
new Kohala({
  apiKey: "pk_...",              // required
  baseUrl: "https://kohala.ai",  // optional (default)
  fetch: customFetch,            // optional custom fetch
  headers: { "x-team": "eng" },  // optional per-request extras
});
```

## Resources

- `kohala.agents` — CRUD plus `health`, `getQuota`/`setQuota`, `listSkills`/`attachSkill`/`detachSkill`, `listKoans`, `listReports`/`getReport`/`createReport`/`updateReport`/`deleteReport`, `listDeployments`/`createDeployment`/`rollbackDeployment`.
- `kohala.runs` — `list`, `get`, `trigger`, `retry`.
- `kohala.workflows` — `list`, `get`, `create`, `update`, `delete`, `listRuns`, `run`, `getRun`.
- `kohala.koans` — `get`, `embedUrl`.
- `kohala.users` — `create` (`POST /api/v1/users`): programmatically create a personal- or business-tier account. Requires the superuser-granted "Can create users" flag on the key's account (ungranted callers get 403). Created accounts are born verified — no verification email — and can log in immediately. Business tier requires `teamName` and creates a new team with the user as its first member; Circle tier is invitation-only and not creatable.

  ```ts
  const { user, enterprise } = await kohala.users.create({
    email: "new.hire@example.com",
    password: "s3cure-pass",
    tier: "business",
    teamName: "Acme Coffee Co.",
  });
  ```

For low-level access, `kohala.request(method, path, options)` (and `get`/`post`/`patch`/`put`/`delete`) call endpoints on the documented `/api/v1` surface directly. Note the key's scope: a `pk_` key authenticates the versioned management surface (`/api/v1/agents`, `/api/v1/workflows`, `/api/v1/workflow-runs`) — including agent-scoped koans, reports, skills, and runs under `/api/v1/agents/:id/…`. Account endpoints (profile, token balance, key management) are session-only and reject keys by design.

## Mobile & Lani chat API

The SDK covers the `pk_`-key `/api/v1` surface. The cookie-free **Mobile API**
(`mk_` bearer tokens) — Lani chat, including document & image attachments
with server-side content extraction (`POST /api/lani-meta/attachments`,
`attachmentIds` on message sends, per-message `attachments` arrays, and
auth-gated downloads) — is a plain REST surface authenticated per device, so
call it directly with `fetch`. See the full reference at
[kohala.ai/platform/api](https://kohala.ai/platform/api).

## Errors

Non-2xx responses throw a `KohalaError` with `status`, `code`, `details`, and `requestId`:

```ts
import { KohalaError } from "@kohala/sdk";

try {
  await kohala.agents.get(999);
} catch (err) {
  if (err instanceof KohalaError && err.status === 404) {
    // handle not found
  }
}
```

## License

MIT
