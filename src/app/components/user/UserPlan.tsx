import React, { useState } from 'react';
import { Check, Sparkles, Clock, Calendar, Stethoscope, Activity, ArrowRight } from 'lucide-react';
import { addActivity, getMemberByEmail, updateMember } from '../../data/gymStore';

interface UserPlanProps {
  plan: 'Basic' | 'Standard' | 'Premium';
  memberName: string;
  onUpdatePlan?: (plan: 'Basic' | 'Standard' | 'Premium') => void;
}

export function UserPlan({ plan: selectedPlan = 'Premium', memberName, onUpdatePlan }: UserPlanProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const formatCLP = (amount: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);

  const packsConfig = {
    Basic: {
      name: 'Pack Básico Kinesiológico (4 ses)',
      sessions: 4,
      price: 45000,
      description: 'Ideal para evaluaciones puntuales y lesiones agudas leves.',
      features: [
        '1 Evaluación inicial con Ficha SOAP, EVA y ROM',
        '3 Sesiones de kinesiología y terapia manual en box',
        'Pauta de ejercicios domiciliarios guiados',
        'Agendamiento autónomo en la app',
      ],
    },
    Standard: {
      name: 'Pack Recuperación Activa (8 ses)',
      sessions: 8,
      price: 85000,
      description: 'Perfecto para rehabilitación post-traumática y seguimiento continuo.',
      features: [
        'Evaluación biomecánica completa con escalas EVA y ROM',
        '6 Sesiones kinésicas de descarga y readaptación',
        '2 Clases de entrenamiento funcional adaptado',
        'Control de restricciones físicas sincronizado con entrenadores',
        'Reagendamiento y cancelación sin pérdida de sesión',
      ],
    },
    Premium: {
      name: 'Pack Readaptación Total (12 ses)',
      sessions: 12,
      price: 120000,
      description: 'Tratamiento integral de kinesiología con reingreso al deporte.',
      features: [
        'Evaluaciones continuas de movilidad articular y fuerza',
        '8 Sesiones de kinesiología personalizada en box',
        '4 Sesiones de entrenamiento funcional en gimnasio',
        'Acceso total a la app móvil con gráficos de dolor y movilidad',
        'Pase digital QR prioritario',
      ],
    },
  };

  const currentConfig = packsConfig[selectedPlan] ?? packsConfig.Standard;

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRenew = () => {
    addActivity({ name: memberName, action: `renovó ${currentConfig.name}` });
    showFeedback(`¡${currentConfig.name} renovado con éxito! Se acreditaron ${currentConfig.sessions} sesiones.`);
  };

  const handleSelectPack = (planKey: 'Basic' | 'Standard' | 'Premium') => {
    if (onUpdatePlan) {
      onUpdatePlan(planKey);
    }
    const chosen = packsConfig[planKey];
    addActivity({ name: memberName, action: `adquirió ${chosen.name}` });
    showFeedback(`Has activado ${chosen.name} (${chosen.sessions} sesiones) con éxito.`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-1 text-[#F7F7F7]">Paquetes de Kinesiología y Readaptación</h1>
        <p className="text-white/60 text-sm">Gestiona tus sesiones clínicas, rehabilitación y transición a entrenamiento</p>
      </div>

      {feedback && (
        <div className="rounded-xl border border-[#09C82C]/40 bg-[#09C82C]/15 p-4 text-[#09C82C] flex items-center gap-2">
          <Check className="h-5 w-5" />
          <span className="text-sm font-medium">{feedback}</span>
        </div>
      )}

      {/* Current Pack Card */}
      <div className="bg-gradient-to-br from-[#09C82C]/20 to-[#09C82C]/5 rounded-2xl p-6 backdrop-blur-sm border border-[#09C82C]/20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F7F7F7]">{currentConfig.name}</h2>
              <span className="px-3 py-1 bg-[#09C82C]/30 text-[#09C82C] rounded-full text-xs font-bold">
                Activo
              </span>
            </div>
            <p className="text-2xl font-black text-[#09C82C]">{formatCLP(currentConfig.price)} <span className="text-xs font-normal text-white/60">/ paquete completo</span></p>
          </div>
          <Sparkles className="w-8 h-8 text-[#09C82C] hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3.5 border border-white/10">
            <Stethoscope className="w-5 h-5 text-[#09C82C]" />
            <div>
              <p className="text-xs text-white/50">Total de Sesiones</p>
              <p className="font-bold text-white text-sm">{currentConfig.sessions} sesiones</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3.5 border border-white/10">
            <Calendar className="w-5 h-5 text-[#09C82C]" />
            <div>
              <p className="text-xs text-white/50">Fecha de Activación</p>
              <p className="font-bold text-white text-sm">15 Ene, 2025</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3.5 border border-white/10">
            <Clock className="w-5 h-5 text-[#09C82C]" />
            <div>
              <p className="text-xs text-white/50">Vigencia del Paquete</p>
              <p className="font-bold text-white text-sm">60 días hábiles</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-sm mb-3 text-[#F7F7F7]">Cobertura y Beneficios del Paquete</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentConfig.features.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2.5">
                <div className="w-5 h-5 bg-[#09C82C]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-[#09C82C]" />
                </div>
                <span className="text-xs sm:text-sm text-white/90">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleRenew}
            className="w-full sm:w-auto px-6 py-3 bg-[#09C82C] text-[#010A01] rounded-xl hover:bg-[#09C82C]/90 transition-transform hover:scale-105 font-bold text-sm"
          >
            Renovar / Acreditar Paquete
          </button>
        </div>
      </div>

      {/* Available Packs */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-[#F7F7F7]">Adquirir u otro Paquete de Sesiones</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(Object.keys(packsConfig) as Array<'Basic' | 'Standard' | 'Premium'>).map((planKey) => {
            const pack = packsConfig[planKey];
            const isCurrent = planKey === selectedPlan;

            return (
              <div
                key={planKey}
                className={`rounded-2xl p-6 backdrop-blur-sm border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#09C82C]/10 border-[#09C82C] shadow-lg shadow-[#09C82C]/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  {isCurrent && (
                    <span className="inline-block px-3 py-1 bg-[#09C82C] text-[#010A01] rounded-full text-xs font-bold mb-3">
                      Paquete actual
                    </span>
                  )}
                  <h3 className="text-xl font-bold mb-1 text-white">{pack.name}</h3>
                  <p className="text-white/60 text-xs mb-4 min-h-[32px]">{pack.description}</p>
                  
                  <div className="mb-5 pb-5 border-b border-white/10">
                    <p className="text-3xl font-black text-[#09C82C]">
                      {formatCLP(pack.price)}
                    </p>
                    <span className="text-xs text-white/50">{pack.sessions} sesiones incluidas</span>
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {pack.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-white/80">
                        <Check className="w-3.5 h-3.5 text-[#09C82C] mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  disabled={isCurrent}
                  onClick={() => handleSelectPack(planKey)}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition-colors ${
                    isCurrent
                      ? 'bg-white/5 text-white/40 cursor-not-allowed'
                      : 'bg-[#09C82C] text-[#010A01] hover:bg-[#09C82C]/90'
                  }`}
                >
                  {isCurrent ? 'Paquete en uso' : 'Adquirir este paquete'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}