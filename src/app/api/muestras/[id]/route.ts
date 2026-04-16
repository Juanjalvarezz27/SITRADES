import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ 
      req: request as any, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Actualizamos TODOS los campos técnicos y de ubicación
    const muestraActualizada = await prisma.muestraFarmaceutica.update({
      where: { id },
      data: {
        codigo_interno: body.codigo_interno,
        lote: body.lote,
        registro_sanitario: body.registro_sanitario,
        principio_activo: body.principio_activo,
        tipo_empaque_id: Number(body.tipo_empaque_id),
        unidad_medida_id: Number(body.unidad_medida_id),
        riesgo_bioseguridad: body.riesgo_bioseguridad,
        cantidad: Number(body.cantidad),
        proposito_analisis: body.proposito_analisis,
        fecha_caducidad: new Date(body.fecha_caducidad),
        fecha_fin_retencion: new Date(body.fecha_fin_retencion),
        area_id: Number(body.area_id),
        ubicacion_detalle: body.ubicacion_detalle,
      },
    });

    // Guardar en el historial la auditoría de edición
    await prisma.historialTrazabilidad.create({
      data: {
        muestra_id: id,
        estado_anterior_id: muestraActualizada.estado_id, 
        estado_nuevo_id: muestraActualizada.estado_id,    
        motivo: "Edición general de ficha técnica y/o logística de la muestra.",
        cambiado_por: token.id as string,
      }
    });

    return NextResponse.json(muestraActualizada, { status: 200 });

  } catch (error: any) {
    console.error("Error al actualizar muestra:", error);
    return NextResponse.json({ error: "Error interno al actualizar" }, { status: 500 });
  }
}