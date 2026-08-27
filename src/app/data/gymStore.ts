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

