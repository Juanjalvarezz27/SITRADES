import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const unidades = await prisma.unidadMedida.findMany({ orderBy: { nombre: 'asc' } });
    return NextResponse.json(unidades);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener unidades" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nombre } = await request.json();
    const nuevaUnidad = await prisma.unidadMedida.create({ data: { nombre } });
    return NextResponse.json(nuevaUnidad, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear unidad" }, { status: 500 });
  }
}