import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Agregamos Promise en el tipado de los params para compatibilidad con las versiones nuevas de Next.js
export async function GET(request: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    // Extraemos el ID de forma segura
    const params = await context.params;
    const id = params.id;

    //  BLINDAJE: Si el ID no existe, cortamos la ejecución de inmediato
    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Falta el ID válido de la muestra" }, { status: 400 });
    }

    const historial = await prisma.historialTrazabilidad.findMany({
      where: { muestra_id: id }, 
      include: {
        estado_anterior: true,
        estado_nuevo: true,
        usuario: {
          select: { nombre: true, rol: true }
        }
      },
      orderBy: { fecha_cambio: 'desc' }
    });

    return NextResponse.json(historial);
  } catch (error) {
    console.error("Error al obtener trazabilidad:", error);
    return NextResponse.json({ error: "Error al obtener el historial de trazabilidad" }, { status: 500 });
  }
}