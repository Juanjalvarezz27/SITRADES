import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const direcciones = await prisma.direccion.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        piso: true, 
        areas: {
          orderBy: { nombre: 'asc' }
        },
        _count: {
          select: { areas: true }
        }
      }
    });
    return NextResponse.json(direcciones, { status: 200 });
  } catch (error) {
    console.error("Error al obtener direcciones:", error);
    return NextResponse.json({ error: "Error al cargar las direcciones" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, piso_id } = body;

    if (!nombre || nombre.trim() === "") {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }
    if (!piso_id) {
      return NextResponse.json({ error: "Debe seleccionar un piso" }, { status: 400 });
    }

    const nombreLimpio = nombre.trim();
    const pisoIdInt = parseInt(piso_id);

    // Evitar direcciones duplicadas en el mismo piso
    const direccionExistente = await prisma.direccion.findFirst({
      where: { nombre: nombreLimpio, piso_id: pisoIdInt }
    });

    if (direccionExistente) {
      return NextResponse.json({ error: "Ya existe una dirección con este nombre en el piso seleccionado" }, { status: 400 });
    }

    const nuevaDireccion = await prisma.direccion.create({
      data: { nombre: nombreLimpio, piso_id: pisoIdInt }
    });

    return NextResponse.json(nuevaDireccion, { status: 201 });
  } catch (error) {
    console.error("Error al crear dirección:", error);
    return NextResponse.json({ error: "Error interno al registrar la dirección" }, { status: 500 });
  }
}