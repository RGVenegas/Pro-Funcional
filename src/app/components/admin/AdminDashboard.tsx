import React from 'react';
import { Users, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { KPICard } from '../shared/KPICard';
import { MembershipGrowthChart } from '../charts/MembershipGrowthChart';
import { RevenueChart } from '../charts/RevenueChart';

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-[#F7F7F7]">Dashboard</h1>
        <p className="text-white/60">Overview of your gym's performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Members"
          value="342"
          change="+12%"
          trend="up"
          icon={Users}
        />
        <KPICard
          title="Monthly Revenue"
          value="$28,450"
          change="+8.2%"
          trend="up"
          icon={DollarSign}
        />
        <KPICard
          title="Active Subscriptions"
          value="318"
          change="+5.4%"
          trend="up"
          icon={TrendingUp}
        />
        <KPICard
          title="Class Occupancy"
          value="87%"
          change="+3.1%"
          trend="up"
          icon={Calendar}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-[#F7F7F7]">Membership Growth</h3>
          <MembershipGrowthChart />
        </div>
        
        <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-[#F7F7F7]">Revenue Overview</h3>
          <RevenueChart />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <h3 className="text-lg font-semibold mb-4 text-[#F7F7F7]">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { name: 'John Smith', action: 'renewed subscription', time: '2 minutes ago' },
            { name: 'Emma Wilson', action: 'booked a class', time: '15 minutes ago' },
            { name: 'Michael Brown', action: 'completed payment', time: '1 hour ago' },
            { name: 'Sarah Davis', action: 'updated profile', time: '2 hours ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
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