import React, { useMemo } from 'react';
import { AlertTriangle, Mail, MessageCircle, ShieldAlert, Users } from 'lucide-react';
import { getMembers, getUserBookings } from '../../data/gymStore';

export function AdminRiskDashboard() {
  const riskMembers = useMemo(() => {
    const bookings = getUserBookings();
    const map = new Map<string, { id: string; name: string; email: string; phone?: string; noShows: number; dates: string[]; total: number }>();

    for (const booking of bookings) {
      if (!booking.userName || booking.status === 'cancelled') continue;
      const member = getMembers().find((m) => m.id === booking.memberId || m.name === booking.userName);
      const key = member?.id || booking.userName;
      const current = map.get(key) ?? {
        id: member?.id || key,
        name: booking.userName,
        email: member?.email || `${booking.userName.toLowerCase().replace(/\s+/g, '.')}@profuncional.cl`,
        phone: member?.phone,
        noShows: 0,
        dates: [],
        total: 0,
      };

      current.total += 1;
      if (booking.status === 'no-show') {
        current.noShows += 1;
        current.dates.push(booking.date);
      }

      map.set(key, current);
    }

    return Array.from(map.values())
      .filter((member) => member.noShows >= 2)
      .sort((a, b) => b.noShows - a.noShows);
  }, []);

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
        <h1 className="text-3xl font-bold mb-1 text-[#F7F7F7]">Riesgo de inasistencia</h1>
        <p className="text-white/60 text-sm">Seguimiento de alumnos con 2 o más faltas para activar contacto proactivo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-300"><Users className="w-5 h-5" /></span>
            <span className="text-xs uppercase tracking-wider text-amber-200/80">Riesgo</span>
          </div>
          <div className="text-3xl font-bold text-white">{riskMembers.length}</div>
          <p className="text-sm text-white/70">Alumnos con 2+ faltas</p>
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
          <div className="text-3xl font-bold text-white">{riskMembers.filter((m) => m.noShows >= 3).length}</div>
          <p className="text-sm text-white/70">Alta prioridad</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-[#F7F7F7] mb-4">Contactar a alumnos con faltas repetidas</h2>

        <div className="space-y-3">
          {riskMembers.length === 0 ? (
            <p className="text-white/60">No hay alumnos con 2 o más inasistencias en este momento.</p>
          ) : (
            riskMembers.map((member) => (
              <div key={member.id} className="rounded-xl border border-white/10 bg-[#03161a] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{member.name}</p>
                    <p className="text-xs text-white/50">{member.email}</p>
                    <p className="text-xs text-white/50 mt-1">Faltas: {member.noShows} · Fechas: {member.dates.slice(0, 3).join(', ') || 'Sin fechas registradas'}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
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
