import { dispatchPortalRequest } from "../lib/portal-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = dispatchPortalRequest;
export const HEAD = dispatchPortalRequest;
export const POST = dispatchPortalRequest;
export const PUT = dispatchPortalRequest;
export const PATCH = dispatchPortalRequest;
export const DELETE = dispatchPortalRequest;
export const OPTIONS = dispatchPortalRequest;
