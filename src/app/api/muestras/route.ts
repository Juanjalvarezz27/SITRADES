import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
export const dynamic = 'force-dynamic';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 1. GET: Obtener muestras separadas por Fases (Activa, Descarte, Inactiva)
export async function GET(request: Request) {
  try {
    // Leemos el parámetro de fase desde la URL (por defecto será 'activa')
    const { searchParams } = new URL(request.url);
    const fase = searchParams.get("fase") || "activa"; 
    const hoy = new Date();

    // Construimos las reglas de filtrado de forma dinámica
    let whereClause: any = {};

    if (fase === "activa") {
      // FASE 1: Inventario Activo (Vigentes y Vencidas en custodia)
      // Condición: La fecha de retención AÚN NO se ha cumplido y NO está destruida
      whereClause = {
        fecha_fin_retencion: { gt: hoy },
        estado: { nombre: { not: "Destruida / Segregada" } }
      };
    } else if (fase === "descarte") {
      // FASE 2: Cola de Logística Inversa (Retención Cumplida)
      // Condición: La fecha de retención YA SE CUMPLIÓ, pero NO ha sido destruida
      whereClause = {
        fecha_fin_retencion: { lte: hoy },
        estado: { nombre: { not: "Destruida / Segregada" } }
      };
    } else if (fase === "inactiva") {
      // FASE 3: Archivo Histórico
      // Condición: Ya completaron el protocolo y se firmó su destrucción
      whereClause = {
        estado: { nombre: "Destruida / Segregada" }
      };
    }

    // Ejecutamos la consulta limpia
const muestras = await prisma.muestraFarmaceutica.findMany({
      where: whereClause,
      include: {
        area: {
          include: { direccion: { include: { piso: true } } }
        },
        estado: true,
        usuarioRegistrador: {
          select: { nombre: true, rol: true }
        },
        reporte_descarte: {
          include: {
            ejecutor: {
              select: { nombre: true }
            }
          }
        }
      },
      orderBy: { creado_en: "desc" }
    });

    return NextResponse.json(muestras);
  } catch (error) {
    console.error("Error al obtener el inventario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// 2. POST: Registrar una nueva muestra
export async function POST(request: Request) {
  try {
    // Extraemos la sesión del usuario para auditoría
    const token = await getToken({ 
      req: request as any, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.id) {
      return NextResponse.json({ error: "No autorizado. Inicie sesión." }, { status: 401 });
    }

    const body = await request.json();

    // Buscamos el estado inicial en la BD
    const estadoInicial = await prisma.estadoMuestra.findFirst({
      where: { nombre: "Recibida (Pendiente de Análisis)" }
    });

    if (!estadoInicial) throw new Error("No existe el estado inicial en la BD.");

    // Guardamos la muestra inyectando el ID del usuario
    const nuevaMuestra = await prisma.muestraFarmaceutica.create({
      data: {
        codigo_interno: body.codigo_interno,
        lote: body.lote,
        registro_sanitario: body.registro_sanitario,
        principio_activo: body.principio_activo,
        tipo_empaque: body.tipo_empaque,
        riesgo_bioseguridad: body.riesgo_bioseguridad,
        cantidad: Number(body.cantidad),
        unidad_medida: body.unidad_medida,
        proposito_analisis: body.proposito_analisis,
        fecha_caducidad: new Date(body.fecha_caducidad),
        fecha_fin_retencion: new Date(body.fecha_fin_retencion),
        area_id: Number(body.area_id),
        ubicacion_detalle: body.ubicacion_detalle,
        estado_id: estadoInicial.id,
        registrado_por: token.id as string, 
      },
    });

    // Guardamos el primer paso en el historial
    await prisma.historialTrazabilidad.create({
      data: {
        muestra_id: nuevaMuestra.id,
        estado_anterior_id: estadoInicial.id,
        estado_nuevo_id: estadoInicial.id,
        motivo: "Ingreso inicial de la muestra al sistema y asignación a área de almacenamiento.",
        cambiado_por: token.id as string, 
      }
    });

    return NextResponse.json(nuevaMuestra, { status: 201 });

  } catch (error: any) {
    console.error("Error al registrar muestra:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}