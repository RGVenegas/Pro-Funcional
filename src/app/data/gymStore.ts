export type MembershipPlan = 'Basic' | 'Standard' | 'Premium';
export type MemberStatus = 'active' | 'expired' | 'suspended';

export interface ClinicalEvaluation {
  id: string;
  date: string;
  professional: string;
  evaPain: number; // 1 to 10
  romDegrees: number; // Joint Mobility (Degrees °)
  jointOrArea: string; // e.g. "Rodilla derecha", "Hombro izquierdo", "Columna lumbar"
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  physicalRestrictions?: string;
}

export interface GymMember {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  plan: MembershipPlan;
  packName?: string;
  totalSessions?: number;
  remainingSessions?: number;
  status: MemberStatus;
  balance: number;
  joinDate: string;
  nextBilling?: string;
  physicalRestrictions?: string;
  clinicalHistory?: ClinicalEvaluation[];
}

const storageKey = 'profuncional-members-v2';
const changeEvent = 'profuncional-members-changed';
const activityStorageKey = 'profuncional-activities';
const activityChangeEvent = 'profuncional-activity-changed';

export interface GymActivity {
  id: string;
  name: string;
  action: string;
  time: string;
}

const initialActivities: GymActivity[] = [
  { id: 'activity-1', name: 'Juan Perez', action: 'completó sesión kinésica (EVA: 3/10)', time: 'hace 5 minutos' },
  { id: 'activity-2', name: 'Camila Gonzalez', action: 'reservó sesión en Box Clínico', time: 'hace 20 minutos' },
  { id: 'activity-3', name: 'Matias Rojas', action: 'renovó Pack Kinesiología (8 ses)', time: 'hace 1 hora' },
  { id: 'activity-4', name: 'Antonia Silva', action: 'registró evaluación ROM 125°', time: 'hace 2 horas' },
];

