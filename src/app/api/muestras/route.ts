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
    const { searchParams } = new URL(request.url);
    const fase = searchParams.get("fase") || "activa";
    const hoy = new Date();

    let whereClause: any = {};

    if (fase === "activa") {
      whereClause = {
        fecha_fin_retencion: { gt: hoy },
        estado: { 
          nombre: { 
            // Ocultamos también las que ya están en bolsa roja
            notIn: ["Destruida / Segregada", "Anulada (Error de Registro)", "Esperando Recolección (Bolsa Roja)"] 
          } 
        }
      };
    } else if (fase === "descarte") {
      whereClause = {
        fecha_fin_retencion: { lte: hoy },
        estado: { 
          nombre: { 
            //  Ocultamos las que Seguridad Industrial ya tiene pendientes
            notIn: ["Destruida / Segregada", "Anulada (Error de Registro)", "Esperando Recolección (Bolsa Roja)"] 
          } 
        }
      };
    } else if (fase === "inactiva") {
      whereClause = {
        estado: { 
          nombre: { 
            in: ["Destruida / Segregada", "Anulada (Error de Registro)"] 
          } 
        }
      };
    }

    // Actualizamos el Include para traer la información completa
    const muestras = await prisma.muestraFarmaceutica.findMany({
      where: whereClause,
      include: {
        area: {
          include: { direccion: { include: { piso: true } } }
        },
        estado: true,
        tipo_empaque: true,
        unidad_medida: true,
        usuarioRegistrador: {
          select: { nombre: true, rol: true }
        },
        // Los historiales cuelgan de la Muestra, no del Reporte
        historiales: {
          include: { usuario: { select: { nombre: true } } },
          orderBy: { fecha_cambio: 'desc' }
        },
        reporte_descarte: {
          include: {
            ejecutor: {
              select: { nombre: true }
            },
            metodo_disposicion: true
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
  let body: any;

  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.id) {
      return NextResponse.json({ error: "No autorizado. Inicie sesión." }, { status: 401 });
    }

    body = await request.json();
    const areaId = Number(body.area_id);

    // 1. VALIDACIÓN DE INFRAESTRUCTURA ACTIVA (Bloqueo por Herencia)
    const areaValidacion = await prisma.area.findUnique({
      where: { id: areaId },
      include: {
        direccion: {
          include: { piso: true }
        }
      }
    });

    if (!areaValidacion) {
      return NextResponse.json({ error: "El área seleccionada no existe." }, { status: 404 });
    }

    // Si el área, su dirección o su piso están inhabilitados, bloqueamos
    if (
      areaValidacion.activo === false ||
      areaValidacion.direccion.activo === false ||
      areaValidacion.direccion.piso.activo === false
    ) {
      return NextResponse.json({
        error: "No se puede registrar la muestra: La ubicación (Piso, Dirección o Área) se encuentra inhabilitada actualmente."
      }, { status: 403 });
    }

    const estadoInicial = await prisma.estadoMuestra.findFirst({
      where: { nombre: "Recibida (Pendiente de Análisis)" }
    });

    if (!estadoInicial) throw new Error("No existe el estado inicial en la BD.");

    const nuevaMuestra = await prisma.muestraFarmaceutica.create({
      data: {
        codigo_interno: body.codigo_interno,
        lote: body.lote,
        registro_sanitario: body.registro_sanitario,
        principio_activo: body.principio_activo,
        tipo_empaque_id: Number(body.tipo_empaque_id),
        unidad_medida_id: Number(body.unidad_medida_id),
        riesgo_bioseguridad: body.riesgo_bioseguridad,
        cantidad: Number(body.cantidad),
        proposito_analisis: body.proposito_analisis,
        fecha_caducidad: new Date(body.fecha_caducidad),
        fecha_fin_retencion: new Date(body.fecha_fin_retencion),
        area_id: areaId,
        ubicacion_detalle: body.ubicacion_detalle,
        estado_id: estadoInicial.id,
        registrado_por: token.id as string,
      },
    });

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

    // MANEJO DE ERRORES DE PRISMA (Duplicidad de Código Interno)
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target && target.includes('codigo_interno')) {
        return NextResponse.json(
          { error: `El Código Interno "${body?.codigo_interno || 'ingresado'}" ya existe en el sistema. Verifique y use uno distinto.` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}