import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
export const dynamic = 'force-dynamic';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 1. GET: Obtener muestras separadas por Fases
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fase = searchParams.get("fase") || "activa";
    const hoy = new Date();

    let whereClause: any = {};

    if (fase === "activa") {
      whereClause = {
        estado: {
          nombre: {
            notIn: [
              "Destruida / Segregada", 
              "Anulada (Error de Registro)", 
              "Esperando Recolección (Bolsa Roja)",
              "Retención Cumplida (Descartable)" // Ocultamos si ya pasó a descarte
            ]
          }
        },
        OR: [
          // Camino B: Contramuestras que aún no vencen su retención
          { tipo_muestra: "CONTRAMUESTRA", fecha_fin_retencion: { gt: hoy } },
          // Camino A: Muestras Operativas que siguen en análisis
          { tipo_muestra: "ANALISIS" } 
        ]
      };
    } else if (fase === "descarte") {
      whereClause = {
        estado: {
          nombre: {
            notIn: ["Destruida / Segregada", "Anulada (Error de Registro)", "Esperando Recolección (Bolsa Roja)"]
          }
        },
        OR: [
          // Camino B: Contramuestras que ya cumplieron el tiempo legal
          { tipo_muestra: "CONTRAMUESTRA", fecha_fin_retencion: { lte: hoy } },
          // Camino A: Operativas que fueron soltadas manualmente por el analista (pasaron a este estado)
          { tipo_muestra: "ANALISIS", estado: { nombre: "Retención Cumplida (Descartable)" } }
        ]
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
        historiales: {
          include: { usuario: { select: { nombre: true } } },
          orderBy: { fecha_cambio: 'desc' }
        },
        reporte_descarte: {
          include: {
            ejecutor: { select: { nombre: true } },
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
    const tipoMuestra = body.tipo_muestra || "CONTRAMUESTRA";

    // 1. VALIDACIÓN DE INFRAESTRUCTURA ACTIVA
    const areaValidacion = await prisma.area.findUnique({
      where: { id: areaId },
      include: { direccion: { include: { piso: true } } }
    });

    if (!areaValidacion) return NextResponse.json({ error: "El área seleccionada no existe." }, { status: 404 });

    if (
      areaValidacion.activo === false ||
      areaValidacion.direccion.activo === false ||
      areaValidacion.direccion.piso.activo === false
    ) {
      return NextResponse.json({
        error: "No se puede registrar la muestra: La ubicación se encuentra inhabilitada actualmente."
      }, { status: 403 });
    }

    // OBTENER TODOS LOS ESTADOS NECESARIOS PARA EL FLUJO
    const [estadoRecibida, estadoEnAnalisis, estadoVencida, estadoRetencion] = await Promise.all([
      prisma.estadoMuestra.findFirst({ where: { nombre: "Recibida (Pendiente de Análisis)" } }),
      prisma.estadoMuestra.findFirst({ where: { nombre: "En Análisis" } }), // <-- Nuevo Estado para Camino A
      prisma.estadoMuestra.findFirst({ where: { nombre: "Vencida (En Custodia Legal)" } }),
      prisma.estadoMuestra.findFirst({ where: { nombre: "Retención Cumplida (Descartable)" } })
    ]);

    if (!estadoRecibida || !estadoEnAnalisis || !estadoVencida || !estadoRetencion) {
      throw new Error("Faltan estados base en la BD. Asegúrese de tener los estados 'Recibida (Pendiente de Análisis)' y 'En Análisis'.");
    }

    // Determinamos el estado inicial según el propósito (Camino A vs Camino B)
    const estadoInicial = tipoMuestra === "ANALISIS" ? estadoEnAnalisis : estadoRecibida;

    // PASO 1: CREACIÓN INICIAL
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
        tipo_muestra: tipoMuestra as any,
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
        motivo: tipoMuestra === "ANALISIS" 
          ? "Ingreso de Muestra Operativa directamente a estado de Análisis." 
          : "Ingreso inicial de Contramuestra al sistema y asignación a área de almacenamiento.",
        cambiado_por: token.id as string,
      }
    });

    const hoy = new Date();
    let estadoActualId = estadoInicial.id;

    // PASO 2: LOGICA DE AUTOMATIZACIÓN (SÓLO PARA CONTRAMUESTRAS)
    // Las operativas (ANALISIS) se saltan todo esto porque no tienen retención y su estado depende del usuario.
    if (tipoMuestra === "CONTRAMUESTRA") {
      if (new Date(body.fecha_caducidad) <= hoy) {
        await prisma.muestraFarmaceutica.update({
          where: { id: nuevaMuestra.id },
          data: { estado_id: estadoVencida.id }
        });

        await prisma.historialTrazabilidad.create({
          data: {
            muestra_id: nuevaMuestra.id,
            estado_anterior_id: estadoActualId,
            estado_nuevo_id: estadoVencida.id,
            motivo: "Actualización automática: La fecha de caducidad del producto ha expirado. Pasa a custodia.",
            cambiado_por: token.id as string,
          }
        });
        estadoActualId = estadoVencida.id; 
      }

      if (new Date(body.fecha_fin_retencion) <= hoy) {
        await prisma.muestraFarmaceutica.update({
          where: { id: nuevaMuestra.id },
          data: { estado_id: estadoRetencion.id }
        });

        await prisma.historialTrazabilidad.create({
          data: {
            muestra_id: nuevaMuestra.id,
            estado_anterior_id: estadoActualId,
            estado_nuevo_id: estadoRetencion.id,
            motivo: "Actualización automática: El periodo de retención legal ha concluido. Apta para descarte.",
            cambiado_por: token.id as string,
          }
        });
      }
    }

    return NextResponse.json(nuevaMuestra, { status: 201 });

  } catch (error: any) {
    console.error("Error al registrar muestra:", error);

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