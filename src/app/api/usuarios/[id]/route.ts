import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  context: any // Usamos any para evitar conflictos de TypeScript entre Next 14 y 15
) {
  try {
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 });
    }

    // Eliminamos el usuario de la base de datos
    await prisma.usuario.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Usuario eliminado correctamente" }, { status: 200 });

  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el usuario. Es posible que tenga registros asociados." }, 
      { status: 500 }
    );
  }
}