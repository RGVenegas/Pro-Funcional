import React, { FormEvent, useEffect, useState } from 'react';
import { Search, Eye, UserPlus, QrCode, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { addActivity, addMember, getMemberCheckIns, getMembers, getUserBookings, GymMember, recordQrCheckIn, subscribeToBookings, subscribeToMembers } from '../../data/gymStore';
import { apiEnabled, hasToken, request } from '../../data/api';

interface Member {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'active' | 'expired' | 'suspended';
  balance: number;
  joinDate: string;
}

interface MembersListProps {
  onViewMember: (memberId: string) => void;
  onViewRisk: (memberId: string) => void;
}

export function MembersList({ onViewMember, onViewRisk }: MembersListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'alert'>('all');
  const [members, setMembers] = useState<GymMember[]>(getMembers);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [qrMessage, setQrMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const formatCLP = (amount: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);

  useEffect(() => subscribeToMembers(() => setMembers(getMembers())), []);
  useEffect(() => subscribeToBookings(() => setMembers(getMembers())), []);

  const getAttendanceSummary = (member: GymMember) => {
    const bookings = getUserBookings()
      .filter((booking) => (booking.memberId ? booking.memberId === member.id : booking.userName.toLowerCase() === member.name.toLowerCase()) && booking.status !== 'cancelled')
      .sort((a, b) => b.date.localeCompare(a.date));
    const checkIns = getMemberCheckIns().filter((checkIn) => checkIn.memberId === member.id);
    const missedQrBookings = bookings.filter((booking) => {
      const startTime = booking.time.split(' - ')[0];
      const bookingStart = new Date(`${booking.date}T${startTime}:00`);
      const hasQrCheckIn = checkIns.some((checkIn) => {
        const checkedAt = new Date(checkIn.checkedAt);
        const checkInDate = `${checkedAt.getFullYear()}-${String(checkedAt.getMonth() + 1).padStart(2, '0')}-${String(checkedAt.getDate()).padStart(2, '0')}`;
        return checkInDate === booking.date;
      });
      return bookingStart < new Date() && !hasQrCheckIn;
    });
    let consecutiveAbsences = 0;
    for (const booking of bookings) {
      if (booking.status === 'attended') break;
      if (booking.status === 'no-show') consecutiveAbsences += 1;
    }

    const sessions = [
      ...bookings.filter((booking) => booking.status === 'attended').map((booking) => ({
        date: new Date(`${booking.date}T12:00:00`),
        label: booking.title,
      })),
      ...checkIns.map((checkIn) => ({
        date: new Date(checkIn.checkedAt),
        label: 'QR validado',
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return { consecutiveAbsences, missedQrCount: missedQrBookings.length, lastSession: sessions[0] };
  };

  const handleQrValidation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const scanned = qrValue.trim();
    const memberId = scanned.startsWith('PROFUNCIONAL:') ? scanned.slice('PROFUNCIONAL:'.length) : '';
    const member = members.find((item) => item.id === memberId);
    if (!member) {
      setQrMessage({ text: 'QR no reconocido. Escanea la credencial de un miembro.', isError: true });
      return;
    }
    try {
      recordQrCheckIn(member.id);
      setQrMessage({ text: `Ingreso validado: ${member.name}`, isError: false });
      setQrValue('');
    } catch (error) {
      setQrMessage({ text: (error as Error).message, isError: true });
    }
  };

  const handleCreateMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim().toLowerCase();
    const password = String(form.get('password') || '');
    const plan = String(form.get('plan') || 'Standard') as GymMember['plan'];
    if (!name || !email || password.length < 8) {
      setCreateError('Ingresa nombre, correo y una contraseña de al menos 8 caracteres.');
      return;
    }
    if (members.some((member) => member.email.toLowerCase() === email)) {
      setCreateError('Ya existe un perfil con ese correo.');
      return;
    }
    if (apiEnabled && hasToken()) {
      try {
        await request('/auth/register', 'POST', { name, email, password, plan: plan.toUpperCase() });
      } catch (error) {
        setCreateError((error as Error).message || 'No se pudo crear el perfil en el servidor.');
        return;
      }
    }
    const newMember = addMember({ name, email, password, plan });
    addActivity({ name, action: `perfil creado por administración (${plan})` });
    setMembers(getMembers());
    setSearchQuery(newMember.name);
    setCreateError('');
    setIsCreateOpen(false);
    formElement.reset();
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || (filterStatus === 'alert'
      ? getAttendanceSummary(member).missedQrCount > 0
      : member.status === filterStatus);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-[#F7F7F7]">Miembros</h1>
          <p className="text-xs sm:text-sm text-white/60">Administra perfiles, asistencias y membresías</p>
        </div>
        <button type="button" onClick={() => { setCreateError(''); setIsCreateOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#00E676] px-4 py-2.5 text-sm font-bold text-[#021826]">
          <UserPlus className="h-4 w-4" /> Crear perfil
        </button>
      </div>

      <form onSubmit={handleQrValidation} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 space-y-2 text-sm text-white/75">
          Validar asistencia con QR
          <span className="relative block">
            <QrCode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input value={qrValue} onChange={(event) => setQrValue(event.target.value)} placeholder="Escanea la credencial o ingresa el código" className="h-11 w-full rounded-lg border border-white/10 bg-black/20 pl-10 pr-3 text-white outline-none focus:border-[#00E676]" />
          </span>
        </label>
        <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#00E676]/40 bg-[#00E676]/15 px-4 text-sm font-bold text-[#00E676]">
          <CheckCircle2 className="h-4 w-4" /> Validar QR
        </button>
        {qrMessage && <p role="status" className={`text-sm sm:max-w-xs ${qrMessage.isError ? 'text-rose-300' : 'text-[#00E676]'}`}>{qrMessage.text}</p>}
      </form>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Buscar miembros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#00E676]"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              filterStatus === 'all' ? 'bg-[#00E676] text-[#021826] font-bold' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              filterStatus === 'active' ? 'bg-[#00E676] text-[#021826] font-bold' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              filterStatus === 'expired' ? 'bg-[#00E676] text-[#021826] font-bold' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Vencidos
          </button>
          <button
            onClick={() => setFilterStatus('alert')}
            className={`flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              filterStatus === 'alert' ? 'bg-amber-400 text-[#021826] font-bold' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Alerta
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-xs">
                <th className="text-left p-3.5 text-white/70 font-semibold">Miembro</th>
                <th className="text-left p-3.5 text-white/70 font-semibold hidden md:table-cell">Membresía</th>
                <th className="text-left p-3.5 text-white/70 font-semibold">Estado</th>
                <th className="text-left p-3.5 text-white/70 font-semibold">Última sesión</th>
                <th className="text-left p-3.5 text-white/70 font-semibold">Alerta</th>
                <th className="text-left p-3.5 text-white/70 font-semibold hidden sm:table-cell">Saldo</th>
                <th className="text-right p-3.5 text-white/70 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="cursor-pointer border-b border-white/5 hover:bg-white/5 transition-colors" onClick={() => onViewMember(member.id)}>
                  {(() => {
                    const attendance = getAttendanceSummary(member);
                    return <>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#00E676]/20 flex items-center justify-center flex-shrink-0 text-[#00E676] font-bold text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0 max-w-[130px] sm:max-w-xs">
                        <button type="button" className="font-medium truncate text-left text-white text-sm hover:text-[#00E676] block w-full" onClick={() => onViewMember(member.id)}>{member.name}</button>
                        <p className="text-xs text-white/40 truncate">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 hidden md:table-cell">
                    <span className="text-white/80 text-xs">{member.plan}</span>
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="p-3.5 text-xs text-white/70">
                    {attendance.lastSession ? <><span className="block">{attendance.lastSession.date.toLocaleDateString('es-CL')}</span><span className="text-white/45">{attendance.lastSession.label}</span></> : <span className="text-white/40">Sin asistencia</span>}
                  </td>
                  <td className="p-3.5">
                    {attendance.consecutiveAbsences >= 3 ? (
                      <button type="button" onClick={(event) => { event.stopPropagation(); onViewRisk(member.id); }} className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/30 bg-amber-400/10 px-2.5 py-1.5 text-xs font-semibold text-amber-200">
                        <AlertTriangle className="h-3.5 w-3.5" /> Riesgo · {attendance.consecutiveAbsences} faltas
                      </button>
                    ) : <span className="text-xs text-white/40">Sin alerta</span>}
                  </td>
                  <td className="p-3.5 hidden sm:table-cell text-xs">
                    <span className={member.balance < 0 ? 'text-rose-400 font-semibold' : member.balance > 0 ? 'text-[#00E676] font-semibold' : 'text-white/50'}>
                      {formatCLP(Math.abs(member.balance) * 1000)}
                      {member.balance < 0 && ' deuda'}
                      {member.balance > 0 && ' crédito'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onViewMember(member.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00E676] text-[#021826] font-bold text-xs rounded-lg hover:bg-[#00E676]/90 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver</span>
                    </button>
                  </td>
                    </>;
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCreateOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="create-member-title" className="w-full max-w-lg rounded-xl border border-white/15 bg-[#071522] p-5 text-white shadow-2xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div><h2 id="create-member-title" className="text-xl font-bold">Crear perfil de miembro</h2><p className="mt-1 text-sm text-white/55">Acceso y membresía inicial</p></div>
              <button type="button" aria-label="Cerrar" onClick={() => setIsCreateOpen(false)} className="rounded-md p-2 text-white/60 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreateMember} className="space-y-4">
              <label className="block space-y-1.5 text-sm text-white/75">Nombre<input name="name" required className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-[#00E676]" /></label>
              <label className="block space-y-1.5 text-sm text-white/75">Correo<input name="email" type="email" required className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-[#00E676]" /></label>
              <label className="block space-y-1.5 text-sm text-white/75">Contraseña inicial<input name="password" type="password" minLength={8} required className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-[#00E676]" /></label>
              <label className="block space-y-1.5 text-sm text-white/75">Membresía<select name="plan" defaultValue="Standard" className="h-10 w-full rounded-md border border-white/10 bg-[#0b1726] px-3 text-white outline-none focus:border-[#00E676]"><option>Basic</option><option>Standard</option><option>Premium</option></select></label>
              {createError && <p role="alert" className="text-sm text-rose-300">{createError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-md border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5">Cancelar</button>
                <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-[#00E676] px-4 py-2 text-sm font-bold text-[#021826]"><UserPlus className="h-4 w-4" /> Crear perfil</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}