const fs = require("node:fs");

for (const target of ["dist", "dist-vercel", "src/query-engine.node"]) {
  fs.rmSync(target, { recursive: true, force: true });
}
