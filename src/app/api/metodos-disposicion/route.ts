import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Obtener todos los métodos activos
export async function GET() {
  try {
    const metodos = await prisma.metodoDisposicion.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json(metodos);
  } catch (error) {
    console.error("Error al obtener métodos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// Crear un nuevo método
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.nombre) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

    const nuevo = await prisma.metodoDisposicion.create({
      data: { nombre: body.nombre }
    });
    return NextResponse.json(nuevo, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: "Este método ya existe" }, { status: 400 });
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}