import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const empaques = await prisma.tipoEmpaque.findMany({ // Verifica si en tu esquema es tipo_empaque o tipoEmpaque
      orderBy: { nombre: "asc" }
    });
    return NextResponse.json(empaques);
  } catch (error: any) {
    console.error("Error en GET tipos-empaque:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nombre } = await request.json();
    const nuevo = await prisma.tipoEmpaque.create({
      data: { nombre }
    });
    return NextResponse.json(nuevo);
  } catch (error: any) {
    console.error("Error en POST tipos-empaque:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}