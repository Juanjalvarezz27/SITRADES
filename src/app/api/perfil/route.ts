import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route"; 
import bcrypt from "bcryptjs"; 

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email as string },
      include: {
        rol: true,
        area: true,
      }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Retiramos el password por seguridad
    const { password_hash, ...datosSeguros } = usuario;
    return NextResponse.json(datosSeguros);

  } catch (error) {
    return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, email, password } = body;

    if (!nombre || !email) {
      return NextResponse.json({ error: "El nombre y correo son obligatorios" }, { status: 400 });
    }

    // Preparamos la data a actualizar
    const dataToUpdate: any = { nombre, email };

    // Si el usuario envió una contraseña, la encriptamos antes de guardarla
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.password_hash = await bcrypt.hash(password, salt);
    }

    const actualizado = await prisma.usuario.update({
      where: { email: session.user.email as string },
      data: dataToUpdate
    });

    const { password_hash, ...datosSeguros } = actualizado;
    return NextResponse.json(datosSeguros);

  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Este correo electrónico ya está registrado por otro usuario." }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al actualizar el perfil" }, { status: 500 });
  }
}