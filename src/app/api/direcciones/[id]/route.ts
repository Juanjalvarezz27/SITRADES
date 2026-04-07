import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params?.id);
    
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const body = await request.json();
    const { nombre, piso_id } = body;

    if (!nombre || nombre.trim() === "") return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    if (!piso_id) return NextResponse.json({ error: "Debe seleccionar un piso" }, { status: 400 });

    const nombreLimpio = nombre.trim();
    const pisoIdInt = parseInt(piso_id);

    const direccionExistente = await prisma.direccion.findFirst({
      where: { nombre: nombreLimpio, piso_id: pisoIdInt, NOT: { id } }
    });

    if (direccionExistente) {
      return NextResponse.json({ error: "Ya existe otra dirección con este nombre en ese piso" }, { status: 400 });
    }

    const direccionActualizada = await prisma.direccion.update({
      where: { id },
      data: { nombre: nombreLimpio, piso_id: pisoIdInt }
    });

    return NextResponse.json(direccionActualizada, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar dirección:", error);
    return NextResponse.json({ error: "Error al actualizar la información" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params?.id);

    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const direccion = await prisma.direccion.findUnique({
      where: { id },
      include: { _count: { select: { areas: true } } }
    });

    if (!direccion) return NextResponse.json({ error: "La dirección no existe" }, { status: 404 });

    // Protección relacional
    if (direccion._count.areas > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar porque tiene ${direccion._count.areas} área(s) asignada(s).` }, 
        { status: 409 }
      );
    }

    await prisma.direccion.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Dirección eliminada" }, { status: 200 });
  } catch (error) {
    console.error("Error al eliminar dirección:", error);
    return NextResponse.json({ error: "Error interno al eliminar" }, { status: 500 });
  }
}