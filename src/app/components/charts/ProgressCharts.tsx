import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Dumbbell,
  Activity,
  Heart,
  Scale,
  Flame,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  CheckCircle,
  Calendar,
  User,
  Trash2,
  Sparkles,
  Info
} from 'lucide-react';
import {
  ProgressAssessment,
  BASE_EXERCISES_INFO,
  HEALTH_METRICS_INFO,
  ExerciseKey,
  HealthMetricKey,
  calculateBMI,
  addProgressAssessment,
  deleteProgressAssessment
} from '../../data/progressStore';
import { today, formatDate } from '../../data/dates';

interface ProgressChartsProps {
  memberId: string;
  memberName: string;
  assessments: ProgressAssessment[];
  canEdit?: boolean;
  defaultTab?: 'health' | 'exercises';
}

export function ProgressCharts({
  memberId,
  memberName,
  assessments,
  canEdit = true,
  defaultTab = 'health',
}: ProgressChartsProps) {
  const [activeTab, setActiveTab] = useState<'health' | 'exercises'>(defaultTab);
  const [selectedHealthKey, setSelectedHealthKey] = useState<HealthMetricKey>('weight');
  const [selectedExerciseKey, setSelectedExerciseKey] = useState<ExerciseKey>('squat');
  const [exerciseCategoryFilter, setExerciseCategoryFilter] = useState<'all' | 'Tren Inferior' | 'Tren Superior' | 'Core & Estabilidad' | 'Cadena Posterior'>('all');

  // New assessment modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formDate, setFormDate] = useState(today());
  const [formEvaluator, setFormEvaluator] = useState('Prof. Carlos Rivera');
  const [formHeight, setFormHeight] = useState(175);
  const [formWeight, setFormWeight] = useState(80);
  const [formBodyFat, setFormBodyFat] = useState(20);
  const [formBmr, setFormBmr] = useState(1800);
  const [formBodyAge, setFormBodyAge] = useState(32);

  // 10 Exercises Form State
  const [formSquat, setFormSquat] = useState(70);
  const [formBenchPress, setFormBenchPress] = useState(60);
  const [formLatPulldown, setFormLatPulldown] = useState(55);
  const [formPlank, setFormPlank] = useState(60);
  const [formLunges, setFormLunges] = useState(30);
  const [formBarHang, setFormBarHang] = useState(45);
  const [formDips, setFormDips] = useState(8);
  const [formPushups, setFormPushups] = useState(22);
  const [formCrunch, setFormCrunch] = useState(35);
  const [formDeadlift, setFormDeadlift] = useState(85);
  const [formNotes, setFormNotes] = useState('');

  const sortedAssessments = useMemo(() => {
    return [...assessments].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }, [assessments]);

  const latest = sortedAssessments[sortedAssessments.length - 1];
  const first = sortedAssessments[0];

  // Prepared data for Health Chart
  const healthChartData = useMemo(() => {
    return sortedAssessments.map((a, i) => ({
      date: formatDate(a.date),
      fullDate: a.date,
      session: `Test ${i + 1}`,
      weight: a.health.weight,
      bmi: a.health.bmi,
      bodyFat: a.health.bodyFat,
      bmr: a.health.bmr,
      bodyAge: a.health.bodyAge,
    }));
  }, [sortedAssessments]);

  // Prepared data for Exercises Chart
  const exerciseChartData = useMemo(() => {
    return sortedAssessments.map((a, i) => ({
      date: formatDate(a.date),
      fullDate: a.date,
      session: `Test ${i + 1}`,
      squat: a.exercises.squat,
      benchPress: a.exercises.benchPress,
      latPulldown: a.exercises.latPulldown,
      plank: a.exercises.plank,
      lunges: a.exercises.lunges,
      barHang: a.exercises.barHang,
      dips: a.exercises.dips,
      pushups: a.exercises.pushups,
      crunch: a.exercises.crunch,
      deadlift: a.exercises.deadlift,
    }));
  }, [sortedAssessments]);

  const selectedExerciseMeta = BASE_EXERCISES_INFO.find((e) => e.key === selectedExerciseKey) || BASE_EXERCISES_INFO[0];
  const selectedHealthMeta = HEALTH_METRICS_INFO.find((h) => h.key === selectedHealthKey) || HEALTH_METRICS_INFO[0];

  const filteredExercisesList = useMemo(() => {
    if (exerciseCategoryFilter === 'all') return BASE_EXERCISES_INFO;
    return BASE_EXERCISES_INFO.filter((e) => e.category === exerciseCategoryFilter);
  }, [exerciseCategoryFilter]);

  // Calculate Delta for selected metric
  const getMetricDelta = (currentVal: number | undefined, firstVal: number | undefined) => {
    if (currentVal === undefined || firstVal === undefined) return null;
    const diff = Number((currentVal - firstVal).toFixed(1));
    return diff;
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const computedBmi = calculateBMI(formWeight, formHeight);

    addProgressAssessment(
      {
        memberId,
        date: formDate,
        evaluator: formEvaluator,
        health: {
          weight: formWeight,
          heightCm: formHeight,
          bmi: computedBmi,
          bodyFat: formBodyFat,
          bmr: formBmr,
          bodyAge: formBodyAge,
        },
        exercises: {
          squat: formSquat,
          benchPress: formBenchPress,
          latPulldown: formLatPulldown,
          plank: formPlank,
          lunges: formLunges,
          barHang: formBarHang,
          dips: formDips,
          pushups: formPushups,
          crunch: formCrunch,
          deadlift: formDeadlift,
        },
        notes: formNotes,
      },
      memberName
    );

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar este registro de evaluación física?')) {
      deleteProgressAssessment(id);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Top Controls: Switch between Health Metrics and 10 Base Exercises */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('health')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'health'
                ? 'bg-[#00E676] text-[#021826] shadow-lg shadow-[#00E676]/20'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>5 Métricas de Salud</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exercises')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'exercises'
                ? 'bg-[#00E676] text-[#021826] shadow-lg shadow-[#00E676]/20'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>10 Ejercicios Base Medibles</span>
          </button>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#00E676] text-[#021826] text-xs font-extrabold hover:bg-[#00E676]/90 transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Registrar Nuevo Test Físico</span>
          </button>
        )}
      </div>

      {sortedAssessments.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
          <Activity className="w-10 h-10 text-white/30 mx-auto" />
          <h3 className="font-bold text-base text-white">Sin Evaluaciones Registradas</h3>
          <p className="text-xs text-white/50 max-w-md mx-auto">
            Aún no se han registrado tests de los 10 ejercicios base ni métricas de bioimpedancia para este alumno.
          </p>
          {canEdit && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#00E676] text-[#021826] text-xs font-bold"
            >
              Registrar Primer Test
            </button>
          )}
        </div>
      ) : activeTab === 'health' ? (
        /* ================= VISTA 5 MÉTRICAS DE SALUD ================= */
        <div className="space-y-6">
          {/* Quick KPI Cards for the 5 Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {HEALTH_METRICS_INFO.map((metric) => {
              const currentVal = latest ? (latest.health as any)[metric.key] : undefined;
              const firstVal = first ? (first.health as any)[metric.key] : undefined;
              const delta = getMetricDelta(currentVal, firstVal);
              const isSelected = selectedHealthKey === metric.key;

              return (
                <div
                  key={metric.key}
                  onClick={() => setSelectedHealthKey(metric.key)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#00E676]/15 border-[#00E676] shadow-lg shadow-[#00E676]/10 scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:border-white/25'
                  }`}
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/60 block truncate mb-1">
                      {metric.label}
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-white">
                      {currentVal ?? '—'} <span className="text-xs font-normal text-white/50">{metric.unit}</span>
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    {delta !== null ? (
                      <span
                        className={`flex items-center gap-0.5 font-bold ${
                          delta > 0
                            ? metric.key === 'bmr'
                              ? 'text-emerald-400'
                              : 'text-amber-300'
                            : delta < 0
                            ? metric.key === 'weight' || metric.key === 'bodyFat' || metric.key === 'bodyAge'
                              ? 'text-emerald-400'
                              : 'text-sky-300'
                            : 'text-white/60'
                        }`}
                      >
                        {delta > 0 ? `+${delta}` : delta} {metric.unit}
                      </span>
                    ) : (
                      <span className="text-white/40">Inicial</span>
                    )}
                    <span className="text-[10px] text-white/40">{sortedAssessments.length} tests</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráfico Principal de Salud con Área Degradada */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00E676] px-2 py-0.5 rounded bg-[#00E676]/15 border border-[#00E676]/30">
                    Curva Evolutiva
                  </span>
                  <h3 className="font-bold text-lg text-white">
                    {selectedHealthMeta.label} ({selectedHealthMeta.unit})
                  </h3>
                </div>
                <p className="text-xs text-white/60 mt-1">{selectedHealthMeta.target} · Ref: {selectedHealthMeta.referenceNormal}</p>
              </div>

              {/* Selector de métrica activa para graficar */}
              <div className="flex flex-wrap gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                {HEALTH_METRICS_INFO.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setSelectedHealthKey(m.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedHealthKey === m.key
                        ? 'bg-[#00E676] text-[#021826]'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {m.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthChartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E676" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#00E676" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#ffffff60" fontSize={11} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#ffffff60" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#071626',
                      borderColor: 'rgba(0, 230, 118, 0.4)',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} ${selectedHealthMeta.unit}`, selectedHealthMeta.label]}
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey={selectedHealthKey}
                    stroke="#00E676"
                    strokeWidth={3}
                    dot={{ fill: '#00E676', r: 4, strokeWidth: 2, stroke: '#021826' }}
                    activeDot={{ r: 6, fill: '#00E676' }}
                    fillOpacity={1}
                    fill="url(#healthGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* ================= VISTA 10 EJERCICIOS BASE MEDIBLES ================= */
        <div className="space-y-6">
          {/* Category Filter Chips for the 10 Exercises */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10">
            <span className="text-xs text-white/50 px-2 font-semibold hidden sm:inline">Categoría:</span>
            {(['all', 'Tren Inferior', 'Tren Superior', 'Core & Estabilidad', 'Cadena Posterior'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setExerciseCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  exerciseCategoryFilter === cat
                    ? 'bg-[#00E676] text-[#021826]'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat === 'all' ? 'Todos los 10 Ejercicios' : cat}
              </button>
            ))}
          </div>

          {/* Grid of the 10 Exercise Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {filteredExercisesList.map((exercise) => {
              const currentVal = latest ? latest.exercises[exercise.key] : undefined;
              const firstVal = first ? first.exercises[exercise.key] : undefined;
              const delta = getMetricDelta(currentVal, firstVal);
              const isSelected = selectedExerciseKey === exercise.key;

              return (
                <div
                  key={exercise.key}
                  onClick={() => setSelectedExerciseKey(exercise.key)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#00E676]/15 border-[#00E676] shadow-lg shadow-[#00E676]/10 scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:border-white/25'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] uppercase font-bold text-[#00E676] tracking-wider truncate">
                        {exercise.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-white leading-tight truncate mb-1">
                      {exercise.label}
                    </h4>
                    <p className="text-xl sm:text-2xl font-black text-white">
                      {currentVal ?? '—'} <span className="text-xs font-normal text-white/50">{exercise.unit}</span>
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    {delta !== null ? (
                      <span
                        className={`flex items-center gap-0.5 font-bold ${
                          delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-white/60'
                        }`}
                      >
                        {delta > 0 ? `+${delta}` : delta} {exercise.unit}
                      </span>
                    ) : (
                      <span className="text-white/40">Inicial</span>
                    )}
                    <span className="text-[10px] text-white/40">Ver curva →</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráfico de Ejercicio Seleccionado */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00E676] px-2 py-0.5 rounded bg-[#00E676]/15 border border-[#00E676]/30">
                    {selectedExerciseMeta.category}
                  </span>
                  <h3 className="font-bold text-lg text-white">
                    Progreso: {selectedExerciseMeta.label} ({selectedExerciseMeta.unit})
                  </h3>
                </div>
                <p className="text-xs text-white/60 mt-1">{selectedExerciseMeta.target}</p>
              </div>

              {/* Selector directo de ejercicio para graficar */}
              <select
                value={selectedExerciseKey}
                onChange={(e) => setSelectedExerciseKey(e.target.value as ExerciseKey)}
                className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#00E676]"
              >
                {BASE_EXERCISES_INFO.map((ex) => (
                  <option key={ex.key} value={ex.key}>
                    {ex.label} ({ex.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exerciseChartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#ffffff60" fontSize={11} />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="#ffffff60" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#071626',
                      borderColor: 'rgba(0, 230, 118, 0.4)',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} ${selectedExerciseMeta.unit}`, selectedExerciseMeta.label]}
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey={selectedExerciseKey}
                    stroke="#00E676"
                    strokeWidth={3}
                    dot={{ fill: '#00E676', r: 5, strokeWidth: 2, stroke: '#021826' }}
                    activeDot={{ r: 7, fill: '#00E676' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Historial Cronológico de Tests con Botón para Eliminar si tiene permisos */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
        <h4 className="font-bold text-sm text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#00E676]" />
          <span>Historial de Registros de Evaluación Física ({sortedAssessments.length})</span>
        </h4>

        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {sortedAssessments.map((a) => (
            <div
              key={a.id}
              className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{formatDate(a.date)}</span>
                  <span className="text-[11px] text-white/50">por {a.evaluator}</span>
                </div>
                <div className="text-[11px] text-white/70 mt-1 flex flex-wrap gap-2">
                  <span>Peso: <strong>{a.health.weight} kg</strong></span>
                  <span>IMC: <strong>{a.health.bmi}</strong></span>
                  <span>%Grasa: <strong>{a.health.bodyFat}%</strong></span>
                  <span>Sentadilla: <strong>{a.exercises.squat} kg</strong></span>
                  <span>Press Banca: <strong>{a.exercises.benchPress} kg</strong></span>
                  <span>Plancha: <strong>{a.exercises.plank} s</strong></span>
                </div>
                {a.notes && <p className="text-[11px] text-[#00E676]/90 mt-1">"{a.notes}"</p>}
              </div>

              {canEdit && (
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  title="Eliminar este test"
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors self-end sm:self-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal para Registrar Nuevo Test Físico & Métricas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveAssessment}
            className="bg-[#0b1726] border border-[#00E676]/50 rounded-2xl p-5 sm:p-6 w-full max-w-2xl space-y-4 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-[#00E676] tracking-wider">
                  Test Físico & Control Antropométrico
                </span>
                <h3 className="text-xl font-bold mt-0.5">Ingresar Nuevas Métricas ({memberName})</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/50 hover:text-white text-sm bg-white/5 p-2 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Metadatos: Fecha y Evaluador */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="text-white/70">
                Fecha de la Medición
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-[#00E676]"
                />
              </label>

              <label className="text-white/70">
                Profesional Evaluador
                <input
                  type="text"
                  required
                  value={formEvaluator}
                  onChange={(e) => setFormEvaluator(e.target.value)}
                  placeholder="Kinesiólogo o Entrenador"
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-[#00E676]"
                />
              </label>
            </div>

            {/* SECCIÓN 1: 5 MÉTRICAS DE SALUD */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="font-bold text-xs uppercase text-[#00E676] tracking-wider flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                <span>5 Métricas de Salud (Bioimpedancia)</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <label className="text-white/70">
                  Estatura (cm)
                  <input
                    type="number"
                    value={formHeight}
                    onChange={(e) => setFormHeight(Number(e.target.value))}
                    className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-[#00E676]"
                  />
                </label>

                <label className="text-white/70">
                  Peso (kg) *
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-[#00E676]"
                  />
                </label>

                <label className="text-white/70">
                  IMC (Calculado)
                  <input
                    type="text"
                    disabled
                    value={calculateBMI(formWeight, formHeight)}
                    className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/60 px-3 text-[#00E676] font-bold outline-none"
                  />
                </label>

                <label className="text-white/70">
                  % Grasa Corporal
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formBodyFat}
                    onChange={(e) => setFormBodyFat(Number(e.target.value))}
                    className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-[#00E676]"
                  />
                </label>

                <label className="text-white/70">
                  TMB / BMR (kcal)
                  <input
                    type="number"
                    required
                    value={formBmr}
                    onChange={(e) => setFormBmr(Number(e.target.value))}
                    className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-[#00E676]"
                  />
                </label>

                <label className="text-white/70">
                  Edad Corporal (años)
                  <input
                    type="number"
                    required
                    value={formBodyAge}
                    onChange={(e) => setFormBodyAge(Number(e.target.value))}
                    className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-[#00E676]"
                  />
                </label>
              </div>
            </div>

            {/* SECCIÓN 2: 10 EJERCICIOS BASE MEDIBLES */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="font-bold text-xs uppercase text-[#00E676] tracking-wider flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>10 Ejercicios Base Medibles</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                <label className="text-white/70">
                  Sentadilla (kg)
                  <input
                    type="number"
                    value={formSquat}
                    onChange={(e) => setFormSquat(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 text-white outline-none focus:border-[#00E676]"
                  />
                </label>

                <label className="text-white/70">
                  Press Banca (kg)
                  <input
                    type="number"
                    value={formBenchPress}
                    onChange={(e) => setFormBenchPress(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 text-white outline-none focus:border-[#00E676]"
                  />
                </label>

                <label className="text-white/70">
                  Jalón Dorsal (kg)
                  <input
                    type="number"
                    value={formLatPulldown}
                    onChange={(e) => setFormLatPulldown(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 text-white outline-none focus:border-[#00E676]"
                  />
                </label>

                <label className="text-white/70">
                  Plancha (seg)
                  <input
                    type="number"
                    value={formPlank}
                    onChange={(e) => setFormPlank(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 text-white outline-none focus:border-[#00E676]"
                  />
                </label>

                <label className="text-white/70">
                  Estocadas (kg)
                  <input
                    type="number"
                    value={formLunges}
                    onChange={(e) => setFormLunges(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 text-white outline-none focus:border-[#00E676]"
                  />
                </label>

                <label className="text-white/70">
                  Suspensión (seg)
                  <input
                    type="number"
                    value={formBarHang}
                    onChange={(e) => setFormBarHang(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 text-white outline-none focus:border-[#00E676]"
                  />
                </label>

                <label className="text-white/70">
                  Paralelas/Dips (reps)
                  <input
                    type="number"
                    value={formDips}
                    onChange={(e) => setFormDips(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 text-white outline-none focus:border-[#00E676]"
                  />
                </label>

                <label className="text-white/70">
                  Flexiones Suelo (reps)
                  <input
                    type="number"
                    value={formPushups}
                    onChange={(e) => setFormPushups(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 text-white outline-none focus:border-[#00E676]"
                  />
                </label>

                <label className="text-white/70">
                  Crunch (reps)
                  <input
                    type="number"
                    value={formCrunch}
                    onChange={(e) => setFormCrunch(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 text-white outline-none focus:border-[#00E676]"
                  />
                </label>

                <label className="text-white/70">
                  Peso Muerto (kg)
                  <input
                    type="number"
                    value={formDeadlift}
                    onChange={(e) => setFormDeadlift(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 text-white outline-none focus:border-[#00E676]"
                  />
                </label>
              </div>
            </div>

            <label className="text-xs text-white/70 block">
              Observaciones / Conclusiones del Test
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Observaciones de técnica, rangos o progresión..."
                rows={2}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-white outline-none focus:border-[#00E676]"
              />
            </label>

            <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#00E676] text-[#021826] text-xs font-extrabold hover:bg-[#00E676]/90 shadow-lg shadow-[#00E676]/20"
              >
                Guardar y Graficar Automáticamente
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
