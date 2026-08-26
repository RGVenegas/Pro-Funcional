import React from 'react';
import { Calendar, Dumbbell, QrCode, TrendingUp } from 'lucide-react';
import { AuthUser } from '../auth/Login';

interface UserHomeProps {
  user: AuthUser;
}

export function UserHome({ user: account }: UserHomeProps) {
  const selectedClasses = account.selectedClasses ?? [];
  const user = {
    name: account.name,
    nextClass: selectedClasses.length > 0 ? {
      name: selectedClasses[0],
        time: 'Hoy a las 18:00',
      instructor: 'Mike R.',
    } : null,
  };

  const quickStats = [
    { label: 'Entrenamientos esta semana', value: '5', icon: Dumbbell },
    { label: 'Clases elegidas', value: String(selectedClasses.length), icon: Calendar },
    { label: 'Dias consecutivos', value: '12', icon: TrendingUp },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-[#09C82C]/20 to-[#09C82C]/5 rounded-xl p-6 backdrop-blur-sm border border-[#09C82C]/20">
        <h1 className="text-3xl font-bold mb-2 text-[#F7F7F7]">Bienvenido de nuevo, {user.name}!</h1>
        <p className="text-white/60">Listo para superar tus objetivos de hoy?</p>
      </div>

      {/* Next Training */}
      {user.nextClass && (
        <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <h3 className="font-semibold mb-4 text-[#F7F7F7]">Proxima sesion de entrenamiento</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#09C82C]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-6 h-6 text-[#09C82C]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#F7F7F7]">{user.nextClass.name}</h4>
              <p className="text-sm text-white/60">con {user.nextClass.instructor}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-[#F7F7F7]">{user.nextClass.time}</p>
              <button className="text-sm text-[#09C82C] hover:underline mt-1">
                Ver detalles
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
          <h3 className="font-semibold mb-1 text-[#F7F7F7]">Reservar una clase</h3>
          <p className="text-sm text-white/60">Asegura tu lugar en las proximas sesiones</p>
        </button>
        
        <button className="bg-white/5 hover:bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/10 transition-colors text-left">
          <QrCode className="w-8 h-8 text-[#09C82C] mb-3" />
          <h3 className="font-semibold mb-1 text-[#F7F7F7]">Ver tarjeta QR</h3>
          <p className="text-sm text-white/60">Accede a tu tarjeta digital de membresia</p>
        </button>
      </div>
    </div>
  );
}