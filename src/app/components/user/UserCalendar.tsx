import React, { FormEvent, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Users, User, Stethoscope, Dumbbell, AlertCircle, CheckCircle } from 'lucide-react';
import { addActivity, consumeSession, getMembers, refundSession, subscribeToMembers, updateMember } from '../../data/gymStore';

type CalendarTab = 'my-schedule' | 'gym-schedule';

interface ClassEvent {
  id: string;
  name: string;
  time: string;
  instructor: string;
  type?: 'kine' | 'functional';
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Find member to manage session balance
  const [member, setMember] = useState(() => {
    const list = getMembers();
    return list.find((m) => m.name.toLowerCase() === memberName.toLowerCase()) || list[0];
  });

  useEffect(() => {
    const unsub = subscribeToMembers(() => {
      const list = getMembers();
      const found = list.find((m) => m.name.toLowerCase() === memberName.toLowerCase()) || list[0];
      if (found) setMember(found);
    });
    return unsub;
  }, [memberName]);

  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const dates = [20, 21, 22, 23, 24, 25, 26];

  const defaultMySchedule: Record<number, ClassEvent[]> = {
    20: [
      { id: '1', name: 'Sesión Kinesiología (Box 1)', time: '08:00', instructor: 'Klgo. Andrés Morales', type: 'kine', isBooked: true },
      { id: '2', name: 'Entrenamiento Funcional HIIT', time: '18:00', instructor: 'Prof. Mike R.', type: 'functional', isBooked: true },
    ],
    22: [
      { id: '3', name: 'Control Kinésico & Movilidad', time: '09:00', instructor: 'Klga. Valeria Reyes', type: 'kine', isBooked: true },
    ],
    24: [
      { id: '4', name: 'Readaptación Funcional Grupal', time: '17:00', instructor: 'Prof. Carlos Vega', type: 'functional', isBooked: true },
    ],
  };

  const mySchedule: Record<number, ClassEvent[]> = chosenClasses.length > 0
    ? chosenClasses.reduce<Record<number, ClassEvent[]>>((schedule, className, index) => {
      const date = 20 + index;
      schedule[date] = [{ id: `selected-${index}`, name: className, time: '18:00', instructor: 'Equipo ProFuncional', isBooked: true }];
      return schedule;
    }, {})
    : defaultMySchedule;

  const gymSchedule: Record<number, ClassEvent[]> = {
    20: [
      { id: '1', name: 'Box Clínico Kinesiología 1', time: '08:00', instructor: 'Klgo. Andrés Morales', type: 'kine', capacity: 1, booked: 1, isBooked: true },
      { id: '2', name: 'Entrenamiento Funcional HIIT', time: '09:00', instructor: 'Prof. Mike R.', type: 'functional', capacity: 12, booked: 8, isBooked: false },
      { id: '3', name: 'Readaptación de Tren Inferior', time: '17:00', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 10, booked: 7, isBooked: false },
      { id: '4', name: 'Box Clínico Kinesiología 2', time: '19:00', instructor: 'Klga. Valeria Reyes', type: 'kine', capacity: 1, booked: 1, isBooked: true },
    ],
    21: [
      { id: '5', name: 'Evaluación Kinésica & ROM', time: '07:00', instructor: 'Klgo. Andrés Morales', type: 'kine', capacity: 1, booked: 0, isBooked: false },
      { id: '6', name: 'Entrenamiento Funcional y Core', time: '18:00', instructor: 'Prof. Mike R.', type: 'functional', capacity: 12, booked: 10, isBooked: false },
    ],
    22: [
      { id: '7', name: 'Box Clínico Kinesiología 1', time: '09:00', instructor: 'Klga. Valeria Reyes', type: 'kine', capacity: 1, booked: 1, isBooked: true },
      { id: '8', name: 'Readaptación Cardiovascular', time: '17:00', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 12, booked: 9, isBooked: false },
    ],
    23: [
      { id: '9', name: 'Terapia Manual & Descarga', time: '07:00', instructor: 'Klgo. Andrés Morales', type: 'kine', capacity: 1, booked: 0, isBooked: false },
      { id: '10', name: 'Entrenamiento Funcional HIIT', time: '18:00', instructor: 'Prof. Mike R.', type: 'functional', capacity: 12, booked: 11, isBooked: false },
    ],
    24: [
      { id: '11', name: 'Box Clínico Kinesiología 2', time: '08:00', instructor: 'Klga. Valeria Reyes', type: 'kine', capacity: 1, booked: 0, isBooked: false },
      { id: '12', name: 'Readaptación Funcional Total', time: '17:00', instructor: 'Prof. Carlos Vega', type: 'functional', capacity: 10, booked: 8, isBooked: true },
    ],
    25: [
      { id: '13', name: 'Taller de Movilidad y ROM', time: '09:00', instructor: 'Klgo. Andrés Morales', type: 'functional', capacity: 15, booked: 10, isBooked: false },
      { id: '14', name: 'Entrenamiento Funcional HIIT', time: '11:00', instructor: 'Prof. Mike R.', type: 'functional', capacity: 12, booked: 8, isBooked: false },
    ],
    26: [
      { id: '15', name: 'Evaluación y Pauta Domiciliaria', time: '09:00', instructor: 'Klga. Valeria Reyes', type: 'kine', capacity: 1, booked: 0, isBooked: false },
    ],
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingClass) return;

