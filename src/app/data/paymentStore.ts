import { getMembers, updateMember, addActivity, GymMember } from './gymStore';
import { today } from './dates';

export type ServiceCategory = 'kinesiology' | 'functional' | 'personalized';
export type PaymentMethod = 'point_pos' | 'mp_checkout_api' | 'transfer' | 'cash';

export interface GymService {
  id: string;
  title: string;
  category: ServiceCategory;
  price: number; // in CLP
  sessionsCount: number;
  durationMinutes: number;
  description: string;
  installmentsAllowed: boolean;
  maxInstallments: number; // e.g. 1, 3, 6
  instructorRevenueSharePercent: number; // e.g. 70
  clinicRevenueSharePercent: number; // e.g. 30
  isOfficialTariff?: boolean;
  isActive: boolean;
}

export interface PaymentTransaction {
  id: string;
  date: string;
  createdAt: string;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  serviceId: string;
  serviceTitle: string;
  grossAmount: number;
  method: PaymentMethod;
  installments: number;
  mpFeePercent: number;
  mpFeeAmount: number;
  netAmount: number;
  instructorShareAmount: number;
  clinicShareAmount: number;
  status: 'approved' | 'pending' | 'rejected';
  mpPaymentId: string;
  notes?: string;
}

const SERVICES_KEY = 'profuncional-services-v1';
const TRANSACTIONS_KEY = 'profuncional-payments-v1';
const SERVICES_EVENT = 'profuncional-services-changed';
const TRANSACTIONS_EVENT = 'profuncional-payments-changed';

