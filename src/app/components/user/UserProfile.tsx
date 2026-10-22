import React, { useState, useEffect } from 'react';
import { Calendar, Check, Mail, ShieldCheck, UserRound, Clock, CreditCard, Dumbbell, Heart, ArrowUpRight, Sparkles, Scale, Activity } from 'lucide-react';
import { getMemberByEmail, getMembers, GymMember } from '../../data/gymStore';
import { formatDate, calculatePlanCycle } from '../../data/dates';
import { CarePanel } from '../shared/CarePanel';
import { AuthUser } from '../auth/Login';
import { ProgressCharts } from '../charts/ProgressCharts';
import {
  getMemberProgressAssessments,
  subscribeToProgress,
  ProgressAssessment,
  HEALTH_METRICS_INFO,
} from '../../data/progressStore';

interface UserProfileProps {
  user: AuthUser;
}

export function UserProfile({ user: account }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'metrics'>('account');
  const member: GymMember | undefined =
    getMemberByEmail(account.email) ||
    getMembers().find((m) => m.name.toLowerCase() === account.name.toLowerCase()) ||
    getMembers()[0];

  const [assessments, setAssessments] = useState<ProgressAssessment[]>(() =>
    member ? getMemberProgressAssessments(member.id) : []
  );

  useEffect(() => {
    const unsub = subscribeToProgress(() => {
      if (member) {
        setAssessments(getMemberProgressAssessments(member.id));
      }
    });
    return unsub;
  }, [member?.id]);

  const cycle = calculatePlanCycle(member?.joinDate, member?.nextBilling);
  const user = {
    name: account.name,
    email: account.email,
    plan: account.plan ?? 'Premium',
    status: member?.bookingSuspended
      ? 'Suspendida (Faltas)'
      : member?.status === 'active'
      ? cycle.isInGracePeriod
        ? 'Período de Gracia'
        : 'Activa'
      : member?.status === 'suspended'
      ? 'Suspendida'
      : 'Vencida',
    memberSince: cycle.joinDate,
    renewalDate: cycle.renewalDate,
    gracePeriodDate: cycle.gracePeriodEndDate,
  };

  const latestAssessment = assessments[assessments.length - 1];

  return (
    <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl sm:text-3xl font-bold text-[#F7F7F7]">Mi Perfil</h1>
          <p className="text-xs sm:text-sm text-white/60">
            Administra tus datos de membresía, 10 ejercicios base y métricas de salud bioimpedancia.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'account'
                ? 'bg-[#00E676] text-[#021826] shadow-lg shadow-[#00E676]/20'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <UserRound className="w-3.5 h-3.5" />
            <span>Membresía & Cuenta</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'metrics'
                ? 'bg-[#00E676] text-[#021826] shadow-lg shadow-[#00E676]/20'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>10 Ejercicios & Métricas ({assessments.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'account' ? (
        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-8">
            <div className="flex flex-col items-start gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 border-[#00E676] bg-[#00E676]/20 flex-shrink-0">
                <UserRound className="h-7 w-7 sm:h-9 sm:w-9 text-[#00E676]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-[#F7F7F7]">{user.name}</h2>
                <p className="mt-0.5 flex items-center gap-2 text-xs sm:text-sm text-white/60">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#00E676]/30 bg-gradient-to-br from-[#00E676]/20 to-transparent p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white/60">Nivel de membresía</p>
                  <p className="mt-1 text-3xl font-bold text-[#00E676]">{user.plan}</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-[#00E676]" />
              </div>
              <span
                className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                  cycle.isInGracePeriod ? 'bg-amber-500/20 text-amber-300' : 'bg-[#00E676]/20 text-[#00E676]'
                }`}
              >
                <Check className="h-4 w-4" />
                {user.status}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3.5 border border-white/10">
                <Calendar className="h-5 w-5 text-[#00E676] flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/50">Inscripción Original</p>
                  <p className="font-semibold text-sm text-white">{formatDate(user.memberSince)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3.5 border border-white/10">
                <Clock className="h-5 w-5 text-[#00E676] flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/50">Vencimiento (Ciclo 30d)</p>
                  <p className="font-semibold text-sm text-white">{formatDate(user.renewalDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3.5 border border-white/10">
                <CreditCard className="h-5 w-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/50">Límite Pago (+5d)</p>
                  <p className="font-semibold text-sm text-amber-300">{formatDate(user.gracePeriodDate)}</p>
                </div>
              </div>
            </div>

            {/* Quick KPI Card of Health & Strength */}
            {latestAssessment ? (
              <div className="mt-6 rounded-2xl border border-[#00E676]/30 bg-[#00E676]/5 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00E676]" />
                    <h4 className="font-bold text-sm text-white">Último Test Físico Registrado</h4>
                    <span className="text-xs text-white/50">({formatDate(latestAssessment.date)})</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('metrics')}
                    className="text-xs font-bold text-[#00E676] hover:underline flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>Ver Curvas y 10 Ejercicios</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-white/50 uppercase font-semibold block">Peso</span>
                    <p className="text-lg font-bold text-white">{latestAssessment.health.weight} <span className="text-xs text-white/50">kg</span></p>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-white/50 uppercase font-semibold block">IMC</span>
                    <p className="text-lg font-bold text-emerald-400">{latestAssessment.health.bmi}</p>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-white/50 uppercase font-semibold block">% Grasa</span>
                    <p className="text-lg font-bold text-sky-400">{latestAssessment.health.bodyFat}%</p>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-white/50 uppercase font-semibold block">Sentadilla</span>
                    <p className="text-lg font-bold text-[#00E676]">{latestAssessment.exercises.squat} <span className="text-xs text-white/50">kg</span></p>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-white/50 uppercase font-semibold block">Press Banca</span>
                    <p className="text-lg font-bold text-[#00E676]">{latestAssessment.exercises.benchPress} <span className="text-xs text-white/50">kg</span></p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Soporte Kinésico y Recepción</span>
                </h4>
                <p className="text-xs text-white/70 mt-1">
                  ¿Tienes dudas con tu diagnóstico, pauta médica o pagos? Escríbenos directamente.
                </p>
              </div>
              <button
                onClick={() => {
                  const url = `https://wa.me/56912345678?text=${encodeURIComponent(
                    `Hola ProFuncional, soy ${user.name}. Necesito comunicarme con recepción sobre mi cuenta y sesiones.`
                  )}`;
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
                className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-black font-extrabold text-xs shadow-lg shadow-[#25D366]/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Contactar por WhatsApp</span>
              </button>
            </div>
          </div>
          {member && <CarePanel memberId={member.id} section="profile" author={member.name} />}
        </div>
      ) : (
        <div className="space-y-6">
          {member && (
            <ProgressCharts
              memberId={member.id}
              memberName={member.name}
              assessments={assessments}
              canEdit={true}
              defaultTab="health"
            />
          )}
        </div>
      )}
    </div>
  );
}
