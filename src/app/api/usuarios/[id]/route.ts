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

export async function PUT(
  request: Request,
  context: any
) {
  try {
    const params = await context.params;
    const id = params?.id;
    const body = await request.json();
    const { nombre, email, password, rol_id, area_id } = body;

    if (!id) return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });

    // Preparamos los datos a actualizar
    const updateData: any = {
      nombre,
      email,
      rol_id: parseInt(rol_id),
      area_id: parseInt(area_id),
    };

    // Si envió una nueva contraseña, la encriptamos y la agregamos
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(password, salt);
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(usuarioActualizado, { status: 200 });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json({ error: "Error al actualizar la información del usuario" }, { status: 500 });
  }
}