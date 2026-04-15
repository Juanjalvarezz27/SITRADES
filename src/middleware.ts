import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// 1. Permisos para FRONTEND (Vistas)
const frontendPermissions: Record<string, string[]> = {
  "/home/infraestructura": ["Administrador"],
  "/home/personal": ["Administrador"],
  "/home/alertas": ["Administrador", "Seguridad Industrial"],
  "/home/muestras": ["Administrador", "Analista de Laboratorio"],
  "/home": ["Administrador", "Analista de Laboratorio", "Seguridad Industrial"],
};

// 2. Permisos para BACKEND (API Endpoints)
const apiPermissions: Record<string, string[]> = {
  "/api/usuarios": ["Administrador"],
  "/api/areas": ["Administrador"],
  "/api/pisos": ["Administrador"],
  "/api/direcciones": ["Administrador"],
  "/api/muestras": ["Administrador", "Analista de Laboratorio"],
};

// 3. Rutas públicas
const publicRoutes = ["/", "/manual"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado. Debes iniciar sesión." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  const userRole = token.rol as string;

  // D. PROTECCIÓN DE ENDPOINTS (API) -> Retornan JSON (403 Forbidden)
  if (pathname.startsWith("/api/")) {
    
    // EXCEPCIÓN: Los Analistas necesitan hacer GET a infraestructura para registrar muestras
    if ((pathname.startsWith("/api/areas") || pathname.startsWith("/api/pisos") || pathname.startsWith("/api/direcciones")) && method === "GET") {
      return NextResponse.next();
    }

    const sortedApiRoutes = Object.entries(apiPermissions).sort(
      ([routeA], [routeB]) => routeB.length - routeA.length
    );

    for (const [route, allowedRoles] of sortedApiRoutes) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.json(
            { error: "Acceso denegado. No tienes el rol necesario para esta acción." }, 
            { status: 403 }
          );
        }
        break;
      }
    }
    return NextResponse.next(); 
  }

  // E. PROTECCIÓN DE VISTAS (FRONTEND) -> Retornan Redirect
  let hasAccess = false;
  let routeRequiresProtection = false;

  const sortedFrontendRoutes = Object.entries(frontendPermissions).sort(
    ([routeA], [routeB]) => routeB.length - routeA.length
  );

  for (const [route, allowedRoles] of sortedFrontendRoutes) {
    if (pathname.startsWith(route)) {
      routeRequiresProtection = true;
      if (allowedRoles.includes(userRole)) {
        hasAccess = true;
      }
      break;
    }
  }

  if (routeRequiresProtection && !hasAccess) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

// 4. Matcher Explícito y Seguro
export const config = {
  matcher: [
    "/home/:path*",
    "/api/usuarios/:path*",
    "/api/areas/:path*",
    "/api/pisos/:path*",
    "/api/direcciones/:path*",
    "/api/muestras/:path*"
  ],
};