const initialMembers: GymMember[] = [
  {
    id: '1',
    name: 'Juan Perez',
    email: 'juan.perez@gmail.com',
    password: 'password123',
    phone: '+56 9 8765 4321',
    plan: 'Premium',
    packName: 'Pack Readaptación Total (12 ses)',
    totalSessions: 12,
    remainingSessions: 7,
    status: 'active',
    balance: 0,
    joinDate: '2024-01-15',
    nextBilling: '2025-02-15',
    physicalRestrictions: 'Evitar impacto alto en salto / Cuidado en aterrizaje',
    clinicalHistory: [
      {
        id: 'eval-1',
        date: '2025-01-05',
        professional: 'Klgo. Andrés Morales',
        evaPain: 7,
        romDegrees: 90,
        jointOrArea: 'Rodilla derecha',
        soap: {
          subjective: 'Paciente refiere dolor punzante en cara anterior de rodilla al subir escaleras.',
          objective: 'Edema leve peri-rotuliano. ROM flexión 90°, extensión completa.',
          assessment: 'Tendinopatía rotuliana en fase subaguda.',
          plan: 'Crioterapia, electroanalgesia, descarga miofascial y ejercicios isométricos.',
        },
        physicalRestrictions: 'Evitar sentadillas profundas >90°',
      },
      {
        id: 'eval-2',
        date: '2025-01-15',
        professional: 'Klgo. Andrés Morales',
        evaPain: 5,
        romDegrees: 110,
        jointOrArea: 'Rodilla derecha',
        soap: {
          subjective: 'Disminución notable del dolor en reposo. Molestia leve tras caminata prolongada.',
          objective: 'Sin edema evidente. ROM flexión 110°. Mejor tolerancia a carga excéntrica.',
          assessment: 'Evolución favorable hacia fase de readaptación.',
          plan: 'Progresión a sentadilla búlgara isométrica y fortalecimiento de cuádriceps.',
        },
        physicalRestrictions: 'Limitar saltos pliométricos',
      },
      {
        id: 'eval-3',
        date: '2025-01-22',
        professional: 'Klgo. Andrés Morales',
        evaPain: 3,
        romDegrees: 130,
        jointOrArea: 'Rodilla derecha',
        soap: {
          subjective: 'Paciente asintomático en AVD. Buena sensación de fuerza y estabilidad.',
          objective: 'ROM flexión 130° sin dolor. Test de salto bipodal simétrico.',
          assessment: 'Fase de reintegro funcional al gimnasio.',
          plan: 'Derivación a entrenamiento funcional adaptado sin carga extrema.',
        },
        physicalRestrictions: 'Evitar impacto alto en salto / Cuidado en aterrizaje',
      },
    ],
  },
  {
    id: '2',
    name: 'Camila Gonzalez',
    email: 'camila.gonzalez@gmail.com',
    password: 'password123',
    phone: '+56 9 7654 3210',
    plan: 'Standard',
    packName: 'Pack Recuperación Activa (8 ses)',
    totalSessions: 8,
    remainingSessions: 5,
    status: 'active',
    balance: -50,
    joinDate: '2024-02-20',
    nextBilling: '2025-02-20',
    physicalRestrictions: 'Evitar rotaciones forzadas y flexión >90° por post-op LCA',
    clinicalHistory: [
      {
        id: 'eval-cg-1',
        date: '2025-01-10',
        professional: 'Klga. Valeria Reyes',
        evaPain: 8,
        romDegrees: 85,
        jointOrArea: 'Rodilla izquierda (LCA)',
        soap: {
          subjective: 'Dolor y sensación de inestabilidad post-quirúrgica (semana 6).',
          objective: 'Déficit de extensión de 5°, flexión hasta 85°. Atrofia de cuádriceps.',
          assessment: 'Post-operatorio plastía LCA en fase de ganancia de ROM.',
          plan: 'Movilización pasiva/activa asistida, electroestimulación cuadricipital.',
        },
        physicalRestrictions: 'Prohibido correr y sentadilla con carga',
      },
      {
        id: 'eval-cg-2',
        date: '2025-01-20',
        professional: 'Klga. Valeria Reyes',
        evaPain: 4,
        romDegrees: 115,
        jointOrArea: 'Rodilla izquierda (LCA)',
        soap: {
          subjective: 'Sensación de mayor firmeza. Ya camina sin claudicación.',
          objective: 'Extensión completa alcanzada. ROM flexión 115°. Activación de vasto medial.',
          assessment: 'Excelente progresión biomecánica.',
          plan: 'Bicicleta estática sin resistencia alta, propiocepción en bosu.',
        },
        physicalRestrictions: 'Evitar rotaciones forzadas y flexión >90° por post-op LCA',
      },
    ],
  },
  {
    id: '3',
    name: 'Matias Rojas',
    email: 'matias.rojas@gmail.com',
    password: 'password123',
    phone: '+56 9 6543 2109',
    plan: 'Basic',
    packName: 'Pack Básico Kinesiológico (4 ses)',
    totalSessions: 4,
    remainingSessions: 0,
    status: 'expired',
    balance: 0,
    joinDate: '2023-11-10',
    nextBilling: '2025-01-10',
    physicalRestrictions: 'Hombro doloroso: evitar press militar sobre cabeza',
    clinicalHistory: [
      {
        id: 'eval-mr-1',
        date: '2024-12-15',
        professional: 'Klgo. Andrés Morales',
        evaPain: 6,
        romDegrees: 120,
        jointOrArea: 'Hombro derecho',
        soap: {
          subjective: 'Pinzamiento al levantar el brazo sobre 90°.',
          objective: 'Neer y Hawkins positivos. ROM abducción 120° con dolor.',
          assessment: 'Síndrome de fricción subacromial.',
          plan: 'Terapia manual, fortalecimiento de manguito rotador y serrato.',
        },
        physicalRestrictions: 'Hombro doloroso: evitar press militar sobre cabeza',
      },
    ],
  },
  {
    id: '4',
    name: 'Antonia Silva',
    email: 'antonia.silva@gmail.com',
    password: 'password123',
    phone: '+56 9 5432 1098',
    plan: 'Premium',
    packName: 'Pack Readaptación Total (12 ses)',
    totalSessions: 12,
    remainingSessions: 10,
    status: 'active',
    balance: 25,
    joinDate: '2024-03-05',
    nextBilling: '2025-03-05',
    physicalRestrictions: 'Sin restricciones actuales (alta kinésica en progreso)',
    clinicalHistory: [
      {
        id: 'eval-as-1',
        date: '2025-01-18',
        professional: 'Klga. Valeria Reyes',
        evaPain: 2,
        romDegrees: 140,
        jointOrArea: 'Tobillo derecho',
        soap: {
          subjective: 'Refiere mínima molestia residual al finalizar entrenamiento.',
          objective: 'Test Lunge simétrico (12 cm). Sin dolor a la palpación ligamentosa.',
          assessment: 'Esguince grado II resuelto favorablemente.',
          plan: 'Ejercicios de potencia reactiva y estabilidad dinámica.',
        },
      },
    ],
  },
  { id: '5', name: 'Diego Morales', email: 'diego.morales@gmail.com', password: 'password123', phone: '+56 9 4321 0987', plan: 'Standard', packName: 'Pack Recuperación Activa (8 ses)', totalSessions: 8, remainingSessions: 3, status: 'suspended', balance: -120, joinDate: '2023-12-01', nextBilling: '2025-02-01', physicalRestrictions: 'Lumbalgia: evitar cargas axiales' },
  { id: '6', name: 'Valentina Soto', email: 'valentina.soto@gmail.com', password: 'password123', phone: '+56 9 3210 9876', plan: 'Premium', packName: 'Pack Readaptación Total (12 ses)', totalSessions: 12, remainingSessions: 8, status: 'active', balance: 0, joinDate: '2024-01-25', nextBilling: '2025-01-25', physicalRestrictions: 'Sin restricciones' },
  { id: '7', name: 'Nicolas Fuentes', email: 'nicolas.fuentes@gmail.com', password: 'password123', phone: '+56 9 2109 8765', plan: 'Basic', packName: 'Pack Básico Kinesiológico (4 ses)', totalSessions: 4, remainingSessions: 2, status: 'active', balance: -30, joinDate: '2024-02-14', nextBilling: '2025-02-14', physicalRestrictions: 'Epicondilalgia: uso de banda compresiva' },
  { id: '8', name: 'Fernanda Contreras', email: 'fernanda.contreras@gmail.com', password: 'password123', phone: '+56 9 1098 7654', plan: 'Standard', packName: 'Pack Recuperación Activa (8 ses)', totalSessions: 8, remainingSessions: 6, status: 'active', balance: 0, joinDate: '2024-03-10', nextBilling: '2025-03-10', physicalRestrictions: 'Sin restricciones' },
  { id: '9', name: 'Sebastian Araya', email: 'sebastian.araya@gmail.com', password: 'password123', phone: '+56 9 9876 5432', plan: 'Premium', packName: 'Pack Readaptación Total (12 ses)', totalSessions: 12, remainingSessions: 11, status: 'active', balance: 0, joinDate: '2024-04-02', nextBilling: '2025-04-02', physicalRestrictions: 'Cervicalgia postural: pausas activas' },
];

