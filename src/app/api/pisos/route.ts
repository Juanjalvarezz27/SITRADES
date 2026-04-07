import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const pisos = await prisma.piso.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        direcciones: {
          orderBy: { nombre: 'asc' },
          include: {
            areas: {
              orderBy: { nombre: 'asc' }
            }
          }
        },
        _count: {
          select: { direcciones: true }
        }
      }
    });

    return NextResponse.json(pisos, { status: 200 });
  } catch (error) {
    console.error("Error al obtener pisos:", error);
    return NextResponse.json({ error: "Error al cargar los pisos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre } = body;

    // 1. Validación básica
    if (!nombre || nombre.trim() === "") {
      return NextResponse.json({ error: "El nombre del piso es obligatorio" }, { status: 400 });
    }

    const nombreLimpio = nombre.trim();

    // 2. Evitar duplicados exactos
    const pisoExistente = await prisma.piso.findUnique({
      where: { nombre: nombreLimpio }
    });

    if (pisoExistente) {
      return NextResponse.json({ error: "Ya existe un piso con este nombre" }, { status: 400 });
    }

    // 3. Crear en base de datos
    const nuevoPiso = await prisma.piso.create({
      data: { nombre: nombreLimpio }
    });

    return NextResponse.json(nuevoPiso, { status: 201 });

  } catch (error) {
    console.error("Error al crear piso:", error);
    return NextResponse.json({ error: "Ocurrió un error al registrar el piso" }, { status: 500 });
  }
}