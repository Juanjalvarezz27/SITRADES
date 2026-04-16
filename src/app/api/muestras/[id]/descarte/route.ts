import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    // ✨ PASO CLAVE: Desenvolver los params antes de usarlos
    const { id } = await params; 

    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const { metodo_disposicion_id, observaciones } = body;

    if (!metodo_disposicion_id) {
      return NextResponse.json({ error: "No se recibió el método de disposición" }, { status: 400 });
    }

    // 1. Buscar estado "Destruida / Segregada"
    const estadoDestruida = await prisma.estadoMuestra.findFirst({
      where: { nombre: "Destruida / Segregada" }
    });

    if (!estadoDestruida) {
      return NextResponse.json({ error: "Estado de destrucción no encontrado en BD" }, { status: 400 });
    }

    // 2. Obtener estado actual (Usando el id ya desenvuelto)
    const muestra = await prisma.muestraFarmaceutica.findUnique({
      where: { id: id },
      select: { estado_id: true }
    });

    if (!muestra) {
      return NextResponse.json({ error: "Muestra no encontrada" }, { status: 404 });
    }

    // 3. TRANSACCIÓN ATÓMICA
    await prisma.$transaction([
      prisma.muestraFarmaceutica.update({
        where: { id: id },
        data: { estado_id: estadoDestruida.id }
      }),
      
      prisma.reporteDescarte.create({
        data: {
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
          estado_nuevo_id: estadoDestruida.id,
          motivo: "Ejecución de protocolo legal de descarte físico y segregación.",
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