import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const unidades = await prisma.unidadMedida.findMany({
      orderBy: { nombre: "asc" }
    });
    return NextResponse.json(unidades);
  } catch (error: any) {
    console.error("Error en GET unidades-medida:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nombre } = await request.json();
    const nueva = await prisma.unidadMedida.create({
      data: { nombre }
    });
    return NextResponse.json(nueva);
  } catch (error: any) {
    console.error("Error en POST unidades-medida:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}