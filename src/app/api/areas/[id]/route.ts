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
    const { activo } = await request.json();

    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    await prisma.area.update({
      where: { id },
      data: { activo }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error al cambiar estado del área" }, { status: 500 });
  }
}