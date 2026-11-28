import { NextResponse, type NextRequest } from "next/server";
import {
  AFFILIATE_COOKIE_NAME,
  AFFILIATE_COOKIE_TTL_SECONDS,
  sanitizeAffiliateRef,
} from "@mw/seo";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const ref = sanitizeAffiliateRef(request.nextUrl.searchParams.get("ref"));

  if (ref) {
    response.cookies.set(AFFILIATE_COOKIE_NAME, ref, {
      httpOnly: true,
      maxAge: AFFILIATE_COOKIE_TTL_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
