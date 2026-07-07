import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "@/keystatic.config";

// makeRouteHandler validates GitHub App env vars eagerly, which would fail the
// build before the GitHub App is configured. Resolve it lazily at request time.
let handlers: ReturnType<typeof makeRouteHandler> | undefined;

function getHandlers() {
  handlers ??= makeRouteHandler({ config });
  return handlers;
}

export function GET(req: Request) {
  return getHandlers().GET(req);
}

export function POST(req: Request) {
  return getHandlers().POST(req);
}
