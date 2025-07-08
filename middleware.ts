import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "auth_token";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE)?.value;

  // Allow static files and API login
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api/auth/login")
  ) {
    return NextResponse.next();
  }

  // If authenticated, redirect /login and / to /dashboard
  if (
    token === "authenticated" &&
    (pathname === "/login" || pathname === "/")
  ) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // If not authenticated, protect /dashboard and /api/listings
  if (
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/api/listings")) &&
    token !== "authenticated"
  ) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/listings/:path*", "/login", "/"],
};
