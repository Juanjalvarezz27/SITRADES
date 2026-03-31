import { PrismaClient } from '@prisma/client';

export async function seedUsuarios(prisma: PrismaClient) {
  console.log(' Poblando tabla de Usuarios (Administrador inicial)...');
  
  // 1. Buscamos el ID del rol Administrador
  const rolAdmin = await prisma.rol.findUnique({
    where: { nombre: 'Administrador' }
  });

  if (!rolAdmin) {
    throw new Error('No se encontró el rol "Administrador". Asegúrate de correr seedRoles primero.');
  }

  // 2. Creamos al usuario maestro (Tú) [cite: 9]
  const adminData = {
    nombre: 'Juan Sarmiento', 
    email: 'admin@sitrades.inhrr.gob.ve',
    password_hash: '1234', 
    rol_id: rolAdmin.id
  };

  // 3. Upsert para evitar duplicados si corres el comando varias veces
  await prisma.usuario.upsert({
    where: { email: adminData.email },
    update: {}, // No actualizamos nada si ya existe
    create: {
      nombre: adminData.nombre,
      email: adminData.email,
      password_hash: adminData.password_hash,
      rol_id: adminData.rol_id
    }
  });

  console.log('Usuario Administrador creado con éxito.');
}