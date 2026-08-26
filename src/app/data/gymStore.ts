export type MembershipPlan = 'Basic' | 'Standard' | 'Premium';
export type MemberStatus = 'active' | 'expired' | 'suspended';

export interface GymMember {
  id: string;
  name: string;
  email: string;
  plan: MembershipPlan;
  status: MemberStatus;
  balance: number;
  joinDate: string;
}

const storageKey = 'profuncional-members';
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
  { id: 'activity-1', name: 'Juan Perez', action: 'renovo su membresia', time: 'hace 2 minutos' },
  { id: 'activity-2', name: 'Camila Gonzalez', action: 'reservo una clase', time: 'hace 15 minutos' },
  { id: 'activity-3', name: 'Matias Rojas', action: 'completo un pago', time: 'hace 1 hora' },
  { id: 'activity-4', name: 'Antonia Silva', action: 'actualizo su perfil', time: 'hace 2 horas' },
];

const initialMembers: GymMember[] = [
  { id: '1', name: 'Juan Perez', email: 'juan.perez@gmail.com', plan: 'Premium', status: 'active', balance: 0, joinDate: '2024-01-15' },
  { id: '2', name: 'Camila Gonzalez', email: 'camila.gonzalez@gmail.com', plan: 'Standard', status: 'active', balance: -50, joinDate: '2024-02-20' },
  { id: '3', name: 'Matias Rojas', email: 'matias.rojas@gmail.com', plan: 'Basic', status: 'expired', balance: 0, joinDate: '2023-11-10' },
  { id: '4', name: 'Antonia Silva', email: 'antonia.silva@gmail.com', plan: 'Premium', status: 'active', balance: 25, joinDate: '2024-03-05' },
  { id: '5', name: 'Diego Morales', email: 'diego.morales@gmail.com', plan: 'Standard', status: 'suspended', balance: -120, joinDate: '2023-12-01' },
  { id: '6', name: 'Valentina Soto', email: 'valentina.soto@gmail.com', plan: 'Premium', status: 'active', balance: 0, joinDate: '2024-01-25' },
  { id: '7', name: 'Nicolas Fuentes', email: 'nicolas.fuentes@gmail.com', plan: 'Basic', status: 'active', balance: -30, joinDate: '2024-02-14' },
  { id: '8', name: 'Fernanda Contreras', email: 'fernanda.contreras@gmail.com', plan: 'Standard', status: 'active', balance: 0, joinDate: '2024-03-10' },
  { id: '9', name: 'Sebastian Araya', email: 'sebastian.araya@gmail.com', plan: 'Premium', status: 'active', balance: 0, joinDate: '2024-04-02' },
];

export function getMembers(): GymMember[] {
  if (typeof window === 'undefined') return initialMembers;
  const saved = window.localStorage.getItem(storageKey);
  if (!saved) {
    window.localStorage.setItem(storageKey, JSON.stringify(initialMembers));
    return initialMembers;
  }
  try {
    return JSON.parse(saved) as GymMember[];
  } catch {
    window.localStorage.setItem(storageKey, JSON.stringify(initialMembers));
    return initialMembers;
  }
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
    joinDate: new Date().toISOString().slice(0, 10),
  };
  window.localStorage.setItem(storageKey, JSON.stringify([...members, newMember]));
  window.dispatchEvent(new Event(changeEvent));
  return newMember;
}

export function subscribeToMembers(onChange: () => void): () => void {
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
  window.localStorage.setItem(activityStorageKey, JSON.stringify([newActivity, ...activities]));
  window.dispatchEvent(new Event(activityChangeEvent));
}

export function subscribeToActivities(onChange: () => void): () => void {
  window.addEventListener(activityChangeEvent, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(activityChangeEvent, onChange);
    window.removeEventListener('storage', onChange);
  };
}
