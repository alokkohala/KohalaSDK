# @kohala/next

Next.js helpers and components for the [Kohala](https://kohala.ai) API, built on
[`@kohala/sdk`](https://www.npmjs.com/package/@kohala/sdk).

## Install

```bash
npm install @kohala/next @kohala/sdk
```

Set `KOHALA_API_KEY` (and optionally `KOHALA_BASE_URL`) in your environment.

## Usage

Build a client in any server context (Server Component, Route Handler,
`getServerSideProps`):

```tsx
import { createKohala, Koan } from "@kohala/next";

export default async function Page() {
  const kohala = createKohala(); // reads KOHALA_API_KEY
  const agents = await kohala.agents.list();
  return (
    <main>
      <ul>{agents.map((a) => <li key={a.id}>{a.name}</li>)}</ul>
      <Koan slug="my-koan-slug" view="detail" style={{ height: 480 }} />
    </main>
  );
}
```

Route Handler example:

```ts
// app/api/agents/route.ts
import { createKohala } from "@kohala/next";

export async function GET() {
  const kohala = createKohala();
  return Response.json(await kohala.agents.list());
}
```

`<Koan>` is a server-friendly iframe (no client hooks). `koanEmbedUrl(slug, {
view })` builds the same URL without a client.

## License

MIT
