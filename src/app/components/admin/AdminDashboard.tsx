import React, { useEffect, useState } from 'react';
import { Users, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { KPICard } from '../shared/KPICard';
import { MembershipGrowthChart } from '../charts/MembershipGrowthChart';
import { RevenueChart } from '../charts/RevenueChart';
import { getActivities, getMembers, GymActivity, GymMember, subscribeToActivities, subscribeToMembers } from '../../data/gymStore';

export function AdminDashboard() {
  const [members, setMembers] = useState<GymMember[]>(getMembers);
  const [activities, setActivities] = useState<GymActivity[]>(getActivities);
  useEffect(() => subscribeToMembers(() => setMembers(getMembers())), []);
  useEffect(() => subscribeToActivities(() => setActivities(getActivities())), []);
  const planPrices: Record<string, number> = { Basic: 29000, Standard: 59000, Premium: 99000 };
  const activeMembers = members.filter((member) => member.status === 'active');
  const monthlyRevenueValue = activeMembers.reduce((total, member) => total + planPrices[member.plan], 0);
  const monthlyRevenue = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(monthlyRevenueValue);
  const classSlots = [
    [15, 20], [12, 15], [22, 25], [18, 20], [10, 15], [8, 20], [12, 12],
    [16, 20], [14, 15], [25, 30], [11, 15], [20, 25], [19, 20], [12, 20],
    [13, 15], [18, 25], [17, 20], [15, 15], [21, 25], [10, 20], [8, 15],
  ];
  const occupiedSpots = classSlots.reduce((total, [booked]) => total + booked, 0);
  const totalSpots = classSlots.reduce((total, [, capacity]) => total + capacity, 0);
  const occupancy = ((occupiedSpots / totalSpots) * 100).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-[#F7F7F7]">Resumen</h1>
        <p className="text-white/60">Rendimiento general de tu gimnasio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Miembros registrados"
          value={String(members.length)}
          icon={Users}
        />
        <KPICard
          title="Ingresos mensuales por membresias"
          value={monthlyRevenue}
          icon={DollarSign}
        />
        <KPICard
          title="Membresias activas"
          value={String(activeMembers.length)}
          icon={TrendingUp}
        />
        <KPICard
          title="Ocupacion de clases"
          value={`${occupancy}%`}
          icon={Calendar}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-[#F7F7F7]">Crecimiento de membresias</h3>
          <MembershipGrowthChart />
        </div>
        
        <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-[#F7F7F7]">Resumen de ingresos</h3>
          <RevenueChart monthlyRevenue={monthlyRevenueValue} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <h3 className="text-lg font-semibold mb-4 text-[#F7F7F7]">Actividad reciente</h3>
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#09C82C]/20 flex items-center justify-center">
                  <span className="text-[#09C82C] font-semibold">
                    {activity.name.split(' ').map(n => n[0]).join('')}
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
    </div>
  );
}