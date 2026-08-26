import React, { useState } from 'react';
import { Check, Sparkles, Clock, Calendar } from 'lucide-react';
import { addActivity } from '../../data/gymStore';

interface UserPlanProps {
  plan: 'Basic' | 'Standard' | 'Premium';
  memberName: string;
  onUpdatePlan?: (plan: 'Basic' | 'Standard' | 'Premium') => void;
}

export function UserPlan({ plan: selectedPlan = 'Premium', memberName, onUpdatePlan }: UserPlanProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const formatCLP = (amount: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);

  const planPricing: Record<'Basic' | 'Standard' | 'Premium', number> = {
    Basic: 29,
    Standard: 59,
    Premium: 99,
  };

  const planBenefits: Record<'Basic' | 'Standard' | 'Premium', string[]> = {
    Basic: [
      'Acceso al gimnasio en horario valle',
      'Acceso a equipamiento básico y máquinas de fuerza',
      'Casillero de uso diario',
      'Acceso completo a la app móvil',
    ],
    Standard: [
      'Acceso ilimitado al gimnasio en todos los horarios',
      '5 clases grupales incluidas al mes',
      'Arriendo de casillero exclusivo',
      'Acceso a sauna y vestuarios premium',
      'Acceso a la app móvil con seguimiento',
    ],
    Premium: [
      'Acceso ilimitado total al gimnasio y todas las áreas',
      'Todas las clases grupales ilimitadas (HIIT, Yoga, CrossFit)',
      'Consulta mensual con entrenador personal',
      'Orientación y pauta nutricional personalizada',
      'Invitado gratis 2 veces al mes',
      'Beneficios exclusivos en la app móvil',
    ],
  };

  const currentPlan = {
    name: selectedPlan,
    status: 'activa',
    price: planPricing[selectedPlan] ?? 59,
    startDate: '2024-01-15',
    expirationDate: '2025-02-15',
    benefits: planBenefits[selectedPlan] ?? planBenefits.Standard,
  };

  const availablePlans = [
    {
      name: 'Basic' as const,
      price: 29,
      description: 'Ideal para comenzar tu entrenamiento funcional',
      features: ['Acceso en horario valle', 'Equipamiento funcional básico', 'Casillero diario', 'App móvil'],
    },
    {
      name: 'Standard' as const,
      price: 59,
      description: 'Perfecto para entrenar con frecuencia y flexibilidad',
      features: ['Acceso ilimitado al gimnasio', '5 clases grupales al mes', 'Casillero exclusivo', 'Seguimiento en app'],
    },
    {
      name: 'Premium' as const,
      price: 99,
      description: 'La experiencia completa con clases y asesoría total',
      features: ['Acceso total ilimitado', 'Clases grupales ilimitadas', 'Sesiones con entrenador', 'Pauta nutricional'],
    },
  ];

  const daysUntilExpiration = Math.floor(
    (new Date(currentPlan.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRenew = () => {
    addActivity({ name: memberName, action: `renovó su membresía ${currentPlan.name}` });
    showFeedback(`¡Membresía ${currentPlan.name} renovada con éxito!`);
  };

  const handleSelectPlan = (planName: 'Basic' | 'Standard' | 'Premium') => {
    if (onUpdatePlan) {
      onUpdatePlan(planName);
    }
    addActivity({ name: memberName, action: `cambió su plan a ${planName}` });
    showFeedback(`Has cambiado tu suscripción al plan ${planName} con éxito.`);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-[#F7F7F7]">Mi membresía</h1>
        <p className="text-white/60">Administra tu suscripción, planes y beneficios</p>
      </div>

      {feedback && (
        <div className="rounded-xl border border-[#09C82C]/40 bg-[#09C82C]/15 p-4 text-[#09C82C] flex items-center gap-2">
          <Check className="h-5 w-5" />
          <span className="text-sm font-medium">{feedback}</span>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-[#09C82C]/20 to-[#09C82C]/5 rounded-xl p-6 backdrop-blur-sm border border-[#09C82C]/20">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-[#F7F7F7]">Plan {currentPlan.name}</h2>
              <span className="px-3 py-1 bg-[#09C82C]/30 text-[#09C82C] rounded-full text-sm font-medium">
                Activa
              </span>
            </div>
            <p className="text-2xl font-bold text-[#09C82C]">{formatCLP(currentPlan.price * 1000)}/mes</p>
          </div>
          <Sparkles className="w-8 h-8 text-[#09C82C]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
            <Calendar className="w-5 h-5 text-[#09C82C]" />
            <div>
              <p className="text-xs text-white/60">Inicio</p>
              <p className="font-medium">{new Date(currentPlan.startDate).toLocaleDateString('es-CL')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
            <Clock className="w-5 h-5 text-[#09C82C]" />
            <div>
              <p className="text-xs text-white/60">Vencimiento</p>
              <p className="font-medium">{new Date(currentPlan.expirationDate).toLocaleDateString('es-CL')}</p>
            </div>
          </div>
        </div>

        {daysUntilExpiration <= 30 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <p className="text-yellow-400 text-sm">
              Tu plan vence en {daysUntilExpiration} días. Renueva ahora para seguir disfrutando tus beneficios sin interrupción.
            </p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-[#F7F7F7]">Beneficios incluidos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentPlan.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#09C82C]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-[#09C82C]" />
                </div>
                <span className="text-sm text-[#F7F7F7]/90">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRenew}
            className="flex-1 px-6 py-3 bg-[#09C82C] text-[#010A01] rounded-lg hover:bg-[#09C82C]/90 transition-colors font-semibold"
          >
            Renovar membresía
          </button>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-[#F7F7F7]">Cambiar de membresía</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availablePlans.map((plan) => {
            const isCurrent = plan.name === selectedPlan;
            return (
              <div
                key={plan.name}
                className={`rounded-xl p-6 backdrop-blur-sm border transition-all ${
                  isCurrent
                    ? 'bg-[#09C82C]/10 border-[#09C82C] scale-105'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                {isCurrent && (
                  <span className="inline-block px-3 py-1 bg-[#09C82C] text-[#010A01] rounded-full text-xs font-bold mb-4">
                    Membresía actual
                  </span>
                )}
                <h3 className="text-xl font-bold mb-2 text-[#F7F7F7]">{plan.name}</h3>
                <p className="text-white/60 text-sm mb-4">{plan.description}</p>
                <p className="text-3xl font-bold mb-6 text-[#09C82C]">
                  {formatCLP(plan.price * 1000)}
                  <span className="text-sm text-white/60 font-normal">/mes</span>
                </p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-[#09C82C] mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled={isCurrent}
                  onClick={() => handleSelectPlan(plan.name)}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    isCurrent
                      ? 'bg-white/5 text-white/40 cursor-not-allowed'
                      : 'bg-[#09C82C] text-[#010A01] font-semibold hover:bg-[#09C82C]/90'
                  }`}
                >
                  {isCurrent ? 'Membresía actual' : 'Seleccionar plan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}