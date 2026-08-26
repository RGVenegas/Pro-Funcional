import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, Edit, Ban, RefreshCw, Flame, Dumbbell } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';

interface MemberDetailProps {
  memberId: string;
  onBack: () => void;
}

type Tab = 'info' | 'balance' | 'subscriptions' | 'notes';

export function MemberDetail({ memberId, onBack }: MemberDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const members = {
    '1': { name: 'Juan Perez', email: 'juan.perez@gmail.com', plan: 'Premium', status: 'active' as const, balance: 0, joinDate: '2024-01-15', nextBilling: '2025-02-15', attendance: ['2025-01-22', '2025-01-21', '2025-01-20', '2025-01-18', '2025-01-17'] },
    '2': { name: 'Camila Gonzalez', email: 'camila.gonzalez@gmail.com', plan: 'Standard', status: 'active' as const, balance: -50, joinDate: '2024-02-20', nextBilling: '2025-02-20', attendance: ['2025-01-22', '2025-01-21', '2025-01-20', '2025-01-15'] },
    '3': { name: 'Matias Rojas', email: 'matias.rojas@gmail.com', plan: 'Basic', status: 'expired' as const, balance: 0, joinDate: '2023-11-10', nextBilling: '2025-01-10', attendance: ['2025-01-20', '2025-01-19'] },
    '4': { name: 'Antonia Silva', email: 'antonia.silva@gmail.com', plan: 'Premium', status: 'active' as const, balance: 25, joinDate: '2024-03-05', nextBilling: '2025-03-05', attendance: ['2025-01-22', '2025-01-21', '2025-01-20', '2025-01-19', '2025-01-18', '2025-01-17'] },
    '5': { name: 'Diego Morales', email: 'diego.morales@gmail.com', plan: 'Standard', status: 'suspended' as const, balance: -120, joinDate: '2023-12-01', nextBilling: '2025-02-01', attendance: ['2025-01-22', '2025-01-18'] },
    '6': { name: 'Valentina Soto', email: 'valentina.soto@gmail.com', plan: 'Premium', status: 'active' as const, balance: 0, joinDate: '2024-01-25', nextBilling: '2025-01-25', attendance: ['2025-01-22', '2025-01-21', '2025-01-20'] },
    '7': { name: 'Nicolas Fuentes', email: 'nicolas.fuentes@gmail.com', plan: 'Basic', status: 'active' as const, balance: -30, joinDate: '2024-02-14', nextBilling: '2025-02-14', attendance: ['2025-01-22', '2025-01-19', '2025-01-18'] },
    '8': { name: 'Fernanda Contreras', email: 'fernanda.contreras@gmail.com', plan: 'Standard', status: 'active' as const, balance: 0, joinDate: '2024-03-10', nextBilling: '2025-03-10', attendance: ['2025-01-22', '2025-01-21', '2025-01-20', '2025-01-19'] },
  };
  const member = members[memberId as keyof typeof members] ?? members['1'];
  const attendanceDates = member.attendance.map((date) => new Date(`${date}T12:00:00`));
  let streak = 0;
  for (let index = 0; index < attendanceDates.length; index += 1) {
    const gap = index === 0 ? 0 : (attendanceDates[index - 1].getTime() - attendanceDates[index].getTime()) / 86400000;
    if (gap > 2) break;
    streak += 1;
  }

  const payments = [
    { date: '2025-01-15', amount: 99, status: 'completed', method: 'Credit Card' },
    { date: '2024-12-15', amount: 99, status: 'completed', method: 'Credit Card' },
    { date: '2024-11-15', amount: 99, status: 'completed', method: 'Credit Card' },
  ];

  const subscriptions = [
    { plan: 'Premium', startDate: '2024-01-15', endDate: '2025-02-15', status: 'active' },
    { plan: 'Standard', startDate: '2023-06-01', endDate: '2024-01-15', status: 'expired' },
  ];

  const tabs = [
    { id: 'info', label: 'Informacion personal' },
    { id: 'balance', label: 'Saldo de cuenta' },
    { id: 'subscriptions', label: 'Membresias' },
    { id: 'notes', label: 'Notas privadas' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#F7F7F7]">Detalle del miembro</h1>
          <p className="text-white/60">Historial y datos del miembro</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#09C82C]/30 bg-[#09C82C]/10 p-5">
          <div className="mb-2 flex items-center gap-2 text-[#09C82C]"><Flame className="h-5 w-5" /><span className="text-sm font-medium">Racha actual</span></div>
          <p className="text-3xl font-bold text-[#F7F7F7]">{streak} dias</p>
          <p className="mt-1 text-sm text-white/55">Se pierde despues de 2 dias seguidos sin asistir.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="mb-2 flex items-center gap-2 text-white/70"><Dumbbell className="h-5 w-5" /><span className="text-sm font-medium">Historial de asistencia</span></div>
          <p className="text-3xl font-bold text-[#F7F7F7]">{member.attendance.length}</p>
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
                <span className="text-sm">{member.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2">
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Renew</span>
            </button>
            <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center gap-2">
              <Ban className="w-4 h-4" />
              <span className="hidden sm:inline">Suspend</span>
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
                <label className="text-sm text-white/60 mb-1 block">Correo</label>
                <p className="font-medium text-[#F7F7F7]">{member.email}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Telefono</label>
                <p className="font-medium text-[#F7F7F7]">{member.phone}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Fecha de ingreso</label>
                <p className="font-medium text-[#F7F7F7]">{new Date(member.joinDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Membresia actual</label>
                <p className="font-medium text-[#F7F7F7]">{member.plan}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Proximo cobro</label>
                <p className="font-medium text-[#F7F7F7]">{new Date(member.nextBilling).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {activeTab === 'balance' && (
            <div className="space-y-6">
              <div className="bg-[#09C82C]/10 border border-[#09C82C]/20 rounded-lg p-4">
                <p className="text-sm text-white/60 mb-1">Saldo actual</p>
                <p className="text-3xl font-bold text-[#09C82C]">${member.balance}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-[#F7F7F7]">Historial de pagos</h3>
                <div className="space-y-3">
                  {payments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div>
                        <p className="font-medium text-[#F7F7F7]">${payment.amount}</p>
                        <p className="text-sm text-white/60">{payment.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{new Date(payment.date).toLocaleDateString()}</p>
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
                      <h4 className="font-semibold text-lg">{sub.plan} Plan</h4>
                      <p className="text-sm text-white/60">
                        {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
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
              <textarea
                className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#09C82C] resize-none"
                placeholder="Add clinical notes or observations (private admin notes)..."
              />
              <button className="px-4 py-2 bg-[#09C82C] text-[#010A01] rounded-lg hover:bg-[#09C82C]/90 transition-colors font-medium">
                Save Notes
              </button>
              
              <div className="mt-6 space-y-3">
                <h4 className="font-semibold">Previous Notes</h4>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-sm text-white/60 mb-2">Jan 10, 2025 - Admin</p>
                  <p>Member requested extended hours access due to work schedule.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}