import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    
    // Solo Administradores y Seguridad Industrial deberían sacar reportes masivos
    if (!token || !token.id || (token.rol !== "Administrador" && token.rol !== "Seguridad Industrial")) {
      return NextResponse.json({ error: "No autorizado para generar reportes." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    
    // Extraer parámetros
    const busqueda = searchParams.get("busqueda") || "";
    const area = searchParams.get("area") || "TODOS";
    const usuario = searchParams.get("usuario") || "TODOS";
    const estado = searchParams.get("estado") || "TODOS";
    const fechaInicio = searchParams.get("fechaInicio");
    const fechaFin = searchParams.get("fechaFin");

    // Construir la consulta dinámica (Query Builder)
    let whereClause: any = {};

    // 1. Filtro de Búsqueda de Texto (Código, Lote, Producto)
    if (busqueda) {
      whereClause.OR = [
        { codigo_interno: { contains: busqueda, mode: "insensitive" } },
        { lote: { contains: busqueda, mode: "insensitive" } },
        { principio_activo: { contains: busqueda, mode: "insensitive" } }
      ];
    }

    // 2. Filtro de Área
    if (area !== "TODOS") {
      whereClause.area = { nombre: area };
    }

    // 3. Filtro de Usuario Registrador
    if (usuario !== "TODOS") {
      whereClause.usuarioRegistrador = { nombre: usuario };
    }

    // 4. Filtro de Fechas (Rango de Creación / Ingreso)
    if (fechaInicio || fechaFin) {
      whereClause.creado_en = {};
      if (fechaInicio) whereClause.creado_en.gte = new Date(`${fechaInicio}T00:00:00.000Z`);
      if (fechaFin) whereClause.creado_en.lte = new Date(`${fechaFin}T23:59:59.999Z`);
    }

    // 5. Filtro de Estado Legal
    const hoy = new Date();
    if (estado === "ACTIVA") {
      whereClause.estado = { nombre: { notIn: ["Destruida / Segregada", "Anulada (Error de Registro)"] } };
    } else if (estado === "DESCARTADA") {
      whereClause.estado = { nombre: "Destruida / Segregada" };
    } else if (estado === "ANULADA") {
      whereClause.estado = { nombre: "Anulada (Error de Registro)" };
    }

    // Ejecutar consulta con todas las relaciones necesarias para el reporte
    const reportes = await prisma.muestraFarmaceutica.findMany({
      where: whereClause,
      include: {
        area: { include: { direccion: { include: { piso: true } } } },
        estado: true,
        tipo_empaque: true,
        unidad_medida: true,
        usuarioRegistrador: { select: { nombre: true, rol: true } },
        reporte_descarte: {
          include: {
            ejecutor: { select: { nombre: true } },
            metodo_disposicion: true
          }
        }
      },
      orderBy: { creado_en: "desc" }
    });

    return NextResponse.json(reportes);

  } catch (error) {
    console.error("Error al generar reporte:", error);
    return NextResponse.json({ error: "Error interno al procesar el reporte." }, { status: 500 });
  }
}