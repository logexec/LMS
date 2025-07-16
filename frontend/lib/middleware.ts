import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Sanctum uses the `laravel_session` cookie by default
  const hasSession = !!request.cookies.get('laravel_session');
  if (!hasSession && request.nextUrl.pathname.startsWith('/app')) {
    // redirect protected paths back to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}