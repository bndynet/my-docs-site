/**
 * Docusaurus config entry passed to `docusaurus` via `--config`.
 * The `docs` CLI sets DOCS_DIR (required) and optionally DOCS_CONFIG
 * (when the user passes `--config <path>`); both are honored here.
 */
module.exports = require('./index.cjs').getDocusaurusConfig({
  siteDir: process.env.DOCS_DIR || process.cwd(),
  docsConfig: process.env.DOCS_CONFIG || undefined,
});
