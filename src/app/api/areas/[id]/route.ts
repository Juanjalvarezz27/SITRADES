import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params?.id);
    
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const body = await request.json();
    const { nombre, direccion_id } = body;

    if (!nombre || nombre.trim() === "") return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    if (!direccion_id) return NextResponse.json({ error: "Debe seleccionar una dirección" }, { status: 400 });

    const nombreLimpio = nombre.trim();
    const direccionIdInt = parseInt(direccion_id);

    const areaExistente = await prisma.area.findFirst({
      where: { nombre: nombreLimpio, direccion_id: direccionIdInt, NOT: { id } }
    });

    if (areaExistente) return NextResponse.json({ error: "Ya existe otra área con este nombre en esa dirección" }, { status: 400 });

    const areaActualizada = await prisma.area.update({
      where: { id },
      data: { nombre: nombreLimpio, direccion_id: direccionIdInt }
    });

    return NextResponse.json(areaActualizada, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar área:", error);
    return NextResponse.json({ error: "Error al actualizar la información" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params?.id);

    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const area = await prisma.area.findUnique({
      where: { id },
      include: { _count: { select: { usuarios: true } } }
    });

    if (!area) return NextResponse.json({ error: "El área no existe" }, { status: 404 });

    // Protección relacional: Si hay personal trabajando aquí, no se puede borrar
    if (area._count.usuarios > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar porque hay ${area._count.usuarios} usuario(s) asignado(s) a esta área.` }, 
        { status: 409 }
      );
    }

    await prisma.area.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Área eliminada" }, { status: 200 });
  } catch (error) {
    console.error("Error al eliminar área:", error);
    return NextResponse.json({ error: "Error interno al eliminar" }, { status: 500 });
  }
}