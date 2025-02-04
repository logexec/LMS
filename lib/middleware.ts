// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { sidenavLinks } from "@/utils/constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas/ignoradas
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("jwt-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.APP_KEY || "default-secret-key")
    );

    const userPermissions = payload.permissions as string[];
    const hasPermission = checkPathPermissions(pathname, userPermissions);

    if (!hasPermission) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

function checkPathPermissions(
  pathname: string,
  permissions: string[]
): boolean {
  const route = sidenavLinks
    .flatMap((category) => category.links)
    .find((link) => link.url === pathname);

  return route
    ? !route.requiredPermissions?.length ||
        route.requiredPermissions.some((p) => permissions.includes(p))
    : false;
}
