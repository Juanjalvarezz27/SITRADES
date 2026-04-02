import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const rol = searchParams.get("rol") || ""; 
    
    // Capturamos los nuevos filtros (recibiremos los IDs)
    const piso = searchParams.get("piso") || "";
    const direccion = searchParams.get("direccion") || "";
    const area = searchParams.get("area") || "";

    const whereConditions: any = {
      OR: [
        { nombre: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    };

    if (rol !== "") whereConditions.rol = { nombre: rol };

    // Si mandan Área, filtramos directamente por el ID del área
    if (area !== "") {
      whereConditions.area_id = parseInt(area);
    } 
    // Si no mandan Área pero sí Dirección, buscamos todas las áreas de esa dirección
    else if (direccion !== "") {
      whereConditions.area = { direccion_id: parseInt(direccion) };
    } 
    // Si solo mandan Piso, buscamos las áreas que pertenezcan a direcciones de ese piso
    else if (piso !== "") {
      whereConditions.area = { direccion: { piso_id: parseInt(piso) } };
    }

    const orderByCondition = rol === "" && query === "" && area === "" && direccion === "" && piso === ""
      ? { nombre: "asc" as const } 
      : { creado_en: "desc" as const };

    const usuarios = await prisma.usuario.findMany({
      where: whereConditions,
      include: {
        rol: true,
        area: {
          include: {
            direccion: { include: { piso: true } }
          }
        }
      },
      orderBy: orderByCondition,
    });

    return NextResponse.json(usuarios, { status: 200 });

  } catch (error) {
    console.error("Error en la API de usuarios:", error);
    return NextResponse.json({ error: "Error interno al obtener los usuarios" }, { status: 500 });
  }
}