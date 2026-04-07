import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// 1. Diccionario de Permisos
const routePermissions: Record<string, string[]> = {
  "/home/infraestructura": ["Administrador"], 
  "/home/personal": ["Administrador"],
  "/home/alertas": ["Administrador", "Seguridad Industrial"],
  "/home/muestras": ["Administrador", "Analista de Laboratorio"],
  "/home": ["Administrador", "Analista de Laboratorio", "Seguridad Industrial"],
};

// 2. Rutas públicas
const publicRoutes = ["/", "/manual"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // A. Permitir paso inmediato a rutas públicas
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // B. Extraer el token JWT de NextAuth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // C. Si no hay sesión, rebotar obligatoriamente al Login
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // D. Verificación Estricta de Roles
  const userRole = token.rol as string;
  let hasAccess = false;
  let routeRequiresProtection = false;

  // Ordenamos las rutas de la más larga a la más corta para evitar colisiones (ej: /home/personal vs /home)
  const sortedRoutes = Object.entries(routePermissions).sort(
    ([routeA], [routeB]) => routeB.length - routeA.length
  );

  for (const [route, allowedRoles] of sortedRoutes) {
    if (pathname.startsWith(route)) {
      routeRequiresProtection = true;
      
      if (allowedRoles.includes(userRole)) {
        hasAccess = true;
      }
      break; 
    }
  }

  // Si la ruta exige un rol específico y el usuario no lo tiene, lo devolvemos a su inicio seguro
  if (routeRequiresProtection && !hasAccess) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // E. Acceso concedido
  return NextResponse.next();
}

// 3. Matcher Optimizado para rendimiento
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};