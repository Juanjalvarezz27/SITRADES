import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params?.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const body = await request.json();
    const { nombre, piso_id } = body;

    const direccionActualizada = await prisma.direccion.update({
      where: { id },
      data: { 
        nombre: nombre.trim(), 
        piso_id: parseInt(piso_id) 
      }
    });

    return NextResponse.json(direccionActualizada, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar la información" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params?.id);
    const { activo } = await request.json();

    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    await prisma.direccion.update({
      where: { id },
      data: { activo }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error al cambiar estado de la dirección" }, { status: 500 });
  }
}