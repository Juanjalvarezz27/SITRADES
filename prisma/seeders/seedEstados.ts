import { PrismaClient } from '@prisma/client';

export async function seedEstados(prisma: PrismaClient) {
  console.log(' Poblando tabla de Estados de Muestra...');

  const estados = [
    { nombre: 'Recibida (Pendiente de Análisis)' },
    { nombre: 'Vencida (En Custodia Legal)' },
    { nombre: 'Retención Cumplida (Descartable)' },
    { nombre: 'Destruida / Segregada' },
    { nombre: 'Anulada (Error de Registro)' },
  ];

  for (const estado of estados) {
    await prisma.estadoMuestra.upsert({
      where: { nombre: estado.nombre },
      update: {},
      create: { nombre: estado.nombre },
    });
  }

  console.log(' Estados de Muestra sincronizados correctamente.');
}