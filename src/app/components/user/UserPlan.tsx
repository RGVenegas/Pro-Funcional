import React from 'react';
import { Check, Sparkles, Clock, Calendar } from 'lucide-react';
import { addActivity } from '../../data/gymStore';

interface UserPlanProps {
  plan: 'Basic' | 'Standard' | 'Premium';
  memberName: string;
}

export function UserPlan({ plan: selectedPlan = 'Premium', memberName }: UserPlanProps) {
  const formatCLP = (amount: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);

  const currentPlan = {
    name: selectedPlan,
    status: 'active',
    price: 99,
    startDate: '2024-01-15',
    expirationDate: '2025-02-15',
    benefits: [
      'Unlimited gym access',
      'All group classes included',
      'Personal trainer consultation',
      'Access to premium equipment',
      'Nutrition guidance',
      'Mobile app premium features',
    ],
  };

  const availablePlans = [
    {
      name: 'Basic',
      price: 29,
      description: 'Ideal para comenzar',
      features: ['Acceso al gimnasio en horario valle', 'Acceso a equipamiento basico', 'Aplicacion movil'],
    },
    {
      name: 'Standard',
      price: 59,
      description: 'Perfecto para entrenar con frecuencia',
      features: ['Acceso ilimitado al gimnasio', 'Clases grupales (5 al mes)', 'Arriendo de casillero', 'Aplicacion movil'],
    },
    {
      name: 'Premium',
      price: 99,
      description: 'La experiencia de entrenamiento completa',
      features: ['Todos los beneficios Standard', 'Clases grupales ilimitadas', 'Sesiones con entrenador personal', 'Orientacion nutricional'],
      popular: true,
    },
  ];

  const daysUntilExpiration = Math.floor(
    (new Date(currentPlan.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-[#F7F7F7]">Mi membresia</h1>
        <p className="text-white/60">Administra tu suscripcion y beneficios</p>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-[#09C82C]/20 to-[#09C82C]/5 rounded-xl p-6 backdrop-blur-sm border border-[#09C82C]/20">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-[#F7F7F7]">{currentPlan.name}</h2>
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
              <p className="font-medium">{new Date(currentPlan.startDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
            <Clock className="w-5 h-5 text-[#09C82C]" />
            <div>
              <p className="text-xs text-white/60">Vencimiento</p>
              <p className="font-medium">{new Date(currentPlan.expirationDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {daysUntilExpiration <= 30 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <p className="text-yellow-400 text-sm">
              Tu plan vence en {daysUntilExpiration} dias. Renueva ahora para seguir disfrutando tus beneficios.
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
          <button onClick={() => addActivity({ name: memberName, action: `renovo la membresia ${currentPlan.name}` })} className="flex-1 px-6 py-3 bg-[#09C82C] text-[#010A01] rounded-lg hover:bg-[#09C82C]/90 transition-colors font-medium">
            Renovar membresia
          </button>
          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium">
            Cancelar
          </button>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-[#F7F7F7]">Cambiar de membresia</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availablePlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-6 backdrop-blur-sm border transition-all ${
                plan.popular
                  ? 'bg-[#09C82C]/10 border-[#09C82C] scale-105'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {plan.popular && (
                <span className="inline-block px-3 py-1 bg-[#09C82C] text-[#010A01] rounded-full text-xs font-medium mb-4">
                  Membresia actual
                </span>
              )}
              <h3 className="text-xl font-bold mb-2 text-[#F7F7F7]">{plan.name}</h3>
              <p className="text-white/60 text-sm mb-4">{plan.description}</p>
              <p className="text-3xl font-bold mb-6">
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
                disabled={plan.name === currentPlan.name}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.name === currentPlan.name
                    ? 'bg-white/5 text-white/40 cursor-not-allowed'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {plan.name === currentPlan.name ? 'Membresia actual' : 'Seleccionar plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}