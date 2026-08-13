# Kohala SDKs

Source for the Kohala client SDKs, published to npm under the `@kohala` scope (MIT):

| Package | Description |
|---|---|
| [`@kohala/sdk`](packages/sdk) | Typed, isomorphic client for the Kohala public REST API |
| [`@kohala/react`](packages/react) | React hooks and components |
| [`@kohala/next`](packages/next) | Next.js helpers and components |
| [`@kohala/vue`](packages/vue) | Vue 3 plugin and composables |

Each package is standalone (no npm workspaces) and builds with `tsup` (ESM + CJS + type declarations). Build `packages/sdk` first, then the adapters.

- Docs: https://kohala.ai/developers
- API reference: https://kohala.ai/platform/api
- Devkit (Python agent scaffolding): https://github.com/alokkohala/KohalaDevkit
