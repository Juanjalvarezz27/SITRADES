import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function PATCH(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const { muestraIds, confirmacionEmpaque } = body;

    if (!muestraIds || muestraIds.length === 0) {
      return NextResponse.json({ error: "No se seleccionaron bolsas para recoger" }, { status: 400 });
    }

    // 1. Ubicar los estados involucrados
    const estadoRecoleccion = await prisma.estadoMuestra.findFirst({
      where: { nombre: "Esperando Recolección (Bolsa Roja)" }
    });

    const estadoDestruida = await prisma.estadoMuestra.findFirst({
      where: { nombre: "Destruida / Segregada" }
    });

    if (!estadoRecoleccion || !estadoDestruida) {
      return NextResponse.json({ error: "Estados no encontrados en BD." }, { status: 500 });
    }

    // 2. Preparamos la data para el Historial (Huella de Auditoría)
    // Usamos map porque Iván podría recoger varias bolsas de un solo viaje
    const historialesData = muestraIds.map((id: string) => ({
      muestra_id: id,
      estado_anterior_id: estadoRecoleccion.id,
      estado_nuevo_id: estadoDestruida.id,
      motivo: `Recolección confirmada por Seguridad Industrial. Integridad del empaque verificada: ${confirmacionEmpaque ? 'Conforme' : 'No Conforme'}. Disposición final ejecutada.`,
      cambiado_por: token.id as string
    }));

    // 3. Ejecutamos los cambios en bloque (Transacción)
    await prisma.$transaction([
      // Cambiar estado de las muestras
      prisma.muestraFarmaceutica.updateMany({
        where: { id: { in: muestraIds } },
        data: { estado_id: estadoDestruida.id }
      }),
      
      // Guardar el evento en el historial de trazabilidad
      prisma.historialTrazabilidad.createMany({
        data: historialesData
      })
    ]);

    return NextResponse.json({ success: true, procesadas: muestraIds.length });

  } catch (error: any) {
    console.error("ERROR FATAL AL CONFIRMAR RECOLECCIÓN:", error);
    return NextResponse.json({
      error: error.message || "Error interno al procesar la recolección"
    }, { status: 500 });
  }
}