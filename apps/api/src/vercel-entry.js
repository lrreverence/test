/* global module, require */
// The Vercel Node loader consumes CommonJS server exports.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bundle = require("../dist-vercel/index.js");

module.exports = bundle.default ?? bundle;
