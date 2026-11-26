import { startServer } from "./server.ts";

const server = startServer();
console.log(`[mw-mylove] listening on http://0.0.0.0:${server.port}`);
