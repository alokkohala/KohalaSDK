# @kohala/vue

Vue 3 plugin and composables for the [Kohala](https://kohala.ai) API, built on
[`@kohala/sdk`](https://www.npmjs.com/package/@kohala/sdk).

## Install

```bash
npm install @kohala/vue @kohala/sdk vue
```

## Usage

Install the plugin (prefer a server-built client where possible):

```ts
import { createApp } from "vue";
import { Kohala } from "@kohala/sdk";
import { createKohala } from "@kohala/vue";
import App from "./App.vue";

const client = new Kohala({ apiKey: import.meta.env.VITE_KOHALA_API_KEY });
createApp(App).use(createKohala({ client })).mount("#app");
```

Use composables in a component:

```vue
<script setup lang="ts">
import { useAgents, Koan } from "@kohala/vue";
const { data: agents, loading, error, refetch } = useAgents();
</script>

<template>
  <p v-if="loading">Loading…</p>
  <p v-else-if="error">{{ error.message }}</p>
  <ul v-else>
    <li v-for="a in agents" :key="a.id">{{ a.name }}</li>
  </ul>
  <Koan slug="my-koan-slug" view="detail" />
</template>
```

## Composables

`useAgents`, `useAgent`, `useAgentRuns`, `useAgentKoans`, `useKoan` — each
returns reactive `{ data, error, loading, refetch }`. `useKohala()` returns the
underlying client.

## License

MIT
