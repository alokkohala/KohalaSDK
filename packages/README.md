# Kohala SDKs

Official client libraries for the [Kohala](https://kohala.ai) public REST API.
They are thin, typed wrappers over the `/api/v1` surface — every call is metered
server-side and the SDKs add no client-side tracking.

| Package | Registry name | Language / framework |
| --- | --- | --- |
| `sdk/` | [`@kohala/sdk`](https://kohala.ai/developers) | Core JS/TS client (isomorphic) |
| `react/` | `@kohala/react` | React hooks + components |
| `next/` | `@kohala/next` | Next.js server helpers + components |
| `vue/` | `@kohala/vue` | Vue 3 plugin + composables |
| `python/` | `kohala` | Python client (stdlib only) |

The three framework adapters and the Python package all wrap the core client,
so `@kohala/sdk` is the source of truth for the `/api/v1` API surface and
types.

The mobile SDKs — `KohalaMobile` (Swift/SPM, iOS/macOS) and
`ai.kohala:kohala-mobile` (Kotlin/Maven, Android) — wrap the `mk_`
mobile-token **Mobile API** (Lani chat, Canvas approvals, koan/report
rendering) rather than `/api/v1`. Their source now lives in a **separate SDK
repository**; releases are published to the site's public download links via
the SDK Release Upload API (see `docs/sdk-upload-api.md`).

## Layout

Each package is standalone (this repo has **no** npm workspaces): its own
`package.json`, `tsconfig.json`, and `tsup.config.ts`. Build artifacts land in
each package's `dist/` (JS) or via `hatchling` (Python) and are git-ignored.

## Building locally

The JS packages build with [`tsup`](https://tsup.egoist.dev) (ESM + CJS +
`.d.ts`). From a package directory:

```bash
cd packages/sdk        # or react / next / vue
npm install
npm run build
npm run smoke          # sdk only: offline smoke test
```

Build the core (`sdk`) first — the adapters depend on `@kohala/sdk`. During
local development you can link it with `npm install ../sdk` inside an adapter, or
rely on the published version once it's on npm.

Python:

```bash
cd packages/python
python -m pip install build
python -m build        # produces dist/*.whl and dist/*.tar.gz
python tests/test_smoke.py
```

## Publishing

Publishing is a **one-time, credential-gated** step performed by a maintainer.
Prerequisites (owner-only):

1. An npm organization named `@kohala` (for the four scoped JS packages).
2. A PyPI project named `kohala` (for the Python package).
3. Auth tokens available to whoever runs the publish: `NPM_TOKEN` and
   `PYPI_TOKEN` (or interactive `npm login` / a `~/.pypirc`).

### JS packages (npm)

Publish the core first, then the adapters (so `@kohala/sdk` exists as a
dependency):

```bash
# from repo root
for pkg in sdk react next vue; do
  (cd packages/$pkg && npm install && npm publish --access public)
done
```

Each package's `prepublishOnly` runs the build, so `dist/` is fresh on publish.
Bump the `version` in the relevant `package.json` before re-publishing.

### Python package (PyPI)

```bash
cd packages/python
python -m pip install build twine
python -m build
python -m twine upload dist/*
```

### Mobile SDKs (Swift & Kotlin)

The mobile SDK source lives in a separate repository; publishing (SPM git
tags / Maven Central) happens from there. Source-zip releases are uploaded
to this app's public download links via the superuser SDK Release Upload API
(`docs/sdk-upload-api.md`).

### GitHub Actions (optional)

A tag-triggered workflow can automate the above once the org/project and the
`NPM_TOKEN` / `PYPI_TOKEN` repository secrets exist. Keep the "core first"
ordering for the npm job.

## Versioning

All packages start at `0.1.0`. Keep the adapters' `@kohala/sdk` dependency range
(`^0.1.0`) in step with the core version when you cut a release.