export const INITIAL_SERVICES: GymService[] = [
  {
    id: 'eval-kine',
    title: 'Evaluación Kinésica Integral',
    category: 'kinesiology',
    price: 20000,
    sessionsCount: 1,
    durationMinutes: 45,
    description: 'Anamnesis clínica, evaluación de dolor EVA, rango articular ROM, prueba de fuerza y ficha SOAP con propuesta terapéutica.',
    installmentsAllowed: false,
    maxInstallments: 1,
    instructorRevenueSharePercent: 70,
    clinicRevenueSharePercent: 30,
    isOfficialTariff: true,
    isActive: true,
  },
  {
    id: 'pack-10-kine',
    title: 'Pack 10 Sesiones Kinésicas',
    category: 'kinesiology',
    price: 250000,
    sessionsCount: 10,
    durationMinutes: 45,
    description: 'Tratamiento integral de rehabilitación o readaptación deportiva. Permite pago en cuotas (3 o 6 cuotas con Mercado Pago).',
    installmentsAllowed: true,
    maxInstallments: 6,
    instructorRevenueSharePercent: 70,
    clinicRevenueSharePercent: 30,
    isOfficialTariff: true,
    isActive: true,
  },
  {
    id: 'grupal-8',
    title: 'Plan Funcional Grupal (8 Sesiones)',
    category: 'functional',
    price: 64000,
    sessionsCount: 8,
    durationMinutes: 60,
    description: 'Circuitos de entrenamiento funcional guiado en estaciones. Máximo 8 personas por grupo para supervisión técnica.',
    installmentsAllowed: false,
    maxInstallments: 1,
    instructorRevenueSharePercent: 50,
    clinicRevenueSharePercent: 50,
    isOfficialTariff: true,
    isActive: true,
  },
  {
    id: 'grupal-12',
    title: 'Plan Funcional Grupal (12 Sesiones)',
    category: 'functional',
    price: 84000,
    sessionsCount: 12,
    durationMinutes: 60,
    description: 'Frecuencia ideal de 3 veces por semana. Acceso a sala funcional y agendamiento flexible en la app.',
    installmentsAllowed: false,
    maxInstallments: 1,
    instructorRevenueSharePercent: 50,
    clinicRevenueSharePercent: 50,
    isOfficialTariff: true,
    isActive: true,
  },
  {
    id: 'grupal-20',
    title: 'Plan Funcional Grupal (20 Sesiones)',
    category: 'functional',
    price: 120000,
    sessionsCount: 20,
    durationMinutes: 60,
    description: 'Plan intensivo de alto rendimiento con bonus de fidelidad y seguimiento de carga física.',
    installmentsAllowed: true,
    maxInstallments: 3,
    instructorRevenueSharePercent: 50,
    clinicRevenueSharePercent: 50,
    isOfficialTariff: true,
    isActive: true,
  },
  {
    id: 'pers-4',
    title: 'Personalizado 1 a 1 (4 Sesiones)',
    category: 'personalized',
    price: 100000,
    sessionsCount: 4,
    durationMinutes: 60,
    description: 'Objetivos específicos: corrección postural, preparación deportiva individual o readaptación especializada.',
    installmentsAllowed: false,
    maxInstallments: 1,
    instructorRevenueSharePercent: 65,
    clinicRevenueSharePercent: 35,
    isOfficialTariff: true,
    isActive: true,
  },
  {
    id: 'pers-8',
    title: 'Personalizado 1 a 1 (8 Sesiones)',
    category: 'personalized',
    price: 160000,
    sessionsCount: 8,
    durationMinutes: 60,
    description: 'Reintegro deportivo progresivo y fortalecimiento guiado con kinesiólogo/entrenador personal.',
    installmentsAllowed: true,
    maxInstallments: 3,
    instructorRevenueSharePercent: 65,
    clinicRevenueSharePercent: 35,
    isOfficialTariff: true,
    isActive: true,
  },
  {
    id: 'pers-12',
    title: 'Personalizado 1 a 1 (12 Sesiones)',
    category: 'personalized',
    price: 190000,
    sessionsCount: 12,
    durationMinutes: 60,
    description: 'Readaptación total o alto rendimiento personalizado con acceso prioritario a boxes y sala.',
    installmentsAllowed: true,
    maxInstallments: 6,
    instructorRevenueSharePercent: 65,
    clinicRevenueSharePercent: 35,
    isOfficialTariff: true,
    isActive: true,
  },
];

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'pay-001',
    date: '2025-01-20',
    createdAt: '2025-01-20T10:15:00Z',
    memberId: '1',
    memberName: 'Juan Perez',
    memberEmail: 'juan.perez@gmail.com',
    serviceId: 'pack-10-kine',
    serviceTitle: 'Pack 10 Sesiones Kinésicas',
    grossAmount: 250000,
    method: 'mp_checkout_api',
    installments: 3,
    mpFeePercent: 4.19,
    mpFeeAmount: 10475,
    netAmount: 239525,
    instructorShareAmount: 167668,
    clinicShareAmount: 71857,
    status: 'approved',
    mpPaymentId: 'MP-892341029',
    notes: 'Pago en 3 cuotas con Tarjeta de Crédito vía Checkout Mercado Pago.',
  },
  {
    id: 'pay-002',
    date: '2025-01-22',
    createdAt: '2025-01-22T16:45:00Z',
    memberId: '2',
    memberName: 'Camila Gonzalez',
    memberEmail: 'camila.gonzalez@gmail.com',
    serviceId: 'eval-kine',
    serviceTitle: 'Evaluación Kinésica Integral',
    grossAmount: 20000,
    method: 'point_pos',
    installments: 1,
    mpFeePercent: 1.79,
    mpFeeAmount: 358,
    netAmount: 19642,
    instructorShareAmount: 13749,
    clinicShareAmount: 5893,
    status: 'approved',
    mpPaymentId: 'POINT-55194012',
    notes: 'Cobro en recepción con máquina POS Point (Tarjeta Débito).',
  },
  {
    id: 'pay-003',
    date: '2025-01-23',
    createdAt: '2025-01-23T11:20:00Z',
    memberId: '3',
    memberName: 'Matias Rojas',
    memberEmail: 'matias.rojas@gmail.com',
    serviceId: 'grupal-12',
    serviceTitle: 'Plan Funcional Grupal (12 Sesiones)',
    grossAmount: 84000,
    method: 'mp_checkout_api',
    installments: 1,
    mpFeePercent: 3.79,
    mpFeeAmount: 3184,
    netAmount: 80816,
    instructorShareAmount: 40408,
    clinicShareAmount: 40408,
    status: 'approved',
    mpPaymentId: 'MP-910248102',
    notes: 'Renovación mensual vía link de pago Mercado Pago.',
  },
];

// Calculation of Mercado Pago commission and net split
export function calculateMercadoPagoFees(
  amount: number,
  method: PaymentMethod,
  installments = 1,
  instructorSharePercent = 70,
  clinicSharePercent = 30
) {
  let mpFeePercent = 0;
  if (method === 'point_pos') {
    // POS Físico Mercado Pago Point: Débito 1.5% + IVA (~1.79%), Crédito 2.95% + IVA (~3.51%)
    mpFeePercent = installments > 1 ? 3.51 : 1.79;
  } else if (method === 'mp_checkout_api') {
    // Checkout Online / Link / QR: 3.19% + IVA (~3.79%), en cuotas ~4.19%
    mpFeePercent = installments > 1 ? 4.19 : 3.79;
  } else {
    // Transferencia o efectivo
    mpFeePercent = 0;
  }

  const mpFeeAmount = Math.round((amount * mpFeePercent) / 100);
  const netAmount = amount - mpFeeAmount;

  // Split del neto
  const instructorShareAmount = Math.round((netAmount * instructorSharePercent) / 100);
  const clinicShareAmount = netAmount - instructorShareAmount;

  return {
    grossAmount: amount,
    mpFeePercent,
    mpFeeAmount,
    netAmount,
    instructorShareAmount,
    clinicShareAmount,
  };
}

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Local Storage Handlers
export function getServices(): GymService[] {
  try {
    const raw = localStorage.getItem(SERVICES_KEY);
    if (!raw) {
      localStorage.setItem(SERVICES_KEY, JSON.stringify(INITIAL_SERVICES));
      return INITIAL_SERVICES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SERVICES;
  }
}

export function saveServices(services: GymService[]) {
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  window.dispatchEvent(new Event(SERVICES_EVENT));
}

export function subscribeToServices(cb: () => void) {
  window.addEventListener(SERVICES_EVENT, cb);
  return () => window.removeEventListener(SERVICES_EVENT, cb);
}

export function createGymService(newService: Omit<GymService, 'id'>): GymService {
  const services = getServices();
  const created: GymService = {
    ...newService,
    id: `svc-${Date.now().toString(36)}`,
  };
  services.push(created);
  saveServices(services);
  addActivity({
    name: 'Administrador',
    action: `creó nuevo servicio "${created.title}" (${formatCLP(created.price)})`,
  });
  return created;
}

export function getPaymentTransactions(): PaymentTransaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function savePaymentTransactions(txs: PaymentTransaction[]) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
  window.dispatchEvent(new Event(TRANSACTIONS_EVENT));
}

