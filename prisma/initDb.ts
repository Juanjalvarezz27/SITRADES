import { PrismaClient } from '@prisma/client';
import { seedRoles } from './seeders/seedRoles';
import { seedEstados } from './seeders/seedEstados';
import { seedEstructuraFisica } from './seeders/seedEstructuraFisica';
import { seedUsuarios } from './seeders/seedUsuarios';
import { seedUnidadesMedida } from './seeders/seedUnidadesMedida'; 
import { seedTiposEmpaque } from './seeders/seedTiposEmpaque';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando la siembra manual de datos (SITRADES)...');

  // 1. Catálogos base (Sin dependencias)
  await seedRoles(prisma);
  await seedEstados(prisma);
  await seedUnidadesMedida(prisma); 
  await seedTiposEmpaque(prisma); 
  // 2. Estructura Jerárquica (Pisos -> Direcciones -> Áreas)
  await seedEstructuraFisica(prisma);

  // 3. Usuarios (Depende de los Roles)
  await seedUsuarios(prisma);

  console.log('Base de datos inicializada correctamente.');
}

main()
  .catch((e) => {
    console.error('Error crítico durante la siembra de datos:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Conexión a la base de datos cerrada.');
  });