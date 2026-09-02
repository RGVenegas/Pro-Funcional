import React, { FormEvent, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Users, User, Stethoscope, Dumbbell, AlertCircle, CheckCircle, Calendar as CalendarIcon, RefreshCw, XCircle } from 'lucide-react';
import {
  getMembers,
  subscribeToMembers,
  getCentralScheduleBlocks,
  subscribeToSchedule,
  getUserBookings,
  subscribeToBookings,
  createBookingTransaction,
  cancelBookingWith24hRule,
  rescheduleBookingTransaction,
  CentralScheduleBlock,
  UserBookingRecord,
  GymMember
} from '../../data/gymStore';

type CalendarTab = 'my-schedule' | 'gym-schedule';

interface UserCalendarProps {
  memberName: string;
  selectedClasses?: string[];
}

export function UserCalendar({ memberName }: UserCalendarProps) {
  const [activeTab, setActiveTab] = useState<CalendarTab>('my-schedule');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [bookingBlock, setBookingBlock] = useState<{ block: CentralScheduleBlock; targetDate: string } | null>(null);
  const [reschedulingBooking, setReschedulingBooking] = useState<UserBookingRecord | null>(null);
  const [selectedRescheduleBlockId, setSelectedRescheduleBlockId] = useState<string>('');
  const [selectedRescheduleDate, setSelectedRescheduleDate] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Reactive state
  const [member, setMember] = useState<GymMember | undefined>(() => {
    const list = getMembers();
    return list.find((m) => m.name.toLowerCase() === memberName.toLowerCase()) || list[0];
  });

  const [scheduleBlocks, setScheduleBlocks] = useState<CentralScheduleBlock[]>(() => getCentralScheduleBlocks());
  const [userBookings, setUserBookings] = useState<UserBookingRecord[]>(() => getUserBookings(memberName));

  useEffect(() => {
    const unsubMembers = subscribeToMembers(() => {
      const list = getMembers();
      const found = list.find((m) => m.name.toLowerCase() === memberName.toLowerCase()) || list[0];
      if (found) setMember(found);
    });

    const unsubSchedule = subscribeToSchedule(() => {
      setScheduleBlocks(getCentralScheduleBlocks());
    });

    const unsubBookings = subscribeToBookings(() => {
      setUserBookings(getUserBookings(memberName));
    });

    return () => {
      unsubMembers();
      unsubSchedule();
      unsubBookings();
    };
  }, [memberName]);

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  const dayLabels: Record<string, string> = {
    Monday: 'Lun', Tuesday: 'Mar', Wednesday: 'Mié', Thursday: 'Jue',
    Friday: 'Vie', Saturday: 'Sáb', Sunday: 'Dom'
  };

  const getWeekDateInfo = (weekOffset: number, dayIndex: number) => {
    const baseMonday = new Date(2025, 0, 20); // Jan 20, 2025 (Monday)
    const target = new Date(baseMonday);
    target.setDate(baseMonday.getDate() + (weekOffset * 7) + dayIndex);

    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    return {
      dateStr,
      dateNum: target.getDate(),
      dayFormatted: day,
    };
  };

  const getDateForDayOfWeek = (dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday', weekOffset: number = currentWeek) => {
    const dayIndexMap: Record<string, number> = {
      Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6
    };
    const idx = dayIndexMap[dayOfWeek] ?? 0;
    return getWeekDateInfo(weekOffset, idx).dateStr;
  };

  const handleOpenReschedule = (booking: UserBookingRecord) => {
    setReschedulingBooking(booking);
    const available = scheduleBlocks.filter((b) => b.isActive && b.students.length < b.capacity);
    const initialBlock = available.find((b) => b.id === booking.blockId) || available[0];
    if (initialBlock) {
      setSelectedRescheduleBlockId(initialBlock.id);
      setSelectedRescheduleDate(getDateForDayOfWeek(initialBlock.dayOfWeek, currentWeek));
    } else {
      setSelectedRescheduleDate(booking.date);
    }
  };

  const handleBlockSelectChange = (blockId: string) => {
    setSelectedRescheduleBlockId(blockId);
    const found = scheduleBlocks.find((b) => b.id === blockId);
    if (found) {
      const computedDate = getDateForDayOfWeek(found.dayOfWeek, currentWeek);
      setSelectedRescheduleDate(computedDate);
    }
  };

  const getWeekRangeText = (weekOffset: number) => {
    const monInfo = getWeekDateInfo(weekOffset, 0);
    const sunInfo = getWeekDateInfo(weekOffset, 6);
    const monDate = new Date(monInfo.dateStr + 'T00:00:00');
    const sunDate = new Date(sunInfo.dateStr + 'T00:00:00');
    
    const monthStart = monDate.toLocaleDateString('es-ES', { month: 'short' });
    const monthEnd = sunDate.toLocaleDateString('es-ES', { month: 'short' });
    const monthText = monthStart === monthEnd ? monthStart : `${monthStart} - ${monthEnd}`;

    return `${monInfo.dateNum} al ${sunInfo.dateNum} de ${monthText}, ${monDate.getFullYear()}`;
  };

  const showToast = (text: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // HU-03: Realizar Reserva
  const handleBookingSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bookingBlock) return;

    const formData = new FormData(e.currentTarget);
    const bookingDate = String(formData.get('bookingDate'));

    const result = createBookingTransaction(memberName, bookingBlock.block.id, bookingDate);
    if (result.success) {
      showToast(result.message, 'success');
      setBookingBlock(null);
    } else {
      showToast(result.message, 'error');
    }
  };

  // HU-04: Cancelación con Regla de 24h
  const handleCancel = (bookingId: string) => {
    const result = cancelBookingWith24hRule(bookingId, memberName);
    if (result.success) {
      showToast(result.message, result.isRefunded ? 'success' : 'warning');
    } else {
      showToast(result.message, 'error');
    }
  };

  // HU-04: Reagendamiento
  const handleRescheduleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reschedulingBooking) return;

    const formData = new FormData(e.currentTarget);
    const newBlockId = String(formData.get('newBlockId'));
    const newDate = String(formData.get('newDate'));

    const result = rescheduleBookingTransaction(reschedulingBooking.id, memberName, newBlockId, newDate);
    if (result.success) {
      showToast(result.message, 'success');
      setReschedulingBooking(null);
    } else {
      showToast(result.message, 'error');
    }
  };

  const getAvailabilityColor = (booked: number, capacity: number) => {
    const percentage = (booked / capacity) * 100;
    if (percentage >= 90) return 'text-red-400 font-bold';
    if (percentage >= 70) return 'text-yellow-400 font-semibold';
    return 'text-[#00B4D8] font-semibold';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-[#F7F7F7]">Calendario & Agendamiento</h1>
          <p className="text-white/60 text-sm">Reserva en línea (HU-03), reagenda sin costo y cancela con regla de 24h (HU-04)</p>
        </div>

        {/* Saldo de Paquete Card */}
        <div className="bg-[#00B4D8]/10 border border-[#00B4D8]/30 px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs text-[#00B4D8] font-semibold shadow-md">
          <Stethoscope className="w-5 h-5 flex-shrink-0" />
          <div>
            <span className="text-white/60 text-[11px] block">Mi Saldo de Paquete</span>
            <span><strong>{member?.remainingSessions ?? 5} de {member?.totalSessions ?? 8} sesiones disponibles</strong></span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`rounded-xl border p-4 flex items-center gap-3 text-sm font-medium transition-all ${
            toastMessage.type === 'success'
              ? 'border-[#00B4D8]/40 bg-[#00B4D8]/15 text-[#00B4D8]'
              : toastMessage.type === 'warning'
              ? 'border-amber-500/40 bg-amber-500/15 text-amber-200'
              : 'border-red-500/40 bg-red-500/15 text-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : toastMessage.type === 'warning' ? (
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400" />
          ) : (
            <XCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-xl w-fit border border-white/10">
        <button
          onClick={() => setActiveTab('my-schedule')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'my-schedule' ? 'bg-[#00B4D8] text-[#021826]' : 'text-white/70 hover:text-white'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Mi Horario ({userBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('gym-schedule')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'gym-schedule' ? 'bg-[#00B4D8] text-[#021826]' : 'text-white/70 hover:text-white'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          Catálogo del Gimnasio & Boxes
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
          <p className="font-semibold text-white">
            {currentWeek === 0 ? 'Esta semana' : currentWeek > 0 ? `${currentWeek} semana${currentWeek > 1 ? 's' : ''} adelante` : `Hace ${Math.abs(currentWeek)} semana${Math.abs(currentWeek) > 1 ? 's' : ''}`}
          </p>
          <p className="text-xs text-white/60">{getWeekRangeText(currentWeek)}</p>
        </div>
        <button
          onClick={() => setCurrentWeek(currentWeek + 1)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto pb-4 pt-1 -mx-2 px-2 custom-scrollbar">
        <div className="grid grid-cols-7 min-w-[1260px] gap-3">
          {days.map((day, index) => {
            const dateInfo = getWeekDateInfo(currentWeek, index);
            const targetDateStr = dateInfo.dateStr;
            const dateNum = dateInfo.dateNum;
            const isToday = currentWeek === 0 && index === 2; // Wednesday demo

            // Filter schedule blocks for gym schedule
            const dayBlocks = scheduleBlocks.filter((b) => b.dayOfWeek === day && b.isActive);

            // Filter user bookings for "my-schedule" strictly by booking date
            const dayBookings = userBookings.filter((b) => {
              if (b.date === targetDateStr) return true;
              if (b.date) {
                const formattedDay = dateInfo.dayFormatted;
                const targetMonth = targetDateStr.slice(0, 7);
                if (b.date.startsWith(targetMonth) && (b.date.endsWith(`-${formattedDay}`) || b.date.endsWith(`-${dateNum}`))) {
                  return true;
                }
              }
              return false;
            });

            return (
              <div key={day} className="min-h-[220px] flex flex-col gap-2">
                <div className={`text-center p-2.5 rounded-xl ${isToday ? 'bg-[#00B4D8] text-[#021826] font-bold shadow-lg shadow-[#00B4D8]/20' : 'bg-white/5 border border-white/10'}`}>
                  <p className="text-xs font-semibold uppercase">{dayLabels[day]}</p>
                  <p className="text-xl font-black">{dateNum}</p>
                </div>

                <div className="space-y-2.5">
                  {activeTab === 'gym-schedule' &&
                    dayBlocks.map((block) => {
                      const booked = block.students.length;
                      const isUserEnrolled = block.students.some((st) => st.name.toLowerCase() === memberName.toLowerCase());

                      return (
                        <div
                          key={block.id}
                          className={`p-3 rounded-xl border transition-all ${
                            isUserEnrolled
                              ? 'bg-[#00B4D8]/15 border-[#00B4D8]/40'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <p className="font-bold text-xs leading-tight text-white">{block.title}</p>
                            {isUserEnrolled && (
                              <span className="text-[9px] bg-[#00B4D8] text-[#021826] font-bold px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">Agendado</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-white/60 mb-1">
                            <Clock className="w-3 h-3 text-[#00B4D8] flex-shrink-0" />
                            <span className="whitespace-nowrap">{block.startTime} - {block.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-white/60 mb-2 truncate">
                            <User className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{block.instructor}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                            <div className="flex items-center gap-1 text-[11px]">
                              <Users className="w-3 h-3 flex-shrink-0" />
                              <span className={getAvailabilityColor(booked, block.capacity)}>
                                {booked}/{block.capacity} cupos
                              </span>
                            </div>
                            {!isUserEnrolled && (
                              <button
                                type="button"
                                onClick={() => setBookingBlock({ block, targetDate: targetDateStr })}
                                className="text-xs text-[#00B4D8] font-bold hover:underline whitespace-nowrap"
                              >
                                Reservar →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {activeTab === 'my-schedule' &&
                    dayBookings.map((booking) => (
                      <div key={booking.id} className="p-3 rounded-xl bg-white/10 border border-[#00B4D8]/40 space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[9px] uppercase font-bold text-[#00B4D8] tracking-wider truncate">{booking.type === 'kine' ? 'Box Kinésico' : 'Clase Funcional'}</span>
                          <span className="text-[10px] font-mono text-white/60 whitespace-nowrap">{booking.time}</span>
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white leading-tight">{booking.title}</p>
                          <p className="text-[11px] text-white/60 truncate">{booking.instructor}</p>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10 w-full">
                          <button
                            type="button"
                            onClick={() => handleOpenReschedule(booking)}
                            className="w-full py-1.5 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center justify-center gap-1 transition-colors"
                          >
                            <RefreshCw className="w-3 h-3 text-[#00B4D8]" />
                            Reagendar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCancel(booking.id)}
                            className="w-full py-1.5 px-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs font-semibold text-rose-300 flex items-center justify-center gap-1 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ))}

                  {activeTab === 'gym-schedule' && dayBlocks.length === 0 && (
                    <p className="text-white/40 text-[11px] text-center py-4">Sin clases disponibles</p>
                  )}

                  {activeTab === 'my-schedule' && dayBookings.length === 0 && (
                    <p className="text-white/40 text-[11px] text-center py-4">Sin citas reservadas</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal HU-03: Confirmar Reserva autónoma */}
      {bookingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form onSubmit={handleBookingSubmit} className="bg-[#0b1726] border border-[#00B4D8]/40 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-[#00B4D8] tracking-wider">HU-03 · Agendamiento Autónomo</span>
                <h3 className="text-xl font-bold mt-1 text-white">{bookingBlock.block.title}</h3>
              </div>
              <button type="button" onClick={() => setBookingBlock(null)} className="text-white/50 hover:text-white text-sm bg-white/5 p-2 rounded-lg">✕</button>
            </div>

            <div className="bg-white/5 p-4 rounded-xl space-y-2 border border-white/10 text-xs">
              <p className="text-white/70"><strong>Profesional:</strong> {bookingBlock.block.instructor}</p>
              <p className="text-white/70"><strong>Horario:</strong> {bookingBlock.block.startTime} - {bookingBlock.block.endTime} hrs</p>
              <p className="text-white/70"><strong>Cupos disponibles:</strong> {bookingBlock.block.capacity - bookingBlock.block.students.length} de {bookingBlock.block.capacity}</p>
              <div className="pt-2 flex justify-between font-bold text-sm text-[#00B4D8]">
                <span>Mi Saldo Actual:</span>
                <span>{member?.remainingSessions ?? 5} sesiones de paquete</span>
              </div>
            </div>

            <label className="text-xs text-white/70 block">
              Fecha Seleccionada
              <input
                required
                name="bookingDate"
                type="date"
                defaultValue={bookingBlock.targetDate}
                className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#00B4D8]"
              />
            </label>

            <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
              <button type="button" onClick={() => setBookingBlock(null)} className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20">Cancelar</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#00B4D8] text-[#021826] text-xs font-bold hover:bg-[#00B4D8]/90">Confirmar & Descontar 1 Sesión</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal HU-04: Reagendar Cita sin costo ni alteración de saldo */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form onSubmit={handleRescheduleSubmit} className="bg-[#0b1726] border border-white/15 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-[#00B4D8] tracking-wider">HU-04 · Reagendamiento de Cita</span>
                <h3 className="text-xl font-bold mt-1 text-white">Reagendar "{reschedulingBooking.title}"</h3>
              </div>
              <button type="button" onClick={() => setReschedulingBooking(null)} className="text-white/50 hover:text-white text-sm bg-white/5 p-2 rounded-lg">✕</button>
            </div>

            <p className="text-xs text-white/60">
              Selecciona un nuevo bloque disponible del catálogo para mover tu cita. Tu saldo de sesiones no sufrirá ningún descuento ni recargo adicional.
            </p>

            <label className="text-xs text-white/70 block">
              Seleccionar Nuevo Bloque Horario
              <select
                name="newBlockId"
                required
                value={selectedRescheduleBlockId}
                onChange={(e) => handleBlockSelectChange(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#00B4D8]"
              >
                {scheduleBlocks.filter((b) => b.isActive && b.students.length < b.capacity).map((b) => (
                  <option key={b.id} value={b.id}>
                    {dayLabels[b.dayOfWeek]} {b.startTime} hrs - {b.title} ({b.instructor})
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-white/70 block">
              Nueva Fecha
              <input
                required
                name="newDate"
                type="date"
                value={selectedRescheduleDate}
                onChange={(e) => setSelectedRescheduleDate(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#00B4D8]"
              />
            </label>

            <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
              <button type="button" onClick={() => setReschedulingBooking(null)} className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20">Cancelar</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#00B4D8] text-[#021826] text-xs font-bold hover:bg-[#00B4D8]/90">Confirmar Nuevo Horario</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de reservas activas */}
      {userBookings.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#F7F7F7] flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#00B4D8]" />
              Mis Reservas Confirmadas
            </h3>
            <span className="text-xs text-white/50">{userBookings.length} cita{userBookings.length === 1 ? '' : 's'} agendada{userBookings.length === 1 ? '' : 's'}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {userBookings.map((b) => (
              <div key={b.id} className="p-4 rounded-xl bg-black/30 border border-white/10 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-[#00B4D8]">{b.type === 'kine' ? 'Box Kinésico' : 'Clase Funcional'}</span>
                    <span className="text-xs font-bold text-[#00B4D8]">{b.date}</span>
                  </div>
                  <p className="font-bold text-sm text-white">{b.title}</p>
                  <p className="text-xs text-white/60">{b.instructor} · {b.time}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleOpenReschedule(b)}
                    className="flex-1 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#00B4D8]" />
                    Reagendar
                  </button>
                  <button
                    onClick={() => handleCancel(b.id)}
                    className="py-2 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs font-bold text-rose-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Cancelar Cita
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}