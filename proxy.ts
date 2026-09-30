import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";

const AGE_COOKIE = "age_verified";
const EXEMPT_PATHS = ["/age-gate", "/_next", "/favicon.ico", "/api/age-gate"];
const ADMIN_LOGIN_PATHS = ["/admin/login", "/api/admin/login"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (ADMIN_LOGIN_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }

    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const valid = await verifySessionToken(token);
    if (valid) return NextResponse.next();

    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (EXEMPT_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const verified = req.cookies.get(AGE_COOKIE)?.value === "1";
  if (verified) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/age-gate";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
