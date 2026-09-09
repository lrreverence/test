import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

// Vercel discovers `server.ts` as a Node.js backend entrypoint and needs the
// Express app export. A local listener is only started for `pnpm dev`/`start`.
export default app;

if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`Labelwise API listening on http://localhost:${env.PORT}`);
  });
}
