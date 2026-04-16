import { PrismaClient } from '@prisma/client';

export async function seedUnidadesMedida(prisma: PrismaClient) {
  const unidades = [
    { nombre: 'Unidades (Cajas/Frascos)' },
    { nombre: 'Mililitros (ml)' },
    { nombre: 'Gramos (g)' },
    { nombre: 'Ampollas' }
  ];

  for (const unidad of unidades) {
    await prisma.unidadMedida.upsert({
      where: { nombre: unidad.nombre },
      update: {},
      create: unidad,
    });
  }
  console.log(' Unidades de medida sembradas.');
}