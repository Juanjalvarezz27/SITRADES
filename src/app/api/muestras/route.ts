import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 1. GET: Obtener todas las muestras (Inventario) y Auto-Actualizar Estados
export async function GET(request: Request) {
  try {
    // 1. Leemos los parámetros de la URL
    const { searchParams } = new URL(request.url);
    const vista = searchParams.get("vista") || "activa"; 

    // 2. Construimos las reglas de filtrado según la vista
    let whereClause = {};

    if (vista === "activa") {
      whereClause = {
        inhabilitado: false, // Solo las que NO tienen error
        estado: {
          nombre: { not: "Destruida / Segregada" } // Y que NO estén incineradas
        }
      };
    } else if (vista === "inactiva") {
      whereClause = {
        OR: [
          { inhabilitado: true }, // Las anuladas por error
          { estado: { nombre: "Destruida / Segregada" } } // O las destruidas legalmente
        ]
      };
    }

    // 3. Ejecutamos la consulta con Prisma
    const muestras = await prisma.muestraFarmaceutica.findMany({
      where: whereClause,
      include: {
        area: {
          include: { direccion: { include: { piso: true } } }
        },
        estado: true,
        usuarioRegistrador: {
          select: { nombre: true, rol: true } // Traemos quién la registró
        },
        usuarioInhabilitador: {
          select: { nombre: true, rol: true } // Traemos quién lo inhabilito
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
    // 1. Extraemos la sesión del usuario que está haciendo la petición
    const token = await getToken({ 
      req: request as any, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.id) {
      return NextResponse.json({ error: "No autorizado. Inicie sesión." }, { status: 401 });
    }

    // Obtenemos los datos del formulario
    const body = await request.json();

    // Buscamos el estado inicial (ej. "Recibida (Pendiente de Análisis)")
    const estadoInicial = await prisma.estadoMuestra.findFirst({
      where: { nombre: "Recibida (Pendiente de Análisis)" }
    });

    if (!estadoInicial) throw new Error("No existe el estado inicial en la BD.");

    // 2. Guardamos la muestra inyectando el ID del usuario de forma invisible
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
        
        // AQUÍ ESTÁ EL SECRETO: Le pasamos el ID del token directamente
        registrado_por: token.id as string, 
      },
    });

    // 3. Ya que estamos aquí, también guardamos quién creó el PRIMER paso del historial
    await prisma.historialTrazabilidad.create({
      data: {
        muestra_id: nuevaMuestra.id,
        estado_anterior_id: estadoInicial.id,
        estado_nuevo_id: estadoInicial.id,
        motivo: "Ingreso inicial de la muestra al sistema y asignación a área de almacenamiento.",
        
        // También registramos quién hizo el cambio en el historial
        cambiado_por: token.id as string, 
      }
    });

    return NextResponse.json(nuevaMuestra, { status: 201 });

  } catch (error: any) {
    console.error("Error al registrar muestra:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}