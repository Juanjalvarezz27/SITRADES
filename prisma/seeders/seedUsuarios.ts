import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedUsuarios(prisma: PrismaClient) {
  console.log('Poblando tabla de Usuarios (Asignando Rol y Área física)...');

  const roles = await prisma.rol.findMany();
  const rolAdmin = roles.find(r => r.nombre === 'Administrador');
  const rolAnalista = roles.find(r => r.nombre === 'Analista de Laboratorio');
  const rolSeguridad = roles.find(r => r.nombre === 'Seguridad Industrial');

  const areaAdmin = await prisma.area.findFirst({ where: { nombre: "División de evaluación farmacéutica" } });
  const areaAnalista = await prisma.area.findFirst({ where: { nombre: "División de físicoquímica de medicamentos" } });
  const areaSeguridad = await prisma.area.findFirst({ where: { nombre: "Seguridad Industrial" } });

  if (!rolAdmin || !rolAnalista || !rolSeguridad) {
    throw new Error('Faltan roles en la base de datos. Asegúrate de correr seedRoles primero.');
  }

  if (!areaAdmin || !areaAnalista || !areaSeguridad) {
    throw new Error('Faltan áreas en la base de datos. Asegúrate de correr seedEstructuraFisica ANTES de seedUsuarios.');
  }

  // 3. Definimos la plantilla vinculando el area_id
  const usuariosMock = [
    {
      nombre: 'Juan Álvarez',
      email: 'admin@admin',
      password_plano: '1234',
      rol_id: rolAdmin.id,
      area_id: areaAdmin.id // Asignado a División de evaluación
    },
    {
      nombre: 'Dra. Ana López',
      email: 'analista@analista',
      password_plano: '1234',
      rol_id: rolAnalista.id,
      area_id: areaAnalista.id // Asignada a División de físicoquímica
    },
    {
      nombre: 'Ing. Carlos Méndez',
      email: 'seguridad@seguridad',
      password_plano: '1234',
      rol_id: rolSeguridad.id,
      area_id: areaSeguridad.id // Asignado a Seguridad Industrial
    }
  ];

  // 4. Insertamos cada usuario
  for (const userData of usuariosMock) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password_plano, salt);

    await prisma.usuario.upsert({
      where: { email: userData.email },
      update: {
        password_hash: hashedPassword,
        rol_id: userData.rol_id,
        area_id: userData.area_id, // Actualizamos el área si el usuario ya existía
        nombre: userData.nombre
      },
      create: {
        nombre: userData.nombre,
        email: userData.email,
        password_hash: hashedPassword,
        rol_id: userData.rol_id,
        area_id: userData.area_id // Registramos con el área
      }
    });

    console.log(`Usuario creado/actualizado: ${userData.nombre} | Área ID: ${userData.area_id}`);
  }

  console.log('Todos los usuarios de prueba sembrados con éxito.');
}