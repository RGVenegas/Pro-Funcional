import React, { useEffect, useState } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, Edit, Ban, RefreshCw, Flame, Dumbbell, Check } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { addActivity, getMemberById, getMembers, GymMember, subscribeToMembers, updateMember } from '../../data/gymStore';

interface MemberDetailProps {
  memberId: string;
  onBack: () => void;
}

type Tab = 'info' | 'balance' | 'subscriptions' | 'notes';

export function MemberDetail({ memberId, onBack }: MemberDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [member, setMember] = useState<GymMember>(() => getMemberById(memberId) ?? getMembers()[0]);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<Array<{ date: string; author: string; text: string }>>([
    { date: '10 Ene, 2025', author: 'Administrador', text: 'El miembro solicitó extensión de horario por motivos laborales.' },
  ]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToMembers(() => {
      const updated = getMemberById(memberId);
      if (updated) setMember(updated);
    });
    return unsub;
  }, [memberId]);

  const formatCLP = (amount: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);

  const planPrices: Record<string, number> = { Basic: 29000, Standard: 59000, Premium: 99000 };
  const currentPlanPrice = planPrices[member.plan] ?? 59000;

  const attendance = ['2025-01-22', '2025-01-21', '2025-01-20', '2025-01-18', '2025-01-17'];
  const attendanceDates = attendance.map((date) => new Date(`${date}T12:00:00`));
  let streak = 0;
  for (let index = 0; index < attendanceDates.length; index += 1) {
    const gap = index === 0 ? 0 : (attendanceDates[index - 1].getTime() - attendanceDates[index].getTime()) / 86400000;
    if (gap > 2) break;
    streak += 1;
  }

  const payments = [
    { date: '2025-01-15', amount: currentPlanPrice, status: 'Completado', method: 'Tarjeta de Crédito' },
    { date: '2024-12-15', amount: currentPlanPrice, status: 'Completado', method: 'Tarjeta de Crédito' },
    { date: '2024-11-15', amount: currentPlanPrice, status: 'Completado', method: 'Tarjeta de Crédito' },
  ];

  const subscriptions = [
    { plan: member.plan, startDate: member.joinDate, endDate: member.nextBilling || '2025-02-15', status: member.status },
  ];

  const tabs = [
    { id: 'info', label: 'Información personal' },
    { id: 'balance', label: 'Saldo de cuenta' },
    { id: 'subscriptions', label: 'Membresías' },
    { id: 'notes', label: 'Notas privadas' },
  ];

  const showFeedback = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleRenew = () => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    const updated = updateMember(member.id, {
      status: 'active',
      nextBilling: nextDate.toISOString().slice(0, 10),
    });
    if (updated) {
      setMember(updated);
      addActivity({ name: member.name, action: `renovó su membresía ${member.plan}` });
      showFeedback(`Membresía renovada con éxito para ${member.name}.`);
    }
  };

  const handleSuspend = () => {
    const newStatus = member.status === 'suspended' ? 'active' : 'suspended';
    const updated = updateMember(member.id, { status: newStatus });
    if (updated) {
      setMember(updated);
      addActivity({ name: member.name, action: `${newStatus === 'suspended' ? 'fue suspendido' : 'fue reactivado'}` });
      showFeedback(`Estado actualizado a ${newStatus === 'suspended' ? 'Suspendido' : 'Activo'}.`);
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    const newNote = {
      date: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }),
      author: 'Administrador',
      text: noteText.trim(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setNoteText('');
    showFeedback('Nota guardada correctamente.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          aria-label="Volver a la lista de miembros"
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#F7F7F7]">Detalle del miembro</h1>
          <p className="text-white/60">Historial y datos del miembro</p>
        </div>
      </div>

      {actionMessage && (
        <div className="rounded-xl border border-[#09C82C]/40 bg-[#09C82C]/15 p-4 text-[#09C82C] flex items-center gap-2">
          <Check className="h-5 w-5" />
          <span className="text-sm font-medium">{actionMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#09C82C]/30 bg-[#09C82C]/10 p-5">
          <div className="mb-2 flex items-center gap-2 text-[#09C82C]"><Flame className="h-5 w-5" /><span className="text-sm font-medium">Racha actual</span></div>
          <p className="text-3xl font-bold text-[#F7F7F7]">{streak} días</p>
          <p className="mt-1 text-sm text-white/55">Se pierde después de 2 días seguidos sin asistir.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="mb-2 flex items-center gap-2 text-white/70"><Dumbbell className="h-5 w-5" /><span className="text-sm font-medium">Historial de asistencia</span></div>
          <p className="text-3xl font-bold text-[#F7F7F7]">{attendance.length}</p>
          <p className="mt-1 text-sm text-white/55">entrenamientos registrados</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#09C82C]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl text-[#09C82C] font-semibold">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-[#F7F7F7]">{member.name}</h2>
              <StatusBadge status={member.status} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-white/60">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{member.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{member.phone || '+56 9 8765 4321'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRenew}
              className="px-4 py-2 bg-[#09C82C] text-[#010A01] font-semibold hover:bg-[#09C82C]/90 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Renovar</span>
            </button>
            <button
              onClick={handleSuspend}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                member.status === 'suspended'
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
              }`}
            >
              <Ban className="w-4 h-4" />
              <span>{member.status === 'suspended' ? 'Reactivar' : 'Suspender'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#09C82C] border-b-2 border-[#09C82C]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-white/60 mb-1 block">Nombre completo</label>
                <p className="font-medium text-[#F7F7F7]">{member.name}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Correo electrónico</label>
                <p className="font-medium text-[#F7F7F7]">{member.email}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Teléfono</label>
                <p className="font-medium text-[#F7F7F7]">{member.phone || '+56 9 8765 4321'}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Fecha de ingreso</label>
                <p className="font-medium text-[#F7F7F7]">{new Date(member.joinDate).toLocaleDateString('es-CL')}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Membresía actual</label>
                <p className="font-medium text-[#F7F7F7]">Plan {member.plan}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Próximo cobro</label>
                <p className="font-medium text-[#F7F7F7]">{new Date(member.nextBilling || '2025-02-15').toLocaleDateString('es-CL')}</p>
              </div>
            </div>
          )}

          {activeTab === 'balance' && (
            <div className="space-y-6">
              <div className="bg-[#09C82C]/10 border border-[#09C82C]/20 rounded-lg p-4">
                <p className="text-sm text-white/60 mb-1">Saldo actual</p>
                <p className={`text-3xl font-bold ${member.balance < 0 ? 'text-red-400' : 'text-[#09C82C]'}`}>
                  {formatCLP(Math.abs(member.balance) * 1000)}
                  {member.balance < 0 && ' (Deuda pendiente)'}
                  {member.balance > 0 && ' (Saldo a favor)'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-[#F7F7F7]">Historial de pagos</h3>
                <div className="space-y-3">
                  {payments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div>
                        <p className="font-medium text-[#F7F7F7]">{formatCLP(payment.amount)}</p>
                        <p className="text-sm text-white/60">{payment.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/70">{new Date(payment.date).toLocaleDateString('es-CL')}</p>
                        <span className="text-xs px-2 py-1 bg-[#09C82C]/20 text-[#09C82C] rounded">
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              {subscriptions.map((sub, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">Plan {sub.plan}</h4>
                      <p className="text-sm text-white/60">
                        {new Date(sub.startDate).toLocaleDateString('es-CL')} - {new Date(sub.endDate).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                    <StatusBadge status={sub.status as any} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleSaveNote} className="space-y-3">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#09C82C] resize-none"
                  placeholder="Escribe notas u observaciones privadas del administrador..."
                />
                <button type="submit" className="px-4 py-2 bg-[#09C82C] text-[#010A01] rounded-lg hover:bg-[#09C82C]/90 transition-colors font-medium">
                  Guardar nota
                </button>
              </form>
              
              <div className="mt-6 space-y-3">
                <h4 className="font-semibold">Notas registradas</h4>
                {notes.map((note, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-sm text-white/60 mb-2">{note.date} - {note.author}</p>
                    <p className="text-sm text-white/90">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}