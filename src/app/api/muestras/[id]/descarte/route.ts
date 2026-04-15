import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Next.js 15: params es una Promesa
) {
  try {
    const { id } = await params; // Resolvemos la promesa

    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const { metodo_disposicion, observaciones } = body;

    // Buscamos el estado con el nombre EXACTO del seeder
    const estadoFinal = await prisma.estadoMuestra.findFirst({
      where: { nombre: "Destruida / Segregada" }
    });

    if (!estadoFinal) {
      return NextResponse.json({ error: "Estado 'Destruida / Segregada' no encontrado en BD" }, { status: 500 });
    }

    const muestraActual = await prisma.muestraFarmaceutica.findUnique({ where: { id } });
    if (!muestraActual) return NextResponse.json({ error: "Muestra no encontrada" }, { status: 404 });

    const resultado = await prisma.$transaction(async (tx) => {
      const reporte = await tx.reporteDescarte.create({
        data: {
          muestra_id: id,
          metodo_disposicion,
          observaciones: observaciones || "Protocolo Decreto 2.218",
          autorizado_por: token.id as string,
          ejecutado_por: token.id as string,
        }
      });

      const actualizada = await tx.muestraFarmaceutica.update({
        where: { id },
        data: { estado_id: estadoFinal.id }
      });

      await tx.historialTrazabilidad.create({
        data: {
          muestra_id: id,
          estado_anterior_id: muestraActual.estado_id,
          estado_nuevo_id: estadoFinal.id,
          motivo: `DESCARTE FINALIZADO: ${metodo_disposicion}`,
          cambiado_por: token.id as string,
        }
      });

      return { reporte, actualizada };
    });

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}