import { getMemberByEmail, getUserBookings, subscribeToMembers, subscribeToBookings } from '../../data/gymStore';
import { CarePanel } from '../shared/CarePanel';
import { formatDate } from '../../data/dates';
import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Dumbbell, Zap, Stethoscope, Activity, AlertTriangle, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from 'recharts';

interface ClinicalSessionRecord {
  date: string;
  evaPain: number;
  romDegrees: number;
  notes: string;
  professional: string;
}

export function TrainingTracking({ email }: { email: string }) {
    const [, refresh] = useState(0);
    useEffect(() => { const update = () => refresh(n => n + 1); const a = subscribeToMembers(update); const b = subscribeToBookings(update); return () => { a(); b(); }; }, []);
    const member = getMemberByEmail(email);
    const history = [...(member?.clinicalHistory || [])].sort((a, b) => a.date.localeCompare(b.date));
    const [area, setArea] = useState('');
    const selectedArea = area || history.at(-1)?.jointOrArea;
    const records = history.filter(e => e.jointOrArea === selectedArea);
    const latest = records.at(-1);
    const first = records[0];
  const [activeChart, setActiveChart] = useState<'pain' | 'rom'>('pain');

  const clinicalProgressData = records.map((e, i) => ({ session: 'Sesión ' + (i + 1), date: formatDate(e.date), evaPain: e.evaPain, romDegrees: e.romDegrees }));
  const sessions = getUserBookings(member?.name).filter(b => b.status === 'attended').map(b => ({ id: b.id, name: b.title, date: b.date, duration: Math.round((Date.parse(b.date + 'T' + b.time.split(' - ')[1]) - Date.parse(b.date + 'T' + b.time.split(' - ')[0])) / 60000), type: b.type === 'kine' ? 'Box Clínico' : 'Gimnasio', instructor: b.instructor }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-1 text-[#F7F7F7]">Mi Evolución Kinésica & Física</h1>
        <p className="text-white/60 text-sm">Monitoreo de dolor (EVA), rango de movilidad (ROM) y sesiones realizadas</p>
      </div>

      {/* Alerta Médica de Restricciones */}
      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 flex items-start gap-3.5 text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Pauta Médica y Restricciones Activas para el Gimnasio</h3>
          <p className="text-sm font-medium text-white/90 mt-1">
            {member?.physicalRestrictions || 'Sin restricciones registradas por el profesional.'}
          </p>
          <span className="text-xs text-amber-300/70 mt-1 block">{latest ? `Evaluación de ${latest.professional} · ${formatDate(latest.date)}` : 'Evaluación pendiente'}</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60">Dolor Actual (EVA)</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{latest?.evaPain ?? '—'} <span className="text-xs text-white/50">/ 10</span></p>
          <p className="text-[11px] text-white/50">{latest && first ? `${latest.evaPain - first.evaPain} puntos desde inicio` : 'Sin evaluaciones'}</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60">Movilidad (ROM)</span>
            <ArrowUpRight className="w-4 h-4 text-[#00B4D8]" />
          </div>
          <p className="text-2xl font-bold text-[#00B4D8]">{latest ? `${latest.romDegrees}°` : '—'}</p>
          <p className="text-[11px] text-white/50">{latest && first ? `${latest.romDegrees - first.romDegrees}° desde inicio` : 'Sin evaluaciones'}</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60">Sesiones Hechas</span>
            <Stethoscope className="w-4 h-4 text-white/60" />
          </div>
          <p className="text-2xl font-bold text-white">{sessions.length}</p>
          <p className="text-[11px] text-white/50">Asistencias registradas</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60">Días con asistencia</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-300">{new Set(sessions.map(s => s.date)).size}</p>
          <p className="text-[11px] text-white/50">Historial personal</p>
        </div>
      </div>

      {/* HU-06: Gráficos de Evolución de Dolor EVA y Movilidad ROM */}
      <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-bold text-lg text-white">Curva de Recuperación Física</h3>
            <p className="text-xs text-white/60">Evolución sesión a sesión registrada por el equipo de kinesiología</p>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setActiveChart('pain')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeChart === 'pain' ? 'bg-[#00B4D8] text-[#021826]' : 'text-white/60 hover:text-white'
              }`}
            >
              Dolor (Escala EVA 1-10)
            </button>
            <button
              onClick={() => setActiveChart('rom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeChart === 'rom' ? 'bg-[#00B4D8] text-[#021826]' : 'text-white/60 hover:text-white'
              }`}
            >
              Movilidad Articular (ROM °)
            </button>
          </div>
        </div>

        <label className="block text-sm text-white/60">Zona evaluada<select aria-label="Zona evaluada" value={selectedArea || ''} onChange={e => setArea(e.target.value)} className="ml-2 bg-[#010A01] rounded-lg border border-white/10 p-2">{[...new Set(history.map(e => e.jointOrArea))].map(a => <option key={a}>{a}</option>)}</select></label>
{!records.length && <p className="text-sm text-white/60">Aún no hay evaluaciones registradas.</p>}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === 'pain' ? (
              <AreaChart data={clinicalProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00B4D8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#ffffff60" fontSize={12} />
                <YAxis domain={[0, 10]} stroke="#ffffff60" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1726', borderColor: '#ffffff20', borderRadius: '0.75rem', color: '#fff' }}
                  formatter={(value: any) => [`${value} / 10`, 'Nivel de Dolor (EVA)']}
                  labelFormatter={(label) => `Fecha: ${label}`}
                />
                <Area type="monotone" dataKey="evaPain" stroke="#00B4D8" strokeWidth={3} fillOpacity={1} fill="url(#painGradient)" />
              </AreaChart>
            ) : (
              <AreaChart data={clinicalProgressData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="romGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00B4D8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#ffffff60" fontSize={12} />
                <YAxis domain={['auto', 'auto']} stroke="#ffffff60" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1726', borderColor: '#ffffff20', borderRadius: '0.75rem', color: '#fff' }}
                  formatter={(value: any) => [`${value}°`, 'Movilidad Articular (ROM)']}
                  labelFormatter={(label) => `Fecha: ${label}`}
                />
                <Area type="monotone" dataKey="romDegrees" stroke="#00B4D8" strokeWidth={3} fillOpacity={1} fill="url(#romGradient)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between items-center text-xs text-white/50 pt-2 border-t border-white/5 font-mono">
          <span>{member?.care?.goals || 'Objetivos pendientes de definir con tu profesional'}</span>
          <span>Actualizado tras última atención</span>
        </div>
      </div>

      {/* Historial de Sesiones */}
      <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
        <h3 className="font-bold mb-4 text-[#F7F7F7] text-lg">Historial de Sesiones Kinésicas y Funcionales</h3>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between mb-1.5">
                <div>
                  <h4 className="font-bold text-white text-sm">{session.name}</h4>
                  <p className="text-xs text-white/60">{session.type} · {session.instructor}</p>
                </div>
                <span className="text-xs text-[#00B4D8] font-semibold bg-[#00B4D8]/10 border border-[#00B4D8]/20 px-2.5 py-1 rounded-lg">
                  {session.duration} min
                </span>
              </div>
              <p className="text-xs text-white/40">{new Date(session.date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          ))}
        </div>
      </div>
      {member && <><CarePanel memberId={member.id} section="routine" /><CarePanel memberId={member.id} section="messages" author={member.name} /></>}
    </div>
  );
}