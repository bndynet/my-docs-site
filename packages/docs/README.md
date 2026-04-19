# @bndynet/docs

Docusaurus 3 wrapper that ships a complete site template (theme, pages, static, styles, plugins) so a consumer only needs a single `docs.config.js` and this package.

## What you edit

| File | Purpose |
|------|---------|
| **`docs.config.js`** (or `.ts`/`.cjs`/`.mjs`) | `mdxRoot`, `nav`, titles, URLs, `theme`, etc. |
| **Your docs folder** | Under `mdxRoot` (e.g. `docs/docs-a/`, `docs/docs-b/`) |
| **`static/`** *(optional)* | Your own assets; falls back to the package defaults (logo, favicon, etc.) |
| **`src/{components,theme,pages,utils,css}`** *(optional)* | Per-directory override of the shipped template |

You do **not** write a `docusaurus.config.js` — the `docs` CLI injects the packaged one via `--config` automatically.

## Create a project

```bash
npx docs init my-site
cd my-site
npm install
npm run dev
```

`init` is **idempotent** and safe to re-run whenever you bump `@bndynet/docs`.
Per run it:

- Writes `docs.config.js` and `docs/intro.md` if they don't exist.
- **Scaffolds** a full `package.json` if there isn't one — including
  `@bndynet/docs` as a dependency, the standard `docs dev/build/serve/clear`
  scripts, and the temporary `overrides` that pin transitive deps we need
  (see the next section).
- **Merges** managed `overrides` into an *existing* `package.json`: fills in
  any missing key from our table, preserves the file's indentation and
  trailing newline, and **never overwrites** a value you already set. (If
  you pinned a different `webpackbar` range on purpose we won't silently
  clobber it — you'll just see a runtime warning from `checkWebpackbarCompat`
  when the version is too old.)

Recommended flow for an existing project that just `npm install`-ed
`@bndynet/docs`:

```bash
npm install @bndynet/docs
npx docs init .            # merges overrides + seeds docs.config.js
rm -rf node_modules package-lock.json && npm install
npx docs dev
```

### About the `overrides.webpackbar` pin

Docusaurus `3.10.x` ships `@docusaurus/bundler` depending on `webpackbar@^6.0.1`.
`webpackbar@6` passes non-schema options (`name`/`color`/`reporters`/`reporter`)
through to webpack's `ProgressPlugin`, which `webpack@5.106+` now rejects with:

```
ValidationError: Progress Plugin has been initialized using an options object
that does not match the API schema.
```

`webpackbar@7.0.0` fixes the option shape. Because `npm overrides` are only
honoured in the **root** `package.json`, `@bndynet/docs` cannot fix this from
inside its own `package.json` — the scaffolded root `package.json` carries the
override instead, and the `docs` CLI emits a runtime warning at `dev`/`build`
when it detects the incompatible combination.

