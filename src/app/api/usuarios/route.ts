import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    // 1. Capturamos el nuevo parámetro de rol
    const rol = searchParams.get("rol") || ""; 

    // 2. Construimos las condiciones dinámicamente
    const whereConditions: any = {
      OR: [
        { nombre: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    };

    // Si nos enviaron un rol específico, lo agregamos a la condición
    if (rol !== "") {
      whereConditions.rol = {
        nombre: rol,
      };
    }

    const usuarios = await prisma.usuario.findMany({
      where: whereConditions,
      include: {
        rol: true, 
      },
      orderBy: {
        creado_en: "desc",
      },
    });

    return NextResponse.json(usuarios, { status: 200 });

  } catch (error) {
    console.error("Error en la API de usuarios:", error);
    return NextResponse.json(
      { error: "Error interno al obtener los usuarios" }, 
      { status: 500 }
    );
  }
}