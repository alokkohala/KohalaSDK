# @kohala/react

React hooks and components for the [Kohala](https://kohala.ai) API, built on
[`@kohala/sdk`](https://www.npmjs.com/package/@kohala/sdk).

## Install

```bash
npm install @kohala/react @kohala/sdk react
```

## Usage

Wrap your app in a provider (prefer building the client on the server and
passing it in, so your key stays private):

```tsx
import { Kohala } from "@kohala/sdk";
import { KohalaProvider, useAgents, Koan } from "@kohala/react";

const client = new Kohala({ apiKey: process.env.KOHALA_API_KEY! });

function App() {
  return (
    <KohalaProvider client={client}>
      <Dashboard />
    </KohalaProvider>
  );
}

function Dashboard() {
  const { data: agents, loading, error, refetch } = useAgents();
  if (loading) return <p>Loading…</p>;
  if (error) return <p>{error.message}</p>;
  return (
    <ul>
      {agents?.map((a) => <li key={a.id}>{a.name}</li>)}
    </ul>
  );
}
```

Embed a Koan:

```tsx
<Koan slug="my-koan-slug" view="detail" style={{ height: 480 }} />
```

## Hooks

`useAgents`, `useAgent`, `useAgentRuns`, `useAgentHealth`, `useAgentKoans`,
`useKoan` — each returns `{ data, error, loading, refetch }`. `useKohala()`
returns the underlying client for anything not covered by a hook.

## License

MIT
