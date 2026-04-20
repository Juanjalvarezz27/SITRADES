import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    
    // 1. Doble validación de seguridad (Token y Rol)
    if (!token || !token.id || token.rol !== "Administrador") {
      return NextResponse.json({ error: "Acceso denegado. Solo un Administrador puede anular registros." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { motivo_anulacion } = body;

    if (!motivo_anulacion || motivo_anulacion.trim().length < 10) {
      return NextResponse.json({ error: "Debe proporcionar una justificación detallada (mínimo 10 caracteres)." }, { status: 400 });
    }

    // 2. Buscamos la muestra y el estado de anulación
    const muestraActual = await prisma.muestraFarmaceutica.findUnique({ where: { id } });
    if (!muestraActual) return NextResponse.json({ error: "Muestra no encontrada." }, { status: 404 });

    const estadoAnulado = await prisma.estadoMuestra.findUnique({ where: { nombre: 'Anulada (Error de Registro)' } });
    if (!estadoAnulado) throw new Error("No existe el estado de Anulación en la BD.");

    // 3. Transacción: Cambiar estado y registrar el evento en el historial
    const muestraAnulada = await prisma.$transaction(async (tx) => {
      const actualizada = await tx.muestraFarmaceutica.update({
        where: { id },
        data: { estado_id: estadoAnulado.id },
      });

      await tx.historialTrazabilidad.create({
        data: {
          muestra_id: id,
          estado_anterior_id: muestraActual.estado_id,
          estado_nuevo_id: estadoAnulado.id,
          motivo: `REGISTRO ANULADO: ${motivo_anulacion.trim()}`,
          cambiado_por: token.id as string,
        }
      });

      return actualizada;
    });

    return NextResponse.json(muestraAnulada, { status: 200 });

  } catch (error: any) {
    console.error("Error al anular muestra:", error);
    return NextResponse.json({ error: "Error interno al procesar la anulación" }, { status: 500 });
  }
}