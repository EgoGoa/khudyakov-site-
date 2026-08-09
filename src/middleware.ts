import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, sessionToken } from "@/lib/adminAuth";

const OPEN_PATHS = ["/admin/login", "/admin/setup"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (OPEN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const password = process.env.ADMIN_PASSWORD;

  // No password configured: fail closed and explain how to set one, rather
  // than leaving the panel open to anyone who guesses the URL.
  if (!password) {
    return NextResponse.rewrite(new URL("/admin/setup", req.url));
  }

  const expected = await sessionToken(password);
  if (req.cookies.get(ADMIN_COOKIE)?.value === expected) {
    return NextResponse.next();
  }

  const login = new URL("/admin/login", req.url);
  login.searchParams.set("from", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*"],
};
