import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const { nombre } = await request.json();
    const actualizado = await prisma.unidadMedida.update({
      where: { id: Number(id) },
      data: { nombre }
    });
    return NextResponse.json(actualizado);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    await prisma.unidadMedida.delete({
      where: { id: Number(id) }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2003') {
      return NextResponse.json({ error: "No se puede eliminar: esta unidad esta en uso." }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}