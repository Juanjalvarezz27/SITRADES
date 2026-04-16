import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const empaques = await prisma.tipoEmpaque.findMany({ orderBy: { nombre: 'asc' } });
    return NextResponse.json(empaques);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener empaques" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nombre } = await request.json();
    const nuevoEmpaque = await prisma.tipoEmpaque.create({ data: { nombre } });
    return NextResponse.json(nuevoEmpaque, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear empaque" }, { status: 500 });
  }
}