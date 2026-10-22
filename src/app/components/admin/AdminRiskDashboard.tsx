import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Eye, Mail, MessageCircle, ShieldAlert, Users, UserX, CheckCircle2 } from 'lucide-react';
import { getMembers, getUserBookings, liberateFutureBookingsForMember, reactivateMemberBooking, updateMember } from '../../data/gymStore';
import { saveWhatsAppLog } from '../../data/whatsappStore';

interface AdminRiskDashboardProps {
  memberId?: string | null;
  onViewMember: (memberId: string) => void;
  onViewMembers: () => void;
}

export function AdminRiskDashboard({ memberId, onViewMember, onViewMembers }: AdminRiskDashboardProps) {
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const riskMembers = useMemo(() => {
    const bookings = getUserBookings().filter((booking) => booking.status !== 'cancelled');
    const members = getMembers();
    return members.map((member) => {
      const memberBookings = bookings
        .filter((booking) => booking.memberId ? booking.memberId === member.id : Boolean(booking.userName && member.name && booking.userName.toLowerCase() === member.name.toLowerCase()))
        .sort((a, b) => b.date.localeCompare(a.date));
      let consecutiveNoShows = 0;
      const dates: string[] = [];
      for (const booking of memberBookings) {
        if (booking.status === 'attended') break;
        if (booking.status === 'no-show') {
          consecutiveNoShows += 1;
          dates.push(booking.date);
        }
      }
      return {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        bookingSuspended: Boolean(member.bookingSuspended),
        suspensionReason: member.suspensionReason,
        noShows: memberBookings.filter((booking) => booking.status === 'no-show').length,
        consecutiveNoShows: member.consecutiveNoShows ?? consecutiveNoShows,
        dates,
        total: memberBookings.length,
      };
    })
      .filter((member) => (member.consecutiveNoShows >= 3 || member.bookingSuspended) && (!memberId || member.id === memberId))
      .sort((a, b) => b.consecutiveNoShows - a.consecutiveNoShows);
  }, [memberId, actionNotice]);

  const handleLiberateSpots = (member: { id: string; name: string }) => {
    const count = liberateFutureBookingsForMember(member.id, member.name);
    updateMember(member.id, {
      bookingSuspended: true,
      suspensionReason: 'Acumulación de faltas reiteradas sin justificar (Cupos liberados para nuevos alumnos)'
    });
    setActionNotice(`Se liberaron ${count} cupos futuros de ${member.name} y se suspendió su agendamiento.`);
    setTimeout(() => setActionNotice(null), 4500);
  };

  const handleReactivate = (memberId: string, memberName: string) => {
    reactivateMemberBooking(memberId);
    setActionNotice(`Se reactivaron los permisos de agendamiento para ${memberName}.`);
    setTimeout(() => setActionNotice(null), 4500);
  };

  const openWhatsApp = (member: { id?: string; name: string; phone?: string }) => {
    const cleanPhone = (member.phone || '56912345678').replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('56') ? cleanPhone : `56${cleanPhone.replace(/^0/, '')}`;
    const friendlyMsg = `Hola ${member.name} 🌱 Te saludamos con cariño desde ProFuncional. Hoy te extrañamos en el centro. Como sabes, para cuidar los cupos de todos los compañeros, las inasistencias reiteradas sin aviso liberan las reservas futuras. Pero sobre todo, ¡queremos cuidar tu continuidad y que no pierdas tus avances! 💪 Escríbenos cuando puedas para ayudarte a reactivar tu agendamiento. ¡Un abrazo!`;
    
    saveWhatsAppLog({
      memberId: member.id || 'risk-member',
      memberName: member.name,
      phone: finalPhone,
      templateTitle: 'Aviso Empático de Inasistencia & Cuidado de Cupo',
      message: friendlyMsg,
      status: 'sent',
    });

    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(friendlyMsg)}`, '_blank', 'noopener,noreferrer');
  };

  const openEmail = (member: { name: string; email: string }) => {
    const subject = encodeURIComponent('Seguimiento de inasistencias y liberación de cupo');
    const body = encodeURIComponent(
      `Hola ${member.name},\n\nQueremos hablar contigo por tus ausencias recientes en el centro.\n\nSegún la política de ProFuncional, las faltas reiteradas sin aviso liberan cupos para nuevos alumnos asistentes.\n\n¿Podemos coordinar para revisar tu continuidad y reactivar tu plan?\n\nSaludos,\nEquipo ProFuncional`
    );
    window.location.href = `mailto:${member.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={onViewMembers} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#00E676]">
          <ArrowLeft className="h-4 w-4" /> Volver a miembros
        </button>
        <h1 className="text-3xl font-bold mb-1 text-[#F7F7F7]">Control de Inasistencias & Liberación de Cupos</h1>
        <p className="text-white/60 text-sm">Política de cortes por faltas no justificadas para evitar personas que acaparan cupos sin asistir.</p>
      </div>

      {actionNotice && (
        <div className="rounded-xl border border-[#00E676]/40 bg-[#00E676]/15 p-4 text-[#00E676] flex items-center gap-2 text-sm font-bold">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-300"><Users className="w-5 h-5" /></span>
            <span className="text-xs uppercase tracking-wider text-amber-200/80">Riesgo</span>
          </div>
          <div className="text-3xl font-bold text-white">{riskMembers.length}</div>
          <p className="text-sm text-white/70">Alumnos con faltas reiteradas</p>
        </div>

        <div className="rounded-xl border border-[#00E676]/30 bg-[#00E676]/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#00E676]"><ShieldAlert className="w-5 h-5" /></span>
            <span className="text-xs uppercase tracking-wider text-[#00E676]">Cupos Protegidos</span>
          </div>
          <div className="text-3xl font-bold text-white">{riskMembers.filter(m => m.bookingSuspended).length}</div>
          <p className="text-sm text-white/70">Cuentas con cupos liberados</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#00E676]"><AlertTriangle className="w-5 h-5" /></span>
            <span className="text-xs uppercase tracking-wider text-white/60">Prioridad</span>
          </div>
          <div className="text-3xl font-bold text-white">{riskMembers.filter((m) => m.consecutiveNoShows >= 3).length}</div>
          <p className="text-sm text-white/70">3+ ausencias consecutivas</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-[#F7F7F7] mb-4">Gestión de alumnos con ausencias reiteradas</h2>

        <div className="space-y-3">
          {riskMembers.length === 0 ? (
            <p className="text-white/60">No hay miembros con 3 o más ausencias consecutivas en este momento.</p>
          ) : (
            riskMembers.map((member) => (
              <div key={member.id} className="rounded-xl border border-white/10 bg-[#03161a] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{member.name}</p>
                      {member.bookingSuspended && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Cupos Liberados / Suspendido
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50">{member.email}</p>
                    <p className="text-xs text-amber-200 mt-1">Ausencias consecutivas: <strong>{member.consecutiveNoShows}</strong></p>
                    <p className="text-xs text-white/50 mt-1">Faltas totales: {member.noShows} · Fechas: {member.dates.slice(0, 3).join(', ') || 'Sin fechas registradas'}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onViewMember(member.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white hover:border-[#00E676]/40"
                    >
                      <Eye className="w-4 h-4" /> Ver ficha
                    </button>

                    {member.bookingSuspended ? (
                      <button
                        type="button"
                        onClick={() => handleReactivate(member.id, member.name)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Reactivar Cupos
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleLiberateSpots(member)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/20 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/30"
                        title="Cancela reservas futuras y libera los cupos a nuevos asistentes"
                      >
                        <UserX className="w-4 h-4" /> Liberar Cupos
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openWhatsApp(member)}
                      className="interactive-element inline-flex items-center gap-2 rounded-lg bg-[#00E676] px-3 py-2 text-xs font-bold text-[#021826]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => openEmail(member)}
                      className="interactive-element inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white hover:border-[#00E676]/40"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

