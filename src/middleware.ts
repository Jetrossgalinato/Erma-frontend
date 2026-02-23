import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that logged-in users must NOT be able to visit
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("authToken")?.value;

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Authenticated user trying to reach login or register → redirect home
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware only on login/register routes so it stays lightweight
  matcher: ["/login", "/login/:path*", "/register", "/register/:path*"],
};
