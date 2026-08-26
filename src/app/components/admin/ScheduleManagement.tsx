import React, { useEffect, useState } from 'react';
import { Bell, ChevronLeft, ChevronRight, Users } from 'lucide-react';

type ScheduleMode = 'fixed' | 'flexible';

interface ClassSlot {
  id: string;
  time: string;
  name: string;
  instructor: string;
  capacity: number;
  booked: number;
}

interface CancellationNotification {
  id: string;
  member: string;
  className: string;
  time: string;
  instructor: string;
  createdAt: string;
}

export function ScheduleManagement() {
  const [mode, setMode] = useState<ScheduleMode>('fixed');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [notifications, setNotifications] = useState<CancellationNotification[]>(() => JSON.parse(localStorage.getItem('profuncional-notifications') ?? '[]'));

  useEffect(() => {
    const handleCancellation = (event: Event) => {
      const notification = (event as CustomEvent<CancellationNotification>).detail;
      setNotifications((current) => [notification, ...current]);
    };
    window.addEventListener('profuncional-booking-cancelled', handleCancellation);
    return () => window.removeEventListener('profuncional-booking-cancelled', handleCancellation);
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayLabels: Record<string, string> = {
    Monday: 'Lunes', Tuesday: 'Martes', Wednesday: 'Miercoles', Thursday: 'Jueves',
    Friday: 'Viernes', Saturday: 'Sabado', Sunday: 'Domingo',
  };
  
  const fixedSchedule: Record<string, ClassSlot[]> = {
    Monday: [
      { id: '1', time: '06:00', name: 'Morning Yoga', instructor: 'Sarah K.', capacity: 20, booked: 15 },
      { id: '2', time: '09:00', name: 'HIIT Training', instructor: 'Mike R.', capacity: 15, booked: 12 },
      { id: '3', time: '17:00', name: 'Spinning', instructor: 'Emma L.', capacity: 25, booked: 22 },
      { id: '4', time: '19:00', name: 'CrossFit', instructor: 'John D.', capacity: 20, booked: 18 },
    ],
    Tuesday: [
      { id: '5', time: '07:00', name: 'Pilates', instructor: 'Lisa M.', capacity: 15, booked: 10 },
      { id: '6', time: '12:00', name: 'Lunch Flow', instructor: 'Sarah K.', capacity: 20, booked: 8 },
      { id: '7', time: '18:00', name: 'Boxing', instructor: 'Mike R.', capacity: 12, booked: 12 },
    ],
    Wednesday: [
      { id: '8', time: '06:00', name: 'Morning Yoga', instructor: 'Sarah K.', capacity: 20, booked: 16 },
      { id: '9', time: '09:00', name: 'HIIT Training', instructor: 'Mike R.', capacity: 15, booked: 14 },
      { id: '10', time: '17:00', name: 'Zumba', instructor: 'Maria S.', capacity: 30, booked: 25 },
    ],
    Thursday: [
      { id: '11', time: '07:00', name: 'Pilates', instructor: 'Lisa M.', capacity: 15, booked: 11 },
      { id: '12', time: '18:00', name: 'Spinning', instructor: 'Emma L.', capacity: 25, booked: 20 },
      { id: '13', time: '19:00', name: 'CrossFit', instructor: 'John D.', capacity: 20, booked: 19 },
    ],
    Friday: [
      { id: '14', time: '06:00', name: 'Morning Yoga', instructor: 'Sarah K.', capacity: 20, booked: 12 },
      { id: '15', time: '17:00', name: 'HIIT Training', instructor: 'Mike R.', capacity: 15, booked: 13 },
      { id: '16', time: '18:00', name: 'Dance Fitness', instructor: 'Maria S.', capacity: 25, booked: 18 },
    ],
    Saturday: [
      { id: '17', time: '09:00', name: 'Yoga Flow', instructor: 'Sarah K.', capacity: 20, booked: 17 },
      { id: '18', time: '10:30', name: 'HIIT Training', instructor: 'Mike R.', capacity: 15, booked: 15 },
      { id: '19', time: '11:00', name: 'Spinning', instructor: 'Emma L.', capacity: 25, booked: 21 },
    ],
    Sunday: [
      { id: '20', time: '09:00', name: 'Gentle Yoga', instructor: 'Sarah K.', capacity: 20, booked: 10 },
      { id: '21', time: '10:00', name: 'Pilates', instructor: 'Lisa M.', capacity: 15, booked: 8 },
    ],
  };

  const getOccupancyColor = (booked: number, capacity: number) => {
    const percentage = (booked / capacity) * 100;
    if (percentage >= 90) return 'bg-red-500/20 text-red-400 border-red-500/20';
    if (percentage >= 70) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
    return 'bg-[#09C82C]/20 text-[#09C82C] border-[#09C82C]/20';
  };

  const getBookedCount = (slot: ClassSlot) => {
    const cancelled = notifications.filter((notification) =>
      notification.className === slot.name && notification.time === slot.time && notification.instructor === slot.instructor
    ).length;
    return Math.max(0, slot.booked - cancelled);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[#F7F7F7]">Gestion de horarios</h1>
            <p className="text-white/60">Administra las clases y la disponibilidad</p>
        </div>

        <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
          <button
            onClick={() => setMode('fixed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'fixed' ? 'bg-[#09C82C] text-[#010A01]' : 'text-white/80'
            }`}
          >
            Horario fijo
          </button>
          <button
            onClick={() => setMode('flexible')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'flexible' ? 'bg-[#09C82C] text-[#010A01]' : 'text-white/80'
            }`}
          >
            Reservas flexibles
          </button>
        </div>
      </div>

      {notifications.length > 0 && (
        <section className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5">
          <div className="mb-4 flex items-center gap-2 text-yellow-300">
            <Bell className="h-5 w-5" />
            <h2 className="font-semibold">Notificaciones de cancelacion</h2>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 4).map((notification) => (
              <div key={notification.id} className="flex flex-col gap-1 border-b border-yellow-500/10 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-white/85"><strong>{notification.member}</strong> cancelo su asistencia a <strong>{notification.className}</strong>.</p>
                <p className="text-xs text-white/50">Profesor: {notification.instructor} · {notification.time}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
        <button
          onClick={() => setCurrentWeek(currentWeek - 1)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
            <p className="font-semibold">
            {currentWeek === 0 ? 'Esta semana' : currentWeek > 0 ? `${currentWeek} semana${currentWeek > 1 ? 's' : ''} adelante` : `Hace ${Math.abs(currentWeek)} semana${Math.abs(currentWeek) > 1 ? 's' : ''}`}
          </p>
          <p className="text-sm text-white/60">20 al 26 de Enero, 2025</p>
        </div>
        <button
          onClick={() => setCurrentWeek(currentWeek + 1)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Schedule Grid */}
      {mode === 'fixed' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {days.map((day) => (
            <div key={day} className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <h3 className="font-semibold text-lg mb-4 text-[#F7F7F7]">{dayLabels[day]}</h3>
              <div className="space-y-3">
                {fixedSchedule[day]?.map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-lg border transition-colors hover:bg-white/5 ${getOccupancyColor(getBookedCount(slot), slot.capacity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{slot.name}</p>
                        <p className="text-xs opacity-80">{slot.instructor}</p>
                      </div>
                      <span className="text-xs font-medium">{slot.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Users className="w-3 h-3" />
                      <span>{getBookedCount(slot)}/{slot.capacity}</span>
                      <div className="flex-1 bg-black/20 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-current h-full rounded-full transition-all"
                          style={{ width: `${(getBookedCount(slot) / slot.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(!fixedSchedule[day] || fixedSchedule[day].length === 0) && (
                  <p className="text-white/40 text-sm text-center py-4">No hay clases programadas</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold mb-2 text-[#F7F7F7]">Modo de reservas flexibles</h3>
            <p className="text-white/60 max-w-md mx-auto">
              En este modo, los miembros pueden reservar horarios disponibles durante el dia.
              Configura limites de capacidad y horarios para cada dia.
            </p>
            <button className="mt-6 px-6 py-3 bg-[#09C82C] text-[#010A01] rounded-lg hover:bg-[#09C82C]/90 transition-colors font-medium">
              Configurar horarios flexibles
            </button>
          </div>
        </div>
      )}
    </div>
  );
}