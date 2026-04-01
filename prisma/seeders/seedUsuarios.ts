import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedUsuarios(prisma: PrismaClient) {
  console.log('Poblando tabla de Usuarios (Un usuario por rol)...');
  
  // 1. Traemos todos los roles de la base de datos
  const roles = await prisma.rol.findMany();
  
  const rolAdmin = roles.find(r => r.nombre === 'Administrador');
  const rolAnalista = roles.find(r => r.nombre === 'Analista de Laboratorio');
  const rolSeguridad = roles.find(r => r.nombre === 'Seguridad Industrial');

  if (!rolAdmin || !rolAnalista || !rolSeguridad) {
    throw new Error('Faltan roles en la base de datos. Asegúrate de correr seedRoles primero.');
  }

  // 2. Definimos nuestra plantilla de usuarios de prueba
  const usuariosMock = [
    {
      nombre: 'Juan Álvarez', 
      email: 'admin@sitrades.inhrr.gob.ve',
      password_plano: 'Admin123*',
      rol_id: rolAdmin.id
    },
    {
      nombre: 'Dra. Ana López',
      email: 'analista@sitrades.inhrr.gob.ve',
      password_plano: 'Analista123*',
      rol_id: rolAnalista.id
    },
    {
      nombre: 'Ing. Carlos Méndez',
      email: 'seguridad@sitrades.inhrr.gob.ve',
      password_plano: 'Seguridad123*',
      rol_id: rolSeguridad.id
    }
  ];

  // 3. Insertamos cada usuario encriptando su respectiva contraseña
  for (const userData of usuariosMock) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password_plano, salt);

    await prisma.usuario.upsert({
      where: { email: userData.email },
      update: { 
        // Si ya existe, le actualizamos la clave y el rol por si hubo cambios
        password_hash: hashedPassword,
        rol_id: userData.rol_id,
        nombre: userData.nombre
      }, 
      create: {
        nombre: userData.nombre,
        email: userData.email,
        password_hash: hashedPassword,
        rol_id: userData.rol_id
      }
    });
    
    console.log(`Usuario creado: ${userData.nombre} | Rol ID: ${userData.rol_id}`);
  }

  console.log('Todos los usuarios de prueba sembrados con éxito.');
}