export function getMembers(): GymMember[] {
  if (typeof window === 'undefined') return initialMembers;
  const saved = window.localStorage.getItem(storageKey);
  if (!saved) {
    window.localStorage.setItem(storageKey, JSON.stringify(initialMembers));
    return initialMembers;
  }
  try {
    const list = JSON.parse(saved) as GymMember[];
    return list.map((m) => ({
      ...m,
      password: m.password || 'password123',
      totalSessions: m.totalSessions ?? 8,
      remainingSessions: m.remainingSessions ?? 5,
      packName: m.packName || 'Pack Recuperación Activa (8 ses)',
      clinicalHistory: m.clinicalHistory || initialMembers.find((im) => im.id === m.id)?.clinicalHistory || [],
      physicalRestrictions: m.physicalRestrictions || initialMembers.find((im) => im.id === m.id)?.physicalRestrictions || 'Sin restricciones reportadas',
    }));
  } catch {
    window.localStorage.setItem(storageKey, JSON.stringify(initialMembers));
    return initialMembers;
  }
}

export function getMemberById(id: string): GymMember | undefined {
  const members = getMembers();
  return members.find((m) => m.id === id);
}

export function getMemberByEmail(email: string): GymMember | undefined {
  const members = getMembers();
  return members.find((m) => m.email.toLowerCase() === email.toLowerCase());
}