> **TODO(docusaurus-3.10.1)** — remove the `webpackbar` override and the
> `checkWebpackbarCompat` call in `bin/docs.cjs` once Docusaurus publishes a
> version whose `@docusaurus/bundler` depends on `webpackbar@^7`. Tracking:
> [facebook/docusaurus#11923](https://github.com/facebook/docusaurus/issues/11923).
> Grep this repo for `TODO(docusaurus-3.10.1)` to locate every affected
> site (scaffolded `package.json` template, CLI runtime check, root
> `package.json`, and documentation).

### Maintaining the override list across Docusaurus upgrades

All managed overrides live in **one place** in the package source:
`packages/docs/bin/docs.cjs`, at the `STARTER_OVERRIDES` constant. The
`docs init` merge logic, the CLI's runtime warnings, and the scaffolded
`package.json` all read from it — so adding or removing a pin is a
single-file change.

**When upstream fixes an issue** (e.g. Docusaurus bumps `@docusaurus/bundler`
to depend on `webpackbar@^7`):

1. In `@bndynet/docs` source:
   - Delete the entry from `STARTER_OVERRIDES`.
   - Delete the matching `checkFooCompat` function and its call site in
     `runDocusaurus` (grep for the TODO anchor, e.g. `TODO(docusaurus-3.10.1)`).
   - Remove the TODO-marked `@bndynet/docs` README section and the related
     root README Troubleshooting entry.
2. Bump `packages/docs/package.json` version and republish.
3. Downstream consumers still carry the stale line in their own
   `package.json`. They remove it manually — `docs init` only *adds* managed
   keys, it does not prune them (we don't want to delete something the user
   may now rely on for an unrelated reason).

**When upstream introduces a new issue** that needs a new override:

1. Add a new key to `STARTER_OVERRIDES` with a new `TODO(docusaurus-3.x.y)`
   anchor pointing to the upstream tracking issue.
2. Add a new runtime `checkFooCompat` beside `checkWebpackbarCompat`, wire
   it into `runDocusaurus`.
3. Add a new Troubleshooting entry in both READMEs.
4. Publish. Consumers pick it up by running `npx docs init .` once — the
   merge logic fills in the new override non-destructively.

This keeps the answer to *"how do I maintain this across Docusaurus
upgrades?"* short: edit one constant, grep one anchor to locate the
related check/docs, publish, and optionally ask users to re-run
`npx docs init`.

### Other consumer pitfalls the CLI guards against

Two more compatibility gotchas show up on real-world Docusaurus 3.10.x
installs. `@bndynet/docs` handles them automatically so you usually never
see them; the notes below are for when you run into one anyway.

- **`"type": "commonjs"` in your root `package.json`** — webpack walks up to
  the nearest `package.json#type` to decide the `sourceType` of every `.js`
  file it parses, and `commonjs` makes it reject the ES module output
  Docusaurus emits under `.docusaurus/` (and `@easyops-cn/docusaurus-search-local`'s
  generated files) with multiple copies of:
  ```
  'import' and 'export' may appear only with 'sourceType: module'
  ```
  `docs dev`/`build` fail fast with a targeted message pointing at the
  offending `package.json`. Fix: delete the `"type": "commonjs"` line (or set
  it to `"type": "module"`). The scaffolded `package.json` from `docs init`
  deliberately omits the field.

- **Missing `@mermaid-js/layout-elk`** —
  `@docusaurus/theme-mermaid@3.10.x` declares it as an optional peer and uses
  `DefinePlugin` to dead-code-eliminate the `await import('@mermaid-js/layout-elk')`
  inside `loadMermaid.js` when the package is absent. On webpack 5.106+ the
  dead branch isn't tree-shaken reliably and the build fails with:
  ```
  Module not found: Error: Can't resolve '@mermaid-js/layout-elk'
  ```
  `@bndynet/docs` probes the consumer's `node_modules` for the package in
  `lib/buildDocusaurusConfig.cjs` and, when it's not installed, registers a
  `resolve.alias → false` stub so webpack resolves the dead import to an
  empty module. No action required; if you do want the ELK Mermaid layout,
  `npm install @mermaid-js/layout-elk@^0.1.9` and the stub steps aside.
  Search for `TODO(docusaurus-3.10.x)` to drop the workaround once upstream
  fixes either the tree-shaking or the import guard.

## Commands

| npm script | direct |
|------------|--------|
| `npm run dev` | `docs dev` |
| `npm run build` | `docs build` |
| `npm run serve` | `docs serve` |
| `npm run clear` | `docs clear` |

The `docs` CLI forwards to `@docusaurus/core` with:

- `--config <pkg>/lib/docusaurus.config.cjs`
- `DOCS_DIR=<cwd>` in the environment

To point at an alternative config file (e.g. a prod variant):

```bash
docs build --config ./docs.config.prod.js
```

The flag is consumed by the `docs` CLI (it refers to the **docs** config, not
a Docusaurus config) and exported as `DOCS_CONFIG` so both the Docusaurus
config and the sidebar loader use the same file. To run Docusaurus with a raw
`docusaurus.config.js`, bypass this CLI and invoke `docusaurus` directly.

## `docs.config.js` (sketch)

```js
/** @type {import('@bndynet/docs').DocsConfig} */
module.exports = {
  title: 'My Site',
  logo: 'img/logo.svg',
  url: 'https://example.com',
  baseUrl: '/',
  blog: false,
  mdxRoot: './docs',
  // Each entry is one top menu item. `docsPath` builds an autogenerated
  // sidebar from <mdxRoot>/<docsPath>, keyed by `label`.
  nav: [
    { label: 'A', docsPath: 'docs-a' },
    { label: 'B', docsPath: 'docs-b' },
  ],
  theme: {
    image: 'img/docusaurus-social-card.jpg',
    favicon: 'img/favicon.ico',
  },
};
```

Supported `nav` item shapes:

- `{ label, docsPath, position?, className? }`
- `{ label, to, position?, className?, 'aria-label'? }`
- `{ label, href, position?, className?, 'aria-label'? }`
- `{ html, position?, className? }`

## Override strategy

All shipped defaults live in `packages/docs/assets/`. The consumer can override per directory:

| Shipped asset | Override by placing |
|---------------|---------------------|
| `assets/css/custom.scss` | `<siteDir>/src/css/custom.scss` |
| `assets/static/` (logo, favicon, etc.) | `<siteDir>/static/<same path>` |
| `assets/src/pages/` (homepage etc.) | `<siteDir>/src/pages/` |
| `assets/src/theme/` (swizzled @theme) | `<siteDir>/src/theme/<same path>` |
| `assets/src/components/` (used by pages) | `<siteDir>/src/components/` |
| `assets/src/utils/` | `<siteDir>/src/utils/` |

## Publish

`npm publish --access public` from the package directory.

## License

MIT
