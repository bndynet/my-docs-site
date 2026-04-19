// Production overrides, used via: docs build --config ./docs.config.prod.js
// Only fields that differ from the base config go here; everything else is
// inherited from docs.config.js.
//
// `/tw.config.js` and other baseUrl-relative scripts declared in the base
// config are auto-prefixed with baseUrl by @bndynet/docs, so you don't need
// to rewrite `externalScripts` here.
const base = require('./docs.config.js');

module.exports = {
  ...base,
  baseUrl: '/my-docs-site/',
};
