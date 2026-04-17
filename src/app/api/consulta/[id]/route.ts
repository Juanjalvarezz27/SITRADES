import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID de muestra requerido" }, { status: 400 });
    }

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
        estado: true, 
        reporte_descarte: { 
          include: {
            metodo_disposicion: true
          }
        },
        usuarioRegistrador: true // 
      }
    });

    if (!muestra) {
      return NextResponse.json({ error: "Muestra no encontrada" }, { status: 404 });
    }

    return NextResponse.json(muestra);

  } catch (error) {
    console.error("Error en consulta pública:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}