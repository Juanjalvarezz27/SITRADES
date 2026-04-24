import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
export const dynamic = 'force-dynamic';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // <-- Tipamos params como Promesa
) {
  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.id) {
      return NextResponse.json({ error: "No autorizado. Inicie sesión." }, { status: 401 });
    }

    // ✨ CORRECCIÓN: Desenvolvemos la promesa de los params antes de usar el id
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const body = await request.json();
    const { informe, observaciones } = body;

    if (!informe) {
      return NextResponse.json({ error: "El número de informe es obligatorio." }, { status: 400 });
    }

    // 1. Verificamos que la muestra exista y sea del tipo ANALISIS
    const muestraActual = await prisma.muestraFarmaceutica.findUnique({
      where: { id },
      include: { estado: true }
    });

    if (!muestraActual) {
      return NextResponse.json({ error: "Muestra no encontrada." }, { status: 404 });
    }

    if (muestraActual.tipo_muestra !== "ANALISIS") {
      return NextResponse.json({ error: "Esta acción solo es válida para Muestras Operativas (Análisis)." }, { status: 400 });
    }

    // 2. Buscamos el estado destino que la enviará a la Cola de Descarte
    const estadoDestino = await prisma.estadoMuestra.findFirst({
      where: { nombre: "Retención Cumplida (Descartable)" }
    });

    if (!estadoDestino) {
      return NextResponse.json({ error: "Falla de configuración: Estado destino no encontrado en la base de datos." }, { status: 500 });
    }

    // 3. Ejecutamos la actualización y el historial en una transacción segura
    const resultado = await prisma.$transaction(async (tx) => {
      // Actualizar la muestra
      const muestraActualizada = await tx.muestraFarmaceutica.update({
        where: { id },
        data: { estado_id: estadoDestino.id }
      });

      // Construir el texto del motivo para la auditoría
      let motivoAuditoria = `Análisis finalizado y aprobado bajo el N° de Informe/Certificado: ${informe}. La muestra es liberada manualmente para su descarte físico inmediato.`;
      if (observaciones && observaciones.trim() !== "") {
        motivoAuditoria += ` Observaciones adicionales: ${observaciones}`;
      }

      // Registrar en el historial de trazabilidad
      await tx.historialTrazabilidad.create({
        data: {
          muestra_id: id,
          estado_anterior_id: muestraActual.estado_id,
          estado_nuevo_id: estadoDestino.id,
          motivo: motivoAuditoria,
          cambiado_por: token.id as string,
        }
      });

      return muestraActualizada;
    });

    return NextResponse.json({ message: "Muestra liberada con éxito", data: resultado }, { status: 200 });

  } catch (error: any) {
    console.error("Error al liberar la muestra operativa:", error);
    return NextResponse.json({ error: "Error interno al procesar la liberación operativa." }, { status: 500 });
  }
}