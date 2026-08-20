import React from 'react';
import { Calendar, Dumbbell, QrCode, TrendingUp, Clock } from 'lucide-react';

export function UserHome() {
  const user = {
    name: 'John Smith',
    plan: 'Premium',
    status: 'active',
    expirationDate: '2025-02-15',
    nextClass: {
      name: 'HIIT Training',
      time: 'Today at 6:00 PM',
      instructor: 'Mike R.',
    },
  };

  const quickStats = [
    { label: 'Workouts This Week', value: '5', icon: Dumbbell },
    { label: 'Classes Booked', value: '3', icon: Calendar },
    { label: 'Streak Days', value: '12', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-[#09C82C]/20 to-[#09C82C]/5 rounded-xl p-6 backdrop-blur-sm border border-[#09C82C]/20">
        <h1 className="text-3xl font-bold mb-2 text-[#F7F7F7]">Welcome back, {user.name}!</h1>
        <p className="text-white/60">Ready to crush your fitness goals today?</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-white/60 mb-1">Your Current Plan</p>
            <h2 className="text-2xl font-bold text-[#09C82C]">{user.plan}</h2>
          </div>
          <span className="px-3 py-1 bg-[#09C82C]/20 text-[#09C82C] rounded-full text-sm font-medium">
            Active
          </span>
        </div>
        <div className="flex items-center gap-2 text-white/60 mb-4">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Expires on {new Date(user.expirationDate).toLocaleDateString()}</span>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2 bg-[#09C82C] text-[#010A01] rounded-lg hover:bg-[#09C82C]/90 transition-colors font-medium">
            Renew Plan
          </button>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors font-medium">
            Upgrade
          </button>
        </div>
      </div>

      {/* Next Training */}
      {user.nextClass && (
        <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <h3 className="font-semibold mb-4 text-[#F7F7F7]">Next Training Session</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#09C82C]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-6 h-6 text-[#09C82C]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#F7F7F7]">{user.nextClass.name}</h4>
              <p className="text-sm text-white/60">with {user.nextClass.instructor}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-[#F7F7F7]">{user.nextClass.time}</p>
              <button className="text-sm text-[#09C82C] hover:underline mt-1">
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#09C82C]/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#09C82C]" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <p className="text-sm text-white/60">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="bg-white/5 hover:bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/10 transition-colors text-left">
          <Calendar className="w-8 h-8 text-[#09C82C] mb-3" />
          <h3 className="font-semibold mb-1 text-[#F7F7F7]">Book a Class</h3>
          <p className="text-sm text-white/60">Reserve your spot in upcoming sessions</p>
        </button>
        
        <button className="bg-white/5 hover:bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/10 transition-colors text-left">
          <QrCode className="w-8 h-8 text-[#09C82C] mb-3" />
          <h3 className="font-semibold mb-1 text-[#F7F7F7]">View QR Card</h3>
          <p className="text-sm text-white/60">Access your digital membership card</p>
        </button>
      </div>
    </div>
  );
}