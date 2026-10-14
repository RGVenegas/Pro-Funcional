import { getUserBookings, subscribeToBookings, bookingStart } from '../../data/gymStore';
import { formatDate } from '../../data/dates';
import { ReminderPanel } from '../shared/ReminderPanel';
import React, { useEffect, useState } from 'react';
import { Calendar, Dumbbell, QrCode, TrendingUp, Stethoscope, AlertTriangle, Activity, ArrowRight, CalendarPlus, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import { AuthUser } from '../auth/Login';
import { getMemberByEmail, GymMember, subscribeToMembers } from '../../data/gymStore';
import { Logo } from '../shared/Logo';
import { downloadIcsEvent, getGoogleCalendarUrl } from '../../utils/calendarExport';
import { openWhatsApp } from '../../utils/whatsapp';

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

  const [, tick] = useState(0);
  useEffect(() => subscribeToBookings(() => tick(n => n + 1)), []);
  const bookings = getUserBookings(account.name);
  const upcoming = bookings.filter(b => (!b.status || b.status === 'pending') && bookingStart(b) > Date.now()).sort((a, b) => bookingStart(a) - bookingStart(b))[0];
  const nextSession = { name: upcoming?.title || 'Sin clases agendadas', time: upcoming ? formatDate(upcoming.date) + ' · ' + upcoming.time : 'Elige un horario disponible', instructor: upcoming?.instructor || 'Por asignar', type: upcoming?.type === 'kine' ? 'Box Clínico' : 'Entrenamiento' };

  const remainingSessions = memberData?.remainingSessions ?? 5;
  const totalSessions = memberData?.totalSessions ?? 8;
  const packName = memberData?.packName || 'Pack Recuperación Activa (8 ses)';
  const restrictions = memberData?.physicalRestrictions;

  const quickStats = [
    { label: 'Sesiones disponibles', value: `${remainingSessions}/${totalSessions}`, icon: Stethoscope },
    { label: 'Evaluación de dolor (EVA)', value: memberData?.clinicalHistory?.[0] ? `${memberData.clinicalHistory[0].evaPain}/10` : 'Sin registro', icon: Activity },
    { label: 'Clases asistidas', value: String(bookings.filter(b => b.status === 'attended').length), icon: TrendingUp },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-3 sm:space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-[#00E676]/20 to-[#00E676]/5 rounded-2xl p-4 sm:p-6 backdrop-blur-sm border border-[#00E676]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1.5">
          <Logo size="sm" />
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#F7F7F7] mt-0.5">¡Hola, {account.name}!</h1>
            <p className="text-white/65 text-xs sm:text-sm mt-0.5">Tu avance físico y sesiones agendadas en un solo lugar.</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate?.('calendar')}
          className="self-start sm:self-auto px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#00E676] text-[#011406] text-xs font-bold hover:bg-[#00E676]/90 transition-transform active:scale-95 shadow-md shadow-[#00E676]/20"
        >
          Agendar Sesión
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
      <div className="bg-white/5 rounded-xl p-3.5 sm:p-5 backdrop-blur-sm border border-white/10 space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] sm:text-xs text-white/60">Mi Paquete Contratado</span>
            <h3 className="font-bold text-sm sm:text-lg text-white">{packName}</h3>
          </div>
          <button
            onClick={() => onNavigate?.('plan')}
            className="text-xs text-[#00E676] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Ver paquete</span> <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] sm:text-xs font-semibold">
            <span className="text-white/70">Saldo de sesiones activas</span>
            <span className="text-[#00E676]">{remainingSessions} de {totalSessions} disponibles</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-2 sm:h-2.5 overflow-hidden">
            <div
              className="bg-[#00E676] h-full rounded-full transition-all duration-500"
              style={{ width: `${(remainingSessions / totalSessions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Next Training Card */}
      <div className="bg-white/5 rounded-2xl p-3.5 sm:p-5 backdrop-blur-sm border border-white/10 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#00E676]" />
            <h3 className="font-bold text-xs sm:text-sm text-[#F7F7F7]">Próxima Cita Kinésica / Entrenamiento</h3>
          </div>
          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#00E676]/20 text-[#00E676] font-semibold border border-[#00E676]/30">
            {nextSession.type}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00E676]/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-[#00E676]" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#F7F7F7]">{nextSession.name}</h4>
              <p className="text-[11px] sm:text-xs text-white/60">Profesional: {nextSession.instructor}</p>
              <p className="text-[11px] sm:text-xs font-semibold text-[#00E676] mt-0.5">{nextSession.time}</p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 sm:gap-2">
            <button
              onClick={() => onNavigate?.('calendar')}
              className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Reagendar o Cancelar
            </button>
            {upcoming && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => downloadIcsEvent({
                    title: `ProFuncional: ${upcoming.title || 'Sesión Kinésica'}`,
                    dateStr: upcoming.date,
                    timeStr: upcoming.time || '10:00',
                    description: `Sesión con ${upcoming.instructor || 'Kinesiólogo'}. Recuerda política de cancelación de 24h.`,
                  })}
                  title="Descargar para Apple Calendar / Outlook (.ics)"
                  className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#00E676] bg-[#00E676]/10 hover:bg-[#00E676]/20 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-[#00E676]/30 transition-colors"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Apple / Outlook</span>
                </button>
                <a
                  href={getGoogleCalendarUrl({
                    title: `ProFuncional: ${upcoming.title || 'Sesión Kinésica'}`,
                    dateStr: upcoming.date,
                    timeStr: upcoming.time || '10:00',
                    description: `Sesión con ${upcoming.instructor || 'Kinesiólogo'}. Recuerda política de cancelación de 24h.`,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir en Google Calendar"
                  className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-white/80 bg-white/10 hover:bg-white/20 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-white/10 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Google</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Alerta de Política 24h para la próxima sesión */}
        {upcoming && (
          <div className={`p-2.5 sm:p-3 rounded-xl border text-[11px] sm:text-xs flex items-center justify-between gap-2 sm:gap-3 ${
            hoursUntilSession >= 24
              ? 'bg-[#00E676]/10 border-[#00E676]/30 text-[#00E676]'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <div className="flex items-center gap-1.5">
              {hoursUntilSession >= 24 ? (
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              )}
              <span>
                {hoursUntilSession >= 24
                  ? `Puedes reagendar sin costo (quedan aprox. ${hoursUntilSession}h).`
                  : `Faltan menos de 24h (${hoursUntilSession}h). Cancelación sin reembolso.`}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/40 whitespace-nowrap">
              Regla 24h
            </span>
          </div>
        )}
      </div>

      {memberData && <ReminderPanel memberId={memberData.id} />}

      {/* Quick Stats (Compact 3 columns) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/5 rounded-xl p-2.5 sm:p-4 backdrop-blur-sm border border-white/10 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 mb-1">
                <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#00E676]/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00E676]" />
                </div>
                <p className="text-sm sm:text-2xl font-black text-white">{stat.value}</p>
              </div>
              <p className="text-[10px] sm:text-xs text-white/60 truncate">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Support (Compact 2x2 grid on mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <button
          onClick={() => onNavigate?.('calendar')}
          className="bg-white/5 hover:bg-white/10 active:scale-95 rounded-2xl p-3 sm:p-5 backdrop-blur-sm border border-white/10 transition-all text-left group"
        >
          <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-[#00E676] mb-1.5 transition-transform group-hover:scale-110" />
          <h3 className="font-bold text-xs sm:text-sm mb-0.5 text-[#F7F7F7]">Reservar Sesión</h3>
          <p className="text-[10px] sm:text-xs text-white/55 line-clamp-1 sm:line-clamp-none">Elige horario disponible</p>
        </button>
        
        <button
          onClick={() => onNavigate?.('training')}
          className="bg-white/5 hover:bg-white/10 active:scale-95 rounded-2xl p-3 sm:p-5 backdrop-blur-sm border border-white/10 transition-all text-left group"
        >
          <Activity className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400 mb-1.5 transition-transform group-hover:scale-110" />
          <h3 className="font-bold text-xs sm:text-sm mb-0.5 text-[#F7F7F7]">Mi Evolución</h3>
          <p className="text-[10px] sm:text-xs text-white/55 line-clamp-1 sm:line-clamp-none">Dolor EVA y movilidad ROM</p>
        </button>

        <button
          onClick={() => onNavigate?.('card')}
          className="bg-white/5 hover:bg-white/10 active:scale-95 rounded-2xl p-3 sm:p-5 backdrop-blur-sm border border-white/10 transition-all text-left group"
        >
          <QrCode className="w-5 h-5 sm:w-7 sm:h-7 text-[#00E676] mb-1.5 transition-transform group-hover:scale-110" />
          <h3 className="font-bold text-xs sm:text-sm mb-0.5 text-[#F7F7F7]">Pase Digital QR</h3>
          <p className="text-[10px] sm:text-xs text-white/55 line-clamp-1 sm:line-clamp-none">Acceso por torniquete</p>
        </button>

        <button
          onClick={() => openWhatsApp(account.name)}
          className="bg-[#25D366]/10 hover:bg-[#25D366]/20 active:scale-95 rounded-2xl p-3 sm:p-5 backdrop-blur-sm border border-[#25D366]/30 transition-all text-left group"
        >
          <MessageCircle className="w-5 h-5 sm:w-7 sm:h-7 text-[#25D366] mb-1.5 transition-transform group-hover:scale-110" />
          <h3 className="font-bold text-xs sm:text-sm mb-0.5 text-[#F7F7F7]">Chat WhatsApp</h3>
          <p className="text-[10px] sm:text-xs text-white/55 line-clamp-1 sm:line-clamp-none">Recepción y kinesiólogo</p>
        </button>
      </div>

    </div>
  );
}