    // Descontar 1 sesión del saldo
    if (member) {
      if ((member.remainingSessions ?? 0) <= 0) {
        showToast('⚠️ No tienes sesiones disponibles en tu paquete. Renueva en la pestaña Membresía.');
        return;
      }
      consumeSession(member.id);
    }

    const formData = new FormData(event.currentTarget);
    const newBooking: Booking = {
      id: `${bookingClass.id}-${Date.now()}`,
      name: bookingClass.name,
      date: String(formData.get('date')),
      time: String(formData.get('time')),
      instructor: String(formData.get('instructor')),
    };

    setBookings((current) => [...current, newBooking]);
    addActivity({ name: memberName, action: `agendó ${bookingClass.name} a las ${String(formData.get('time'))} (-1 sesión de saldo)` });
    showToast(`¡Sesión agendada con éxito en <30s! Te quedan ${(member?.remainingSessions ?? 5) - 1} sesiones.`);
    setBookingClass(null);
  };

  const handleCancel = (event: ClassEvent) => {
    if (cancelledBookings.includes(event.id)) return;

    // Reembolsar 1 sesión al saldo del paquete
    if (member) {
      refundSession(member.id);
    }

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
    addActivity({ name: memberName, action: `canceló a tiempo su reserva en ${event.name} (+1 sesión reembolsada)` });
    showToast(`Reserva cancelada a tiempo. ¡1 sesión ha sido devuelta a tu saldo!`);
  };

  const getAvailabilityColor = (booked: number, capacity: number) => {
    const percentage = (booked / capacity) * 100;
    if (percentage >= 90) return 'text-red-400 font-bold';
    if (percentage >= 70) return 'text-yellow-400 font-semibold';
    return 'text-[#09C82C] font-semibold';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-[#F7F7F7]">Calendario & Agendamiento</h1>
          <p className="text-white/60 text-sm">Reserva tu sesión kinésica o entrenamiento funcional en &lt;30 segundos</p>
        </div>

        {/* Saldo banner */}
        <div className="bg-[#09C82C]/10 border border-[#09C82C]/30 px-4 py-2 rounded-xl flex items-center gap-2.5 text-xs text-[#09C82C] font-semibold">
          <Stethoscope className="w-4 h-4" />
          <span>Saldo disponible: <strong>{member?.remainingSessions ?? 5} de {member?.totalSessions ?? 8} sesiones</strong></span>
        </div>
      </div>

      {toastMessage && (
        <div className="rounded-xl border border-[#09C82C]/40 bg-[#09C82C]/15 p-4 text-[#09C82C] flex items-center gap-2">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

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