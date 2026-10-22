import { getMembers, subscribeToMembers, GymMember } from '../../data/gymStore';
import { careAction } from '../../data/careStore';
import { CarePanel } from '../shared/CarePanel';
import { formatDate, calculatePlanCycle } from '../../data/dates';
import {
  processPaymentTransaction,
  PaymentMethod,
  formatCLP,
  PaymentTransaction
} from '../../data/paymentStore';
import React, { useState, useEffect } from 'react';
import {
  Check,
  Sparkles,
  Clock,
  Calendar,
  Stethoscope,
  Dumbbell,
  UserCheck,
  AlertTriangle,
  ShieldAlert,
  CreditCard,
  Smartphone,
  Globe,
  Receipt,
  CheckCircle,
  RefreshCw,
  QrCode
} from 'lucide-react';

interface UserPlanProps {
  plan?: 'Basic' | 'Standard' | 'Premium';
  memberName: string;
  onUpdatePlan?: (plan: 'Basic' | 'Standard' | 'Premium') => void;
}

interface PackItem {
  id: string;
  name: string;
  category: string;
  sessions: number;
  price: number;
  description: string;
  badge?: string;
  installmentsAllowed?: boolean;
  maxInstallments?: number;
  features: string[];
}

export function UserPlan({ plan: selectedPlan = 'Standard', memberName, onUpdatePlan }: UserPlanProps) {
  const [member, setMember] = useState<GymMember | undefined>(() => {
    return getMembers().find((m) => m.name.toLowerCase() === memberName.toLowerCase()) || getMembers()[0];
  });

  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'kinesiologia' | 'grupal' | 'personalizado'>('kinesiologia');

  // Checkout Modal State
  const [selectedPackForPayment, setSelectedPackForPayment] = useState<PackItem | null>(null);
  const [checkoutMethod, setCheckoutMethod] = useState<PaymentMethod>('mp_checkout_api');
  const [checkoutInstallments, setCheckoutInstallments] = useState(1);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<PaymentTransaction | null>(null);

  useEffect(() => {
    const unsub = subscribeToMembers(() => {
      const found = getMembers().find((m) => m.name.toLowerCase() === memberName.toLowerCase());
      if (found) setMember(found);
    });
    return () => unsub();
  }, [memberName]);

  const cycle = calculatePlanCycle(member?.joinDate, member?.nextBilling);

  // Tarifarios Actualizados: Kinesiología ($20k eval, $250k pack 10 en cuotas)
  const kinePacks: PackItem[] = [
    {
      id: 'eval-kine',
      name: 'Evaluación Kinésica Integral',
      category: 'Kinesiología Clínica',
      sessions: 1,
      price: 20000,
      description: 'Anamnesis clínica deportiva, escala EVA de dolor, rango articular ROM, prueba de fuerza y ficha SOAP con propuesta terapéutica.',
      badge: 'Tarifario Oficial',
      installmentsAllowed: false,
      maxInstallments: 1,
      features: [
        'Sesión individual de 45 minutos en Box Kinésico',
        'Medición de dolor en escala EVA y rango articular ROM',
        'Ficha SOAP y diagnóstico funcional personalizado',
        'Plan terapéutico con pauta adaptada a objetivos deportivos',
      ],
    },
    {
      id: 'pack-10-kine',
      name: 'Pack 10 Sesiones Kinesiología',
      category: 'Kinesiología Clínica',
      sessions: 10,
      price: 250000,
      description: 'Tratamiento integral de rehabilitación o reintegro deportivo. Incluye opción de pago en cuotas con Mercado Pago.',
      badge: 'Hasta 6 Cuotas',
      installmentsAllowed: true,
      maxInstallments: 6,
      features: [
        '10 sesiones individuales de 45 minutos en Box Kinésico',
        'Opción de pago al contado o en 3 a 6 cuotas con Mercado Pago',
        'Monitoreo continuo de evolución y progresión de cargas',
        'Reintegro deportivo y prevención de re-lesiones',
        'Acceso prioritario a horarios de box matutinos y vespertinos',
      ],
    },
  ];

  const grupalPacks: PackItem[] = [
    {
      id: 'grupal-8',
      name: '8 Sesiones Mes',
      category: 'Entrenamiento Funcional Grupal',
      sessions: 8,
      price: 64000,
      description: 'Circuitos de entrenamiento funcional grupal en estaciones (8 personas máximo por grupo).',
      badge: undefined,
      installmentsAllowed: false,
      maxInstallments: 1,
      features: [
        '8 sesiones al mes en circuitos funcionales',
        'Máximo 8 personas por grupo para mayor supervisión',
        'Agendamiento autónomo desde la app',
        'Estacionamiento privado, baños y camarines',
      ],
    },
    {
      id: 'grupal-12',
      name: '12 Sesiones Mes',
      category: 'Entrenamiento Funcional Grupal',
      sessions: 12,
      price: 84000,
      description: 'Circuitos de entrenamiento funcional grupal en estaciones (8 personas máximo por grupo).',
      badge: 'Más Popular',
      installmentsAllowed: false,
      maxInstallments: 1,
      features: [
        '12 sesiones al mes en circuitos funcionales',
        'Máximo 8 personas por grupo para mayor supervisión',
        'Frecuencia recomendada de 3 veces por semana',
        'Agendamiento y reagendamiento sin costo (al menos 3 hrs)',
        'Estacionamiento privado, baños y camarines',
      ],
    },
    {
      id: 'grupal-20',
      name: '20 Sesiones Mes',
      category: 'Entrenamiento Funcional Grupal',
      sessions: 20,
      price: 120000,
      description: 'Circuitos de entrenamiento funcional grupal en estaciones (8 personas máximo por grupo).',
      badge: 'Bonus Fidelidad',
      installmentsAllowed: true,
      maxInstallments: 3,
      features: [
        '20 sesiones al mes en circuitos funcionales',
        'Máximo 8 personas por grupo',
        'Plan intensivo de alto rendimiento',
        'Incluye bonus especial de fidelidad',
        'Estacionamiento privado, baños y camarines',
      ],
    },
  ];

  const personalizadoPacks: PackItem[] = [
    {
      id: 'pers-4',
      name: '4 Sesiones Personalizadas',
      category: 'Entrenamiento Personalizado',
      sessions: 4,
      price: 100000,
      description: 'Para objetivos específicos: corrección postural, reintegro deportivo, eliminación de dolores físicos y preparación deportiva.',
      badge: undefined,
      installmentsAllowed: false,
      maxInstallments: 1,
      features: [
        '4 sesiones 1 a 1 con atención 100% personalizada',
        'Corrección postural y eliminación de dolores físicos',
        'Pauta adaptada a objetivos deportivos o kinésicos',
        'Seguimiento directo con el entrenador',
      ],
    },
    {
      id: 'pers-8',
      name: '8 Sesiones Personalizadas',
      category: 'Entrenamiento Personalizado',
      sessions: 8,
      price: 160000,
      description: 'Para objetivos específicos: corrección postural, reintegro deportivo, eliminación de dolores físicos y preparación deportiva.',
      badge: 'Recomendado',
      installmentsAllowed: true,
      maxInstallments: 3,
      features: [
        '8 sesiones 1 a 1 de entrenamiento personalizado',
        'Reintegro deportivo progresivo post-lesión',
        'Corrección postural y fortalecimiento guiado',
        'Sincronización con fichas kinésicas SOAP',
      ],
    },
    {
      id: 'pers-12',
      name: '12 Sesiones Personalizadas',
      category: 'Entrenamiento Personalizado',
      sessions: 12,
      price: 190000,
      description: 'Para objetivos específicos: corrección postural, reintegro deportivo, eliminación de dolores físicos y preparación deportiva.',
      badge: 'Mejor Valor',
      installmentsAllowed: true,
      maxInstallments: 6,
      features: [
        '12 sesiones 1 a 1 de alta especialización',
        'Preparación deportiva de alto rendimiento o readaptación total',
        'Monitoreo continuo de dolor (EVA) y movilidad (ROM)',
        'Acceso prioritario a horarios de atención',
      ],
    },
  ];

  const currentPacks =
    activeCategory === 'kinesiologia'
      ? kinePacks
      : activeCategory === 'grupal'
      ? grupalPacks
      : personalizadoPacks;

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenPaymentModal = (pack: PackItem) => {
    setSelectedPackForPayment(pack);
    setCheckoutMethod('mp_checkout_api');
    setCheckoutInstallments(1);
  };

  const handleExecutePayment = async () => {
    if (!member || !selectedPackForPayment) return;
    setIsProcessingPayment(true);

    try {
      // Simulate gateway authorization latency
      await new Promise((r) => setTimeout(r, 900));

      const res = await processPaymentTransaction({
        memberId: member.id,
        serviceId: selectedPackForPayment.id,
        method: checkoutMethod,
        installments: checkoutInstallments,
        notes: `Pago autónomo por el alumno vía ${checkoutMethod === 'mp_checkout_api' ? 'Checkout Mercado Pago Online' : 'Solicitud POS Point en recepción'}.`,
        operatorName: member.name,
      });

      if (res.success && res.transaction) {
        setCompletedTransaction(res.transaction);
        setSelectedPackForPayment(null);
        showFeedback(`¡Pago exitoso! Se acreditaron ${selectedPackForPayment.sessions} sesiones a tu cuenta.`);
      } else {
        showFeedback(res.message);
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1 text-[#F7F7F7]">Valores y Planes Oficiales Pro-Funcional</h1>
        <p className="text-white/60 text-sm">
          Tarifario oficial de Kinesiología, Entrenamiento Funcional Grupal y Sesiones Personalizadas con pagos vía Mercado Pago.
        </p>
      </div>

      {feedback && (
        <div className="rounded-xl border border-[#00E676]/40 bg-[#00E676]/15 p-4 text-[#00E676] flex items-center gap-2 shadow-lg">
          <Check className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">{feedback}</span>
        </div>
      )}

      {/* Selector de 3 Categorías (Kinesiología vs Grupal vs Personalizado) */}
      <div className="flex flex-col sm:flex-row gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
        <button
          onClick={() => setActiveCategory('kinesiologia')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeCategory === 'kinesiologia'
              ? 'bg-[#00E676] text-[#021826] shadow-lg shadow-[#00E676]/20'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Stethoscope className="w-5 h-5" />
          <span>Kinesiología & Terapia</span>
        </button>

        <button
          onClick={() => setActiveCategory('grupal')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeCategory === 'grupal'
              ? 'bg-[#00E676] text-[#021826] shadow-lg shadow-[#00E676]/20'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          <span>Funcional Grupal (Máx. 8)</span>
        </button>

        <button
          onClick={() => setActiveCategory('personalizado')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeCategory === 'personalizado'
              ? 'bg-[#00E676] text-[#021826] shadow-lg shadow-[#00E676]/20'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span>Entrenamiento 1 a 1</span>
        </button>
      </div>

      {/* Alerta de suspensión por inasistencias si aplica */}
      {member?.bookingSuspended && (
        <div className="rounded-2xl border border-rose-500/50 bg-rose-500/15 p-4 flex items-start gap-3 text-rose-200">
          <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">Reservas Temporalmente Suspendidas</h4>
            <p className="text-sm font-medium mt-0.5 text-white/90">
              {member.suspensionReason || 'Se detectaron faltas reiteradas sin aviso previo. Tus cupos futuros han sido liberados.'}
            </p>
            <p className="text-xs text-rose-300/80 mt-1">Acércate a la recepción o regulariza tu saldo para reactivar tus reservas.</p>
          </div>
        </div>
      )}

      {/* Alerta de período de gracia si aplica */}
      {cycle.isInGracePeriod && !member?.bookingSuspended && (
        <div className="rounded-2xl border border-amber-500/50 bg-amber-500/15 p-4 flex items-start gap-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Período de Gracia de Pago Activo (5 Días)</h4>
            <p className="text-sm font-medium mt-0.5 text-white/90">
              Tu ciclo de 30 días venció el <strong>{formatDate(cycle.renewalDate)}</strong>. Tienes plazo hasta el <strong>{formatDate(cycle.gracePeriodEndDate)}</strong> para regularizar el pago de tu plan antes de que se suspendan las reservas.
            </p>
          </div>
        </div>
      )}

      {/* Mi Plan Activo Banner */}
      <div className="bg-gradient-to-br from-[#00E676]/20 to-[#00E676]/5 rounded-2xl p-6 backdrop-blur-sm border border-[#00E676]/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#00E676] block mb-1">Mi Plan / Paquete Activo</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F7F7F7]">{member?.packName || 'Plan Entrenamiento Funcional'}</h2>
          </div>
          <Sparkles className="w-8 h-8 text-[#00E676] hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3.5 border border-white/10">
            <Stethoscope className="w-5 h-5 text-[#00E676] flex-shrink-0" />
            <div>
              <p className="text-xs text-white/50">Saldo de Sesiones</p>
              <p className="font-bold text-white text-sm">{member?.remainingSessions ?? 5} de {member?.totalSessions ?? 8} dispon.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3.5 border border-white/10">
            <Calendar className="w-5 h-5 text-[#00E676] flex-shrink-0" />
            <div>
              <p className="text-xs text-white/50">Inscripción Original</p>
              <p className="font-bold text-white text-sm">{formatDate(cycle.joinDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3.5 border border-white/10">
            <Clock className="w-5 h-5 text-[#00E676] flex-shrink-0" />
            <div>
              <p className="text-xs text-white/50">Vencimiento (Ciclo 30d)</p>
              <p className="font-bold text-white text-sm">{formatDate(cycle.renewalDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3.5 border border-white/10">
            <CreditCard className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-white/50">Límite Pago (+5d Gracia)</p>
              <p className="font-bold text-amber-300 text-sm">{formatDate(cycle.gracePeriodEndDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Planes según categoría activa */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[#F7F7F7]">
            {activeCategory === 'kinesiologia'
              ? 'Tarifario Oficial de Kinesiología Clínica'
              : activeCategory === 'grupal'
              ? 'Planes Funcionales Grupales en Estaciones'
              : 'Planes de Entrenamiento Personalizado'}
          </h2>
          <p className="text-xs text-white/60">
            {activeCategory === 'kinesiologia'
              ? 'Evaluación kinésica integral y paquetes de sesiones con opción de pago en cuotas mediante Mercado Pago.'
              : activeCategory === 'grupal'
              ? 'Circuitos de entrenamiento funcional en estaciones (máximo 8 personas por grupo).'
              : 'Objetivos específicos: corrección postural, reintegro deportivo, eliminación de dolores y readaptación.'}
          </p>
        </div>

        <div className={`grid gap-5 ${currentPacks.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-3'}`}>
          {currentPacks.map((pack) => (
            <div
              key={pack.id}
              className={`rounded-2xl p-6 backdrop-blur-sm border transition-all flex flex-col justify-between ${
                pack.id === 'eval-kine' || pack.id === 'pack-10-kine'
                  ? 'bg-gradient-to-br from-sky-950/40 via-[#071626] to-[#010a01] border-sky-500/40 shadow-xl shadow-sky-950/20'
                  : 'bg-white/5 border-white/10 hover:border-[#00E676]/50'
              }`}
            >
              <div>
                {pack.badge && (
                  <span className="inline-block px-3 py-1 bg-[#00E676] text-[#021826] rounded-full text-xs font-bold mb-3 shadow-md shadow-[#00E676]/20">
                    {pack.badge}
                  </span>
                )}
                <h3 className="text-xl font-bold mb-1 text-white">{pack.name}</h3>
                <p className="text-white/60 text-xs mb-4 min-h-[36px]">{pack.description}</p>

                <div className="mb-5 pb-5 border-b border-white/10">
                  <p className="text-3xl font-black text-[#00E676]">
                    {formatCLP(pack.price)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-white/50 mt-1">
                    <span>{pack.sessions} {pack.sessions === 1 ? 'sesión incluida' : 'sesiones incluidas'}</span>
                    {pack.installmentsAllowed && (
                      <span className="text-sky-300 font-semibold font-mono">
                        o hasta {pack.maxInstallments} cuotas
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {pack.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-white/80">
                      <Check className="w-3.5 h-3.5 text-[#00E676] mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenPaymentModal(pack)}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-[#00E676] text-[#021826] hover:bg-[#00E676]/90 transition-transform active:scale-95 shadow-lg shadow-[#00E676]/20 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pagar con Mercado Pago →</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Checkout Mercado Pago */}
      {selectedPackForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0b1726] border border-[#00E676]/50 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-[#00E676] tracking-wider">
                  Pasarela Segura Mercado Pago
                </span>
                <h3 className="text-xl font-bold mt-0.5">{selectedPackForPayment.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPackForPayment(null)}
                className="text-white/50 hover:text-white text-sm bg-white/5 p-2 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Resumen del Pack */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-white/70">Total a Pagar:</span>
                <span className="text-2xl font-black text-[#00E676]">{formatCLP(selectedPackForPayment.price)}</span>
              </div>
              <p className="text-white/60">
                Se acreditarán <strong>{selectedPackForPayment.sessions} sesiones</strong> en tu perfil inmediatamente tras la confirmación del pago.
              </p>
            </div>

            {/* Selector de Método de Pago */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-white/80 block">Elige cómo deseas pagar:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setCheckoutMethod('mp_checkout_api')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    checkoutMethod === 'mp_checkout_api'
                      ? 'border-[#00E676] bg-[#00E676]/15 text-white'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Globe className="w-4 h-4 text-sky-400" />
                    <strong className="text-xs">Pagar Online</strong>
                  </div>
                  <p className="text-[11px] text-white/60">
                    Tarjetas de Débito, Crédito en cuotas o código QR.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCheckoutMethod('point_pos')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    checkoutMethod === 'point_pos'
                      ? 'border-[#00E676] bg-[#00E676]/15 text-white'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Smartphone className="w-4 h-4 text-[#00E676]" />
                    <strong className="text-xs">Máquina POS Point</strong>
                  </div>
                  <p className="text-[11px] text-white/60">
                    Pagar con tarjeta física directamente en la recepción del centro.
                  </p>
                </button>
              </div>
            </div>

            {/* Opciones de Cuotas si aplica */}
            {selectedPackForPayment.installmentsAllowed && checkoutMethod === 'mp_checkout_api' && (
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs space-y-2">
                <span className="font-semibold text-white block">Selecciona tus cuotas:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 3, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCheckoutInstallments(num)}
                      className={`py-2 px-2 rounded-lg text-xs font-bold border transition-colors ${
                        checkoutInstallments === num
                          ? 'bg-[#00E676] text-[#021826] border-[#00E676]'
                          : 'bg-white/5 text-white/70 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {num === 1 ? '1 cuota' : `${num} cuotas`}
                      <span className="block text-[10px] font-normal opacity-80">
                        {formatCLP(Math.round(selectedPackForPayment.price / num))}/mes
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Garantía y Seguridad */}
            <div className="flex items-center gap-2 text-[11px] text-white/50 px-1">
              <Sparkles className="w-4 h-4 text-[#00E676] flex-shrink-0" />
              <span>Transacción encriptada y protegida con garantía oficial Mercado Pago.</span>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedPackForPayment(null)}
                disabled={isProcessingPayment}
                className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleExecutePayment}
                disabled={isProcessingPayment}
                className="px-5 py-2.5 rounded-xl bg-[#00E676] text-[#021826] text-xs font-extrabold hover:bg-[#00E676]/90 shadow-lg shadow-[#00E676]/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Conectando con Mercado Pago...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Confirmar Pago de {formatCLP(selectedPackForPayment.price)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Comprobante Digital para el Alumno */}
      {completedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0b1726] border border-[#00E676]/60 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative text-white">
            <div className="text-center space-y-1.5 border-b border-white/10 pb-4">
              <div className="w-12 h-12 rounded-full bg-[#00E676]/20 border border-[#00E676]/40 text-[#00E676] flex items-center justify-center mx-auto mb-1">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">¡Pago Aprobado Exitosamente!</h3>
              <p className="text-xs text-[#00E676] font-mono font-bold">
                ID Mercado Pago: {completedTransaction.mpPaymentId}
              </p>
            </div>

            <div className="space-y-2 text-xs bg-white/5 p-4 rounded-xl border border-white/10 font-mono">
              <div className="flex justify-between">
                <span className="text-white/60">Servicio contratado:</span>
                <span className="text-white font-bold">{completedTransaction.serviceTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Vía de pago:</span>
                <span className="text-[#00E676] font-bold">
                  {completedTransaction.method === 'point_pos' ? 'Máquina POS Point' : 'Checkout Mercado Pago'}
                  {completedTransaction.installments > 1 && ` (${completedTransaction.installments} cuotas)`}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-bold">
                <span className="text-white">Monto Total:</span>
                <span className="text-[#00E676]">{formatCLP(completedTransaction.grossAmount)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 text-xs text-[#00E676] text-center font-semibold">
              ✓ Tus sesiones ya están disponibles en tu saldo para agendar en la agenda.
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setCompletedTransaction(null)}
                className="w-full py-2.5 rounded-xl bg-[#00E676] text-[#021826] text-xs font-bold hover:bg-[#00E676]/90 shadow-md"
              >
                Ir a mi Calendario
              </button>
            </div>
          </div>
        </div>
      )}

      {member && (
        <>
          <CarePanel memberId={member.id} section="payments" />
          <CarePanel memberId={member.id} section="rewards" />
        </>
      )}
    </div>
  );
}