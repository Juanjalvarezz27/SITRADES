import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    // 1. Verificamos quién está haciendo la anulación
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json({ error: "No autorizado. Inicie sesión." }, { status: 401 });
    }

    // 2. Extraemos el motivo de la anulación (Ej: "Me equivoqué en el lote")
    const body = await request.json();
    const { motivo } = body;

    if (!motivo) {
      return NextResponse.json({ error: "El motivo de anulación es obligatorio." }, { status: 400 });
    }

    // 3. Apagamos la muestra en la base de datos (Soft Delete)
    const muestraAnulada = await prisma.muestraFarmaceutica.update({
      where: { id: params.id },
      data: {
        inhabilitado: true,
        motivo_inhabilitacion: motivo,
        fecha_inhabilitacion: new Date(),
        inhabilitado_por: token.id as string,
      }
    });

    // 4. Dejamos constancia en la línea de tiempo (Auditoría)
    await prisma.historialTrazabilidad.create({
      data: {
        muestra_id: params.id,
        estado_anterior_id: muestraAnulada.estado_id,
        estado_nuevo_id: muestraAnulada.estado_id, // El estado no cambia, solo se inhabilitó
        motivo: `REGISTRO INHABILITADO POR ERROR: ${motivo}`,
        cambiado_por: token.id as string,
      }
    });

    return NextResponse.json({ message: "Muestra inhabilitada correctamente y enviada al archivo." }, { status: 200 });

  } catch (error) {
    console.error("Error al anular la muestra:", error);
    return NextResponse.json({ error: "Error interno del servidor al procesar la anulación." }, { status: 500 });
  }
}