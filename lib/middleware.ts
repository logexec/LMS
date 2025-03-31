import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
    headers: { Cookie: request.headers.get("cookie") || "" },
    credentials: "include",
  });

  if (!response.ok) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
