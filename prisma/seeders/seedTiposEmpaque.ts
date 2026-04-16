import { PrismaClient } from '@prisma/client';

export async function seedTiposEmpaque(prisma: PrismaClient) {
  const empaques = [
    { nombre: 'Caja de Cartón' },
    { nombre: 'Frasco de Vidrio' },
    { nombre: 'Blíster Plástico/Aluminio' },
    { nombre: 'Vial Ampolla' },
    { nombre: 'Saco/Bolsa Especial' }
  ];

  for (const empaque of empaques) {
    await prisma.tipoEmpaque.upsert({
      where: { nombre: empaque.nombre },
      update: {},
      create: empaque,
    });
  }
  console.log(' Tipos de empaque sembrados.');
}