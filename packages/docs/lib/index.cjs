/**
 * Public entry for `@bndynet/docs`.
 *
 *   const { getDocusaurusConfig } = require('@bndynet/docs');
 *   module.exports = getDocusaurusConfig(); // or getDocusaurusConfig({ siteDir })
 *
 * End users normally do not import this directly: the `docs` CLI forwards the
 * Docusaurus CLI to `lib/docusaurus.config.cjs`, which calls this for them.
 */
const path = require('path');
const fs = require('fs');
const createJiti = require('jiti');
const { mapDocsConfigToRuntime } = require('./mapDocsConfig.cjs');
const { buildDocusaurusConfig } = require('./buildDocusaurusConfig.cjs');

const CONFIG_CANDIDATES = [
  'docs.config.ts',
  'docs.config.mts',
  'docs.config.js',
  'docs.config.cjs',
  'docs.config.mjs',
];

function defineConfig(config) {
  return config;
}

function findConfigFile(siteDir) {
  for (const f of CONFIG_CANDIDATES) {
    const p = path.join(siteDir, f);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function getDocusaurusConfig(options) {
  const opts = typeof options === 'string' ? { siteDir: options } : options || {};
  const siteDir = opts.siteDir || process.env.DOCS_DIR || process.cwd();

  // Explicit --config wins over auto-discovery. The consumer can point at
  // a variant like ./docs.config.prod.js that re-exports the base with tweaks.
  const envConfig = process.env.DOCS_CONFIG;
  let configPath;
  if (opts.docsConfig) {
    configPath = path.isAbsolute(opts.docsConfig)
      ? opts.docsConfig
      : path.resolve(siteDir, opts.docsConfig);
  } else if (envConfig) {
    configPath = path.isAbsolute(envConfig) ? envConfig : path.resolve(siteDir, envConfig);
  } else {
    configPath = findConfigFile(siteDir);
  }

  if (!configPath || !fs.existsSync(configPath)) {
    throw new Error(
      '[@bndynet/docs] docs.config not found. Tried: ' +
        (opts.docsConfig || envConfig || CONFIG_CANDIDATES.join(', ')) +
        ' (siteDir: ' +
        siteDir +
        ')'
    );
  }

  const jiti = createJiti(__filename, { interopDefault: true, cache: false });
  const mod = jiti(configPath);
  const site = mod.default || mod;
  if (!site || typeof site !== 'object') {
    throw new Error(`[@bndynet/docs] Invalid export from ${configPath}`);
  }

  const { app, docsPathRelative, blog } = mapDocsConfigToRuntime(site, siteDir);

  return buildDocusaurusConfig({
    siteDir,
    app,
    docsPathRelative,
    blog,
    site,
  });
}

module.exports = {
  defineConfig,
  getDocusaurusConfig,
  findConfigFile,
};
