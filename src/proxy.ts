import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";
import { headers } from "next/headers";

const AUTH_ROUTES = ["/auth/login", "/auth/sign-up"];
const PROTECTED_ROUTES = ["/kanban-dashboard"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAuthenticated = !!session;
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/kanban-dashboard", request.url));
  }

  // No autenticado intentando acceder a ruta protegida → al login
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/kanban-dashboard/:path*", "/auth/:path*"],
};
