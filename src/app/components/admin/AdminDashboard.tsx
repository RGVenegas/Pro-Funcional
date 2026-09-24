import React, { useEffect, useMemo, useState } from 'react';
import { Users, DollarSign, TrendingUp, Calendar, Stethoscope, UserX, QrCode, ArrowUpRight, ArrowRight, ShieldCheck } from 'lucide-react';
import { KPICard } from '../shared/KPICard';
import { MembershipGrowthChart } from '../charts/MembershipGrowthChart';
import { RevenueChart, RevenueBreakdownItem } from '../charts/RevenueChart';
import { getActivities, getMembers, GymActivity, GymMember, subscribeToActivities, subscribeToMembers, getUserBookings, getCentralScheduleBlocks } from '../../data/gymStore';

type DashboardView = 'overview' | 'patients' | 'no-show' | 'balance' | 'occupancy';

export function AdminDashboard() {
  const [members, setMembers] = useState<GymMember[]>(getMembers);
  const [activities, setActivities] = useState<GymActivity[]>(getActivities);
  const [selectedView, setSelectedView] = useState<DashboardView>('overview');

  useEffect(() => subscribeToMembers(() => setMembers(getMembers())), []);
  useEffect(() => subscribeToActivities(() => setActivities(getActivities())), []);

  const planPrices: Record<string, number> = { Basic: 45000, Standard: 85000, Premium: 120000 };
  const activeMembers = members.filter((member) => member.status === 'active');
  const monthlyRevenueValue = activeMembers.reduce((total, member) => total + planPrices[member.plan], 0);
  const revenueBreakdown: RevenueBreakdownItem[] = [
    { label: 'Basic', count: activeMembers.filter((member) => member.plan === 'Basic').length, revenue: activeMembers.filter((member) => member.plan === 'Basic').reduce((sum, member) => sum + planPrices[member.plan], 0) },
    { label: 'Standard', count: activeMembers.filter((member) => member.plan === 'Standard').length, revenue: activeMembers.filter((member) => member.plan === 'Standard').reduce((sum, member) => sum + planPrices[member.plan], 0) },
    { label: 'Premium', count: activeMembers.filter((member) => member.plan === 'Premium').length, revenue: activeMembers.filter((member) => member.plan === 'Premium').reduce((sum, member) => sum + planPrices[member.plan], 0) },
  ];

  const monthlyRevenue = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(monthlyRevenueValue);

  const totalRemainingSessions = members.reduce((acc, m) => acc + (m.remainingSessions || 0), 0);
  const totalPurchasedSessions = members.reduce((acc, m) => acc + (m.totalSessions || 8), 0);

  const bookings = getUserBookings();
  const noShowCount = bookings.filter((b) => b.status === 'no-show').length;
  const totalAttendanceEvents = bookings.filter((b) => b.status === 'attended' || b.status === 'no-show').length || 1;
  const noShowRate = ((noShowCount / totalAttendanceEvents) * 100).toFixed(1) + '%';

  const membersWithClinicalData = members
    .filter((member) => member.clinicalHistory && member.clinicalHistory.length > 0)
    .sort((a, b) => (b.clinicalHistory?.length ?? 0) - (a.clinicalHistory?.length ?? 0));

  const noShowByPerson = useMemo(() => {
    const map = new Map<string, { name: string; noShows: number; attended: number; total: number; lastClass?: string }>();

    for (const booking of bookings) {
      if (!booking.userName || booking.status === 'cancelled') continue;
      const current = map.get(booking.userName) ?? { name: booking.userName, noShows: 0, attended: 0, total: 0 };
      current.total += 1;
      if (booking.status === 'no-show') current.noShows += 1;
      if (booking.status === 'attended') current.attended += 1;
      if (!current.lastClass || booking.date > current.lastClass) current.lastClass = booking.date;
      map.set(booking.userName, current);
    }

    return Array.from(map.values())
      .map((entry) => ({ ...entry, rate: entry.total ? ((entry.noShows / entry.total) * 100).toFixed(1) : '0.0' }))
      .sort((a, b) => Number(b.noShows) - Number(a.noShows));
  }, [bookings]);

  const classSlots = getCentralScheduleBlocks();
  const occupancyData = classSlots
    .filter((slot) => slot.isActive)
    .map((slot) => {
      const booked = slot.students.filter((student) => student.status !== 'pending').length;
      return {
        ...slot,
        booked,
        ratio: slot.capacity ? (booked / slot.capacity) * 100 : 0,
      };
    });

  const occupancyValue = (() => {
    const totalBooked = occupancyData.reduce((sum, slot) => sum + slot.booked, 0);
    const totalCapacity = occupancyData.reduce((sum, slot) => sum + slot.capacity, 0);
    if (!totalCapacity) return '0.0';
    return ((totalBooked / totalCapacity) * 100).toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  })();

  const occupancyByInstructor = Array.from(
    occupancyData.reduce((map, slot) => {
      const key = slot.instructor;
      const current = map.get(key) ?? { instructor: key, totalBooked: 0, totalCapacity: 0 };
      current.totalBooked += slot.booked;
      current.totalCapacity += slot.capacity;
      map.set(key, current);
      return map;
    }, new Map<string, { instructor: string; totalBooked: number; totalCapacity: number }>()),
  ).map((entry) => ({
    ...entry[1],
    occupation: entry[1].totalCapacity ? ((entry[1].totalBooked / entry[1].totalCapacity) * 100).toFixed(1) : '0.0',
  })).sort((a, b) => Number(b.occupation) - Number(a.occupation));

  const sessionsByStudent = members.map((member) => ({
    name: member.name,
    email: member.email,
    remaining: member.remainingSessions ?? 0,
    total: member.totalSessions ?? 8,
    status: member.status,
  })).sort((a, b) => (b.remaining - a.remaining) || (b.total - a.total));

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Pacientes / Alumnos"
          value={String(members.length)}
          icon={Users}
          onClick={() => setSelectedView('patients')}
          active={selectedView === 'patients'}
        />
        <KPICard
          title="Tasa de No-Show (Ausentismo)"
          value={noShowRate}
          icon={UserX}
          onClick={() => setSelectedView('no-show')}
          active={selectedView === 'no-show'}
        />
        <KPICard
          title="Sesiones en Saldo Activo"
          value={`${totalRemainingSessions} / ${totalPurchasedSessions}`}
          icon={Stethoscope}
          onClick={() => setSelectedView('balance')}
          active={selectedView === 'balance'}
        />
        <KPICard
          title="Ocupación de Boxes & Clases"
          value={`${occupancyValue}%`}
          icon={Calendar}
          onClick={() => setSelectedView('occupancy')}
          active={selectedView === 'occupancy'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-[#F7F7F7]">Crecimiento de membresias</h3>
          <MembershipGrowthChart />
        </div>

        <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-[#F7F7F7]">Resumen de ingresos</h3>
          <RevenueChart monthlyRevenue={monthlyRevenueValue} breakdown={revenueBreakdown} />
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <h3 className="text-lg font-semibold mb-4 text-[#F7F7F7]">Actividad reciente</h3>
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#09C82C]/20 flex items-center justify-center">
                  <span className="text-[#09C82C] font-semibold">
                    {activity.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-[#F7F7F7]">
                    <span className="font-medium">{activity.name}</span>
                    <span className="text-white/60"> {activity.action}</span>
                  </p>
                  <p className="text-xs text-white/40">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderPatients = () => (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#F7F7F7]">Pacientes / Alumnos con fichas clínicas</h3>
        <button type="button" onClick={() => setSelectedView('overview')} className="text-sm text-[#00E676] flex items-center gap-1">
          Volver <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {membersWithClinicalData.length === 0 ? (
          <p className="text-white/60">No hay fichas clínicas creadas aún.</p>
        ) : (
          membersWithClinicalData.map((member) => (
            <div key={member.id} className="rounded-xl border border-white/10 bg-[#03161a] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{member.name}</p>
                  <p className="text-xs text-white/50">{member.email}</p>
                </div>
                <div className="text-right text-xs text-white/60">
                  <div>{member.clinicalHistory?.length ?? 0} fichas</div>
                  <div>{member.status}</div>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {(member.clinicalHistory ?? []).slice(0, 3).map((evalItem) => (
                  <div key={evalItem.id} className="rounded-lg bg-white/5 p-2 text-sm text-white/80">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{evalItem.jointOrArea}</span>
                      <span className="text-[#00E676]">EVA {evalItem.evaPain}/10</span>
                    </div>
                    <div className="text-xs text-white/60">{evalItem.date} · ROM {evalItem.romDegrees}° · {evalItem.professional}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderNoShow = () => (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#F7F7F7]">Ausentismo por persona</h3>
        <button type="button" onClick={() => setSelectedView('overview')} className="text-sm text-[#00E676] flex items-center gap-1">
          Volver <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {noShowByPerson.length === 0 ? (
          <p className="text-white/60">Todavía no hay datos de asistencia.</p>
        ) : (
          noShowByPerson.map((entry) => (
            <div key={entry.name} className="rounded-xl border border-white/10 bg-[#03161a] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{entry.name}</p>
                  <p className="text-xs text-white/50">No-shows: {entry.noShows} · Asistencias: {entry.attended}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#00E676]">{entry.rate}%</div>
                  <div className="text-[10px] uppercase tracking-wide text-white/50">ausencia</div>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-[#00E676] rounded-full" style={{ width: `${Math.min(100, Number(entry.rate))}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderBalance = () => (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#F7F7F7]">Saldo de clases por alumno</h3>
        <button type="button" onClick={() => setSelectedView('overview')} className="text-sm text-[#00E676] flex items-center gap-1">
          Volver <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {sessionsByStudent.map((student) => (
          <div key={student.email} className="rounded-xl border border-white/10 bg-[#03161a] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{student.name}</p>
                <p className="text-xs text-white/50">{student.email}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-[#00E676]">{student.remaining}/{student.total}</div>
                <div className="text-[10px] uppercase tracking-wide text-white/50">clases</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOccupancy = () => (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#F7F7F7]">Ocupación por entrenador y clase</h3>
        <button type="button" onClick={() => setSelectedView('overview')} className="text-sm text-[#00E676] flex items-center gap-1">
          Volver <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {occupancyByInstructor.map((entry) => (
          <div key={entry.instructor} className="rounded-xl border border-white/10 bg-[#03161a] p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="font-semibold text-white">{entry.instructor}</p>
              <span className="font-bold text-[#00E676]">{entry.occupation}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-[#00E676] rounded-full" style={{ width: `${Math.min(100, Number(entry.occupation))}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/50">{entry.totalBooked} reservas / {entry.totalCapacity} cupos</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1 text-[#F7F7F7]">Dashboard Kinésico-Deportivo</h1>
        <p className="text-white/60 text-sm">Control de rendimiento clínico, paquetes de sesiones y ausentismo</p>
      </div>

      {selectedView === 'overview' ? renderOverview() : selectedView === 'patients' ? renderPatients() : selectedView === 'no-show' ? renderNoShow() : selectedView === 'balance' ? renderBalance() : renderOccupancy()}
    </div>
  );
}