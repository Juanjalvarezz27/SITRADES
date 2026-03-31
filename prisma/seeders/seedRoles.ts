import { PrismaClient } from '@prisma/client';

export async function seedRoles(prisma: PrismaClient) {
  console.log('Poblando tabla de Roles...');
  
  // Roles extraídos estrictamente de los alcances de tu tesis
  const roles = [
    { nombre: 'Administrador' },
    { nombre: 'Analista de Laboratorio' },
    { nombre: 'Seguridad Industrial' },
  ];

  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: {}, // Si ya existe, no lo sobreescribe
      create: { nombre: rol.nombre },
    });
  }
  
  console.log(' Roles sincronizados.');
}