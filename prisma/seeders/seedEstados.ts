import { PrismaClient } from '@prisma/client';

export async function seedEstados(prisma: PrismaClient) {
  console.log(' Poblando tabla de Estados de Muestra...');
  
  // El ciclo de vida legal OFICIAL de la contramuestra (Coincide exacto con la API)
  const estados = [
    { nombre: 'Recibida (Pendiente de Análisis)' }, // 1. Ingreso inicial
    { nombre: 'Vencida (En Custodia Legal)' },      // 2. Pasó fecha caducidad, inicia retención
    { nombre: 'Retención Cumplida (Descartable)' }, // 3. Cumplió el año, lista para logística inversa
    { nombre: 'Descartada' },                       // 4. Fin del ciclo (Incinerada/Neutralizada)
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