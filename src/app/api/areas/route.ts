import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const areas = await prisma.area.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        direccion: {
          include: { piso: true }
        },
        usuarios: {
          select: {
            id: true,
            nombre: true
          },
          orderBy: { nombre: 'asc' }
        },
        _count: {
          select: { usuarios: true }
        }
      }
    });
    return NextResponse.json(areas, { status: 200 });
  } catch (error) {
    console.error("Error al obtener áreas:", error);
    return NextResponse.json({ error: "Error al cargar las áreas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, direccion_id } = body;

    if (!nombre || nombre.trim() === "") return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    if (!direccion_id) return NextResponse.json({ error: "Debe seleccionar una dirección" }, { status: 400 });

    const nombreLimpio = nombre.trim();
    const direccionIdInt = parseInt(direccion_id);

    const areaExistente = await prisma.area.findFirst({
      where: { nombre: nombreLimpio, direccion_id: direccionIdInt }
    });

    if (areaExistente) return NextResponse.json({ error: "Ya existe un área con este nombre en esa dirección" }, { status: 400 });

    const nuevaArea = await prisma.area.create({
      data: { nombre: nombreLimpio, direccion_id: direccionIdInt }
    });

    return NextResponse.json(nuevaArea, { status: 201 });
  } catch (error) {
    console.error("Error al crear área:", error);
    return NextResponse.json({ error: "Error interno al registrar el área" }, { status: 500 });
  }
}