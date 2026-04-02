import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const roles = await prisma.rol.findMany({
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json(roles, { status: 200 });
  } catch (error) {
    console.error("Error cargando roles:", error);
    return NextResponse.json({ error: "Error al cargar roles" }, { status: 500 });
  }
}