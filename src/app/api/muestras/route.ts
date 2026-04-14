import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 1. GET: Obtener todas las muestras (Inventario) y Auto-Actualizar Estados
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    const estadoVencida = await prisma.estadoMuestra.upsert({
      where: { nombre: "Vencida (En Custodia Legal)" },
      update: {},
      create: { nombre: "Vencida (En Custodia Legal)" }
    });
    
    const estadoDescartable = await prisma.estadoMuestra.upsert({
      where: { nombre: "Retención Cumplida (Descartable)" },
      update: {},
      create: { nombre: "Retención Cumplida (Descartable)" }
    });

    const whereClause: any = {};
    if (q) {
      whereClause.OR = [
        { codigo_interno: { contains: q, mode: 'insensitive' } },
        { principio_activo: { contains: q, mode: 'insensitive' } },
        { lote: { contains: q, mode: 'insensitive' } },
      ];
    }

    const muestras = await prisma.muestraFarmaceutica.findMany({
      where: whereClause,
      include: {
        estado: true,
        area: { include: { direccion: { include: { piso: true } } } },
        usuarioRegistrador: { select: { nombre: true, email: true } }
      },
      orderBy: { creado_en: 'desc' }
    });

    const hoy = new Date();
    const tiempoBase = new Date(); 
    const promesasActualizacion = [];

    for (const m of muestras) {
      const fechaCaducidad = new Date(m.fecha_caducidad);
      const fechaRetencion = new Date(m.fecha_fin_retencion);
      
      let estadoActualId = m.estado_id;
      const transaccionesPrisma = [];

      // A. Salto a Vencida
      if (hoy >= fechaCaducidad && estadoActualId !== estadoVencida.id && estadoActualId !== estadoDescartable.id) {
        transaccionesPrisma.push(
          prisma.historialTrazabilidad.create({
            data: {
              muestra: { connect: { id: m.id } },
              estado_anterior: { connect: { id: estadoActualId } },
              estado_nuevo: { connect: { id: estadoVencida.id } },
              motivo: "Actualización automática: La muestra alcanzó su fecha de caducidad y entra en custodia legal.",
              fecha_cambio: new Date(tiempoBase.getTime() + 1000) 
            }
          })
        );
        estadoActualId = estadoVencida.id; 
      }

      // B. Salto a Descartable
      if (hoy >= fechaRetencion && estadoActualId !== estadoDescartable.id) {
        transaccionesPrisma.push(
          prisma.historialTrazabilidad.create({
            data: {
              muestra: { connect: { id: m.id } },
              estado_anterior: { connect: { id: estadoActualId } },
              estado_nuevo: { connect: { id: estadoDescartable.id } },
              motivo: "Actualización automática: La muestra cumplió el año de retención y pasa a estatus descartable.",
              fecha_cambio: new Date(tiempoBase.getTime() + 2000) 
            }
          })
        );
        estadoActualId = estadoDescartable.id;
      }

      if (transaccionesPrisma.length > 0) {
        transaccionesPrisma.push(
          prisma.muestraFarmaceutica.update({
            where: { id: m.id },
            data: { estado: { connect: { id: estadoActualId } } }
          })
        );
        
        promesasActualizacion.push(prisma.$transaction(transaccionesPrisma));
        
        m.estado_id = estadoActualId;
        m.estado = estadoActualId === estadoDescartable.id ? estadoDescartable : estadoVencida;
      }
    }

    if (promesasActualizacion.length > 0) {
      await Promise.all(promesasActualizacion);
    }

    return NextResponse.json(muestras);
  } catch (error) {
    console.error("Error al obtener muestras:", error);
    return NextResponse.json({ error: "Error al obtener las muestras" }, { status: 500 });
  }
}

// 2. POST: Registrar una nueva muestra
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const { 
      codigo_interno, lote, registro_sanitario, principio_activo,
      tipo_empaque, riesgo_bioseguridad, cantidad, unidad_medida,
      proposito_analisis, fecha_caducidad, fecha_fin_retencion, area_id,
      ubicacion_detalle
    } = data;

    // --- VALIDACIONES ESTRICTAS ANTI-NaN ---
    if (!codigo_interno || !lote || !fecha_caducidad || !area_id) {
      return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
    }

    const parsedAreaId = parseInt(area_id, 10);
    if (isNaN(parsedAreaId)) {
      return NextResponse.json({ error: "El Área seleccionada no es válida." }, { status: 400 });
    }

    const parsedCantidad = parseInt(cantidad, 10);
    if (isNaN(parsedCantidad) || parsedCantidad <= 0) {
      return NextResponse.json({ error: "La cantidad debe ser un número mayor a cero." }, { status: 400 });
    }

    const dateCaducidad = new Date(`${fecha_caducidad}T00:00:00Z`);
    const dateFinRetencion = new Date(`${fecha_fin_retencion}T00:00:00Z`);

    let estadoInicial = await prisma.estadoMuestra.findFirst({
      where: { nombre: "Recibida (Pendiente de Análisis)" }
    });

    if (!estadoInicial) {
      estadoInicial = await prisma.estadoMuestra.create({
        data: { nombre: "Recibida (Pendiente de Análisis)" }
      });
    }

    let usuarioAdmin = await prisma.usuario.findFirst({
      where: { rol: { nombre: "Administrador" } }
    });

    if (!usuarioAdmin) {
       return NextResponse.json({ error: "No hay un usuario Administrador registrado en el sistema." }, { status: 400 });
    }

    // --- TRANSACCIÓN CON SINTAXIS SEGURA (connect) ---
    const nuevaMuestra = await prisma.$transaction(async (tx) => {
      const muestra = await tx.muestraFarmaceutica.create({
        data: {
          codigo_interno,
          lote,
          registro_sanitario,
          principio_activo,
          tipo_empaque,
          riesgo_bioseguridad,
          cantidad: parsedCantidad,
          unidad_medida,
          proposito_analisis,
          fecha_caducidad: dateCaducidad,
          fecha_fin_retencion: dateFinRetencion,
          ubicacion_detalle: ubicacion_detalle || null,
          // Conectamos las relaciones de forma explícita
          estado: { connect: { id: estadoInicial.id } },
          area: { connect: { id: parsedAreaId } },
          usuarioRegistrador: { connect: { id: usuarioAdmin.id } }
        }
      });

      await tx.historialTrazabilidad.create({
        data: {
          muestra: { connect: { id: muestra.id } },
          estado_anterior: { connect: { id: estadoInicial.id } },
          estado_nuevo: { connect: { id: estadoInicial.id } },
          usuario: { connect: { id: usuarioAdmin.id } },
          motivo: "Ingreso inicial de la muestra al sistema y asignación a área de almacenamiento."
        }
      });

      return muestra;
    });

    return NextResponse.json(nuevaMuestra, { status: 201 });

  } catch (error: any) {
    console.error("Error al registrar muestra:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "El Código Interno ingresado ya existe en el sistema." }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno del servidor al procesar la solicitud." }, { status: 500 });
  }
}