import { weekDate } from '../../data/dates';
import { studentsForSlot, subscribeToBookings } from '../../data/gymStore';
import { addCentralScheduleBlock, deleteCentralScheduleBlock, recordAttendance } from '../../data/operations';
import React, { useEffect, useState, FormEvent } from 'react';
import { Bell, ChevronLeft, ChevronRight, Users, User, AlertTriangle, CheckCircle, XCircle, Stethoscope, Dumbbell, Clock, Plus, Trash2, PlusCircle } from 'lucide-react';
import {
  addActivity,
  getCentralScheduleBlocks,
  updateCentralScheduleBlock,
  subscribeToSchedule,
  CentralScheduleBlock,
  EnrolledStudent
} from '../../data/gymStore';

type ScheduleMode = 'classes' | 'kine-boxes';

interface CancellationNotification {
  id: string;
  member: string;
  className: string;
  time: string;
  instructor: string;
  createdAt: string;
  isRefunded?: boolean;
}

export function ScheduleManagement() {
  const [mode, setMode] = useState<ScheduleMode>('classes');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState<CentralScheduleBlock | null>(null);
  const loadBlocksForWeek = (weekOffset: number) => {
    const daysOrder: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[] = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];
    return getCentralScheduleBlocks().map((b) => {
      const idx = daysOrder.indexOf(b.dayOfWeek);
      const slotDate = weekDate(weekOffset, idx >= 0 ? idx : 0);
      const enrolled = studentsForSlot(b.id, slotDate);
      const allStudentsMap = new Map<string, EnrolledStudent>();
      for (const st of b.students || []) {
        allStudentsMap.set(st.name.toLowerCase(), st);
      }
      for (const st of enrolled) {
        allStudentsMap.set(st.name.toLowerCase(), st);
      }
      return {
        ...b,
        students: Array.from(allStudentsMap.values()),
      };
    });
  };

  const [blocks, setBlocks] = useState<CentralScheduleBlock[]>(() => loadBlocksForWeek(currentWeek));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<CancellationNotification[]>(() =>
    JSON.parse(localStorage.getItem('profuncional-notifications') ?? '[]')
  );

  useEffect(() => {
    const update = () => {
      setBlocks(loadBlocksForWeek(currentWeek));
    };
    update();
    const unsub = subscribeToSchedule(update);
    const bookings = subscribeToBookings(update);
    return () => { unsub(); bookings(); };
  }, [currentWeek]);

  useEffect(() => {
    const handleCancellation = (event: Event) => {
      const notification = (event as CustomEvent<CancellationNotification>).detail;
      setNotifications((current) => [notification, ...current]);
    };
    window.addEventListener('profuncional-booking-cancelled', handleCancellation);
    return () => window.removeEventListener('profuncional-booking-cancelled', handleCancellation);
  }, []);

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const dayLabels: Record<string, string> = {
    Monday: 'Lunes', Tuesday: 'Martes', Wednesday: 'Miércoles', Thursday: 'Jueves',
    Friday: 'Viernes', Saturday: 'Sábado', Sunday: 'Domingo',
  };

  const getWeekRangeLabel = (weekOffset: number) => {
    const baseMonday = new Date(weekDate() + 'T12:00:00');
    const start = new Date(baseMonday);
    start.setDate(baseMonday.getDate() + weekOffset * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const monthStart = start.toLocaleDateString('es-ES', { month: 'short' });
    const monthEnd = end.toLocaleDateString('es-ES', { month: 'short' });
    const monthText = monthStart === monthEnd ? monthStart : `${monthStart} - ${monthEnd}`;

    return `${start.getDate()} al ${end.getDate()} de ${monthText}, ${start.getFullYear()}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getOccupancyColor = (booked: number, capacity: number) => {
    const percentage = (booked / capacity) * 100;
    if (percentage >= 90) return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (percentage >= 60) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/30';
  };

  const handleCreateBlock = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dayOfWeek = String(formData.get('dayOfWeek')) as CentralScheduleBlock['dayOfWeek'];
    const title = String(formData.get('title'));
    const instructor = String(formData.get('instructor'));
    const startTime = String(formData.get('startTime'));
    const endTime = String(formData.get('endTime'));
    const type = String(formData.get('type')) as 'kine' | 'functional';
    const capacity = Number(formData.get('capacity'));

    // Check operating hours: Mon-Fri 07:00-21:00, Sat 08:00-14:00, Sun 09:00-13:00
    const startHour = parseInt(startTime.split(':')[0], 10);
    const endHour = parseInt(endTime.split(':')[0], 10);
    let outOfBounds = false;
    if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(dayOfWeek)) {
      if (startHour < 7 || endHour > 21 || (endHour === 21 && parseInt(endTime.split(':')[1], 10) > 0)) outOfBounds = true;
    } else if (dayOfWeek === 'Saturday') {
      if (startHour < 8 || endHour > 14 || (endHour === 14 && parseInt(endTime.split(':')[1], 10) > 0)) outOfBounds = true;
    } else if (dayOfWeek === 'Sunday') {
      if (startHour < 9 || endHour > 13 || (endHour === 13 && parseInt(endTime.split(':')[1], 10) > 0)) outOfBounds = true;
    }

    if (outOfBounds) {
      if (!window.confirm('⚠️ El horario ingresado (' + startTime + ' - ' + endTime + ') está fuera del rango oficial de atención del gimnasio. ¿Deseas configurarlo de todas formas?')) {
        return;
      }
    }

    try { await addCentralScheduleBlock({
      dayOfWeek,
      title,
      instructor,
      startTime,
      endTime,
      type,
      capacity,
    });

    } catch (e) { showToast((e as Error).message); return; }
    setIsAddModalOpen(false);
    showToast(`¡Bloque "${title}" (${dayLabels[dayOfWeek]} ${startTime} hrs) creado y publicado en tiempo real!`);
  };

  const handleDeleteBlock = async (blockId: string, title: string) => {
    const res = await deleteCentralScheduleBlock(blockId);
    if (res.success) {
      if (selectedBlock?.id === blockId) setSelectedBlock(null);
      showToast(res.message);
    } else {
      alert(res.message);
    }
  };

  useEffect(() => { if (selectedBlock) setSelectedBlock(blocks.find(b => b.id === selectedBlock.id) || null); }, [blocks]);
  const toggleAttendance = async (blockId: string, studentId: string, newStatus: 'attended' | 'no-show' | 'pending') => {
    const student = blocks.find(b => b.id === blockId)?.students.find(s => s.id === studentId);
    if (!student?.bookingId) return;
    try { await recordAttendance(student.bookingId, student.status === newStatus ? 'pending' : newStatus); showToast('Asistencia actualizada.'); } catch (e) { showToast((e as Error).message); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-[#F7F7F7]">Agenda de Citas y Sesiones</h1>
          <p className="text-white/60 text-sm">Configuración de disponibilidad (HU-01) y control de asistencia kinésica</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#00E676] text-[#021826] text-xs font-bold hover:bg-[#00E676]/90 transition-transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/20"
          >
            <PlusCircle className="w-4 h-4" />
            + Configurar Nuevo Bloque
          </button>

          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
            <button
              onClick={() => setMode('classes')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                mode === 'classes' ? 'bg-[#00E676] text-[#021826]' : 'text-white/70 hover:text-white'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              Clases & Boxes
            </button>
            <button
              onClick={() => setMode('kine-boxes')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                mode === 'kine-boxes' ? 'bg-[#00E676] text-[#021826]' : 'text-white/70 hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Boxes Kinésicos
            </button>
          </div>
        </div>
      </div>

      {/* Operating Hours Banner (Rangos de atención del gimnasio) */}
      <div className="rounded-xl border border-[#00E676]/30 bg-[#00E676]/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#00E676]">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 flex-shrink-0 text-[#00E676]" />
          <div>
            <span className="font-bold block text-[#00E676] uppercase tracking-wider">Rangos de Atención Oficial del Gimnasio & Centro Kinésico</span>
            <span className="text-white/80">Lun - Vie: 07:00 a 21:00 hrs · Sábados: 08:00 a 14:00 hrs · Domingos: 09:00 a 13:00 hrs</span>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-[#00E676]/20 border border-[#00E676]/40 rounded-full font-bold text-[11px] whitespace-nowrap text-[#00E676]">
          Horarios Vigentes
        </span>
      </div>

      {toastMessage && (
        <div className="rounded-xl border border-[#00E676]/40 bg-[#00E676]/15 p-4 text-[#00E676] flex items-center gap-2">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {notifications.length > 0 && (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="mb-3 flex items-center justify-between text-amber-300">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h2 className="font-semibold text-sm">Notificaciones de Cancelación a Tiempo (Cupos liberados)</h2>
            </div>
            <button
              onClick={() => {
                setNotifications([]);
                localStorage.removeItem('profuncional-notifications');
              }}
              className="text-xs text-amber-300/70 hover:text-amber-200 underline"
            >
              Limpiar notificaciones
            </button>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="flex flex-col gap-1 border-b border-amber-500/10 pb-2 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between text-xs">
                <p className="text-white/90"><strong>{notification.member}</strong> canceló su sesión de <strong>{notification.className}</strong> ({notification.isRefunded ? 'sesión devuelta al saldo' : 'sin devolución de sesión'}).</p>
                <p className="text-white/50">{notification.instructor} · {notification.time}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
        <button
          onClick={() => setCurrentWeek(currentWeek - 1)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="font-bold text-white">
            {currentWeek === 0 ? 'Esta semana' : currentWeek > 0 ? `${currentWeek} semana${currentWeek > 1 ? 's' : ''} adelante` : `Hace ${Math.abs(currentWeek)} semana${Math.abs(currentWeek) > 1 ? 's' : ''}`}
          </p>
          <p className="text-xs text-white/60">{getWeekRangeLabel(currentWeek)}</p>
        </div>
        <button
          onClick={() => setCurrentWeek(currentWeek + 1)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile scroll hint indicator */}
      <div className="lg:hidden flex items-center justify-between text-xs text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/25 rounded-xl px-3 py-2 text-[11px]">
        <span className="font-semibold flex items-center gap-1.5">
          <span>📱</span> Desliza horizontalmente para ver la semana completa
        </span>
        <span className="font-mono text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded border border-white/10">7 días →</span>
      </div>

      {/* Schedule Grid */}
      <div className="w-full max-w-full overflow-x-auto pb-4 pt-1 -mx-2 px-2 custom-scrollbar">
        <div className="grid grid-cols-7 min-w-[1260px] gap-3.5">
          {days.map((day) => {
            const dayBlocks = blocks.filter((b) => b.dayOfWeek === day && b.isActive);
            const slots = mode === 'kine-boxes' ? dayBlocks.filter((s) => s.type === 'kine') : dayBlocks;

            return (
              <div key={day} className="bg-white/5 rounded-2xl p-3.5 backdrop-blur-sm border border-white/10 flex flex-col justify-start gap-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5 px-0.5">
                  <h3 className="font-bold text-base text-white">{dayLabels[day]}</h3>
                  <span className="text-[11px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{slots.length} {slots.length === 1 ? 'bloque' : 'bloques'}</span>
                </div>

                <div className="space-y-3">
                  {slots.map((slot) => {
                    const hasRestrictions = slot.students.some((st) => Boolean(st.restrictions));
                    const bookedCount = slot.students.length;

                    return (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-xl border transition-all hover:scale-[1.01] ${getOccupancyColor(bookedCount, slot.capacity)} flex flex-col justify-between`}
                      >
                        {/* Top bar: Hora + Eliminar */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="text-[11px] font-mono font-bold bg-black/60 px-2 py-0.5 rounded-md text-white flex items-center gap-1 whitespace-nowrap border border-white/10">
                            <Clock className="w-3 h-3 text-[#00E676] flex-shrink-0" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(slot.id, slot.title);
                            }}
                            title="Eliminar bloque horario"
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors flex-shrink-0 ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Info principal: Título e Instructor */}
                        <div onClick={() => setSelectedBlock(slot)} className="cursor-pointer mb-2 space-y-0.5">
                          <p className="font-bold text-xs leading-snug text-white">{slot.title}</p>
                          <p className="text-[11px] text-white/70 truncate flex items-center gap-1">
                            <User className="w-3 h-3 text-white/40 flex-shrink-0" />
                            {slot.instructor}
                          </p>
                        </div>

                        {/* Alerta de restricción destacada */}
                        {hasRestrictions && (
                          <div className="mb-2 rounded-lg bg-amber-500/20 border border-amber-500/40 px-2 py-1 flex items-center gap-1.5 text-[10px] text-amber-200 font-medium leading-tight">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <span className="truncate">Restricción médica</span>
                          </div>
                        )}

                        {/* Lista compacta de alumnos */}
                        {slot.students.length > 0 && (
                          <div className="space-y-1 mb-2 pt-1">
                            {slot.students.map((st) => (
                              <div key={st.id} className="flex items-center justify-between text-[11px] bg-black/40 px-2 py-1 rounded-lg gap-1 border border-white/5">
                                <span className="font-medium text-white truncate max-w-[80px]" title={st.name}>{st.name}</span>
                                
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {st.restrictions && (
                                    <span title={st.restrictions} className="text-[9px] bg-amber-500/30 text-amber-300 px-1 py-0.5 rounded font-bold">
                                      ⚠️
                                    </span>
                                  )}
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap ${
                                      st.status === 'attended'
                                        ? 'bg-emerald-500/30 text-emerald-300'
                                        : st.status === 'no-show'
                                        ? 'bg-rose-500/30 text-rose-300'
                                        : 'bg-white/10 text-white/70'
                                    }`}
                                  >
                                    {st.status === 'attended' ? 'Asistió' : st.status === 'no-show' ? 'No-Show' : 'Pendient.'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div onClick={() => setSelectedBlock(slot)} className="mt-auto flex items-center justify-between text-[11px] text-white/60 pt-2 border-t border-white/10 cursor-pointer">
                          <span className="flex items-center gap-1 whitespace-nowrap"><Users className="w-3 h-3 flex-shrink-0" /> {bookedCount}/{slot.capacity}</span>
                          <span className="text-[#00E676] font-semibold text-[10px] sm:text-[11px] whitespace-nowrap">Ver detalle →</span>
                        </div>
                      </div>
                    );
                  })}

                  {slots.length === 0 && (
                    <p className="text-white/40 text-xs text-center py-6">No hay bloques agendados.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal HU-01: Configurar Nuevo Bloque Horario */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <form onSubmit={handleCreateBlock} className="bg-[#0b1726] border border-white/15 rounded-2xl p-4 sm:p-6 w-full max-w-lg space-y-4 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-[#00E676]">HU-01 · Programa PC</span>
                <h3 className="text-xl font-bold mt-0.5">Configurar Nuevo Bloque Horario</h3>
              </div>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-white/50 hover:text-white text-sm bg-white/5 p-2 rounded-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="text-xs text-white/70 col-span-2">
                Día de la Semana
                <select name="dayOfWeek" required className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#00E676]">
                  <option value="Monday">Lunes</option>
                  <option value="Tuesday">Martes</option>
                  <option value="Wednesday">Miércoles</option>
                  <option value="Thursday">Jueves</option>
                  <option value="Friday">Viernes</option>
                  <option value="Saturday">Sábado</option>
                  <option value="Sunday">Domingo</option>
                </select>
              </label>

              <label className="text-xs text-white/70 col-span-2">
                Nombre de la Clase / Box Clínico
                <input required name="title" placeholder="Ej. Box Clínico Kinesiología 3 / HIIT Funcional" className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#00E676]" />
              </label>

              <label className="text-xs text-white/70 col-span-2">
                Profesional / Kinesiólogo / Entrenador
                <input required name="instructor" defaultValue="Klgo. Andrés Morales" className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#00E676]" />
              </label>

              <label className="text-xs text-white/70">
                Hora Inicio
                <input required name="startTime" type="time" defaultValue="08:00" className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#00E676]" />
              </label>

              <label className="text-xs text-white/70">
                Hora Fin
                <input required name="endTime" type="time" defaultValue="09:00" className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#00E676]" />
              </label>

              <label className="text-xs text-white/70">
                Tipo de Atención
                <select name="type" required className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#00E676]">
                  <option value="kine">Box Kinésico (Individual)</option>
                  <option value="functional">Clase Funcional (Grupal)</option>
                </select>
              </label>

              <label className="text-xs text-white/70">
                Capacidad Máxima (Cupos)
                <input required name="capacity" type="number" min="1" max="30" defaultValue="1" className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#00E676]" />
              </label>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20">Cancelar</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#00E676] text-[#021826] text-xs font-bold hover:bg-[#00E676]/90">Guardar Bloque Horario</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal / Drawer de Detalle de Clase & Asistencia */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0b1726] border border-white/15 rounded-2xl p-4 sm:p-6 w-full max-w-xl space-y-5 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-[#00E676] tracking-wider">{selectedBlock.type === 'kine' ? 'Box Kinésico' : 'Clase Funcional'}</span>
                <h3 className="text-xl font-bold mt-1">{selectedBlock.title}</h3>
                <p className="text-xs text-white/60">{selectedBlock.instructor} · {selectedBlock.startTime} - {selectedBlock.endTime} hrs ({dayLabels[selectedBlock.dayOfWeek]})</p>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="text-white/50 hover:text-white text-sm bg-white/5 p-2 rounded-lg"
              >
                Cerrar ✕
              </button>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-3 text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00E676]" />
                Lista de Alumnos Inscritos y Control de Asistencia
              </h4>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {selectedBlock.students.map((student) => (
                  <div key={student.id} className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{student.name}</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          student.status === 'attended'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : student.status === 'no-show'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {student.status === 'attended' ? '✓ Asistencia confirmada' : student.status === 'no-show' ? '✗ Inasistencia (No-Show)' : student.confirmedAt ? 'Confirmó que asistirá' : 'Pendiente de confirmación'}
                      </span>
                    </div>

                    {/* Alerta visible para el entrenador */}
                    {student.restrictions ? (
                      <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-300">Restricción médica activa:</strong> {student.restrictions}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-white/40">Sin restricciones físicas reportadas por kinesiología.</p>
                    )}

                    {/* Botones de asistencia */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => toggleAttendance(selectedBlock.id, student.id, 'attended')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                          student.status === 'attended'
                            ? 'bg-emerald-500 text-black'
                            : 'bg-white/10 hover:bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Marcar Asistió
                      </button>

                      <button
                        onClick={() => toggleAttendance(selectedBlock.id, student.id, 'no-show')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                          student.status === 'no-show'
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/10 hover:bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        Marcar No-Show
                      </button>
                    </div>
                  </div>
                ))}

                {selectedBlock.students.length === 0 && (
                  <p className="text-xs text-white/40 text-center py-6">No hay alumnos inscritos en este bloque actualmente.</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBlock(null)}
                className="px-5 py-2.5 rounded-xl bg-[#00E676] text-[#021826] text-xs font-bold hover:bg-[#00E676]/90"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}