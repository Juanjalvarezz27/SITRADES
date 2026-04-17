import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params?.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID de piso inválido" }, { status: 400 });

    const body = await request.json();
    const { nombre, direcciones = [] } = body;

    if (!nombre || nombre.trim() === "") {
      return NextResponse.json({ error: "El nombre del piso es obligatorio" }, { status: 400 });
    }

    const nombreLimpio = nombre.trim();

    const pisoExistente = await prisma.piso.findFirst({
      where: { nombre: nombreLimpio, NOT: { id } }
    });

    if (pisoExistente) return NextResponse.json({ error: "Ya existe otro piso usando este nombre" }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      await tx.piso.update({ where: { id }, data: { nombre: nombreLimpio } });

      for (const dir of direcciones) {
        if (!dir.nombre || dir.nombre.trim() === "") continue;

        if (dir.id) {
          await tx.direccion.update({ where: { id: dir.id }, data: { nombre: dir.nombre.trim() } });
        } else {
          await tx.direccion.create({ data: { nombre: dir.nombre.trim(), piso_id: id } });
        }
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error al actualizar piso:", error);
    return NextResponse.json({ error: "Error al actualizar la información del piso" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params?.id);
    const body = await request.json();
    const { activo, nombre } = body; // Recibimos ambos posibles campos

    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const dataToUpdate: any = {};
    if (activo !== undefined) dataToUpdate.activo = activo;
    if (nombre !== undefined) dataToUpdate.nombre = nombre.trim();

    await prisma.piso.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error en PATCH pisos:", error);
    return NextResponse.json({ error: "Error al actualizar el piso" }, { status: 500 });
  }
}