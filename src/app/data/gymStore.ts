import { today, appointmentTime, BOOKING_NOTICE_HOURS, dayNames } from './dates';
import { apiEnabled, serverSnapshot } from './api';
import type { CareProfile } from './careStore';
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
  care?: CareProfile;
  notes?: Array<{ date: string; author: string; text: string }>;
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
    name: 'Camila Fernández',
    email: 'camila.fernandez@gmail.com',
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
    id: '2-alias',
    name: 'Camila Fernández',
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
    clinicalHistory: [],
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
    remainingSessions: 2,
    status: 'active',
    balance: 0,
    joinDate: '2024-01-15',
    nextBilling: '2025-02-15',
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
  { id: '10', name: 'Pablo Loncón', email: 'pablito.loncon@gmail.com', password: 'password123', phone: '+56 9 8888 7777', plan: 'Standard', packName: 'Pack Recuperación Activa (8 ses)', totalSessions: 8, remainingSessions: 8, status: 'active', balance: 0, joinDate: '2025-01-20', nextBilling: '2025-02-20', physicalRestrictions: 'Sin restricciones' },
];

export function getMembers(): GymMember[] {
  const map = new Map<string, GymMember>();

  // 1. Load initial demo members as base
  for (const m of initialMembers) {
    const key = m.email ? m.email.toLowerCase() : m.id;
    map.set(key, m);
  }

  // 2. Merge local storage if saved
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const savedList = JSON.parse(saved) as GymMember[];
        for (const m of savedList) {
          const key = m.email ? m.email.toLowerCase() : m.id;
          const existing = map.get(key);
          if (existing) {
            map.set(key, { ...existing, ...m });
          } else {
            map.set(key, m);
          }
        }
      } catch {
        // ignore parse errors
      }
    }
  }

  // Ensure camila.fernandez@gmail.com is present in map
  if (!map.has('camila.fernandez@gmail.com')) {
    const camilaFernandez: GymMember = {
      id: '2',
      name: 'Camila Fernández',
      email: 'camila.fernandez@gmail.com',
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
      clinicalHistory: [],
    };
    map.set('camila.fernandez@gmail.com', camilaFernandez);
  }

  // 3. Merge server snapshot members if available
  if (apiEnabled && serverSnapshot.members && serverSnapshot.members.length > 0) {
    for (const serverMember of serverSnapshot.members as GymMember[]) {
      const key = serverMember.email ? serverMember.email.toLowerCase() : serverMember.id;
      const existing = map.get(key);
      if (existing) {
        map.set(key, { ...existing, ...serverMember });
      } else {
        map.set(key, serverMember);
      }
    }
  }

  const list = Array.from(map.values());

  return list.map((m) => ({
    ...m,
    password: m.password || 'password123',
    totalSessions: m.totalSessions ?? 8,
    remainingSessions: m.remainingSessions ?? 5,
    packName: m.packName || 'Pack Recuperación Activa (8 ses)',
    clinicalHistory: [...(m.clinicalHistory || [])].sort((a, b) => b.date.localeCompare(a.date)),
    physicalRestrictions: m.physicalRestrictions ?? 'Sin restricciones reportadas',
  }));
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
    physicalRestrictions: evaluation.physicalRestrictions ?? member.physicalRestrictions,
    care: member.care?.routine ? { ...member.care, routine: { ...member.care.routine, status: 'draft', approvedAt: undefined, approvedBy: undefined } } : member.care,
  });

  addActivity({
    name: member.name,
    action: `registró evaluación kinésica (EVA: ${evaluation.evaPain}/10 - ROM: ${evaluation.romDegrees}°)`,
  });

  return newEval;
}

