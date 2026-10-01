import React, { useMemo } from 'react';
import { AlertTriangle, ArrowLeft, Eye, Mail, MessageCircle, ShieldAlert, Users } from 'lucide-react';
import { getMembers, getUserBookings } from '../../data/gymStore';

interface AdminRiskDashboardProps {
  memberId?: string | null;
  onViewMember: (memberId: string) => void;
  onViewMembers: () => void;
}

export function AdminRiskDashboard({ memberId, onViewMember, onViewMembers }: AdminRiskDashboardProps) {
  const riskMembers = useMemo(() => {
    const bookings = getUserBookings().filter((booking) => booking.status !== 'cancelled');
    const members = getMembers();
    return members.map((member) => {
      const memberBookings = bookings
        .filter((booking) => booking.memberId ? booking.memberId === member.id : booking.userName.toLowerCase() === member.name.toLowerCase())
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
        noShows: memberBookings.filter((booking) => booking.status === 'no-show').length,
        consecutiveNoShows,
        dates,
        total: memberBookings.length,
      };
    })
      .filter((member) => member.consecutiveNoShows >= 3 && (!memberId || member.id === memberId))
      .sort((a, b) => b.consecutiveNoShows - a.consecutiveNoShows);
  }, [memberId]);

  const openWhatsApp = (member: { name: string; phone?: string }) => {
    const cleanPhone = (member.phone || '').replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('56') ? cleanPhone : `56${cleanPhone.replace(/^0/, '')}`;
    const text = encodeURIComponent(`Hola ${member.name}, te escribimos desde ProFuncional para hablar sobre tus ausencias recientes y reactivar tu continuidad en el centro.`);
    window.open(`https://wa.me/${finalPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const openEmail = (member: { name: string; email: string }) => {
    const subject = encodeURIComponent('Seguimiento de inasistencias');
    const body = encodeURIComponent(
      `Hola ${member.name},\n\nQueremos hablar contigo por tus ausencias recientes en el centro.\n\n¿Podemos coordinar una conversación para revisar tu continuidad y reactivar tu plan?\n\nSaludos,\nEquipo ProFuncional`
    );
    window.location.href = `mailto:${member.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={onViewMembers} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#00E676]">
          <ArrowLeft className="h-4 w-4" /> Volver a miembros
        </button>
        <h1 className="text-3xl font-bold mb-1 text-[#F7F7F7]">Riesgo de inasistencia</h1>
        <p className="text-white/60 text-sm">Seguimiento de miembros con 3 o más clases ausentes consecutivas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-300"><Users className="w-5 h-5" /></span>
            <span className="text-xs uppercase tracking-wider text-amber-200/80">Riesgo</span>
          </div>
          <div className="text-3xl font-bold text-white">{riskMembers.length}</div>
          <p className="text-sm text-white/70">Miembros con 3+ faltas seguidas</p>
        </div>

        <div className="rounded-xl border border-[#00E676]/30 bg-[#00E676]/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#00E676]"><ShieldAlert className="w-5 h-5" /></span>
            <span className="text-xs uppercase tracking-wider text-[#00E676]">Cobertura</span>
          </div>
          <div className="text-3xl font-bold text-white">{Math.max(0, 100 - riskMembers.length * 12)}%</div>
          <p className="text-sm text-white/70">Cobertura de continuidad</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#00E676]"><AlertTriangle className="w-5 h-5" /></span>
            <span className="text-xs uppercase tracking-wider text-white/60">Prioridad</span>
          </div>
          <div className="text-3xl font-bold text-white">{riskMembers.filter((m) => m.consecutiveNoShows >= 4).length}</div>
          <p className="text-sm text-white/70">Alta prioridad</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-[#F7F7F7] mb-4">Contactar a alumnos con faltas repetidas</h2>

        <div className="space-y-3">
          {riskMembers.length === 0 ? (
            <p className="text-white/60">No hay miembros con 3 o más ausencias consecutivas en este momento.</p>
          ) : (
            riskMembers.map((member) => (
              <div key={member.id} className="rounded-xl border border-white/10 bg-[#03161a] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{member.name}</p>
                    <p className="text-xs text-white/50">{member.email}</p>
                    <p className="text-xs text-amber-200 mt-1">Ausencias consecutivas: {member.consecutiveNoShows}</p>
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
