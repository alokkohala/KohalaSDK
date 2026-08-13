import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  // "neutral" = works in both Next.js Server Components (Node) and Client
  // Components (browser) without injecting Node.js shims into client bundles.
  platform: "neutral",
  target: "es2020",
  external: ["react", "react-dom", "next", "@kohala/sdk"],
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});
