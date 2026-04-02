import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, email, password, rol_id, area_id } = body;

    // 1. Validación básica
    if (!nombre || !email || !password || !rol_id || !area_id) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // 2. Verificar que el correo no exista ya
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return NextResponse.json({ error: "Este correo electrónico ya está registrado" }, { status: 400 });
    }

    // 3. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 4. Crear el usuario en la Base de Datos
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password_hash,
        rol_id: parseInt(rol_id),
        area_id: parseInt(area_id),
      }
    });

    return NextResponse.json(nuevoUsuario, { status: 201 });

  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return NextResponse.json({ error: "Ocurrió un error interno al registrar el usuario" }, { status: 500 });
  }
}