export function updateClinicalEvaluation(
  memberId: string,
  evalId: string,
  updates: Partial<Omit<ClinicalEvaluation, 'id'>>
): ClinicalEvaluation | null {
  const member = getMemberById(memberId);
  if (!member || !member.clinicalHistory) return null;

  const index = member.clinicalHistory.findIndex((e) => e.id === evalId);
  if (index === -1) return null;

  const currentEval = member.clinicalHistory[index];
  const updatedEval: ClinicalEvaluation = {
    ...currentEval,
    ...updates,
    soap: updates.soap
      ? { ...currentEval.soap, ...updates.soap }
      : currentEval.soap,
  };

  const updatedHistory = [...member.clinicalHistory];
  updatedHistory[index] = updatedEval;

  updateMember(memberId, {
    clinicalHistory: updatedHistory,
    physicalRestrictions: updates.physicalRestrictions !== undefined ? updates.physicalRestrictions : member.physicalRestrictions,
  });

  addActivity({
    name: member.name,
    action: `actualizó evaluación kinésica de ${updatedEval.jointOrArea} (EVA: ${updatedEval.evaPain}/10 - ROM: ${updatedEval.romDegrees}°)`,
  });

  return updatedEval;
}

export function deleteClinicalEvaluation(memberId: string, evalId: string): boolean {
  const member = getMemberById(memberId);
  if (!member || !member.clinicalHistory) return false;

  const updatedHistory = member.clinicalHistory.filter((e) => e.id !== evalId);
  updateMember(memberId, { clinicalHistory: updatedHistory });

  addActivity({
    name: member.name,
    action: `eliminó una evaluación kinésica`,
  });

  return true;
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
    remainingSessions: member.remainingSessions ?? 8,
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
  if (apiEnabled && serverSnapshot.activities && serverSnapshot.activities.length > 0) return serverSnapshot.activities;
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
  bookingId?: string;
  confirmedAt?: string;
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
  memberId?: string;
  status?: 'pending' | 'attended' | 'no-show' | 'cancelled';
  confirmedAt?: string;
  isRefunded?: boolean;
}

const scheduleStorageKey = 'profuncional-schedule-v6';
const scheduleChangeEvent = 'profuncional-schedule-changed';
const bookingsStorageKey = 'profuncional-user-bookings-v1';
const bookingsChangeEvent = 'profuncional-user-bookings-changed';

