import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 1. Le decimos a TypeScript que params ahora es una Promesa
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 2. Extraemos el ID esperando (await) a que se resuelvan los parámetros
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID de muestra requerido" }, { status: 400 });
    }

    // Buscamos SOLO la muestra que coincide con el ID del código QR
    const muestra = await prisma.muestraFarmaceutica.findUnique({
      where: { id },
      include: {
        area: {
          include: {
            direccion: {
              include: {
                piso: true
              }
            }
          }
        },
        unidad_medida: true,
        tipo_empaque: true,
      }
    });

    if (!muestra) {
      return NextResponse.json({ error: "Muestra no encontrada" }, { status: 404 });
    }

    // Retornamos la muestra exitosamente
    return NextResponse.json(muestra);

  } catch (error) {
    console.error("Error en consulta pública:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}