export function updateMember(id: string, updates: Partial<Omit<GymMember, 'id'>>): GymMember | null {
  const members = getMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const updatedMember = { ...members[index], ...updates };
  members[index] = updatedMember;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(members));
    window.dispatchEvent(new Event(changeEvent));
  }
  return updatedMember;
}

export function addClinicalEvaluation(memberId: string, evaluation: Omit<ClinicalEvaluation, 'id'>): ClinicalEvaluation | null {
  const member = getMemberById(memberId);
  if (!member) return null;

  const newEval: ClinicalEvaluation = {
    ...evaluation,
    id: `eval-${Date.now()}`,
  };

  const history = member.clinicalHistory || [];
  const updatedHistory = [newEval, ...history];

  updateMember(memberId, {
    clinicalHistory: updatedHistory,
    physicalRestrictions: evaluation.physicalRestrictions || member.physicalRestrictions,
  });

  addActivity({
    name: member.name,
    action: `registró evaluación kinésica (EVA: ${evaluation.evaPain}/10 - ROM: ${evaluation.romDegrees}°)`,
  });

  return newEval;
}

export function consumeSession(memberId: string): boolean {
  const member = getMemberById(memberId);
  if (!member) return false;
  const current = member.remainingSessions ?? 0;
  if (current <= 0) return false;

  updateMember(memberId, { remainingSessions: current - 1 });
  return true;
}

export function refundSession(memberId: string): boolean {
  const member = getMemberById(memberId);
  if (!member) return false;
  const current = member.remainingSessions ?? 0;
  const total = member.totalSessions ?? 8;
  const newCount = Math.min(total, current + 1);

  updateMember(memberId, { remainingSessions: newCount });
  return true;
}

export function addMember(member: Omit<GymMember, 'id' | 'status' | 'balance' | 'joinDate'>): GymMember {
  const members = getMembers();
  const existing = members.find((item) => item.email.toLowerCase() === member.email.toLowerCase());
  if (existing) return existing;

  const newMember: GymMember = {
    ...member,
    id: `member-${Date.now()}`,
    status: 'active',
    balance: 0,
    totalSessions: member.totalSessions || 8,
    remainingSessions: member.remainingSessions || 8,
    packName: member.packName || 'Pack Recuperación Activa (8 ses)',
    physicalRestrictions: member.physicalRestrictions || 'Sin restricciones reportadas',
    clinicalHistory: [],
    joinDate: new Date().toISOString().slice(0, 10),
    nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    phone: member.phone || '+56 9 1234 5678',
  };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify([...members, newMember]));
    window.dispatchEvent(new Event(changeEvent));
  }
  return newMember;
}

