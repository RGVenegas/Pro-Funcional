import React, { useEffect, useState } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, Ban, RefreshCw, Flame, Dumbbell, Check, Activity, AlertTriangle, Stethoscope, ChevronDown, PlusCircle } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { addActivity, addClinicalEvaluation, ClinicalEvaluation, getMemberById, getMembers, GymMember, subscribeToMembers, updateMember } from '../../data/gymStore';

interface MemberDetailProps {
  memberId: string;
  onBack: () => void;
}

type Tab = 'info' | 'clinical' | 'balance' | 'subscriptions' | 'notes';

export function MemberDetail({ memberId, onBack }: MemberDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('clinical');
  const [member, setMember] = useState<GymMember>(() => getMemberById(memberId) ?? getMembers()[0]);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<Array<{ date: string; author: string; text: string }>>([
    { date: '10 Ene, 2025', author: 'Administrador', text: 'El miembro solicitó extensión de horario por motivos laborales.' },
  ]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showSoapForm, setShowSoapForm] = useState(false);

  // Form state for new clinical evaluation
  const [evaPain, setEvaPain] = useState<number>(4);
  const [romDegrees, setRomDegrees] = useState<number>(110);
  const [jointOrArea, setJointOrArea] = useState<string>('Rodilla derecha');
  const [soapS, setSoapS] = useState<string>('');
  const [soapO, setSoapO] = useState<string>('');
  const [soapA, setSoapA] = useState<string>('');
  const [soapP, setSoapP] = useState<string>('');
  const [physicalRestrictions, setPhysicalRestrictions] = useState<string>(member.physicalRestrictions || '');

  useEffect(() => {
    const unsub = subscribeToMembers(() => {
      const updated = getMemberById(memberId);
      if (updated) {
        setMember(updated);
        setPhysicalRestrictions(updated.physicalRestrictions || '');
      }
    });
    return unsub;
  }, [memberId]);

  const formatCLP = (amount: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);

  const planPrices: Record<string, number> = { Basic: 45000, Standard: 85000, Premium: 120000 };
  const currentPlanPrice = planPrices[member.plan] ?? 85000;

  const attendance = ['2025-01-22', '2025-01-21', '2025-01-20', '2025-01-18', '2025-01-17'];
  const streak = 3;

  const payments = [
    { date: '2025-01-15', amount: currentPlanPrice, status: 'Completado', method: 'Tarjeta de Débito/Crédito' },
    { date: '2024-12-15', amount: currentPlanPrice, status: 'Completado', method: 'Transferencia' },
  ];

  const subscriptions = [
    { plan: member.packName || `Pack ${member.plan}`, startDate: member.joinDate, endDate: member.nextBilling || '2025-02-15', status: member.status },
  ];

  const tabs: Array<{ id: Tab; label: string; icon?: any }> = [
    { id: 'clinical', label: 'Ficha Kinésica (SOAP & EVA)', icon: Stethoscope },
    { id: 'info', label: 'Información personal' },
    { id: 'balance', label: 'Saldo de cuenta' },
    { id: 'subscriptions', label: 'Paquetes y Planes' },
    { id: 'notes', label: 'Notas privadas' },
  ];

  const showFeedback = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleRenew = () => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    const total = member.totalSessions || 8;
    const updated = updateMember(member.id, {
      status: 'active',
      remainingSessions: total,
      nextBilling: nextDate.toISOString().slice(0, 10),
    });
    if (updated) {
      setMember(updated);
      addActivity({ name: member.name, action: `renovó ${member.packName || 'su paquete de sesiones'}` });
      showFeedback(`Paquete renovado con éxito (${total} sesiones acreditadas).`);
    }
  };

  const handleSuspend = () => {
    const newStatus = member.status === 'suspended' ? 'active' : 'suspended';
    const updated = updateMember(member.id, { status: newStatus });
    if (updated) {
      setMember(updated);
      addActivity({ name: member.name, action: `${newStatus === 'suspended' ? 'fue suspendido' : 'fue reactivado'}` });
      showFeedback(`Estado actualizado a ${newStatus === 'suspended' ? 'Suspendido' : 'Activo'}.`);
    }
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soapS && !soapO && !soapA && !soapP) {
      showFeedback('Por favor ingresa al menos una sección de la nota SOAP.');
      return;
    }

    const newEval = addClinicalEvaluation(member.id, {
      date: new Date().toISOString().slice(0, 10),
      professional: 'Klgo. Andrés Morales',
      evaPain,
      romDegrees,
      jointOrArea,
      soap: {
        subjective: soapS || 'Sin observaciones subjetivas reportadas.',
        objective: soapO || `ROM articular evaluado en ${romDegrees}°.`,
        assessment: soapA || 'Evolución clínica dentro de los parámetros esperados.',
        plan: soapP || 'Continuar pauta de kinesiología y readaptación funcional.',
      },
      physicalRestrictions: physicalRestrictions.trim() || undefined,
    });

    if (newEval) {
      setShowSoapForm(false);
      setSoapS('');
      setSoapO('');
      setSoapA('');
      setSoapP('');
      showFeedback('Ficha clínica SOAP y evaluación guardada con éxito.');
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    const newNote = {
      date: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }),
      author: 'Administrador',
      text: noteText.trim(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setNoteText('');
    showFeedback('Nota guardada correctamente.');
  };

  const getEvaColor = (score: number) => {
    if (score <= 3) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (score <= 6) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            aria-label="Volver a la lista de pacientes"
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#F7F7F7]">Ficha de Paciente / Alumno</h1>
            <p className="text-white/60">Historial clínico kinésico y control de sesiones</p>
          </div>
        </div>

        <button
          onClick={() => { setActiveTab('clinical'); setShowSoapForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#09C82C] text-[#010A01] font-bold hover:bg-[#09C82C]/90 transition-transform hover:scale-105"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Nueva Atención SOAP</span>
        </button>
      </div>

      {actionMessage && (
        <div className="rounded-xl border border-[#09C82C]/40 bg-[#09C82C]/15 p-4 text-[#09C82C] flex items-center gap-2">
          <Check className="h-5 w-5" />
          <span className="text-sm font-medium">{actionMessage}</span>
        </div>
      )}

      {/* Alerta de Restricción Física */}
      {member.physicalRestrictions && member.physicalRestrictions !== 'Sin restricciones reportadas' && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-start gap-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Alerta de Restricción Física para Entrenadores</p>
            <p className="text-sm font-medium text-white/90 mt-0.5">{member.physicalRestrictions}</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#09C82C]/30 bg-[#09C82C]/10 p-5">
          <div className="mb-2 flex items-center justify-between text-[#09C82C]">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo de Sesiones</span>
            <Activity className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold text-[#F7F7F7]">{member.remainingSessions ?? 5} / {member.totalSessions ?? 8}</p>
          <p className="mt-1 text-xs text-white/60">sesiones disponibles de {member.packName || 'su paquete'}</p>
          <div className="mt-3 w-full bg-black/30 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#09C82C] h-full rounded-full transition-all"
              style={{ width: `${((member.remainingSessions ?? 5) / (member.totalSessions ?? 8)) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="mb-2 flex items-center justify-between text-white/70">
            <span className="text-xs font-bold uppercase tracking-wider">Última Escala EVA</span>
            <Stethoscope className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-[#F7F7F7]">
            {member.clinicalHistory && member.clinicalHistory[0] ? `${member.clinicalHistory[0].evaPain} / 10` : 'Sin registro'}
          </p>
          <p className="mt-1 text-xs text-white/55">
            {member.clinicalHistory && member.clinicalHistory[0] ? `Zona: ${member.clinicalHistory[0].jointOrArea}` : 'Evaluación pendiente'}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="mb-2 flex items-center justify-between text-white/70">
            <span className="text-xs font-bold uppercase tracking-wider">Movilidad Articular (ROM)</span>
            <Flame className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-[#F7F7F7]">
            {member.clinicalHistory && member.clinicalHistory[0] ? `${member.clinicalHistory[0].romDegrees}°` : '120°'}
          </p>
          <p className="mt-1 text-xs text-white/55">Rango de movimiento actual</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#09C82C]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl text-[#09C82C] font-semibold">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-[#F7F7F7]">{member.name}</h2>
              <StatusBadge status={member.status} />
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-[#09C82C] font-medium border border-white/10">
                {member.packName || `Pack ${member.plan}`}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-white/60">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{member.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{member.phone || '+56 9 8765 4321'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRenew}
              className="px-4 py-2 bg-[#09C82C] text-[#010A01] font-semibold hover:bg-[#09C82C]/90 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Acreditar / Renovar Pack</span>
            </button>
            <button
              onClick={handleSuspend}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                member.status === 'suspended'
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
              }`}
            >
              <Ban className="w-4 h-4" />
              <span>{member.status === 'suspended' ? 'Reactivar' : 'Suspender'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-[#09C82C] border-b-2 border-[#09C82C] bg-white/[0.02]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* TAB 1: FICHA KINÉSICA (SOAP & EVA & ROM) */}
          {activeTab === 'clinical' && (
            <div className="space-y-6">
              {showSoapForm ? (
                <form onSubmit={handleSaveEvaluation} className="rounded-xl border border-[#09C82C]/40 bg-[#09C82C]/5 p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-[#09C82C]" />
                        Nueva Evaluación Kinésica y Nota SOAP
                      </h3>
                      <p className="text-xs text-white/60 mt-1">Registra la evolución del paciente, dolor en escala EVA y movilidad ROM</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSoapForm(false)}
                      className="text-sm text-white/50 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>

                  {/* Parámetros Cuantitativos: Zona, EVA, ROM */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="text-xs font-semibold uppercase text-white/70 block mb-2">Zona / Articulación Evaluada</label>
                      <input
                        type="text"
                        value={jointOrArea}
                        onChange={(e) => setJointOrArea(e.target.value)}
                        placeholder="Ej: Rodilla derecha (LCA), Hombro, Columna"
                        className="w-full h-11 px-3 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-[#09C82C] outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold uppercase text-white/70">Escala de Dolor (EVA 1-10)</label>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getEvaColor(evaPain)}`}>
                          {evaPain}/10 {evaPain <= 3 ? '(Leve)' : evaPain <= 6 ? '(Moderado)' : '(Severo)'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={evaPain}
                        onChange={(e) => setEvaPain(Number(e.target.value))}
                        className="w-full accent-[#09C82C] cursor-pointer mt-2"
                      />
                      <div className="flex justify-between text-[10px] text-white/40 mt-1 font-mono">
                        <span>1 (Sin dolor)</span>
                        <span>5 (Moderado)</span>
                        <span>10 (Máximo)</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase text-white/70 block mb-2">Rango de Movilidad (ROM °)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={180}
                          value={romDegrees}
                          onChange={(e) => setRomDegrees(Number(e.target.value))}
                          placeholder="Ej: 110"
                          className="w-full h-11 px-3 pr-8 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-[#09C82C] outline-none font-bold"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 font-bold">°</span>
                      </div>
                    </div>
                  </div>

                  {/* Notas SOAP */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#09C82C] flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded-full bg-[#09C82C]/20 text-[#09C82C] flex items-center justify-center text-[10px]">S</span>
                        Subjetivo (Lo que el paciente refiere)
                      </label>
                      <textarea
                        rows={2}
                        value={soapS}
                        onChange={(e) => setSoapS(e.target.value)}
                        placeholder="Dolor al apoyar, sensación de inestabilidad, molestias matutinas..."
                        className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs placeholder:text-white/30 focus:border-[#09C82C] outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#09C82C] flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded-full bg-[#09C82C]/20 text-[#09C82C] flex items-center justify-center text-[10px]">O</span>
                        Objetivo (Hallazgos del kinesiólogo, palpación, pruebas)
                      </label>
                      <textarea
                        rows={2}
                        value={soapO}
                        onChange={(e) => setSoapO(e.target.value)}
                        placeholder="Edema leve, test ortopédicos, fuerza muscular 4/5..."
                        className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs placeholder:text-white/30 focus:border-[#09C82C] outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#09C82C] flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded-full bg-[#09C82C]/20 text-[#09C82C] flex items-center justify-center text-[10px]">A</span>
                        Análisis / Evaluación (Diagnóstico kinésico y progreso)
                      </label>
                      <textarea
                        rows={2}
                        value={soapA}
                        onChange={(e) => setSoapA(e.target.value)}
                        placeholder="Fase proliferativa, respuesta positiva a la carga excéntrica..."
                        className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs placeholder:text-white/30 focus:border-[#09C82C] outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#09C82C] flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded-full bg-[#09C82C]/20 text-[#09C82C] flex items-center justify-center text-[10px]">P</span>
                        Plan Terapéutico (Tratamiento aplicado y tareas)
                      </label>
                      <textarea
                        rows={2}
                        value={soapP}
                        onChange={(e) => setSoapP(e.target.value)}
                        placeholder="Terapia manual, descarga, ejercicios de control motor, 3 series x 10 rep..."
                        className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs placeholder:text-white/30 focus:border-[#09C82C] outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Alerta para entrenadores */}
                  <div className="pt-2">
                    <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Restricción Física para el Gimnasio (Visible para Entrenadores)
                    </label>
                    <input
                      type="text"
                      value={physicalRestrictions}
                      onChange={(e) => setPhysicalRestrictions(e.target.value)}
                      placeholder="Ej: Evitar sentadilla profunda >90° / No realizar saltos de impacto"
                      className="w-full h-11 px-3 bg-black/40 border border-amber-500/30 rounded-lg text-white text-sm focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSoapForm(false)}
                      className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-[#09C82C] text-[#010A01] text-sm font-bold hover:bg-[#09C82C]/90"
                    >
                      Guardar en Ficha Clínica
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between bg-white/[0.02] border border-white/10 rounded-xl p-4">
                  <div>
                    <h3 className="font-semibold text-white">Historial de Evaluaciones Clínicas</h3>
                    <p className="text-xs text-white/50">Registro evolutivo con escalas EVA, ROM y notas SOAP</p>
                  </div>
                  <button
                    onClick={() => setShowSoapForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#09C82C] text-[#010A01] rounded-lg font-bold text-sm hover:bg-[#09C82C]/90 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Nueva Atención
                  </button>
                </div>
              )}

              {/* Lista de Evaluaciones Previas */}
              <div className="space-y-4">
                {member.clinicalHistory && member.clinicalHistory.length > 0 ? (
                  member.clinicalHistory.map((evalItem, index) => (
                    <div key={evalItem.id || index} className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4 hover:border-white/20 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-[#09C82C]/20 border border-[#09C82C]/30 flex items-center justify-center text-[#09C82C] font-bold">
                            #{member.clinicalHistory!.length - index}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-base">{evalItem.jointOrArea}</h4>
                            <p className="text-xs text-white/50">{evalItem.date} · {evalItem.professional}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getEvaColor(evalItem.evaPain)}`}>
                            EVA: {evalItem.evaPain}/10
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold border border-white/15 bg-white/10 text-white">
                            ROM: {evalItem.romDegrees}°
                          </span>
                        </div>
                      </div>

                      {/* SOAP Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                          <span className="font-bold text-[#09C82C] block mb-1">S (Subjetivo):</span>
                          <p className="text-white/80">{evalItem.soap.subjective}</p>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                          <span className="font-bold text-[#09C82C] block mb-1">O (Objetivo):</span>
                          <p className="text-white/80">{evalItem.soap.objective}</p>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                          <span className="font-bold text-[#09C82C] block mb-1">A (Evaluación):</span>
                          <p className="text-white/80">{evalItem.soap.assessment}</p>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                          <span className="font-bold text-[#09C82C] block mb-1">P (Plan Terapéutico):</span>
                          <p className="text-white/80">{evalItem.soap.plan}</p>
                        </div>
                      </div>

                      {evalItem.physicalRestrictions && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-xs text-amber-300 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span><strong>Restricción activa:</strong> {evalItem.physicalRestrictions}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-white/[0.02] rounded-xl border border-white/10 text-white/50">
                    <Stethoscope className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#09C82C]" />
                    <p className="font-medium">No hay evaluaciones kinésicas registradas todavía.</p>
                    <p className="text-xs text-white/40 mt-1">Presiona "Nueva Atención SOAP" para ingresar la primera evaluación.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INFO PERSONAL */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-white/60 mb-1 block">Nombre completo</label>
                <p className="font-medium text-[#F7F7F7]">{member.name}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Correo electrónico</label>
                <p className="font-medium text-[#F7F7F7]">{member.email}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Teléfono</label>
                <p className="font-medium text-[#F7F7F7]">{member.phone || '+56 9 8765 4321'}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Fecha de ingreso</label>
                <p className="font-medium text-[#F7F7F7]">{new Date(member.joinDate).toLocaleDateString('es-CL')}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Paquete Activo</label>
                <p className="font-medium text-[#09C82C]">{member.packName || `Pack ${member.plan}`}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Próximo vencimiento / renovación</label>
                <p className="font-medium text-[#F7F7F7]">{new Date(member.nextBilling || '2025-02-15').toLocaleDateString('es-CL')}</p>
              </div>
            </div>
          )}

          {/* TAB 3: SALDO */}
          {activeTab === 'balance' && (
            <div className="space-y-6">
              <div className="bg-[#09C82C]/10 border border-[#09C82C]/20 rounded-lg p-4">
                <p className="text-sm text-white/60 mb-1">Saldo actual en cuenta</p>
                <p className={`text-3xl font-bold ${member.balance < 0 ? 'text-red-400' : 'text-[#09C82C]'}`}>
                  {formatCLP(Math.abs(member.balance) * 1000)}
                  {member.balance < 0 && ' (Deuda pendiente)'}
                  {member.balance > 0 && ' (Saldo a favor)'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-[#F7F7F7]">Historial de pagos</h3>
                <div className="space-y-3">
                  {payments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div>
                        <p className="font-medium text-[#F7F7F7]">{formatCLP(payment.amount)}</p>
                        <p className="text-sm text-white/60">{payment.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/70">{new Date(payment.date).toLocaleDateString('es-CL')}</p>
                        <span className="text-xs px-2 py-1 bg-[#09C82C]/20 text-[#09C82C] rounded">
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAQUETES Y PLANES */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              {subscriptions.map((sub, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-5 border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg text-white">{sub.plan}</h4>
                      <p className="text-sm text-white/60">
                        {new Date(sub.startDate).toLocaleDateString('es-CL')} - {new Date(sub.endDate).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                    <StatusBadge status={sub.status as any} />
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-white/60">Sesiones restantes: <strong className="text-white">{member.remainingSessions ?? 5}</strong> de {member.totalSessions ?? 8}</span>
                    <button onClick={handleRenew} className="text-[#09C82C] font-semibold hover:underline">Acreditar más sesiones</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: NOTAS PRIVADAS */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleSaveNote} className="space-y-3">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#09C82C] resize-none"
                  placeholder="Escribe notas u observaciones privadas del administrador o recepcionista..."
                />
                <button type="submit" className="px-4 py-2 bg-[#09C82C] text-[#010A01] rounded-lg hover:bg-[#09C82C]/90 transition-colors font-medium">
                  Guardar nota
                </button>
              </form>
              
              <div className="mt-6 space-y-3">
                <h4 className="font-semibold">Notas registradas</h4>
                {notes.map((note, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-sm text-white/60 mb-2">{note.date} - {note.author}</p>
                    <p className="text-sm text-white/90">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}