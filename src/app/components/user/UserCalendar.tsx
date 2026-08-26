import React, { FormEvent, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Users, User } from 'lucide-react';
import { addActivity } from '../../data/gymStore';

type CalendarTab = 'my-schedule' | 'gym-schedule';

interface ClassEvent {
  id: string;
  name: string;
  time: string;
  instructor: string;
  capacity?: number;
  booked?: number;
  isBooked?: boolean;
}

interface Booking {
  id: string;
  name: string;
  date: string;
  time: string;
  instructor: string;
}

interface UserCalendarProps {
  memberName: string;
  selectedClasses: string[];
}

export function UserCalendar({ memberName, selectedClasses }: UserCalendarProps) {
  const chosenClasses = selectedClasses ?? [];
  const [activeTab, setActiveTab] = useState<CalendarTab>('my-schedule');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [bookingClass, setBookingClass] = useState<ClassEvent | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cancelledBookings, setCancelledBookings] = useState<string[]>([]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dates = [20, 21, 22, 23, 24, 25, 26];

  const defaultMySchedule: Record<number, ClassEvent[]> = {
    20: [
      { id: '1', name: 'Morning Yoga', time: '06:00', instructor: 'Sarah K.', isBooked: true },
      { id: '2', name: 'HIIT Training', time: '18:00', instructor: 'Mike R.', isBooked: true },
    ],
    22: [
      { id: '3', name: 'Morning Yoga', time: '06:00', instructor: 'Sarah K.', isBooked: true },
    ],
    24: [
      { id: '4', name: 'HIIT Training', time: '17:00', instructor: 'Mike R.', isBooked: true },
    ],
  };

  const mySchedule: Record<number, ClassEvent[]> = chosenClasses.length > 0
    ? chosenClasses.reduce<Record<number, ClassEvent[]>>((schedule, className, index) => {
      const date = 20 + index;
      schedule[date] = [{ id: `selected-${index}`, name: className, time: '18:00', instructor: 'Por asignar', isBooked: true }];
      return schedule;
    }, {})
    : defaultMySchedule;

  const gymSchedule: Record<number, ClassEvent[]> = {
    20: [
      { id: '1', name: 'Morning Yoga', time: '06:00', instructor: 'Sarah K.', capacity: 20, booked: 15, isBooked: true },
      { id: '2', name: 'HIIT Training', time: '09:00', instructor: 'Mike R.', capacity: 15, booked: 12, isBooked: false },
      { id: '3', name: 'Spinning', time: '17:00', instructor: 'Emma L.', capacity: 25, booked: 22, isBooked: false },
      { id: '4', name: 'CrossFit', time: '19:00', instructor: 'John D.', capacity: 20, booked: 18, isBooked: true },
    ],
    21: [
      { id: '5', name: 'Pilates', time: '07:00', instructor: 'Lisa M.', capacity: 15, booked: 10, isBooked: false },
      { id: '6', name: 'Boxing', time: '18:00', instructor: 'Mike R.', capacity: 12, booked: 12, isBooked: false },
    ],
    22: [
      { id: '7', name: 'Morning Yoga', time: '06:00', instructor: 'Sarah K.', capacity: 20, booked: 16, isBooked: true },
      { id: '8', name: 'Zumba', time: '17:00', instructor: 'Maria S.', capacity: 30, booked: 25, isBooked: false },
    ],
    23: [
      { id: '9', name: 'Pilates', time: '07:00', instructor: 'Lisa M.', capacity: 15, booked: 11, isBooked: false },
      { id: '10', name: 'Spinning', time: '18:00', instructor: 'Emma L.', capacity: 25, booked: 20, isBooked: false },
    ],
    24: [
      { id: '11', name: 'Morning Yoga', time: '06:00', instructor: 'Sarah K.', capacity: 20, booked: 12, isBooked: false },
      { id: '12', name: 'HIIT Training', time: '17:00', instructor: 'Mike R.', capacity: 15, booked: 13, isBooked: true },
    ],
    25: [
      { id: '13', name: 'Yoga Flow', time: '09:00', instructor: 'Sarah K.', capacity: 20, booked: 17, isBooked: false },
      { id: '14', name: 'Spinning', time: '11:00', instructor: 'Emma L.', capacity: 25, booked: 21, isBooked: false },
    ],
    26: [
      { id: '15', name: 'Gentle Yoga', time: '09:00', instructor: 'Sarah K.', capacity: 20, booked: 10, isBooked: false },
    ],
  };

  const handleBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingClass) return;
    const formData = new FormData(event.currentTarget);
    setBookings((current) => [...current, {
      id: `${bookingClass.id}-${Date.now()}`,
      name: bookingClass.name,
      date: String(formData.get('date')),
      time: String(formData.get('time')),
      instructor: String(formData.get('instructor')),
    }]);
    addActivity({ name: memberName, action: `agendo ${bookingClass.name} a las ${String(formData.get('time'))}` });
    setBookingClass(null);
  };

  const handleCancel = (event: ClassEvent) => {
    if (cancelledBookings.includes(event.id)) return;
    const notification = {
      id: `${event.id}-${Date.now()}`,
      member: memberName,
      className: event.name,
      time: event.time,
      instructor: event.instructor,
      createdAt: new Date().toISOString(),
    };
    const savedNotifications = JSON.parse(localStorage.getItem('profuncional-notifications') ?? '[]');
    localStorage.setItem('profuncional-notifications', JSON.stringify([notification, ...savedNotifications]));
    window.dispatchEvent(new CustomEvent('profuncional-booking-cancelled', { detail: notification }));
    setCancelledBookings((current) => [...current, event.id]);
    setBookings((current) => current.filter((booking) => booking.id !== event.id));
  };

  const getAvailabilityColor = (booked: number, capacity: number) => {
    const percentage = (booked / capacity) * 100;
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-[#09C82C]';
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-[#F7F7F7]">Calendario</h1>
        <p className="text-white/60">Consulta y administra tu horario de entrenamiento</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('my-schedule')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'my-schedule' ? 'bg-[#09C82C] text-[#010A01]' : 'text-white/80'
          }`}
        >
          Mi horario
        </button>
        <button
          onClick={() => setActiveTab('gym-schedule')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'gym-schedule' ? 'bg-[#09C82C] text-[#010A01]' : 'text-white/80'
          }`}
        >
          Horario del gimnasio
        </button>
      </div>

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
            {currentWeek === 0 ? 'This Week' : currentWeek > 0 ? `${currentWeek} Week${currentWeek > 1 ? 's' : ''} Ahead` : `${Math.abs(currentWeek)} Week${Math.abs(currentWeek) > 1 ? 's' : ''} Ago`}
          </p>
          <p className="text-sm text-white/60">January 20-26, 2025</p>
        </div>
        <button
          onClick={() => setCurrentWeek(currentWeek + 1)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const date = dates[index];
          const schedule = activeTab === 'my-schedule' ? mySchedule : gymSchedule;
          const events = activeTab === 'my-schedule'
            ? (schedule[date] || []).filter((event) => !cancelledBookings.includes(event.id))
            : schedule[date] || [];
          const isToday = index === 2; // Wednesday for demo

          return (
            <div key={day} className="min-h-[200px]">
              <div className={`text-center p-3 rounded-lg mb-2 ${isToday ? 'bg-[#09C82C] text-[#010A01]' : 'bg-white/5'}`}>
                <p className="text-sm font-medium">{day}</p>
                <p className="text-2xl font-bold">{date}</p>
              </div>

              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer hover:scale-105 ${
                      event.isBooked && activeTab === 'gym-schedule'
                        ? 'bg-[#09C82C]/20 border-[#09C82C]'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-xs leading-tight">{event.name}</p>
                      {event.isBooked && activeTab === 'gym-schedule' && (
                        <div className="w-2 h-2 bg-[#09C82C] rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/60 mb-1">
                      <Clock className="w-3 h-3" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/60 mb-2">
                      <User className="w-3 h-3" />
                      <span>{event.instructor}</span>
                    </div>
                    
                    {activeTab === 'gym-schedule' && event.capacity && (
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span className={getAvailabilityColor(event.booked!, event.capacity)}>
                            {Math.max(0, event.booked! - (cancelledBookings.includes(event.id) ? 1 : 0))}/{event.capacity}
                          </span>
                        </div>
                        {!event.isBooked && (
                          <button type="button" className="text-[#09C82C] hover:underline" onClick={() => setBookingClass(event)}>
                            Reservar
                          </button>
                        )}
                        {event.isBooked && (
                          <button type="button" onClick={() => handleCancel(event)} className="text-red-400 hover:underline">
                            Cancelar
                          </button>
                        )}
                      </div>
                    )}

                    {activeTab === 'my-schedule' && (
                      <button type="button" onClick={() => handleCancel(event)} className="text-xs text-red-400 hover:underline">
                        Cancelar reserva
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {activeTab === 'gym-schedule' && bookingClass && (
        <form onSubmit={handleBooking} className="rounded-xl border border-[#09C82C]/30 bg-[#09C82C]/10 p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#09C82C]">Nueva reserva</p>
              <h3 className="mt-1 text-xl font-bold">{bookingClass.name}</h3>
            </div>
            <button type="button" onClick={() => setBookingClass(null)} className="text-sm text-white/60 hover:text-white">Cerrar</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm text-white/70">Fecha<input required name="date" type="date" defaultValue="2025-01-23" className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-[#09C82C]" /></label>
            <label className="text-sm text-white/70">Hora<input required name="time" type="time" defaultValue={bookingClass.time} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-[#09C82C]" /></label>
            <label className="text-sm text-white/70">Profesor<input required name="instructor" type="text" defaultValue={bookingClass.instructor} className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-[#09C82C]" /></label>
          </div>
          <button type="submit" className="mt-5 rounded-lg bg-[#09C82C] px-5 py-3 font-semibold text-[#010A01] hover:bg-[#09C82C]/90">Confirmar reserva</button>
        </form>
      )}

      {bookings.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-4 font-semibold text-[#F7F7F7]">Mis reservas nuevas</h3>
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex flex-col gap-1 rounded-lg border border-white/10 bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-medium">{booking.name}</p><p className="text-sm text-white/55">con {booking.instructor}</p></div>
                <p className="text-sm text-[#09C82C]">{booking.date} a las {booking.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}