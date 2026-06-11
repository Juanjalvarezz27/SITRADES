import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getHoyCaracas, getFuturoCaracas } from "@/lib/dateUtils";

export const dynamic = 'force-dynamic'; 

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const hoy = getHoyCaracas();         // Medianoche del día actual en Venezuela (UTC-4)
    const proximoMes = getFuturoCaracas(30); // 30 días en el futuro según Venezuela

    // 1. Total de Muestras Activas (no destruidas, no anuladas, no en cola de descarte)
    const totalActivas = await prisma.muestraFarmaceutica.count({
      where: {
        estado: {
          nombre: {
            notIn: [
              "Destruida / Segregada",
              "Anulada (Error de Registro)",
              "Retención Cumplida (Descartable)",
              "Esperando Recolección (Bolsa Roja)"
            ]
          }
        }
      }
    });

    // 2. ALERTAS CRÍTICAS: Cola de Descarte (estado real del sistema)
    const pendientesDescarte = await prisma.muestraFarmaceutica.count({
      where: {
        estado: {
          nombre: {
            in: ["Retención Cumplida (Descartable)", "Esperando Recolección (Bolsa Roja)"]
          }
        }
      }
    });

    // 3. ALERTAS PREVENTIVAS: Contramuestras que caducarán en menos de 30 días (aún activas)
    const vencenPronto = await prisma.muestraFarmaceutica.count({
      where: {
        tipo_muestra: "CONTRAMUESTRA",
        fecha_caducidad: { lte: proximoMes, gt: hoy },
        estado: {
          nombre: {
            notIn: [
              "Destruida / Segregada",
              "Anulada (Error de Registro)",
              "Retención Cumplida (Descartable)",
              "Esperando Recolección (Bolsa Roja)"
            ]
          }
        }
      }
    });

    // 4. Archivo Histórico (Ya destruidas o anuladas)
    const historico = await prisma.muestraFarmaceutica.count({
      where: {
        estado: { nombre: { in: ["Destruida / Segregada", "Anulada (Error de Registro)"] } }
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