const initialScheduleBlocks: CentralScheduleBlock[] = [
  // LUNES
  { id: 'block-1', dayOfWeek: 'Monday', startTime: '08:00', endTime: '09:00', title: 'Entrenamiento Funcional AM', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [{ id: '1', name: 'Juan Perez', restrictions: 'Evitar impacto alto en salto', status: 'attended' }] },
  { id: 'block-2', dayOfWeek: 'Monday', startTime: '09:15', endTime: '10:15', title: 'Box Kinésico & Readaptación', instructor: 'Klgo. Andrés Morales', type: 'kine', capacity: 1, isActive: true, students: [] },
  { id: 'block-3', dayOfWeek: 'Monday', startTime: '10:30', endTime: '11:30', title: 'Entrenamiento Funcional Estaciones', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-4', dayOfWeek: 'Monday', startTime: '11:45', endTime: '12:45', title: 'Funcional Adaptado AM', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-5', dayOfWeek: 'Monday', startTime: '15:00', endTime: '16:00', title: 'Entrenamiento Funcional PM', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-6', dayOfWeek: 'Monday', startTime: '16:15', endTime: '17:15', title: 'Funcional & Control Motor', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-7', dayOfWeek: 'Monday', startTime: '17:30', endTime: '18:30', title: 'Circuitos Funcionales Grupal', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [{ id: '2', name: 'Camila Gonzalez', restrictions: 'Evitar rotaciones forzadas y flexión >90° por post-op LCA', status: 'pending' }] },
  { id: 'block-8', dayOfWeek: 'Monday', startTime: '18:45', endTime: '19:45', title: 'Entrenamiento Funcional HIIT', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [{ id: '4', name: 'Antonia Silva', restrictions: undefined, status: 'attended' }] },
  { id: 'block-9', dayOfWeek: 'Monday', startTime: '20:00', endTime: '21:00', title: 'Funcional Cierre PM', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },

  // MARTES
  { id: 'block-10', dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '09:00', title: 'Entrenamiento Funcional AM', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-11', dayOfWeek: 'Tuesday', startTime: '09:15', endTime: '10:15', title: 'Kinesiología & Terapia Manual', instructor: 'Klga. Valeria Reyes', type: 'kine', capacity: 1, isActive: true, students: [{ id: '8', name: 'Fernanda Contreras', restrictions: undefined, status: 'pending' }] },
  { id: 'block-12', dayOfWeek: 'Tuesday', startTime: '10:30', endTime: '11:30', title: 'Funcional & Core AM', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-13', dayOfWeek: 'Tuesday', startTime: '11:45', endTime: '12:45', title: 'Funcional Estaciones AM', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-14', dayOfWeek: 'Tuesday', startTime: '15:00', endTime: '16:00', title: 'Funcional Readaptación PM', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-15', dayOfWeek: 'Tuesday', startTime: '16:15', endTime: '17:15', title: 'Circuitos Funcionales PM', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-16', dayOfWeek: 'Tuesday', startTime: '17:30', endTime: '18:30', title: 'Entrenamiento Funcional HIIT', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-17', dayOfWeek: 'Tuesday', startTime: '18:45', endTime: '19:45', title: 'Funcional & Movilidad PM', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-18', dayOfWeek: 'Tuesday', startTime: '20:00', endTime: '21:00', title: 'Funcional Nocturno PM', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },

  // MIÉRCOLES
  { id: 'block-19', dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '09:00', title: 'Entrenamiento Funcional AM', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-20', dayOfWeek: 'Wednesday', startTime: '09:15', endTime: '10:15', title: 'Circuitos Funcionales AM', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [{ id: '2', name: 'Camila Gonzalez', restrictions: 'Evitar flexión >90° por LCA', status: 'pending' }] },
  { id: 'block-21', dayOfWeek: 'Wednesday', startTime: '10:30', endTime: '11:30', title: 'Box Kinésico Evaluación', instructor: 'Klgo. Andrés Morales', type: 'kine', capacity: 1, isActive: true, students: [] },
  { id: 'block-22', dayOfWeek: 'Wednesday', startTime: '11:45', endTime: '12:45', title: 'Funcional Estaciones AM', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-23', dayOfWeek: 'Wednesday', startTime: '15:00', endTime: '16:00', title: 'Funcional & Resistencia PM', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-24', dayOfWeek: 'Wednesday', startTime: '16:15', endTime: '17:15', title: 'Circuitos Estaciones PM', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-25', dayOfWeek: 'Wednesday', startTime: '17:30', endTime: '18:30', title: 'Funcional & Control Motor', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-26', dayOfWeek: 'Wednesday', startTime: '18:45', endTime: '19:45', title: 'Entrenamiento Funcional Core', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-27', dayOfWeek: 'Wednesday', startTime: '20:00', endTime: '21:00', title: 'Funcional Nocturno PM', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },

  // JUEVES
  { id: 'block-28', dayOfWeek: 'Thursday', startTime: '08:00', endTime: '09:00', title: 'Entrenamiento Funcional AM', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-29', dayOfWeek: 'Thursday', startTime: '09:15', endTime: '10:15', title: 'Circuitos Funcionales AM', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-30', dayOfWeek: 'Thursday', startTime: '10:30', endTime: '11:30', title: 'Evaluación Kinésica & ROM', instructor: 'Klgo. Andrés Morales', type: 'kine', capacity: 1, isActive: true, students: [] },
  { id: 'block-31', dayOfWeek: 'Thursday', startTime: '11:45', endTime: '12:45', title: 'Funcional Carga Progresiva', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-32', dayOfWeek: 'Thursday', startTime: '15:00', endTime: '16:00', title: 'Funcional Estaciones PM', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-33', dayOfWeek: 'Thursday', startTime: '16:15', endTime: '17:15', title: 'Entrenamiento Funcional PM', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-34', dayOfWeek: 'Thursday', startTime: '17:30', endTime: '18:30', title: 'Funcional & Movilidad PM', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-35', dayOfWeek: 'Thursday', startTime: '18:45', endTime: '19:45', title: 'Entrenamiento Funcional HIIT', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-36', dayOfWeek: 'Thursday', startTime: '20:00', endTime: '21:00', title: 'Funcional Cierre PM', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },

  // VIERNES
  { id: 'block-37', dayOfWeek: 'Friday', startTime: '08:00', endTime: '09:00', title: 'Kinesiología Preventiva', instructor: 'Klga. Valeria Reyes', type: 'kine', capacity: 1, isActive: true, students: [] },
  { id: 'block-38', dayOfWeek: 'Friday', startTime: '09:15', endTime: '10:15', title: 'Entrenamiento Funcional AM', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-39', dayOfWeek: 'Friday', startTime: '10:30', endTime: '11:30', title: 'Circuitos Estaciones AM', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-40', dayOfWeek: 'Friday', startTime: '11:45', endTime: '12:45', title: 'Funcional Adaptado AM', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-41', dayOfWeek: 'Friday', startTime: '15:00', endTime: '16:00', title: 'Readaptación Funcional Total', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-42', dayOfWeek: 'Friday', startTime: '16:15', endTime: '17:15', title: 'Funcional & Core PM', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-43', dayOfWeek: 'Friday', startTime: '17:30', endTime: '18:30', title: 'Circuitos Funcionales PM', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-44', dayOfWeek: 'Friday', startTime: '18:45', endTime: '19:45', title: 'Entrenamiento Funcional HIIT', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-45', dayOfWeek: 'Friday', startTime: '20:00', endTime: '21:00', title: 'Funcional Nocturno PM', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },

  // SÁBADO (08:00 - 14:00)
  { id: 'block-46', dayOfWeek: 'Saturday', startTime: '08:00', endTime: '09:00', title: 'Funcional Matinal Sabatino', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-47', dayOfWeek: 'Saturday', startTime: '09:15', endTime: '10:15', title: 'Evaluación & Readaptación', instructor: 'Klgo. Andrés Morales', type: 'kine', capacity: 1, isActive: true, students: [] },
  { id: 'block-48', dayOfWeek: 'Saturday', startTime: '10:30', endTime: '11:30', title: 'Entrenamiento Funcional Fin de Semana', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-49', dayOfWeek: 'Saturday', startTime: '11:45', endTime: '12:45', title: 'Circuitos Estaciones Sabatino', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },

  // DOMINGO (09:00 - 13:00)
  { id: 'block-50', dayOfWeek: 'Sunday', startTime: '09:15', endTime: '10:15', title: 'Box Kinésico Dominical', instructor: 'Klgo. Andrés Morales', type: 'kine', capacity: 1, isActive: true, students: [] },
  { id: 'block-51', dayOfWeek: 'Sunday', startTime: '10:30', endTime: '11:30', title: 'Movilidad & Recuperación Guiada', instructor: 'Prof. Mike R.', type: 'functional', capacity: 8, isActive: true, students: [] },
  { id: 'block-52', dayOfWeek: 'Sunday', startTime: '11:45', endTime: '12:45', title: 'Funcional Dominical Estaciones', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 8, isActive: true, students: [] },
];

export function getCentralScheduleBlocks(): CentralScheduleBlock[] {
  const map = new Map<string, CentralScheduleBlock>();

  // 1. Base initial schedule blocks (covers Monday through Sunday)
  for (const b of initialScheduleBlocks) {
    const key = `${b.dayOfWeek}-${b.startTime}-${b.title}`;
    map.set(key, b);
  }

  // 2. Merge local storage saved blocks if available
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(scheduleStorageKey);
    if (saved) {
      try {
        const savedList = JSON.parse(saved) as CentralScheduleBlock[];
        for (const b of savedList) {
          const key = `${b.dayOfWeek}-${b.startTime}-${b.title}`;
          const existing = map.get(key);
          if (existing) {
            map.set(key, { ...existing, ...b });
          } else {
            map.set(key, b);
          }
        }
      } catch {
        // ignore parse error
      }
    }
  }

  // 3. Merge server snapshot blocks if available
  if (apiEnabled && serverSnapshot.blocks && serverSnapshot.blocks.length > 0) {
    for (const serverBlock of serverSnapshot.blocks as CentralScheduleBlock[]) {
      const key = `${serverBlock.dayOfWeek}-${serverBlock.startTime}-${serverBlock.title}`;
      const existing = map.get(key);
      if (existing) {
        map.set(key, { ...existing, ...serverBlock });
      } else {
        map.set(key, serverBlock);
      }
    }
  }

  return Array.from(map.values());
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
    id: crypto.randomUUID(),
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
  const map = new Map<string, UserBookingRecord>();

  // 1. Load local storage bookings
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(bookingsStorageKey);
    if (saved) {
      try {
        const savedList = JSON.parse(saved) as UserBookingRecord[];
        for (const b of savedList) {
          const key = b.id || `${b.blockId}-${b.date}-${b.userName}`;
          map.set(key, b);
        }
      } catch {
        // ignore parse error
      }
    }
  }

  // 2. Merge server snapshot bookings if available
  if (apiEnabled && serverSnapshot.bookings && serverSnapshot.bookings.length > 0) {
    for (const serverBooking of serverSnapshot.bookings as UserBookingRecord[]) {
      const key = serverBooking.id || `${serverBooking.blockId}-${serverBooking.date}-${serverBooking.userName}`;
      const existing = map.get(key);
      if (existing) {
        map.set(key, { ...existing, ...serverBooking });
      } else {
        map.set(key, serverBooking);
      }
    }
  }

  const list = Array.from(map.values());
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


export function bookingsForSlot(blockId: string, date: string): UserBookingRecord[] {
  return getUserBookings().filter(b => b.blockId === blockId && b.date === date && b.status !== 'cancelled');
}
export function studentsForSlot(blockId: string, date: string): EnrolledStudent[] {
  return bookingsForSlot(blockId, date).map(b => ({ id: b.memberId || getMembers().find(m => m.name === b.userName)?.id || b.userName, name: b.userName, bookingId: b.id, confirmedAt: b.confirmedAt, status: b.status === 'attended' || b.status === 'no-show' ? b.status : 'pending', restrictions: getMembers().find(m => m.id === b.memberId || m.name === b.userName)?.physicalRestrictions }));
}
export function bookingStart(b: UserBookingRecord): number { return appointmentTime(b.date, b.time.split(' - ')[0]); }
function resolveMember(identity: string) { return getMembers().find(m => m.id === identity || m.email.toLowerCase() === identity.toLowerCase() || m.name.toLowerCase() === identity.toLowerCase()); }
function owns(b: UserBookingRecord, identity: string) { const m = resolveMember(identity); return m && (b.memberId ? b.memberId === m.id : b.userName === m.name); }
function validateSlot(member: GymMember, blockId: string, date: string, exceptId?: string): string | undefined {
  const block = getCentralScheduleBlocks().find(b => b.id === blockId && b.isActive);
  if (!block) return 'El horario no está disponible.';
  if (member.status !== 'active') return 'Tu membresía no está activa. Contacta al centro.';
  const start = appointmentTime(date, block.startTime);
  if (!Number.isFinite(start) || start <= Date.now()) return 'Selecciona una fecha y hora futuras válidas.';
  if (dayNames[new Date(date + 'T12:00:00Z').getUTCDay()] !== block.dayOfWeek) return 'La fecha no corresponde al día de este horario.';
  const reservations = getUserBookings().filter(b => b.id !== exceptId && b.status !== 'cancelled');
  if (reservations.filter(b => b.blockId === blockId && b.date === date).length >= block.capacity) return 'Cupos agotados en esta fecha.';
  const end = appointmentTime(date, block.endTime);
  if (reservations.some(b => owns(b, member.id) && b.date === date && bookingStart(b) < end && appointmentTime(b.date, b.time.split(' - ')[1]) > start)) return 'Ya tienes una reserva que coincide con este horario.';
}
export function createBookingTransaction(identity: string, blockId: string, date: string) {
  const member = resolveMember(identity);
  if (!member) return { success: false, message: 'Alumno no encontrado.' };
  const error = validateSlot(member, blockId, date);
  if (error) return { success: false, message: error };
  if ((member.remainingSessions ?? 0) < 1) return { success: false, message: 'No tienes sesiones disponibles.' };
  const block = getCentralScheduleBlocks().find(b => b.id === blockId)!;
  const booking: UserBookingRecord = { id: crypto.randomUUID(), memberId: member.id, userName: member.name, blockId, date, time: block.startTime + ' - ' + block.endTime, title: block.title, instructor: block.instructor, type: block.type, createdAt: new Date().toISOString(), status: 'pending' };
  saveUserBookings([booking, ...getUserBookings()]);
  consumeSession(member.id);
  window.dispatchEvent(new Event(scheduleChangeEvent));
  return { success: true, message: 'Sesión reservada. Se descontó una sesión de tu saldo.', booking };
}
export function cancelBookingWith24hRule(id: string, identity: string) {
  const all = getUserBookings();
  const booking = all.find(b => b.id === id);
  if (!booking || !owns(booking, identity) || (booking.status && booking.status !== 'pending') || bookingStart(booking) <= Date.now()) return { success: false, isRefunded: false, message: 'Solo puedes cancelar una reserva propia, pendiente y futura.' };
  const isRefunded = bookingStart(booking) - Date.now() >= BOOKING_NOTICE_HOURS * 3600000;
  saveUserBookings(all.map(b => b.id === id ? { ...b, status: 'cancelled', isRefunded } : b));
  if (isRefunded) refundSession(resolveMember(identity)!.id);
  const notification = { id: crypto.randomUUID(), member: booking.userName, className: booking.title, time: booking.time, instructor: booking.instructor, isRefunded, createdAt: new Date().toISOString() };
  let notifications = [];
  try { notifications = JSON.parse(localStorage.getItem('profuncional-notifications') || '[]'); } catch {}
  localStorage.setItem('profuncional-notifications', JSON.stringify([notification, ...notifications]));
  window.dispatchEvent(new CustomEvent('profuncional-booking-cancelled', { detail: notification }));
  window.dispatchEvent(new Event(scheduleChangeEvent));
  return { success: true, isRefunded, message: isRefunded ? 'Cupo liberado y una sesión devuelta a tu saldo.' : 'Cupo liberado. Al faltar menos de 24 horas, la sesión no se devuelve.' };
}
export function rescheduleBookingTransaction(id: string, identity: string, blockId: string, date: string) {
  const all = getUserBookings();
  const old = all.find(b => b.id === id);
  if (!old || !owns(old, identity) || (old.status && old.status !== 'pending')) return { success: false, message: 'Reserva no disponible.' };
  const error = validateSlot(resolveMember(identity)!, blockId, date, id);
  if (error) return { success: false, message: error };
  const block = getCentralScheduleBlocks().find(b => b.id === blockId)!;
  saveUserBookings(all.map(b => b.id === id ? { ...b, blockId, date, time: block.startTime + ' - ' + block.endTime, title: block.title, instructor: block.instructor, type: block.type, confirmedAt: undefined } : b));
  window.dispatchEvent(new Event(scheduleChangeEvent));
  return { success: true, message: 'Reserva reagendada sin alterar tu saldo.' };
}
export function confirmBooking(id: string, identity: string) {
  const all = getUserBookings();
  const b = all.find(b => b.id === id);
  if (!b || !owns(b, identity) || (b.status && b.status !== 'pending') || bookingStart(b) <= Date.now()) throw new Error('Reserva no disponible para confirmar.');
  saveUserBookings(all.map(b => b.id === id ? { ...b, confirmedAt: b.confirmedAt || new Date().toISOString() } : b));
  window.dispatchEvent(new Event(scheduleChangeEvent));
}
export function recordAttendance(id: string, status: 'pending' | 'attended' | 'no-show') {
  const all = getUserBookings();
  const b = all.find(b => b.id === id);
  if (!b || b.status === 'cancelled' || bookingStart(b) > Date.now()) throw new Error('La clase debe haber comenzado para registrar asistencia.');
  saveUserBookings(all.map(b => b.id === id ? { ...b, status } : b));
  window.dispatchEvent(new Event(scheduleChangeEvent));
}
