import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params?.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const body = await request.json();
    const { nombre, direccion_id } = body;

    const areaActualizada = await prisma.area.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        direccion_id: parseInt(direccion_id)
      }
    });

    return NextResponse.json(areaActualizada, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar el área" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params?.id);
    const body = await request.json();
    const { activo, nombre } = body;

    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const dataToUpdate: any = {};
    if (activo !== undefined) dataToUpdate.activo = activo;
    if (nombre !== undefined) dataToUpdate.nombre = nombre.trim();

    await prisma.area.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error en PATCH áreas:", error);
    return NextResponse.json({ error: "Error al actualizar el área" }, { status: 500 });
  }
}