import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, context: any) {
  try {
    // Mantenemos la compatibilidad asíncrona para Next.js 15
    const params = await context.params;
    const id = parseInt(params?.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de piso inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { nombre } = body;

    if (!nombre || nombre.trim() === "") {
      return NextResponse.json({ error: "El nombre del piso es obligatorio" }, { status: 400 });
    }

    const nombreLimpio = nombre.trim();

    // Validar que el nuevo nombre no esté siendo usado por OTRO piso diferente
    const pisoExistente = await prisma.piso.findFirst({
      where: {
        nombre: nombreLimpio,
        NOT: { id: id }
      }
    });

    if (pisoExistente) {
      return NextResponse.json({ error: "Ya existe otro piso usando este nombre" }, { status: 400 });
    }

    const pisoActualizado = await prisma.piso.update({
      where: { id },
      data: { nombre: nombreLimpio }
    });

    return NextResponse.json(pisoActualizado, { status: 200 });

  } catch (error) {
    console.error("Error al actualizar piso:", error);
    return NextResponse.json({ error: "Error al actualizar la información del piso" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params?.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de piso inválido" }, { status: 400 });
    }

    // BUENA PRÁCTICA: Validar relaciones antes de eliminar
    const piso = await prisma.piso.findUnique({
      where: { id },
      include: { _count: { select: { direcciones: true } } }
    });

    if (!piso) {
      return NextResponse.json({ error: "El piso no existe" }, { status: 404 });
    }

    if (piso._count.direcciones > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar porque tiene ${piso._count.direcciones} dirección(es) asignada(s). Elimínelas o reasígnelas primero.` }, 
        { status: 409 } // 409 Conflict
      );
    }

    await prisma.piso.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Piso eliminado correctamente" }, { status: 200 });

  } catch (error) {
    console.error("Error al eliminar piso:", error);
    return NextResponse.json({ error: "Ocurrió un error interno al intentar eliminar el piso" }, { status: 500 });
  }
}