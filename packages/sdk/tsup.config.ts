import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  // "neutral" = isomorphic: no Node.js shims injected, output works in both
  // browser bundlers (Vite, webpack, Rollup) and Node.js runtimes.
  platform: "neutral",
  target: "es2021",
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});
