import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedUsuarios(prisma: PrismaClient) {
  console.log(' Poblando tabla de Usuarios (Administrador inicial)...');
  
  const rolAdmin = await prisma.rol.findUnique({
    where: { nombre: 'Administrador' }
  });

  if (!rolAdmin) {
    throw new Error('No se encontró el rol "Administrador". Asegúrate de correr seedRoles primero.');
  }

  // 1. Generamos la sal y encriptamos la contraseña real
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('1234', salt);

  const adminData = {
    nombre: 'Juan Sarmiento', 
    email: 'admin@sitrades.inhrr.gob.ve',
    password_hash: hashedPassword, 
    rol_id: rolAdmin.id
  };

  await prisma.usuario.upsert({
    where: { email: adminData.email },
    // Si ya existe, le actualizamos el password al nuevo encriptado
    update: { password_hash: adminData.password_hash }, 
    create: {
      nombre: adminData.nombre,
      email: adminData.email,
      password_hash: adminData.password_hash,
      rol_id: adminData.rol_id
    }
  });

  console.log('Usuario Administrador creado con éxito.');
}