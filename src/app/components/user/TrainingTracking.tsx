import { getMemberByEmail, getMembers, getUserBookings, subscribeToMembers, subscribeToBookings } from '../../data/gymStore';
import { CarePanel } from '../shared/CarePanel';
import { formatDate } from '../../data/dates';
import { ProgressCharts } from '../charts/ProgressCharts';
import {
  getMemberProgressAssessments,
  subscribeToProgress,
  ProgressAssessment
} from '../../data/progressStore';
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  TrendingUp,
  Dumbbell,
  Zap,
  Stethoscope,
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Heart
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function TrainingTracking({ email, user }: { email?: string; user?: any }) {
  const [, refresh] = useState(0);

  const member = getMemberByEmail(email || '') || (user ? getMembers().find(m => Boolean(m && m.name && user.name && m.name.toLowerCase() === user.name.toLowerCase())) : getMembers()[0]);
  const [assessments, setAssessments] = useState<ProgressAssessment[]>(() => {
    return member ? getMemberProgressAssessments(member.id) : [];
  });

  const [activeMainTab, setActiveMainTab] = useState<'progress' | 'kine' | 'history'>('progress');

  useEffect(() => {
    const update = () => {
      refresh(n => n + 1);
      if (member) {
        setAssessments(getMemberProgressAssessments(member.id));
      }
    };
    const a = subscribeToMembers(update);
    const b = subscribeToBookings(update);
    const c = subscribeToProgress(update);
    return () => { a(); b(); c(); };
  }, [member?.id]);

  const history = [...(member?.clinicalHistory || [])].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const [area, setArea] = useState('');
  const selectedArea = area || history.at(-1)?.jointOrArea || 'General';
  const records = history.filter(e => e.jointOrArea === selectedArea);
  const latest = records.at(-1);
  const first = records[0];
  const [activeKineChart, setActiveKineChart] = useState<'pain' | 'rom'>('pain');

  const clinicalProgressData = records.map((e, i) => ({
    session: 'Sesión ' + (i + 1),
    date: e.date ? formatDate(e.date) : `Sesión ${i + 1}`,
    evaPain: e.evaPain ?? 0,
    romDegrees: e.romDegrees ?? 0
  }));

  const userBookingsList = member ? getUserBookings(member.name) : [];
  const sessions = userBookingsList
    .filter(b => b.status === 'attended')
    .map(b => {
      let duration = 60;
      if (b.time && b.time.includes(' - ')) {
        const parts = b.time.split(' - ');
        const startMs = Date.parse((b.date || '2025-01-01') + 'T' + parts[0]);
        const endMs = Date.parse((b.date || '2025-01-01') + 'T' + parts[1]);
        if (!isNaN(startMs) && !isNaN(endMs)) {
          duration = Math.round((endMs - startMs) / 60000);
        }
      }
      return {
        id: b.id,
        name: b.title || 'Sesión Kinésica',
        date: b.date || '',
        duration: duration > 0 ? duration : 60,
        type: b.type === 'kine' ? 'Box Clínico' : 'Gimnasio',
        instructor: b.instructor || 'Profesional'
      };
    });

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1 text-[#F7F7F7]">Mi Rendimiento & Métricas de Salud</h1>
        <p className="text-white/60 text-sm">
          Seguimiento de los 10 ejercicios base medibles, 5 métricas de salud (bioimpedancia) y evolución clínica.
        </p>
      </div>

      {/* Alerta Médica de Restricciones si existe */}
      {member?.physicalRestrictions && member.physicalRestrictions !== 'Sin restricciones reportadas' && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 sm:p-5 flex items-start gap-3.5 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Pauta Médica y Restricciones Activas</h3>
            <p className="text-sm font-medium text-white/90 mt-1">
              {member.physicalRestrictions}
            </p>
            <span className="text-xs text-amber-300/70 mt-1 block">
              {latest ? `Supervisado por ${latest.professional} · ${formatDate(latest.date)}` : 'Evaluación al día'}
            </span>
          </div>
        </div>
      )}

      {/* Selector de Vistas Principales */}
      <div className="flex flex-wrap items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
        <button
          type="button"
          onClick={() => setActiveMainTab('progress')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeMainTab === 'progress'
              ? 'bg-[#00E676] text-[#021826] shadow-lg shadow-[#00E676]/20'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Tests Físicos & Salud (10 Ejercicios + 5 Métricas)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('kine')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeMainTab === 'kine'
              ? 'bg-[#00E676] text-[#021826] shadow-lg shadow-[#00E676]/20'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Curva Kinésica (EVA & ROM)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('history')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeMainTab === 'history'
              ? 'bg-[#00E676] text-[#021826] shadow-lg shadow-[#00E676]/20'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Historial de Sesiones ({sessions.length})</span>
        </button>
      </div>

      {/* CONTENIDO 1: 10 EJERCICIOS BASE Y 5 MÉTRICAS DE SALUD */}
      {activeMainTab === 'progress' && member && (
        <ProgressCharts
          memberId={member.id}
          memberName={member.name}
          assessments={assessments}
          canEdit={true}
          defaultTab="health"
        />
      )}

      {/* CONTENIDO 2: CURVA KINÉSICA (EVA & ROM) */}
      {activeMainTab === 'kine' && (
        <div className="space-y-6">
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
                <ArrowUpRight className="w-4 h-4 text-[#00E676]" />
              </div>
              <p className="text-2xl font-bold text-[#00E676]">{latest ? `${latest.romDegrees}°` : '—'}</p>
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

          <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-bold text-lg text-white">Curva de Recuperación Física (EVA & ROM)</h3>
                <p className="text-xs text-white/60">Evolución sesión a sesión registrada por el equipo de kinesiología</p>
              </div>

              <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
                <button
                  onClick={() => setActiveKineChart('pain')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeKineChart === 'pain' ? 'bg-[#00E676] text-[#021826]' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Dolor (Escala EVA 1-10)
                </button>
                <button
                  onClick={() => setActiveKineChart('rom')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeKineChart === 'rom' ? 'bg-[#00E676] text-[#021826]' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Movilidad Articular (ROM °)
                </button>
              </div>
            </div>

            <label className="block text-sm text-white/60">
              Zona evaluada:
              <select
                aria-label="Zona evaluada"
                value={selectedArea || ''}
                onChange={e => setArea(e.target.value)}
                className="ml-2 bg-[#010A01] rounded-lg border border-white/10 p-2 text-white"
              >
                {[...new Set(history.map(e => e.jointOrArea))].map(a => <option key={a}>{a}</option>)}
              </select>
            </label>

            {!records.length && <p className="text-sm text-white/60">Aún no hay evaluaciones registradas para esta zona.</p>}

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {activeKineChart === 'pain' ? (
                  <AreaChart data={clinicalProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00E676" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00E676" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="date" stroke="#ffffff60" fontSize={12} />
                    <YAxis domain={[0, 10]} stroke="#ffffff60" fontSize={12} />
                    <Tooltip
                      cursor={{ stroke: 'rgba(0, 230, 118, 0.3)' }}
                      contentStyle={{ backgroundColor: '#0b1726', borderColor: 'rgba(0, 230, 118, 0.4)', borderRadius: '0.75rem', color: '#fff' }}
                      formatter={(value: any) => [`${value} / 10`, 'Nivel de Dolor (EVA)']}
                      labelFormatter={(label) => `Fecha: ${label}`}
                    />
                    <Area type="monotone" dataKey="evaPain" stroke="#00E676" strokeWidth={3} fillOpacity={1} fill="url(#painGradient)" />
                  </AreaChart>
                ) : (
                  <AreaChart data={clinicalProgressData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="romGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00E676" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00E676" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="date" stroke="#ffffff60" fontSize={12} />
                    <YAxis domain={['auto', 'auto']} stroke="#ffffff60" fontSize={12} />
                    <Tooltip
                      cursor={{ stroke: 'rgba(0, 230, 118, 0.3)' }}
                      contentStyle={{ backgroundColor: '#0b1726', borderColor: 'rgba(0, 230, 118, 0.4)', borderRadius: '0.75rem', color: '#fff' }}
                      formatter={(value: any) => [`${value}°`, 'Movilidad Articular (ROM)']}
                      labelFormatter={(label) => `Fecha: ${label}`}
                    />
                    <Area type="monotone" dataKey="romDegrees" stroke="#00E676" strokeWidth={3} fillOpacity={1} fill="url(#romGradient)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO 3: HISTORIAL DE SESIONES */}
      {activeMainTab === 'history' && (
        <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-lg">Historial de Asistencias a Clases y Boxes</h3>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <h4 className="font-bold text-white text-sm">{session.name}</h4>
                    <p className="text-xs text-white/60">{session.type} · {session.instructor}</p>
                  </div>
                  <span className="text-xs text-[#00E676] font-semibold bg-[#00E676]/10 border border-[#00E676]/20 px-2.5 py-1 rounded-lg">
                    {session.duration} min
                  </span>
                </div>
                <p className="text-xs text-white/40">{new Date(session.date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            ))}

            {sessions.length === 0 && (
              <p className="text-xs text-white/40 text-center py-6">No hay asistencias registradas hasta el momento.</p>
            )}
          </div>
        </div>
      )}

      {member && (
        <>
          <CarePanel memberId={member.id} section="routine" />
          <CarePanel memberId={member.id} section="messages" author={member.name} />
        </>
      )}
    </div>
  );
}