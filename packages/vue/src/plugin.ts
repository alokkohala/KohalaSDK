import type { App, InjectionKey } from "vue";
import { Kohala, type KohalaOptions } from "@kohala/sdk";

/** Injection key used to provide/inject the Kohala client in a Vue app. */
export const kohalaKey: InjectionKey<Kohala> = Symbol("kohala");

export type CreateKohalaOptions = KohalaOptions | { client: Kohala };

/**
 * Create the Kohala Vue plugin.
 *
 * ```ts
 * app.use(createKohala({ apiKey: import.meta.env.VITE_KOHALA_API_KEY }));
 * ```
 *
 * Note: an `apiKey` passed here ships to wherever the app runs — prefer a
 * server-built client in trusted contexts.
 */
export function createKohala(options: CreateKohalaOptions) {
  const client =
    "client" in options ? options.client : new Kohala(options);
  return {
    install(app: App) {
      app.provide(kohalaKey, client);
      app.config.globalProperties.$kohala = client;
    },
  };
}
