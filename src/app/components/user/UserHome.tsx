import React, { useEffect, useState } from 'react';
import { Calendar, Dumbbell, QrCode, TrendingUp, Stethoscope, AlertTriangle, Activity, ArrowRight } from 'lucide-react';
import { AuthUser } from '../auth/Login';
import { getMemberByEmail, GymMember, subscribeToMembers } from '../../data/gymStore';

interface UserHomeProps {
  user: AuthUser;
  onNavigate?: (view: 'home' | 'plan' | 'calendar' | 'training' | 'card' | 'profile') => void;
}

export function UserHome({ user: account, onNavigate }: UserHomeProps) {
  const [memberData, setMemberData] = useState<GymMember | undefined>(() => getMemberByEmail(account.email));

  useEffect(() => {
    const unsub = subscribeToMembers(() => {
      const updated = getMemberByEmail(account.email);
      if (updated) setMemberData(updated);
    });
    return unsub;
  }, [account.email]);

  const selectedClasses = account.selectedClasses ?? [];
  const nextSession = {
    name: selectedClasses[0] || 'Kinesiología & Readaptación',
    time: 'Hoy a las 18:00',
    instructor: 'Klgo. Andrés Morales',
    type: 'Box Clínico',
  };

  const remainingSessions = memberData?.remainingSessions ?? 5;
  const totalSessions = memberData?.totalSessions ?? 8;
  const packName = memberData?.packName || 'Pack Recuperación Activa (8 ses)';
  const restrictions = memberData?.physicalRestrictions;

  const quickStats = [
    { label: 'Sesiones disponibles', value: `${remainingSessions}/${totalSessions}`, icon: Stethoscope },
    { label: 'Evaluación de dolor (EVA)', value: memberData?.clinicalHistory?.[0] ? `${memberData.clinicalHistory[0].evaPain}/10` : '3/10', icon: Activity },
    { label: 'Racha de constancia', value: '12 días', icon: TrendingUp },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-[#09C82C]/20 to-[#09C82C]/5 rounded-2xl p-6 backdrop-blur-sm border border-[#09C82C]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#09C82C]">Centro Kinésico-Deportivo</span>
          <h1 className="text-3xl font-black text-[#F7F7F7] mt-0.5">¡Hola, {account.name}!</h1>
          <p className="text-white/65 text-sm mt-1">Tu avance físico y sesiones agendadas en un solo lugar.</p>
        </div>

        <button
          onClick={() => onNavigate?.('calendar')}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-[#09C82C] text-[#010A01] text-xs font-bold hover:bg-[#09C82C]/90 transition-transform hover:scale-105"
        >
          Agendar Sesión (&lt;30s)
        </button>
      </div>

      {/* Alerta de Restricción Física si existe */}
      {restrictions && restrictions !== 'Sin restricciones reportadas' && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-start gap-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-400 uppercase tracking-wide">Pauta Kinésica Activa:</span>
            <p className="mt-0.5 text-white/90 font-medium">{restrictions}</p>
          </div>
        </div>
      )}

      {/* Session Pack Balance Card */}
      <div className="bg-white/5 rounded-xl p-5 backdrop-blur-sm border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-white/60">Mi Paquete Contratado</span>
            <h3 className="font-bold text-lg text-white">{packName}</h3>
          </div>
          <button
            onClick={() => onNavigate?.('plan')}
            className="text-xs text-[#09C82C] font-semibold hover:underline flex items-center gap-1"
          >
            Ver paquete / renovar <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-white/70">Saldo de sesiones activas</span>
            <span className="text-[#09C82C]">{remainingSessions} de {totalSessions} disponibles</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#09C82C] h-full rounded-full transition-all duration-500"
              style={{ width: `${(remainingSessions / totalSessions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Next Training */}
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#F7F7F7]">Próxima Cita Kinésica / Entrenamiento</h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#09C82C]/20 text-[#09C82C] font-semibold border border-[#09C82C]/30">
            {nextSession.type}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#09C82C]/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-6 h-6 text-[#09C82C]" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[#F7F7F7]">{nextSession.name}</h4>
            <p className="text-xs text-white/60">Profesional: {nextSession.instructor}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-[#F7F7F7]">{nextSession.time}</p>
            <button
              onClick={() => onNavigate?.('calendar')}
              className="text-xs text-[#09C82C] hover:underline mt-1 block"
            >
              Reagendar o Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-9 h-9 bg-[#09C82C]/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#09C82C]" />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <p className="text-xs text-white/60">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate?.('calendar')}
          className="bg-white/5 hover:bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/10 transition-all text-left group hover:scale-[1.02]"
        >
          <Calendar className="w-7 h-7 text-[#09C82C] mb-2 transition-transform group-hover:scale-110" />
          <h3 className="font-bold text-sm mb-1 text-[#F7F7F7]">Reservar Sesión</h3>
          <p className="text-xs text-white/55">Elige horario en menos de 30 segundos</p>
        </button>
        
        <button
          onClick={() => onNavigate?.('training')}
          className="bg-white/5 hover:bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/10 transition-all text-left group hover:scale-[1.02]"
        >
          <Activity className="w-7 h-7 text-amber-400 mb-2 transition-transform group-hover:scale-110" />
          <h3 className="font-bold text-sm mb-1 text-[#F7F7F7]">Mi Evolución Kinésica</h3>
          <p className="text-xs text-white/55">Gráficos de dolor EVA y movilidad articular</p>
        </button>

        <button
          onClick={() => onNavigate?.('card')}
          className="bg-white/5 hover:bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/10 transition-all text-left group hover:scale-[1.02]"
        >
          <QrCode className="w-7 h-7 text-[#09C82C] mb-2 transition-transform group-hover:scale-110" />
          <h3 className="font-bold text-sm mb-1 text-[#F7F7F7]">Pase Digital QR</h3>
          <p className="text-xs text-white/55">Acceso por torniquete / recepción</p>
        </button>
      </div>
    </div>
  );
}