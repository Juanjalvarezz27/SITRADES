import { PrismaClient } from '@prisma/client';

export async function seedEstructuraFisica(prisma: PrismaClient) {
  console.log('Poblando estructura física (Pisos, Direcciones, Áreas)...');
  
  // Data filtrada estrictamente según el alcance de la tesis (Especialidades Farmacéuticas)
  const estructura = [
    {
      piso: "Piso 1",
      direcciones: [
        {
          nombre: "Dirección de laboratorio de control de medicamentos",
          areas: ["Laboratorio de recombinantes"]
        },
        {
          nombre: "Dirección de laboratorio nacional de control de medicamentos, cosméticos, productos médicos y otras tecnologías",
          areas: ["División de físicoquímica de medicamentos"] 
        }
      ]
    },
    {
      piso: "Piso 2",
      direcciones: [
        {
          nombre: "Dirección de autorizaciones sanitarias de medicamentos",
          areas: ["División de evaluación farmacéutica"]
        },
        {
          nombre: "Dirección de centro nacional de vigilancia farmacológica",
          areas: ["División de seguridad de medicamentos", "División de reacciones adversas de medicamentos"]
        },
        {
          nombre: "Presidencia",
          areas: ["Seguridad Industrial"]
        }
      ]
    },
    {
      piso: "Piso 3",
      direcciones: [
        {
          nombre: "Presidencia piso 3",
          areas: ["Seguridad industrial", "Auditoría interna"]
        }
      ]
    }
  ];

  for (const pisoData of estructura) {
    // 1. Crear o encontrar el Piso (Upsert porque el nombre del piso es @unique)
    const piso = await prisma.piso.upsert({
      where: { nombre: pisoData.piso },
      update: {},
      create: { nombre: pisoData.piso },
    });

    // 2. Recorrer e insertar sus Direcciones
    for (const dirData of pisoData.direcciones) {
      // Usamos findFirst porque nombre de dirección no es @unique en el esquema
      let direccion = await prisma.direccion.findFirst({
        where: { nombre: dirData.nombre, piso_id: piso.id },
      });

      if (!direccion) {
        direccion = await prisma.direccion.create({
          data: {
            nombre: dirData.nombre,
            piso_id: piso.id,
          },
        });
      }

      // 3. Recorrer e insertar sus Áreas exactas
      for (const areaNombre of dirData.areas) {
        let area = await prisma.area.findFirst({
          where: { nombre: areaNombre, direccion_id: direccion.id },
        });

        if (!area) {
          await prisma.area.create({
            data: {
              nombre: areaNombre,
              direccion_id: direccion.id,
            },
          });
        }
      }
    }
  }
  
  console.log('Estructura física sincronizada (Solo áreas autorizadas).');
}