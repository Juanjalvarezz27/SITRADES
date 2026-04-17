import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request, context: any) {
  try {
    const params = await context.params;
    const id = params?.id;
    const body = await request.json();
    const { activo } = body; // Recibimos true (activar) o false (inhabilitar)

    if (!id) {
      return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 });
    }

    await prisma.usuario.update({
      where: { id },
      data: { activo }
    });

    const accion = activo ? "reactivado" : "inhabilitado";
    return NextResponse.json({ success: true, message: `Usuario ${accion} correctamente` }, { status: 200 });

  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el estado del usuario. Verifique la conexión." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: any) {
  try {
    const params = await context.params;
    const id = params?.id;
    const body = await request.json();
    const { nombre, email, password, rol_id, area_id } = body;

    if (!id) return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });

    const updateData: any = {
      nombre,
      email,
      rol_id: parseInt(rol_id),
      area_id: parseInt(area_id),
    };

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