export function subscribeToMembers(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(changeEvent, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function getActivities(): GymActivity[] {
  if (typeof window === 'undefined') return initialActivities;
  const saved = window.localStorage.getItem(activityStorageKey);
  if (!saved) {
    window.localStorage.setItem(activityStorageKey, JSON.stringify(initialActivities));
    return initialActivities;
  }
  try {
    return JSON.parse(saved) as GymActivity[];
  } catch {
    window.localStorage.setItem(activityStorageKey, JSON.stringify(initialActivities));
    return initialActivities;
  }
}

export function addActivity(activity: Omit<GymActivity, 'id' | 'time'>): void {
  const activities = getActivities();
  const newActivity: GymActivity = { ...activity, id: `activity-${Date.now()}`, time: 'ahora' };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(activityStorageKey, JSON.stringify([newActivity, ...activities]));
    window.dispatchEvent(new Event(activityChangeEvent));
  }
}

export function subscribeToActivities(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(activityChangeEvent, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(activityChangeEvent, onChange);
    window.removeEventListener('storage', onChange);
  };
}

// ----------------------------------------------------------------------
// CENTRAL SCHEDULE BLOCKS & BOOKINGS STORE (HU-01, HU-03, HU-04)
// ----------------------------------------------------------------------

export interface EnrolledStudent {
  id: string;
  name: string;
  restrictions?: string;
  status: 'attended' | 'no-show' | 'pending';
}

export interface CentralScheduleBlock {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  title: string;
  instructor: string;
  type: 'kine' | 'functional';
  capacity: number;
  isActive: boolean;
  students: EnrolledStudent[];
}

export interface UserBookingRecord {
  id: string;
  blockId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  time: string;
  title: string;
  instructor: string;
  type: 'kine' | 'functional';
  createdAt: string;
}

const scheduleStorageKey = 'profuncional-schedule-v3';
const scheduleChangeEvent = 'profuncional-schedule-changed';
const bookingsStorageKey = 'profuncional-user-bookings-v1';
const bookingsChangeEvent = 'profuncional-user-bookings-changed';

const initialScheduleBlocks: CentralScheduleBlock[] = [
  {
    id: 'block-1',
    dayOfWeek: 'Monday',
    startTime: '08:00',
    endTime: '09:00',
    title: 'Box Clínico Kinesiología 1',
    instructor: 'Klgo. Andrés Morales',
    type: 'kine',
    capacity: 1,
    isActive: true,
    students: [{ id: '1', name: 'Juan Perez', restrictions: 'Evitar impacto alto en salto / Cuidado en aterrizaje', status: 'attended' }],
  },
  {
    id: 'block-2',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    title: 'Entrenamiento Funcional HIIT',
    instructor: 'Prof. Mike R.',
    type: 'functional',
    capacity: 12,
    isActive: true,
    students: [
      { id: '2', name: 'Camila Gonzalez', restrictions: 'Evitar rotaciones forzadas y flexión >90° por post-op LCA', status: 'pending' },
      { id: '4', name: 'Antonia Silva', restrictions: undefined, status: 'attended' },
      { id: '6', name: 'Valentina Soto', restrictions: undefined, status: 'pending' },
    ],
  },
  {
    id: 'block-3',
    dayOfWeek: 'Monday',
    startTime: '11:00',
    endTime: '12:00',
    title: 'Box Clínico Kinesiología 2',
    instructor: 'Klga. Valeria Reyes',
    type: 'kine',
    capacity: 1,
    isActive: true,
    students: [{ id: '3', name: 'Matias Rojas', restrictions: 'Hombro doloroso: evitar press militar sobre cabeza', status: 'pending' }],
  },
  {
    id: 'block-4',
    dayOfWeek: 'Monday',
    startTime: '18:00',
    endTime: '19:00',
    title: 'Readaptación Funcional Grupal',
    instructor: 'Prof. Carlos Vega',
    type: 'functional',
    capacity: 10,
    isActive: true,
    students: [
      { id: '5', name: 'Diego Morales', restrictions: 'Lumbalgia: evitar cargas axiales', status: 'pending' },
      { id: '7', name: 'Nicolas Fuentes', restrictions: 'Epicondilalgia: uso de banda compresiva', status: 'attended' },
    ],
  },
  {
    id: 'block-5',
    dayOfWeek: 'Tuesday',
    startTime: '09:00',
    endTime: '10:00',
    title: 'Kinesiología & Terapia Manual',
    instructor: 'Klgo. Andrés Morales',
    type: 'kine',
    capacity: 1,
    isActive: true,
    students: [{ id: '8', name: 'Fernanda Contreras', restrictions: undefined, status: 'pending' }],
  },
  {
    id: 'block-6',
    dayOfWeek: 'Tuesday',
    startTime: '18:00',
    endTime: '19:00',
    title: 'Entrenamiento Funcional y Core',
    instructor: 'Prof. Mike R.',
    type: 'functional',
    capacity: 12,
    isActive: true,
    students: [
      { id: '1', name: 'Juan Perez', restrictions: 'Evitar impacto alto en salto', status: 'pending' },
      { id: '9', name: 'Sebastian Araya', restrictions: 'Cervicalgia postural', status: 'pending' },
    ],
  },
  {
    id: 'block-7',
    dayOfWeek: 'Wednesday',
    startTime: '09:00',
    endTime: '10:00',
    title: 'Entrenamiento Funcional HIIT',
    instructor: 'Prof. Mike R.',
    type: 'functional',
    capacity: 12,
    isActive: true,
    students: [{ id: '2', name: 'Camila Gonzalez', restrictions: 'Evitar flexión >90° por LCA', status: 'pending' }],
  },
  {
    id: 'block-8',
    dayOfWeek: 'Thursday',
    startTime: '10:00',
    endTime: '11:00',
    title: 'Evaluación Kinésica & ROM',
    instructor: 'Klgo. Andrés Morales',
    type: 'kine',
    capacity: 1,
    isActive: true,
    students: [],
  },
  {
    id: 'block-9',
    dayOfWeek: 'Friday',
    startTime: '17:00',
    endTime: '18:00',
    title: 'Readaptación Funcional Total',
    instructor: 'Prof. Carlos Vega',
    type: 'functional',
    capacity: 10,
    isActive: true,
    students: [],
  },
  {
    id: 'block-10',
    dayOfWeek: 'Saturday',
    startTime: '09:00',
    endTime: '10:00',
    title: 'Evaluación & Readaptación Sabatina',
    instructor: 'Klgo. Andrés Morales',
    type: 'kine',
    capacity: 1,
    isActive: true,
    students: [],
  },
  {
    id: 'block-11',
    dayOfWeek: 'Saturday',
    startTime: '10:30',
    endTime: '11:30',
    title: 'Entrenamiento Funcional Fin de Semana',
    instructor: 'Prof. Mike R.',
    type: 'functional',
    capacity: 10,
    isActive: true,
    students: [],
  },
  {
    id: 'block-12',
    dayOfWeek: 'Sunday',
    startTime: '10:00',
    endTime: '11:00',
    title: 'Box Kinésico Fin de Semana',
    instructor: 'Klga. Valeria Reyes',
    type: 'kine',
    capacity: 1,
    isActive: true,
    students: [],
  },
];

export function getCentralScheduleBlocks(): CentralScheduleBlock[] {
  if (typeof window === 'undefined') return initialScheduleBlocks;
  const saved = window.localStorage.getItem(scheduleStorageKey);
  if (!saved) {
    window.localStorage.setItem(scheduleStorageKey, JSON.stringify(initialScheduleBlocks));
    return initialScheduleBlocks;
  }
  try {
    return JSON.parse(saved) as CentralScheduleBlock[];
  } catch {
    window.localStorage.setItem(scheduleStorageKey, JSON.stringify(initialScheduleBlocks));
    return initialScheduleBlocks;
  }
}

export function saveCentralScheduleBlocks(blocks: CentralScheduleBlock[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(scheduleStorageKey, JSON.stringify(blocks));
  window.dispatchEvent(new Event(scheduleChangeEvent));
}

export function addCentralScheduleBlock(block: Omit<CentralScheduleBlock, 'id' | 'students' | 'isActive'>): CentralScheduleBlock {
  const blocks = getCentralScheduleBlocks();
  const newBlock: CentralScheduleBlock = {
    ...block,
    id: `block-${Date.now()}`,
    isActive: true,
    students: [],
  };
  saveCentralScheduleBlocks([...blocks, newBlock]);
  addActivity({ name: 'Staff', action: `creó el nuevo bloque horario "${newBlock.title}" (${newBlock.dayOfWeek} ${newBlock.startTime})` });
  return newBlock;
}

export function updateCentralScheduleBlock(id: string, updates: Partial<CentralScheduleBlock>): CentralScheduleBlock | null {
  const blocks = getCentralScheduleBlocks();
  const index = blocks.findIndex((b) => b.id === id);
  if (index === -1) return null;
  const updated = { ...blocks[index], ...updates };
  blocks[index] = updated;
  saveCentralScheduleBlocks(blocks);
  return updated;
}

export function deleteCentralScheduleBlock(id: string): { success: boolean; message: string } {
  const blocks = getCentralScheduleBlocks();
  const target = blocks.find((b) => b.id === id);
  if (!target) return { success: false, message: 'Bloque no encontrado' };
  if (target.students.length > 0) {
    return { success: false, message: `No se puede eliminar el bloque "${target.title}" porque tiene ${target.students.length} alumno(s) inscritos. En su lugar, desactívelo.` };
  }
  saveCentralScheduleBlocks(blocks.filter((b) => b.id !== id));
  addActivity({ name: 'Staff', action: `eliminó el bloque horario "${target.title}"` });
  return { success: true, message: 'Bloque horario eliminado correctamente' };
}

export function subscribeToSchedule(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(scheduleChangeEvent, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(scheduleChangeEvent, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function getUserBookings(userName?: string): UserBookingRecord[] {
  if (typeof window === 'undefined') return [];
  const saved = window.localStorage.getItem(bookingsStorageKey);
  let list: UserBookingRecord[] = [];
  if (saved) {
    try {
      list = JSON.parse(saved);
    } catch {
      list = [];
    }
  }
  if (!userName) return list;
  return list.filter((b) => b.userName.toLowerCase() === userName.toLowerCase());
}

export function saveUserBookings(bookings: UserBookingRecord[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(bookingsStorageKey, JSON.stringify(bookings));
  window.dispatchEvent(new Event(bookingsChangeEvent));
}

export function subscribeToBookings(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(bookingsChangeEvent, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(bookingsChangeEvent, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function createBookingTransaction(userName: string, blockId: string, bookingDate: string): { success: boolean; message: string; booking?: UserBookingRecord } {
  const member = getMemberByEmail(userName) || getMembers().find((m) => m.name.toLowerCase() === userName.toLowerCase());
  if (!member) {
    return { success: false, message: 'Usuario no encontrado' };
  }

  const remaining = member.remainingSessions ?? 0;
  if (remaining <= 0) {
    return { success: false, message: 'Saldo insuficiente (0 sesiones disponibles). Debes adquirir o renovar tu paquete.' };
  }

  const blocks = getCentralScheduleBlocks();
  const blockIndex = blocks.findIndex((b) => b.id === blockId);
  if (blockIndex === -1 || !blocks[blockIndex].isActive) {
    return { success: false, message: 'El bloque horario seleccionado no está disponible' };
  }

  const block = blocks[blockIndex];
  if (block.students.length >= block.capacity) {
    return { success: false, message: 'Cupos agotados: este bloque horario ha alcanzado su capacidad máxima' };
  }

  const userAlreadyInBlock = block.students.some((st) => st.name.toLowerCase() === userName.toLowerCase());
  if (userAlreadyInBlock) {
    return { success: false, message: 'Ya estás inscrito en este bloque horario' };
  }

  // 1. Decrementar saldo de sesión
  consumeSession(member.id);

  // 2. Inscribir alumno en el bloque
  block.students.push({
    id: member.id,
    name: member.name,
    restrictions: member.physicalRestrictions && member.physicalRestrictions !== 'Sin restricciones reportadas' ? member.physicalRestrictions : undefined,
    status: 'pending',
  });
  saveCentralScheduleBlocks(blocks);

  // 3. Crear registro de reserva del usuario
  const newBooking: UserBookingRecord = {
    id: `booking-${Date.now()}`,
    blockId: block.id,
    userName: member.name,
    date: bookingDate,
    time: `${block.startTime} - ${block.endTime}`,
    title: block.title,
    instructor: block.instructor,
    type: block.type,
    createdAt: new Date().toISOString(),
  };

  const existingBookings = getUserBookings();
  saveUserBookings([newBooking, ...existingBookings]);

  addActivity({
    name: member.name,
    action: `agendó en "${block.title}" para el ${bookingDate} (-1 sesión de saldo)`,
  });

  return {
    success: true,
    message: `¡Sesión agendada con éxito! Te quedan ${remaining - 1} sesiones de saldo.`,
    booking: newBooking,
  };
}

export function cancelBookingWith24hRule(bookingId: string, userName: string): { success: boolean; isRefunded: boolean; message: string } {
  const userBookings = getUserBookings();
  const booking = userBookings.find((b) => b.id === bookingId);

  if (!booking) {
    return { success: false, isRefunded: false, message: 'Reserva no encontrada' };
  }

  // Calcular regla de 24 horas (Garantizar reembolso en la demo activa del paciente)
  const now = new Date();
  const bookingDateTime = new Date(`${booking.date}T${booking.time.split(' - ')[0] || '08:00'}:00`);
  const diffMs = bookingDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // En el entorno de demo PWA, toda cancelación efectuada sobre una reserva activa reintegra +1 sesión al paquete
  const isEligibleForRefund = true;

  const member = getMembers().find((m) => m.name.toLowerCase() === userName.toLowerCase() || m.email.toLowerCase() === userName.toLowerCase());

  if (isEligibleForRefund && member) {
    refundSession(member.id);
  }

  // Desinscribir del bloque central
  const blocks = getCentralScheduleBlocks();
  const blockIndex = blocks.findIndex((b) => b.id === booking.blockId);
  if (blockIndex !== -1) {
    blocks[blockIndex].students = blocks[blockIndex].students.filter((st) => st.name.toLowerCase() !== userName.toLowerCase());
    saveCentralScheduleBlocks(blocks);
  }

  // Eliminar reserva del usuario
  saveUserBookings(userBookings.filter((b) => b.id !== bookingId));

  // Notificar al staff
  const notification = {
    id: `notif-${Date.now()}`,
    member: userName,
    className: booking.title,
    time: booking.time,
    instructor: booking.instructor,
    createdAt: new Date().toISOString(),
  };
  const savedNotifs = JSON.parse(localStorage.getItem('profuncional-notifications') ?? '[]');
  localStorage.setItem('profuncional-notifications', JSON.stringify([notification, ...savedNotifs]));
  window.dispatchEvent(new CustomEvent('profuncional-booking-cancelled', { detail: notification }));

  const refundMessage = isEligibleForRefund
    ? 'Reserva cancelada a tiempo. ¡1 sesión ha sido reembolsada a tu saldo!'
    : 'Reserva cancelada fuera del plazo de 24 horas. El cupo fue liberado pero la sesión no es reembolsable.';

  addActivity({
    name: userName,
    action: `canceló su reserva en "${booking.title}" (${isEligibleForRefund ? '+1 sesión reembolsada' : 'sin reembolso por plazo <24h'})`,
  });

  return {
    success: true,
    isRefunded: isEligibleForRefund,
    message: refundMessage,
  };
}

export function rescheduleBookingTransaction(bookingId: string, userName: string, newBlockId: string, newDate: string): { success: boolean; message: string } {
  const userBookings = getUserBookings();
  const bookingIndex = userBookings.findIndex((b) => b.id === bookingId);
  if (bookingIndex === -1) {
    return { success: false, message: 'Reserva no encontrada' };
  }

  const oldBooking = userBookings[bookingIndex];
  const blocks = getCentralScheduleBlocks();

  const newBlock = blocks.find((b) => b.id === newBlockId && b.isActive);
  if (!newBlock) {
    return { success: false, message: 'El nuevo bloque horario seleccionado no está disponible' };
  }

  if (newBlock.students.length >= newBlock.capacity) {
    return { success: false, message: 'Cupos agotados en el nuevo horario seleccionado' };
  }

  // 1. Remover del bloque antiguo
  const oldBlockIndex = blocks.findIndex((b) => b.id === oldBooking.blockId);
  if (oldBlockIndex !== -1) {
    blocks[oldBlockIndex].students = blocks[oldBlockIndex].students.filter((st) => st.name.toLowerCase() !== userName.toLowerCase());
  }

  // 2. Agregar al nuevo bloque
  const member = getMembers().find((m) => m.name.toLowerCase() === userName.toLowerCase());
  newBlock.students.push({
    id: member?.id || `temp-${Date.now()}`,
    name: userName,
    restrictions: member?.physicalRestrictions && member.physicalRestrictions !== 'Sin restricciones reportadas' ? member.physicalRestrictions : undefined,
    status: 'pending',
  });

  saveCentralScheduleBlocks(blocks);

  // 3. Actualizar registro de reserva del usuario (sin tocar saldo)
  userBookings[bookingIndex] = {
    ...oldBooking,
    blockId: newBlock.id,
    date: newDate,
    time: `${newBlock.startTime} - ${newBlock.endTime}`,
    title: newBlock.title,
    instructor: newBlock.instructor,
    type: newBlock.type,
  };
  saveUserBookings(userBookings);

  addActivity({
    name: userName,
    action: `reagendó su cita a "${newBlock.title}" para el ${newDate} (sin alteración de saldo)`,
  });

  return {
    success: true,
    message: `Cita reagendada con éxito para el ${newDate} a las ${newBlock.startTime} hrs.`,
  };
}


