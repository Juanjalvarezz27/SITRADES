import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    // 1. Buscamos el ID del estado intermedio
    const estadoRecoleccion = await prisma.estadoMuestra.findFirst({
      where: { nombre: "Esperando Recolección (Bolsa Roja)" }
    });

    if (!estadoRecoleccion) {
      return NextResponse.json({ pendientes: [] });
    }

    // 2. Traemos todas las muestras en ese estado con sus relaciones necesarias para las tarjetas
    const pendientes = await prisma.muestraFarmaceutica.findMany({
      where: { estado_id: estadoRecoleccion.id },
      include: {
        area: {
          include: { direccion: { include: { piso: true } } }
        },
        usuarioRegistrador: {
          select: { nombre: true } // Solo traemos el nombre del analista para no exponer passwords
        },
        unidad_medida: true,
        estado: true
      },
      orderBy: { actualizado_en: 'asc' } // Las más antiguas primero (prioridad)
    });

    return NextResponse.json(pendientes);

  } catch (error: any) {
    console.error("Error al obtener bolsas pendientes:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}