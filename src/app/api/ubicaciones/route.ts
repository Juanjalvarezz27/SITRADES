import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const ubicaciones = await prisma.piso.findMany({
      include: {
        direcciones: {
          include: {
            areas: true
          },
          orderBy: { nombre: 'asc' }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json(ubicaciones, { status: 200 });
  } catch (error) {
    console.error("Error cargando ubicaciones:", error);
    return NextResponse.json({ error: "Error al cargar ubicaciones" }, { status: 500 });
  }
}