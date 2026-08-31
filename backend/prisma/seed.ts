import { PrismaClient, Role, MemberStatus, MembershipPlan, SlotType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos iniciales (Seed) de ProFuncional...');

  // Limpiar base de datos previa
  await prisma.activityLog.deleteMany();
  await prisma.clinicalEvaluation.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.scheduleBlock.deleteMany();
  await prisma.sessionPackage.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('admin1234', saltRounds);
  const userPassword = await bcrypt.hash('password123', saltRounds);

  // 1. Crear Staff / Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@profuncional.cl',
      password: adminPassword,
      name: 'Personal del Gimnasio (Admin/Staff)',
      phone: '+56 9 9999 8888',
      role: Role.ADMIN,
      status: MemberStatus.ACTIVE,
      balance: 0,
    },
  });

  const kinesiologist = await prisma.user.create({
    data: {
      email: 'andres.morales@profuncional.cl',
      password: adminPassword,
      name: 'Klgo. Andrés Morales',
      phone: '+56 9 8888 7777',
      role: Role.KINESIOLOGO,
      status: MemberStatus.ACTIVE,
      balance: 0,
    },
  });

  // 2. Crear Pacientes
  const juan = await prisma.user.create({
    data: {
      email: 'juan.perez@gmail.com',
      password: userPassword,
      name: 'Juan Perez',
      phone: '+56 9 8765 4321',
      role: Role.PATIENT,
      status: MemberStatus.ACTIVE,
      balance: 0,
      physicalRestrictions: 'Evitar impacto alto en salto / Cuidado en aterrizaje',
      packages: {
        create: {
          plan: MembershipPlan.PREMIUM,
          packName: 'Pack Readaptación Total (12 ses)',
          totalSessions: 12,
          remainingSessions: 7,
          price: 99000,
        },
      },
      clinicalRecords: {
        create: [
          {
            professionalName: 'Klgo. Andrés Morales',
            evaPain: 7,
            romDegrees: 90,
            jointOrArea: 'Rodilla derecha',
            subjective: 'Paciente refiere dolor punzante en cara anterior de rodilla al subir escaleras.',
            objective: 'Edema leve peri-rotuliano. ROM flexión 90°, extensión completa.',
            assessment: 'Tendinopatía rotuliana en fase subaguda.',
            plan: 'Crioterapia, electroanalgesia, descarga miofascial y ejercicios isométricos.',
            physicalRestrictions: 'Evitar sentadillas profundas >90°',
          },
          {
            professionalName: 'Klgo. Andrés Morales',
            evaPain: 3,
            romDegrees: 130,
            jointOrArea: 'Rodilla derecha',
            subjective: 'Paciente asintomático en AVD. Buena sensación de fuerza y estabilidad.',
            objective: 'ROM flexión 130° sin dolor. Test de salto bipodal simétrico.',
            assessment: 'Fase de reintegro funcional al gimnasio.',
            plan: 'Derivación a entrenamiento funcional adaptado sin carga extrema.',
            physicalRestrictions: 'Evitar impacto alto en salto / Cuidado en aterrizaje',
          },
        ],
      },
    },
  });

  const camila = await prisma.user.create({
    data: {
      email: 'camila.gonzalez@gmail.com',
      password: userPassword,
      name: 'Camila Gonzalez',
      phone: '+56 9 7654 3210',
      role: Role.PATIENT,
      status: MemberStatus.ACTIVE,
      balance: -50,
      physicalRestrictions: 'Evitar rotaciones forzadas y flexión >90° por post-op LCA',
      packages: {
        create: {
          plan: MembershipPlan.STANDARD,
          packName: 'Pack Recuperación Activa (8 ses)',
          totalSessions: 8,
          remainingSessions: 5,
          price: 59000,
        },
      },
      clinicalRecords: {
        create: [
          {
            professionalName: 'Klga. Valeria Reyes',
            evaPain: 8,
            romDegrees: 85,
            jointOrArea: 'Rodilla izquierda (LCA)',
            subjective: 'Dolor y sensación de inestabilidad post-quirúrgica (semana 6).',
            objective: 'Déficit de extensión de 5°, flexión hasta 85°. Atrofia de cuádriceps.',
            assessment: 'Post-operatorio plastía LCA en fase de ganancia de ROM.',
            plan: 'Movilización pasiva/activa asistida, electroestimulación cuadricipital.',
            physicalRestrictions: 'Prohibido correr y sentadilla con carga',
          },
        ],
      },
    },
  });

  const matias = await prisma.user.create({
    data: {
      email: 'matias.rojas@gmail.com',
      password: userPassword,
      name: 'Matias Rojas',
      phone: '+56 9 6543 2109',
      role: Role.PATIENT,
      status: MemberStatus.EXPIRED,
      balance: 0,
      physicalRestrictions: 'Hombro doloroso: evitar press militar sobre cabeza',
      packages: {
        create: {
          plan: MembershipPlan.BASIC,
          packName: 'Pack Básico Kinesiológico (4 ses)',
          totalSessions: 4,
          remainingSessions: 0,
          price: 29000,
          isActive: false,
        },
      },
    },
  });

  // 3. Crear Bloques Horarios (HU-01)
  const block1 = await prisma.scheduleBlock.create({
    data: {
      dayOfWeek: 'Monday',
      startTime: '08:00',
      endTime: '09:00',
      title: 'Box Clínico Kinesiología 1',
      instructor: 'Klgo. Andrés Morales',
      type: SlotType.KINE_BOX,
      capacity: 1,
    },
  });

  const block2 = await prisma.scheduleBlock.create({
    data: {
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      title: 'Entrenamiento Funcional HIIT',
      instructor: 'Prof. Mike R.',
      type: SlotType.FUNCTIONAL,
      capacity: 12,
    },
  });

  const block3 = await prisma.scheduleBlock.create({
    data: {
      dayOfWeek: 'Wednesday',
      startTime: '08:00',
      endTime: '09:00',
      title: 'Box Clínico Kinesiología 2',
      instructor: 'Klga. Valeria Reyes',
      type: SlotType.KINE_BOX,
      capacity: 1,
    },
  });

  const block4 = await prisma.scheduleBlock.create({
    data: {
      dayOfWeek: 'Wednesday',
      startTime: '18:00',
      endTime: '19:00',
      title: 'Readaptación Funcional Grupal',
      instructor: 'Prof. Carlos Vega',
      type: SlotType.FUNCTIONAL,
      capacity: 10,
    },
  });

  // 4. Crear Reservas de Ejemplo (HU-03)
  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));

  await prisma.booking.create({
    data: {
      scheduleBlockId: block1.id,
      userId: juan.id,
      bookingDate: nextMonday,
    },
  });

  await prisma.booking.create({
    data: {
      scheduleBlockId: block2.id,
      userId: camila.id,
      bookingDate: nextMonday,
    },
  });

  // 5. Activity Log
  await prisma.activityLog.createMany({
    data: [
      { userName: 'Juan Perez', action: 'completó sesión kinésica (EVA: 3/10)' },
      { userName: 'Camila Gonzalez', action: 'reservó sesión en Box Clínico' },
      { userName: 'Matias Rojas', action: 'renovó Pack Kinesiología (8 ses)' },
    ],
  });

  console.log('✅ Seed completado con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