export function subscribeToPaymentTransactions(cb: () => void) {
  window.addEventListener(TRANSACTIONS_EVENT, cb);
  return () => window.removeEventListener(TRANSACTIONS_EVENT, cb);
}

export async function processPaymentTransaction(params: {
  memberId: string;
  serviceId: string;
  method: PaymentMethod;
  installments?: number;
  notes?: string;
  operatorName?: string;
}): Promise<{ success: boolean; transaction?: PaymentTransaction; message: string }> {
  const { memberId, serviceId, method, installments = 1, notes, operatorName = 'Sistema' } = params;

  const members = getMembers();
  const member = members.find((m) => m.id === memberId || m.name.toLowerCase() === memberId.toLowerCase());
  if (!member) {
    return { success: false, message: 'Alumno o paciente no encontrado en el sistema.' };
  }

  const services = getServices();
  const service = services.find((s) => s.id === serviceId);
  if (!service) {
    return { success: false, message: 'Servicio o tarifario no encontrado.' };
  }

  // Calculate fees and distribution
  const calc = calculateMercadoPagoFees(
    service.price,
    method,
    installments,
    service.instructorRevenueSharePercent,
    service.clinicRevenueSharePercent
  );

  const prefix = method === 'point_pos' ? 'POINT' : method === 'mp_checkout_api' ? 'MP' : 'TRF';
  const mpPaymentId = `${prefix}-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const newTx: PaymentTransaction = {
    id: `tx-${Date.now().toString(36)}`,
    date: today(),
    createdAt: new Date().toISOString(),
    memberId: member.id,
    memberName: member.name,
    memberEmail: member.email,
    serviceId: service.id,
    serviceTitle: service.title,
    grossAmount: calc.grossAmount,
    method,
    installments,
    mpFeePercent: calc.mpFeePercent,
    mpFeeAmount: calc.mpFeeAmount,
    netAmount: calc.netAmount,
    instructorShareAmount: calc.instructorShareAmount,
    clinicShareAmount: calc.clinicShareAmount,
    status: 'approved',
    mpPaymentId,
    notes: notes || `Pago aprobado vía ${method === 'point_pos' ? 'Máquina POS Point' : method === 'mp_checkout_api' ? 'Checkout API Mercado Pago' : 'Transferencia directa'}${installments > 1 ? ` (${installments} cuotas)` : ''}.`,
  };

  // Save transaction
  const currentTxs = getPaymentTransactions();
  savePaymentTransactions([newTx, ...currentTxs]);

  // Update member sessions & plan
  const newTotalSessions = (member.totalSessions || 0) + service.sessionsCount;
  const newRemainingSessions = (member.remainingSessions || 0) + service.sessionsCount;
  
  // Set next billing date (30 days from today)
  const d = new Date();
  d.setDate(d.getDate() + 30);
  const nextBillingDate = d.toISOString().split('T')[0];

  updateMember(member.id, {
    packName: service.title,
    totalSessions: newTotalSessions,
    remainingSessions: newRemainingSessions,
    status: 'active',
    nextBilling: nextBillingDate,
    bookingSuspended: false,
    suspensionReason: undefined,
  });

  addActivity({
    name: member.name,
    action: `pagó ${service.title} (${formatCLP(service.price)}) vía ${method === 'point_pos' ? 'POS Point' : 'Mercado Pago'}. Se acreditaron ${service.sessionsCount} sesiones.`,
  });

  return {
    success: true,
    transaction: newTx,
    message: `¡Pago de ${formatCLP(service.price)} procesado con éxito! Se acreditaron ${service.sessionsCount} sesiones a ${member.name}.`,
  };
}
