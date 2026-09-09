/* global __dirname, module, process, require */
// The Vercel Node loader consumes CommonJS server exports.
process.env.PRISMA_QUERY_ENGINE_LIBRARY ??= `${__dirname}/query-engine.node`;

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bundle = require("../dist-vercel/index.js");

module.exports = bundle.default ?? bundle;
