import { getMembers } from '../../data/gymStore';
import { careAction } from '../../data/careStore';
import { CarePanel } from '../shared/CarePanel';
import { formatDate } from '../../data/dates';
import React, { useState } from 'react';
import { Check, Sparkles, Clock, Calendar, Stethoscope, Dumbbell, UserCheck } from 'lucide-react';

interface UserPlanProps {
  plan?: 'Basic' | 'Standard' | 'Premium';
  memberName: string;
  onUpdatePlan?: (plan: 'Basic' | 'Standard' | 'Premium') => void;
}

export function UserPlan({ plan: selectedPlan = 'Standard', memberName }: UserPlanProps) {
  const member = getMembers().find(m => m.name === memberName);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'grupal' | 'personalizado'>('grupal');

  const formatCLP = (amount: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);

  const grupalPacks = [
    {
      id: 'grupal-8',
      name: '8 Sesiones Mes',
      category: 'Entrenamiento Funcional Grupal',
      sessions: 8,
      price: 64000,
      description: 'Circuitos de entrenamiento funcional grupal en estaciones (8 personas máximo por grupo).',
      badge: undefined,
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
      features: [
        '12 sesiones al mes en circuitos funcionales',
        'Máximo 8 personas por grupo para mayor supervisión',
        'Frecuencia recomendada de 3 veces por semana',
        'Agendamiento y reagendamiento sin costo (al menos 24 hrs)',
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
      badge: 'Bonus',
      features: [
        '20 sesiones al mes en circuitos funcionales',
        'Máximo 8 personas por grupo',
        'Plan intensivo de alto rendimiento',
        'Incluye bonus especial de fidelidad',
        'Estacionamiento privado, baños y camarines',
      ],
    },
  ];

  const personalizadoPacks = [
    {
      id: 'pers-4',
      name: '4 Sesiones Personalizadas',
      category: 'Entrenamiento Personalizado',
      sessions: 4,
      price: 100000,
      description: 'Para objetivos específicos: corrección postural, reintegro deportivo, eliminación de dolores físicos y preparación deportiva.',
      badge: undefined,
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
      features: [
        '12 sesiones 1 a 1 de alta especialización',
        'Preparación deportiva de alto rendimiento o readaptación total',
        'Monitoreo continuo de dolor (EVA) y movilidad (ROM)',
        'Acceso prioritario a horarios de atención',
      ],
    },
  ];

  const currentPacks = activeCategory === 'grupal' ? grupalPacks : personalizadoPacks;

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const requestPack = async (packName: string, price: number) => {
    if (!member) return;
    try {
      await careAction(member.id, 'message', { text: `Quiero contratar/renovar: ${packName} (${formatCLP(price)})` }, false, member.name);
      showFeedback('Solicitud enviada a Pro-Funcional. El equipo confirmará el pago y acreditará las sesiones en tu cuenta.');
    } catch (e) {
      showFeedback((e as Error).message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-1 text-[#F7F7F7]">Valores y Planes Oficiales Pro-Funcional</h1>
        <p className="text-white/60 text-sm">Elige entre Entrenamiento Funcional Grupal o Entrenamiento Personalizado</p>
      </div>

      {feedback && (
        <div className="rounded-xl border border-[#00E676]/40 bg-[#00E676]/15 p-4 text-[#00E676] flex items-center gap-2">
          <Check className="h-5 w-5" />
          <span className="text-sm font-medium">{feedback}</span>
        </div>
      )}

      {/* Selector de Categoría (Grupal vs Personalizado) */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
        <button
          onClick={() => setActiveCategory('grupal')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeCategory === 'grupal'
              ? 'bg-[#00E676] text-[#021826] shadow-lg shadow-[#00E676]/20'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          <span>Funcional Grupal (Máx. 8 pers)</span>
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
          <span>Entrenamiento Personalizado</span>
        </button>
      </div>

      {/* Mi Plan Activo Banner */}
      <div className="bg-gradient-to-br from-[#00E676]/20 to-[#00E676]/5 rounded-2xl p-6 backdrop-blur-sm border border-[#00E676]/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#00E676] block mb-1">Mi Plan / Paquete Activo</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F7F7F7]">{member?.packName || 'Pack Entrenamiento Funcional'}</h2>
          </div>
          <Sparkles className="w-8 h-8 text-[#00E676] hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3.5 border border-white/10">
            <Stethoscope className="w-5 h-5 text-[#00E676]" />
            <div>
              <p className="text-xs text-white/50">Saldo de Sesiones</p>
              <p className="font-bold text-white text-sm">{member?.remainingSessions ?? 5} de {member?.totalSessions ?? 8} dispon.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3.5 border border-white/10">
            <Calendar className="w-5 h-5 text-[#00E676]" />
            <div>
              <p className="text-xs text-white/50">Fecha de Ingreso</p>
              <p className="font-bold text-white text-sm">{formatDate(member?.joinDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3.5 border border-white/10">
            <Clock className="w-5 h-5 text-[#00E676]" />
            <div>
              <p className="text-xs text-white/50">Vigencia del Paquete</p>
              <p className="font-bold text-white text-sm">{formatDate(member?.nextBilling)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Planes según categoría activa */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[#F7F7F7]">
            {activeCategory === 'grupal' ? 'Planes Grupales en Estaciones' : 'Planes de Entrenamiento Personalizado'}
          </h2>
          <p className="text-xs text-white/60">
            {activeCategory === 'grupal'
              ? 'Circuitos de entrenamiento funcional en estaciones (máximo 8 personas por grupo)'
              : 'Para objetivos específicos: corrección postural, reintegro deportivo, eliminación de dolores y preparación física.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {currentPacks.map((pack) => (
            <div
              key={pack.id}
              className="rounded-2xl p-6 backdrop-blur-sm bg-white/5 border border-white/10 hover:border-[#00E676]/50 transition-all flex flex-col justify-between"
            >
              <div>
                {pack.badge && (
                  <span className="inline-block px-3 py-1 bg-[#00E676] text-[#021826] rounded-full text-xs font-bold mb-3">
                    {pack.badge}
                  </span>
                )}
                <h3 className="text-xl font-bold mb-1 text-white">{pack.name}</h3>
                <p className="text-white/60 text-xs mb-4 min-h-[36px]">{pack.description}</p>
                
                <div className="mb-5 pb-5 border-b border-white/10">
                  <p className="text-3xl font-black text-[#00E676]">
                    {formatCLP(pack.price)}
                  </p>
                  <span className="text-xs text-white/50">{pack.sessions} sesiones incluidas</span>
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

              <button
                onClick={() => requestPack(pack.name, pack.price)}
                className="w-full py-3 rounded-xl font-bold text-xs bg-[#00E676] text-[#021826] hover:bg-[#00E676]/90 transition-colors shadow-lg shadow-[#00E676]/20"
              >
                Solicitar / Contratar este Plan
              </button>
            </div>
          ))}
        </div>
      </div>

      {member && (
        <>
          <CarePanel memberId={member.id} section="payments" />
          <CarePanel memberId={member.id} section="rewards" />
        </>
      )}
    </div>
  );
}