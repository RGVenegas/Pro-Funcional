import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Phone,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Bot,
  HelpCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  HeartHandshake,
  Smartphone
} from 'lucide-react';
import {
  DEFAULT_TEMPLATES,
  WHATSAPP_INTEGRATION_OPTIONS,
  WhatsAppTemplate,
  getAllWhatsAppLogs,
  saveWhatsAppLog,
  subscribeToWhatsAppLogs,
  formatWhatsAppMessage,
  openWhatsAppDirect,
  WhatsAppLog
} from '../../data/whatsappStore';
import { getMembers, GymMember } from '../../data/gymStore';
import { today, formatDate, calculatePlanCycle } from '../../data/dates';

export function AdminWhatsAppReminders() {
  const [activeTab, setActiveTab] = useState<'send' | 'costs' | 'history'>('send');
  const [members] = useState<GymMember[]>(() => getMembers());
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DEFAULT_TEMPLATES[0].id);

  // Selected member & variables
  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];
  const [customPhone, setCustomPhone] = useState(selectedMember?.phone || '56912345678');
  const [customName, setCustomName] = useState(selectedMember?.name || 'Alumno');

  const selectedTemplate =
    DEFAULT_TEMPLATES.find((t) => t.id === selectedTemplateId) || DEFAULT_TEMPLATES[0];

  const cycle = calculatePlanCycle(selectedMember?.joinDate, selectedMember?.nextBilling);

  // Editable message text
  const [editableMessage, setEditableMessage] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Logs state
  const [logs, setLogs] = useState<WhatsAppLog[]>(() => getAllWhatsAppLogs());

  useEffect(() => {
    const unsub = subscribeToWhatsAppLogs(() => setLogs(getAllWhatsAppLogs()));
    return unsub;
  }, []);

  // Update recipient inputs when member changes
  useEffect(() => {
    if (selectedMember) {
      setCustomName(selectedMember.name);
      setCustomPhone(selectedMember.phone || '56912345678');
    }
  }, [selectedMemberId]);

  // Update editable text whenever template or recipient variables change
  useEffect(() => {
    const formatted = formatWhatsAppMessage(selectedTemplate.template, {
      nombre: customName,
      servicio: selectedMember?.packName?.includes('Kine') ? 'Kinesiología' : 'Entrenamiento Funcional',
      fecha: formatDate(today()),
      hora: '11:00 hrs',
      profesional: 'Klgo. Andrés Morales',
      vencimiento: formatDate(cycle.renewalDate),
      gracia: formatDate(cycle.gracePeriodEndDate),
    });
    setEditableMessage(formatted);
  }, [selectedTemplateId, customName, selectedMember?.packName, cycle.renewalDate, cycle.gracePeriodEndDate]);

  const handleSend = () => {
    if (!customPhone) {
      alert('Por favor ingresa un número de teléfono válido.');
      return;
    }

    // Save log
    saveWhatsAppLog({
      memberId: selectedMember?.id || 'manual',
      memberName: customName,
      phone: customPhone,
      templateTitle: selectedTemplate.title,
      message: editableMessage,
      status: 'sent',
    });

    // Open WhatsApp
    openWhatsAppDirect(customPhone, editableMessage);

    setFeedbackNotice(`Mensaje enviado con éxito al +${customPhone}`);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableMessage);
    setFeedbackNotice('Mensaje copiado al portapapeles');
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] text-xs font-bold uppercase tracking-wider">
              Módulo de Fidelización
            </span>
            <span className="text-xs text-white/50">· Recordatorios Amigables</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Recordatorios Friendly WhatsApp
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Confirmación de clases a 90 min, avisos empáticos de inasistencias y renovación de ciclos con 5 días de gracia.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('send')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'send'
                ? 'bg-[#25D366] text-[#021826] shadow-lg shadow-[#25D366]/20'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Envío Rápido 1-Clic</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('costs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'costs'
                ? 'bg-[#25D366] text-[#021826] shadow-lg shadow-[#25D366]/20'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Costos & Alternativas (? - IA ?)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#25D366] text-[#021826] shadow-lg shadow-[#25D366]/20'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Historial ({logs.length})</span>
          </button>
        </div>
      </div>

      {feedbackNotice && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 p-3.5 text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* ================= TAB 1: ENVÍO RÁPIDO & TEMPLATES FRIENDLY ================= */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Selectors & Templates */}
          <div className="lg:col-span-7 space-y-5">
            {/* Destinatario Selector */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#25D366]" />
                <span>1. Destinatario (Alumno / Paciente)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-white/60 block mb-1">
                    Seleccionar Alumno
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#25D366]"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.plan})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-white/60 block mb-1">
                    Teléfono WhatsApp (con código de país)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      placeholder="Ej: 56912345678"
                      className="w-full h-10 pl-9 pr-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#25D366]"
                    />
                  </div>
                </div>
              </div>

              {selectedMember?.bookingSuspended && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 text-xs text-rose-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-300 block">Alumno con Reservas Suspendidas por Inasistencia</span>
                    <span>Recomendado enviar la plantilla empática de cuidado de cupo para coordinar su reactivación.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Template Selector Cards */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-white/70 block tracking-wider">
                2. Seleccionar Plantilla con Tono "Friendly"
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEFAULT_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#25D366]/15 border-[#25D366] shadow-lg shadow-[#25D366]/10 scale-[1.01]'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase text-[#25D366] px-2 py-0.5 rounded bg-[#25D366]/20 border border-[#25D366]/30">
                            {tpl.badge}
                          </span>
                          <span className="text-[10px] text-white/50">{tpl.tone}</span>
                        </div>
                        <h4 className="font-bold text-xs text-white mt-1 leading-snug">{tpl.title}</h4>
                        <p className="text-[11px] text-white/60 mt-1 line-clamp-2 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                        <span className="text-[#25D366] font-semibold">
                          {isSelected ? '✓ Seleccionada' : 'Seleccionar'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: WhatsApp Live Preview & Direct Action */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#071318] p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-black font-bold text-xs">
                    PF
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Vista Previa WhatsApp</h4>
                    <p className="text-[10px] text-emerald-400">En línea · ProFuncional</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-xs flex items-center gap-1"
                    title="Copiar texto"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Copiar</span>
                  </button>
                </div>
              </div>

              {/* Chat Bubble simulation */}
              <div className="bg-[#0b2027] rounded-2xl p-4 border border-[#25D366]/20 space-y-2 relative">
                <div className="text-xs text-white/90 whitespace-pre-wrap leading-relaxed font-sans">
                  {editableMessage}
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-white/40 pt-1">
                  <span>{new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
                </div>
              </div>

              {/* Text editor */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/60 flex items-center justify-between">
                  <span>Editar Mensaje antes de enviar:</span>
                  <span className="text-[10px] text-white/40">Puedes modificar cualquier palabra</span>
                </label>
                <textarea
                  rows={6}
                  value={editableMessage}
                  onChange={(e) => setEditableMessage(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white outline-none focus:border-[#25D366] leading-relaxed resize-none font-sans"
                />
              </div>

              {/* Action Button: 1-Click WhatsApp */}
              <button
                type="button"
                onClick={handleSend}
                className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 active:scale-98 text-[#021826] font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#25D366]/25 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Abrir en WhatsApp Web / Móvil</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </button>

              <p className="text-[11px] text-center text-white/50">
                Se abrirá WhatsApp directamente con el teléfono <strong>+{customPhone}</strong> y el mensaje pre-cargado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: COSTOS Y ALTERNATIVAS TÉCNICAS (? - IA ?) ================= */}
      {activeTab === 'costs' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Análisis de Costos y Alternativas de Integración WhatsApp (? - ¿IA?)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              En respuesta a la observación del proyecto sobre costos y alternativas para recordatorios de confirmación a 90 minutos y fidelización, presentamos el desglose técnico de las 4 opciones posibles:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WHATSAPP_INTEGRATION_OPTIONS.map((opt, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${opt.badgeColor}`}>
                      {opt.badge}
                    </span>
                    <span className="text-[11px] text-white/50 font-medium">Complejidad: {opt.complexity}</span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-tight">{opt.title}</h3>

                  <div className="grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-xl border border-white/10 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/50 block">Costo Fijo Mensual</span>
                      <strong className="text-white font-bold">{opt.costMonthly}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/50 block">Costo Por Mensaje</span>
                      <strong className="text-[#25D366] font-bold">{opt.costPerMessage}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-emerald-400 block">Ventajas:</span>
                    <ul className="space-y-1 text-white/80 list-disc list-inside text-[11px]">
                      {opt.pros.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-amber-400 block">Consideraciones / Desventajas:</span>
                    <ul className="space-y-1 text-white/70 list-disc list-inside text-[11px]">
                      {opt.cons.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 text-xs bg-white/[0.02] p-3 rounded-xl">
                  <strong className="text-[#25D366] block mb-0.5">Dictamen / Recomendación:</strong>
                  <span className="text-white/80 text-[11px]">{opt.recommendedFor}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Strategic Decision Matrix */}
          <div className="rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 p-5 sm:p-6 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#25D366]" />
              <span>Conclusión y Hoja de Ruta Recomendada para ProFuncional</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-black/40 p-3.5 rounded-xl border border-white/10 space-y-1">
                <span className="font-bold text-[#25D366] block">Fase Inicial (Activa)</span>
                <p className="text-white/80 text-[11px]">
                  Utilizar la <strong>Alternativa 1 (Click-to-Chat 1-Clic)</strong> combinada con las <strong>Notificaciones Web Push de la PWA</strong>. Costo operativo $0 CLP, sin burocracia de Meta.
                </p>
              </div>

              <div className="bg-black/40 p-3.5 rounded-xl border border-white/10 space-y-1">
                <span className="font-bold text-sky-400 block">Fase Escalamiento (100+ alumnos)</span>
                <p className="text-white/80 text-[11px]">
                  Integrar la <strong>WhatsApp Cloud API oficial</strong> para disparar los recordatorios a 90 minutos automáticamente desde el backend NestJS (costo ~$18 CLP por confirmación).
                </p>
              </div>

              <div className="bg-black/40 p-3.5 rounded-xl border border-white/10 space-y-1">
                <span className="font-bold text-purple-400 block">Fase IA Conversacional</span>
                <p className="text-white/80 text-[11px]">
                  Integrar un agente IA (ej. Botpress / ManyChat) solo si se requiere que un bot libere y reasigne cupos respondiendo en lenguaje natural a cancelaciones imprevistas de los alumnos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: HISTORIAL DE MENSAJES ================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Registro de Recordatorios Enviados</h3>
            <span className="text-xs text-white/50">{logs.length} envíos registrados</span>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 text-white/50 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto opacity-30 text-[#25D366]" />
              <p className="font-medium text-sm">Aún no se han enviado recordatorios desde esta sesión.</p>
              <p className="text-xs text-white/40">Utiliza la pestaña "Envío Rápido 1-Clic" para enviar el primer mensaje.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
              <table className="w-full text-left text-xs text-white/80">
                <thead className="bg-white/5 text-[11px] uppercase font-bold text-white/60 border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Fecha y Hora</th>
                    <th className="p-3.5">Destinatario</th>
                    <th className="p-3.5">Teléfono</th>
                    <th className="p-3.5">Tipo de Recordatorio</th>
                    <th className="p-3.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 text-white/60 whitespace-nowrap">
                        {new Date(log.sentAt).toLocaleString('es-CL', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3.5 font-bold text-white whitespace-nowrap">{log.memberName}</td>
                      <td className="p-3.5 text-[#25D366] font-mono whitespace-nowrap">+{log.phone}</td>
                      <td className="p-3.5 text-white/80 max-w-xs truncate">{log.templateTitle}</td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          Enviado vía Web/App
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
