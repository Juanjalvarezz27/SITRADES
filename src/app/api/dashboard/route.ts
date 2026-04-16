import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic'; 

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const hoy = new Date();
    
    // Calculamos la fecha de dentro de 30 días para la alerta de "Vencen Pronto"
    const proximoMes = new Date();
    proximoMes.setDate(hoy.getDate() + 30);

    // 1. Total de Muestras Activas (Aún no cumplen tiempo de retención)
    const totalActivas = await prisma.muestraFarmaceutica.count({
      where: {
        fecha_fin_retencion: { gt: hoy },
        estado: { nombre: { not: "Destruida / Segregada" } }
      }
    });

    // 2. ALERTAS CRÍTICAS: Cola de Descarte (Retención cumplida, esperando destrucción)
    const pendientesDescarte = await prisma.muestraFarmaceutica.count({
      where: {
        fecha_fin_retencion: { lte: hoy },
        estado: { nombre: { not: "Destruida / Segregada" } }
      }
    });

    // 3. ALERTAS PREVENTIVAS: Vencen en menos de 30 días
    const vencenPronto = await prisma.muestraFarmaceutica.count({
      where: {
        fecha_caducidad: { lte: proximoMes, gt: hoy },
        estado: { nombre: { not: "Destruida / Segregada" } }
      }
    });

    // 4. Archivo Histórico (Ya destruidas)
    const historico = await prisma.muestraFarmaceutica.count({
      where: {
        estado: { nombre: "Destruida / Segregada" }
      }
    });

    // 5. Últimas 5 muestras ingresadas (Para la tabla de actividad reciente)
    const recientes = await prisma.muestraFarmaceutica.findMany({
      take: 5,
      orderBy: { creado_en: 'desc' },
      include: {
        area: true,
        tipo_empaque: true
      }
    });

    return NextResponse.json({
      kpis: {
        totalActivas,
        pendientesDescarte,
        vencenPronto,
        historico
      },
      recientes
    });

  } catch (error) {
    console.error("Error cargando dashboard:", error);
    return NextResponse.json({ error: "Error interno al cargar métricas" }, { status: 500 });
  }
}