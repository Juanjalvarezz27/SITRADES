import { PrismaClient } from '@prisma/client';

export async function seedEstados(prisma: PrismaClient) {
  console.log(' Poblando tabla de Estados de Muestra...');
  
  // El ciclo de vida legal de la contramuestra
  const estados = [
    { nombre: 'Activa' },             // En periodo de utilidad
    { nombre: 'En Custodia Legal' },  // Vencida, cumpliendo el año de retención
    { nombre: 'Alerta de Descarte' }, // Año cumplido, lista para destrucción
    { nombre: 'Descartada' },         // Ya incinerada/neutralizada
  ];

  for (const estado of estados) {
    await prisma.estadoMuestra.upsert({
      where: { nombre: estado.nombre },
      update: {},
      create: { nombre: estado.nombre },
    });
  }
  
  console.log(' Estados de Muestra sincronizados.');
}