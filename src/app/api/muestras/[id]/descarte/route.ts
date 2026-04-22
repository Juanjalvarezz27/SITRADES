import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const { metodo_disposicion_id, observaciones } = body;

    if (!metodo_disposicion_id) {
      return NextResponse.json({ error: "No se recibió el método de disposición" }, { status: 400 });
    }

    // Buscamos el único estado intermedio
    const estadoRecoleccion = await prisma.estadoMuestra.findFirst({
      where: { nombre: "Esperando Recolección (Bolsa Roja)" }
    });

    if (!estadoRecoleccion) {
      return NextResponse.json({ error: "Estado de recolección no encontrado en BD. Corre el seed." }, { status: 400 });
    }

    const muestra = await prisma.muestraFarmaceutica.findUnique({
      where: { id: id },
      select: { estado_id: true }
    });

    if (!muestra) {
      return NextResponse.json({ error: "Muestra no encontrada" }, { status: 404 });
    }

    // TRANSACCIÓN ATÓMICA
await prisma.$transaction([
      prisma.muestraFarmaceutica.update({
        where: { id: id },
        data: { estado_id: estadoRecoleccion.id } // Asignamos el estado intermedio
      }),

      // Cambiamos create por upsert
      prisma.reporteDescarte.upsert({
        where: { muestra_id: id },
        update: {
          metodo_disposicion_id: Number(metodo_disposicion_id),
          observaciones: observaciones || "Sin observaciones",
          ejecutado_por: token.id as string,
          autorizado_por: token.id as string,
        },
        create: {
          muestra_id: id,
          metodo_disposicion_id: Number(metodo_disposicion_id),
          observaciones: observaciones || "Sin observaciones",
          ejecutado_por: token.id as string,
          autorizado_por: token.id as string,
        }
      }),

      prisma.historialTrazabilidad.create({
        data: {
          muestra_id: id,
          estado_anterior_id: muestra.estado_id,
          estado_nuevo_id: estadoRecoleccion.id,
          motivo: "Certificación de descarte finalizada. Residuo segregado en bolsa roja y posicionado en área transitoria para recolección.",
          cambiado_por: token.id as string
        }
      })
    ]);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("ERROR FATAL EN PRISMA (DESCARTE):", error);
    return NextResponse.json({
      error: error.message || "Error interno al procesar el descarte"
    }, { status: 500 });
  }
}