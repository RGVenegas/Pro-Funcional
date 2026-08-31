import React, { useEffect, useState, FormEvent } from 'react';
import { Bell, ChevronLeft, ChevronRight, Users, AlertTriangle, CheckCircle, XCircle, Stethoscope, Dumbbell, Clock, Plus, Trash2, PlusCircle } from 'lucide-react';
import {
  addActivity,
  getCentralScheduleBlocks,
  addCentralScheduleBlock,
  updateCentralScheduleBlock,
  deleteCentralScheduleBlock,
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
}

export function ScheduleManagement() {
  const [mode, setMode] = useState<ScheduleMode>('classes');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState<CentralScheduleBlock | null>(null);
  const [blocks, setBlocks] = useState<CentralScheduleBlock[]>(() => getCentralScheduleBlocks());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<CancellationNotification[]>(() =>
    JSON.parse(localStorage.getItem('profuncional-notifications') ?? '[]')
  );

  useEffect(() => {
    const unsub = subscribeToSchedule(() => {
      setBlocks(getCentralScheduleBlocks());
    });
    return unsub;
  }, []);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getOccupancyColor = (booked: number, capacity: number) => {
    const percentage = (booked / capacity) * 100;
    if (percentage >= 90) return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (percentage >= 60) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-[#09C82C]/20 text-[#09C82C] border-[#09C82C]/30';
  };

  const handleCreateBlock = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dayOfWeek = String(formData.get('dayOfWeek')) as CentralScheduleBlock['dayOfWeek'];
    const title = String(formData.get('title'));
    const instructor = String(formData.get('instructor'));
    const startTime = String(formData.get('startTime'));
    const endTime = String(formData.get('endTime'));
    const type = String(formData.get('type')) as 'kine' | 'functional';
    const capacity = Number(formData.get('capacity'));

    addCentralScheduleBlock({
      dayOfWeek,
      title,
      instructor,
      startTime,
      endTime,
      type,
      capacity,
    });

    setIsAddModalOpen(false);
    showToast(`¡Bloque "${title}" (${dayLabels[dayOfWeek]} ${startTime} hrs) creado y publicado en tiempo real!`);
  };

  const handleDeleteBlock = (blockId: string, title: string) => {
    const res = deleteCentralScheduleBlock(blockId);
    if (res.success) {
      if (selectedBlock?.id === blockId) setSelectedBlock(null);
      showToast(res.message);
    } else {
      alert(res.message);
    }
  };

  const toggleAttendance = (blockId: string, studentId: string, newStatus: 'attended' | 'no-show' | 'pending') => {
    const targetBlock = blocks.find((b) => b.id === blockId);
    if (!targetBlock) return;

    const updatedStudents = targetBlock.students.map((student) => {
      if (student.id !== studentId) return student;
      const status = student.status === newStatus ? 'pending' : newStatus;
      if (status === 'attended') {
        addActivity({ name: student.name, action: `asistió a la sesión de ${targetBlock.title}` });
      } else if (status === 'no-show') {
        addActivity({ name: student.name, action: `registró inasistencia (No-Show) en ${targetBlock.title}` });
      }
      return { ...student, status };
    });

    updateCentralScheduleBlock(blockId, { students: updatedStudents });

    if (selectedBlock && selectedBlock.id === blockId) {
      setSelectedBlock((prev) => prev ? { ...prev, students: updatedStudents } : null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-[#F7F7F7]">Parrilla de Citas y Sesiones</h1>
          <p className="text-white/60 text-sm">Configuración de disponibilidad (HU-01) y control de asistencia kinésica</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#09C82C] text-[#010A01] text-xs font-bold hover:bg-[#09C82C]/90 transition-transform hover:scale-105 flex items-center gap-2 shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            + Configurar Nuevo Bloque
          </button>

          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setMode('classes')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                mode === 'classes' ? 'bg-[#09C82C] text-[#010A01]' : 'text-white/70 hover:text-white'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              Clases & Boxes
            </button>
            <button
              onClick={() => setMode('kine-boxes')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                mode === 'kine-boxes' ? 'bg-[#09C82C] text-[#010A01]' : 'text-white/70 hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Boxes Kinésicos
            </button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="rounded-xl border border-[#09C82C]/40 bg-[#09C82C]/15 p-4 text-[#09C82C] flex items-center gap-2">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {notifications.length > 0 && (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="mb-3 flex items-center gap-2 text-amber-300">
            <Bell className="h-5 w-5" />
            <h2 className="font-semibold text-sm">Notificaciones de Cancelación a Tiempo (Cupos liberados)</h2>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="flex flex-col gap-1 border-b border-amber-500/10 pb-2 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between text-xs">
                <p className="text-white/90"><strong>{notification.member}</strong> canceló su sesión de <strong>{notification.className}</strong> (sesión reembolsada a saldo).</p>
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
          <p className="text-xs text-white/60">20 al 26 de Enero, 2025</p>
        </div>
        <button
          onClick={() => setCurrentWeek(currentWeek + 1)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {days.slice(0, 5).map((day) => {
          const dayBlocks = blocks.filter((b) => b.dayOfWeek === day && b.isActive);
          const slots = mode === 'kine-boxes' ? dayBlocks.filter((s) => s.type === 'kine') : dayBlocks;

          return (
            <div key={day} className="bg-white/5 rounded-xl p-5 backdrop-blur-sm border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-lg text-white">{dayLabels[day]}</h3>
                <span className="text-xs text-white/50">{slots.length} bloque{slots.length === 1 ? '' : 's'}</span>
              </div>

              <div className="space-y-3">
                {slots.map((slot) => {
                  const hasRestrictions = slot.students.some((st) => Boolean(st.restrictions));
                  const bookedCount = slot.students.length;

                  return (
                    <div
                      key={slot.id}
                      className={`p-4 rounded-xl border transition-all hover:scale-[1.01] ${getOccupancyColor(bookedCount, slot.capacity)}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div onClick={() => setSelectedBlock(slot)} className="cursor-pointer flex-1">
                          <p className="font-bold text-sm text-white">{slot.title}</p>
                          <p className="text-xs text-white/70">{slot.instructor}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-black/40 px-2 py-0.5 rounded text-white flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#09C82C]" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(slot.id, slot.title);
                            }}
                            title="Eliminar bloque horario"
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Alerta de restricción destacada para entrenadores */}
                      {hasRestrictions && (
                        <div className="mb-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 p-2 flex items-center gap-1.5 text-[11px] text-amber-200 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span>¡Alumnos con restricciones físicas registradas!</span>
                        </div>
                      )}

                      {/* Alumnos inscritos */}
                      <div className="space-y-1.5 pt-1">
                        {slot.students.map((st) => (
                          <div key={st.id} className="flex items-center justify-between text-xs bg-black/30 px-2.5 py-1.5 rounded-lg">
                            <span className="font-medium text-white truncate max-w-[130px]">{st.name}</span>
                            
                            <div className="flex items-center gap-1">
                              {st.restrictions && (
                                <span title={st.restrictions} className="text-[10px] bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                                  ⚠️ Restricción
                                </span>
                              )}
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                  st.status === 'attended'
                                    ? 'bg-emerald-500/30 text-emerald-300'
                                    : st.status === 'no-show'
                                    ? 'bg-rose-500/30 text-rose-300'
                                    : 'bg-white/10 text-white/70'
                                }`}
                              >
                                {st.status === 'attended' ? 'Asistió' : st.status === 'no-show' ? 'No-Show' : 'Pendiente'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div onClick={() => setSelectedBlock(slot)} className="mt-3 flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/10 cursor-pointer">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {bookedCount}/{slot.capacity} cupos</span>
                        <span className="text-[#09C82C] font-semibold">Ver detalle & asistencia →</span>
                      </div>
                    </div>
                  );
                })}

                {slots.length === 0 && (
                  <p className="text-white/40 text-xs text-center py-6">No hay bloques agendados para este día.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal HU-01: Configurar Nuevo Bloque Horario */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateBlock} className="bg-[#101a14] border border-white/15 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-[#09C82C]">HU-01 · Programa PC</span>
                <h3 className="text-xl font-bold mt-0.5">Configurar Nuevo Bloque Horario</h3>
              </div>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-white/50 hover:text-white text-sm bg-white/5 p-2 rounded-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="text-xs text-white/70 col-span-2">
                Día de la Semana
                <select name="dayOfWeek" required className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#09C82C]">
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
                <input required name="title" placeholder="Ej. Box Clínico Kinesiología 3 / HIIT Funcional" className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#09C82C]" />
              </label>

              <label className="text-xs text-white/70 col-span-2">
                Profesional / Kinesiólogo / Entrenador
                <input required name="instructor" defaultValue="Klgo. Andrés Morales" className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#09C82C]" />
              </label>

              <label className="text-xs text-white/70">
                Hora Inicio
                <input required name="startTime" type="time" defaultValue="08:00" className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#09C82C]" />
              </label>

              <label className="text-xs text-white/70">
                Hora Fin
                <input required name="endTime" type="time" defaultValue="09:00" className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#09C82C]" />
              </label>

              <label className="text-xs text-white/70">
                Tipo de Atención
                <select name="type" required className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#09C82C]">
                  <option value="kine">Box Kinésico (Individual)</option>
                  <option value="functional">Clase Funcional (Grupal)</option>
                </select>
              </label>

              <label className="text-xs text-white/70">
                Capacidad Máxima (Cupos)
                <input required name="capacity" type="number" min="1" max="30" defaultValue="1" className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white text-sm outline-none focus:border-[#09C82C]" />
              </label>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20">Cancelar</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#09C82C] text-[#010A01] text-xs font-bold hover:bg-[#09C82C]/90">Guardar Bloque Horario</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal / Drawer de Detalle de Clase & Asistencia */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#101a14] border border-white/15 rounded-2xl p-6 w-full max-w-xl space-y-5 shadow-2xl text-white">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-[#09C82C] tracking-wider">{selectedBlock.type === 'kine' ? 'Box Kinésico' : 'Clase Funcional'}</span>
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
                <Users className="w-4 h-4 text-[#09C82C]" />
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
                        {student.status === 'attended' ? '✓ Asistencia confirmada' : student.status === 'no-show' ? '✗ Inasistencia (No-Show)' : 'Pendiente de inicio'}
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
                className="px-5 py-2.5 rounded-xl bg-[#09C82C] text-[#010A01] text-xs font-bold hover:bg-[#09C82C]/90"
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