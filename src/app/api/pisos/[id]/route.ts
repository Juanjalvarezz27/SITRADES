import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params?.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID de piso inválido" }, { status: 400 });

    const body = await request.json();
    // Recibimos las direcciones actuales y los IDs de las que el usuario decidió borrar en el modal
    const { nombre, direcciones = [], direccionesEliminadas = [] } = body;

    if (!nombre || nombre.trim() === "") {
      return NextResponse.json({ error: "El nombre del piso es obligatorio" }, { status: 400 });
    }

    const nombreLimpio = nombre.trim();

    const pisoExistente = await prisma.piso.findFirst({
      where: { nombre: nombreLimpio, NOT: { id } }
    });

    if (pisoExistente) return NextResponse.json({ error: "Ya existe otro piso usando este nombre" }, { status: 400 });

    // TRANSACCIÓN DE PRISMA: Ejecutamos todo de forma segura
    await prisma.$transaction(async (tx) => {
      // 1. Actualizamos el nombre del piso
      await tx.piso.update({ where: { id }, data: { nombre: nombreLimpio } });

      // 2. Verificamos y eliminamos las direcciones que el usuario quitó
      if (direccionesEliminadas.length > 0) {
        // Bloqueo de seguridad: No borrar direcciones que tengan áreas
        for (const dirId of direccionesEliminadas) {
          const check = await tx.direccion.findUnique({ where: { id: dirId }, include: { _count: { select: { areas: true } } } });
          if (check && check._count.areas > 0) {
            throw new Error(`La dirección "${check.nombre}" no se puede eliminar desde aquí porque contiene áreas asignadas.`);
          }
          await tx.direccion.delete({ where: { id: dirId } });
        }
      }

      // 3. Creamos las nuevas o actualizamos las existentes
      for (const dir of direcciones) {
        if (!dir.nombre || dir.nombre.trim() === "") continue;
        
        if (dir.id) {
          // Si trae ID, es una existente que tal vez cambió de nombre
          await tx.direccion.update({ where: { id: dir.id }, data: { nombre: dir.nombre.trim() } });
        } else {
          // Si no trae ID, es una nueva que el usuario acaba de agregar al modal
          await tx.direccion.create({ data: { nombre: dir.nombre.trim(), piso_id: id } });
        }
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("Error al actualizar piso:", error);
    // Si el error es el que lanzamos nosotros arriba (sobre las áreas), lo mostramos al usuario
    if (error.message && error.message.includes("no se puede eliminar")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
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