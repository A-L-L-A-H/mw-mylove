import { dispatchPortalRequest } from "../../lib/portal-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = dispatchPortalRequest;
export const HEAD = dispatchPortalRequest;
export const POST = dispatchPortalRequest;
