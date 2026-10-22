import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import {
  CreditCard,
  PlusCircle,
  Smartphone,
  Globe,
  DollarSign,
  PieChart,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Receipt,
  ArrowRight,
  TrendingUp,
  Percent,
  Calendar,
  User,
  Clock,
  Sparkles,
  Stethoscope,
  Dumbbell,
  FileText
} from 'lucide-react';
import {
  GymService,
  PaymentTransaction,
  PaymentMethod,
  getServices,
  getPaymentTransactions,
  subscribeToServices,
  subscribeToPaymentTransactions,
  calculateMercadoPagoFees,
  formatCLP,
  createGymService,
  processPaymentTransaction
} from '../../data/paymentStore';
import { getMembers, GymMember } from '../../data/gymStore';

export function AdminPayments() {
  const [services, setServices] = useState<GymService[]>(getServices);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(getPaymentTransactions);
  const [members, setMembers] = useState<GymMember[]>(getMembers);

  // Filter & Search state
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'kinesiology' | 'functional' | 'personalized'>('all');
  const [searchTx, setSearchTx] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all');

  // Terminal de Cobro Modal State
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [chargeMemberId, setChargeMemberId] = useState(members[0]?.id || '');
  const [chargeServiceId, setChargeServiceId] = useState(services[0]?.id || '');
  const [chargeMethod, setChargeMethod] = useState<PaymentMethod>('point_pos');
  const [chargeInstallments, setChargeInstallments] = useState(1);
  const [chargeNotes, setChargeNotes] = useState('');
  const [isProcessingCharge, setIsProcessingCharge] = useState(false);
  const [pointTerminalStep, setPointTerminalStep] = useState<'ready' | 'waiting_card' | 'pin' | 'approved'>('ready');

  // New Service Modal State
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentTransaction | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    const unsubServices = subscribeToServices(() => setServices(getServices()));
    const unsubTxs = subscribeToPaymentTransactions(() => setTransactions(getPaymentTransactions()));
    return () => {
      unsubServices();
      unsubTxs();
    };
  }, []);

  const selectedServiceForCharge = useMemo(() => {
    return services.find((s) => s.id === chargeServiceId) || services[0];
  }, [services, chargeServiceId]);

  const chargeCalculation = useMemo(() => {
    if (!selectedServiceForCharge) {
      return { grossAmount: 0, mpFeePercent: 0, mpFeeAmount: 0, netAmount: 0, instructorShareAmount: 0, clinicShareAmount: 0 };
    }
    return calculateMercadoPagoFees(
      selectedServiceForCharge.price,
      chargeMethod,
      chargeInstallments,
      selectedServiceForCharge.instructorRevenueSharePercent,
      selectedServiceForCharge.clinicRevenueSharePercent
    );
  }, [selectedServiceForCharge, chargeMethod, chargeInstallments]);

  // Overall Financial KPIs
  const totalGrossRevenue = useMemo(() => {
    return transactions.filter(t => t.status === 'approved').reduce((acc, t) => acc + t.grossAmount, 0);
  }, [transactions]);

  const totalMpFees = useMemo(() => {
    return transactions.filter(t => t.status === 'approved').reduce((acc, t) => acc + t.mpFeeAmount, 0);
  }, [transactions]);

  const totalClinicNet = useMemo(() => {
    return transactions.filter(t => t.status === 'approved').reduce((acc, t) => acc + t.clinicShareAmount, 0);
  }, [transactions]);

  const totalInstructorNet = useMemo(() => {
    return transactions.filter(t => t.status === 'approved').reduce((acc, t) => acc + t.instructorShareAmount, 0);
  }, [transactions]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') return services;
    return services.filter((s) => s.category === selectedCategory);
  }, [services, selectedCategory]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.memberName.toLowerCase().includes(searchTx.toLowerCase()) ||
        tx.serviceTitle.toLowerCase().includes(searchTx.toLowerCase()) ||
        tx.mpPaymentId.toLowerCase().includes(searchTx.toLowerCase());
      const matchMethod = methodFilter === 'all' || tx.method === methodFilter;
      return matchSearch && matchMethod;
    });
  }, [transactions, searchTx, methodFilter]);

  // Handle Create Service
  const handleCreateServiceSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get('title')).trim();
    const category = String(fd.get('category')) as GymService['category'];
    const price = Number(fd.get('price'));
    const sessionsCount = Number(fd.get('sessionsCount'));
    const durationMinutes = Number(fd.get('durationMinutes'));
    const description = String(fd.get('description')).trim();
    const installmentsAllowed = fd.get('installmentsAllowed') === 'on';
    const maxInstallments = Number(fd.get('maxInstallments') || 1);
    const instructorRevenueSharePercent = Number(fd.get('instructorRevenueSharePercent'));
    const clinicRevenueSharePercent = 100 - instructorRevenueSharePercent;

    if (!title || price <= 0 || sessionsCount <= 0) {
      showToast('Por favor completa todos los campos requeridos con valores válidos.', 'error');
      return;
    }

    createGymService({
      title,
      category,
      price,
      sessionsCount,
      durationMinutes,
      description,
      installmentsAllowed,
      maxInstallments,
      instructorRevenueSharePercent,
      clinicRevenueSharePercent,
      isActive: true,
    });

    setIsNewServiceModalOpen(false);
    showToast(`¡Servicio "${title}" creado y publicado exitosamente!`, 'success');
  };

  // Handle Process Charge
  const handleExecuteCharge = async () => {
    if (!chargeMemberId || !chargeServiceId) return;
    setIsProcessingCharge(true);

    if (chargeMethod === 'point_pos') {
      setPointTerminalStep('waiting_card');
      await new Promise((r) => setTimeout(r, 1200));
      setPointTerminalStep('pin');
      await new Promise((r) => setTimeout(r, 1000));
      setPointTerminalStep('approved');
      await new Promise((r) => setTimeout(r, 600));
    } else {
      await new Promise((r) => setTimeout(r, 800));
    }

    const res = await processPaymentTransaction({
      memberId: chargeMemberId,
      serviceId: chargeServiceId,
      method: chargeMethod,
      installments: chargeInstallments,
      notes: chargeNotes,
      operatorName: 'Administrador Pro-Funcional',
    });

    setIsProcessingCharge(false);
    setPointTerminalStep('ready');

    if (res.success && res.transaction) {
      showToast(res.message, 'success');
      setIsChargeModalOpen(false);
      setSelectedReceipt(res.transaction);
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          role="alert"
          className={`fixed top-6 right-6 z-[9999] max-w-md p-4 rounded-xl border flex items-start gap-3 shadow-2xl backdrop-blur-md animate-bounce-in ${
            toastMessage.type === 'success'
              ? 'border-[#00E676]/60 bg-[#06180a]/95 text-[#00E676]'
              : 'border-red-500/60 bg-[#230808]/95 text-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#00E676]" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          )}
          <div className="flex-1 text-xs">
            <span className="font-bold block uppercase tracking-wider mb-0.5">
              {toastMessage.type === 'success' ? 'Operación Exitosa' : 'Aviso'}
            </span>
            <span className="leading-relaxed">{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/40 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00E676]/20 border border-[#00E676]/40 text-[#00E676] text-xs font-bold uppercase tracking-wider">
              Módulo de Finanzas & Cobros
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-bold uppercase tracking-wider">
              Mercado Pago Integrado
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#F7F7F7]">Reestructuración de Precios & Mercado Pago</h1>
          <p className="text-white/60 text-sm">
            Tarifario oficial kinésico, cobro mediante Máquina POS Point o Checkout API y distribución automática de ingresos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsNewServiceModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-[#00E676]" />
            <span>Crear Servicio / Tarifario</span>
          </button>

          <button
            onClick={() => setIsChargeModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#00E676] hover:bg-[#00E676]/90 text-[#021826] text-xs font-extrabold transition-transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-[#00E676]/20"
          >
            <CreditCard className="w-4 h-4" />
            <span>Terminal de Cobro MP</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60 text-xs mb-2">
            <span>Recaudación Bruta Total</span>
            <DollarSign className="w-4 h-4 text-[#00E676]" />
          </div>
          <p className="text-2xl font-black text-white">{formatCLP(totalGrossRevenue)}</p>
          <span className="text-[11px] text-[#00E676] mt-1 font-semibold">100% transacciones procesadas</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60 text-xs mb-2">
            <span>Comisiones Mercado Pago</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{formatCLP(totalMpFees)}</p>
          <span className="text-[11px] text-white/50 mt-1">Point (1.79%-3.51%) / API (3.79%)</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60 text-xs mb-2">
            <span>Neto Gimnasio / Clínica</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-[#00E676]">{formatCLP(totalClinicNet)}</p>
          <span className="text-[11px] text-emerald-300 mt-1 font-semibold">Margen neto operativo</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60 text-xs mb-2">
            <span>Liquidación Kinesiólogos</span>
            <Stethoscope className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-sky-300">{formatCLP(totalInstructorNet)}</p>
          <span className="text-[11px] text-sky-200 mt-1 font-semibold">Split acordado (70% Kine)</span>
        </div>
      </div>

      {/* Tarifario Oficial & Catálogo de Servicios */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#00E676]" />
              Catálogo de Servicios & Tarifario Oficial
            </h2>
            <p className="text-xs text-white/60">
              Valores actualizados para Kinesiología (Evaluación $20k y Pack 10 $250k) y Entrenamiento Funcional.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === 'all' ? 'bg-[#00E676] text-[#021826]' : 'text-white/60 hover:text-white'
              }`}
            >
              Todos ({services.length})
            </button>
            <button
              onClick={() => setSelectedCategory('kinesiology')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                selectedCategory === 'kinesiology' ? 'bg-[#00E676] text-[#021826]' : 'text-white/60 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Kinesiología
            </button>
            <button
              onClick={() => setSelectedCategory('functional')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                selectedCategory === 'functional' ? 'bg-[#00E676] text-[#021826]' : 'text-white/60 hover:text-white'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              Funcional
            </button>
            <button
              onClick={() => setSelectedCategory('personalized')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === 'personalized' ? 'bg-[#00E676] text-[#021826]' : 'text-white/60 hover:text-white'
              }`}
            >
              Personalizado
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const isKineOfficial = service.id === 'eval-kine' || service.id === 'pack-10-kine';
            return (
              <div
                key={service.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isKineOfficial
                    ? 'bg-gradient-to-br from-sky-950/40 via-[#071726] to-black border-sky-500/40 shadow-lg shadow-sky-950/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        service.category === 'kinesiology'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : service.category === 'functional'
                          ? 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {service.category === 'kinesiology'
                        ? 'Kinesiología Clínica'
                        : service.category === 'functional'
                        ? 'Entrenamiento Grupal'
                        : 'Entrenamiento 1 a 1'}
                    </span>

                    {isKineOfficial && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40">
                        Tarifario Oficial
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-white leading-snug">{service.title}</h3>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">{service.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-[#00E676]">{formatCLP(service.price)}</span>
                      {service.installmentsAllowed && (
                        <p className="text-[11px] text-white/60">
                          o hasta {service.maxInstallments} cuotas de {formatCLP(Math.round(service.price / service.maxInstallments))}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-white/80 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                      {service.sessionsCount} {service.sessionsCount === 1 ? 'sesión' : 'sesiones'} ({service.durationMinutes} min)
                    </span>
                  </div>

                  {/* Split Distribution Preview */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-white/70">
                      <span>Kinesiólogo / Entrenador:</span>
                      <strong className="text-sky-300">{service.instructorRevenueSharePercent}% ({formatCLP(Math.round((service.price * service.instructorRevenueSharePercent) / 100))})</strong>
                    </div>
                    <div className="flex items-center justify-between text-white/70">
                      <span>Clínica / Gimnasio:</span>
                      <strong className="text-emerald-300">{service.clinicRevenueSharePercent}% ({formatCLP(Math.round((service.price * service.clinicRevenueSharePercent) / 100))})</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setChargeServiceId(service.id);
                      setIsChargeModalOpen(true);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#00E676]/15 hover:bg-[#00E676] text-[#00E676] hover:text-[#021826] border border-[#00E676]/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Cobrar este Servicio →</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historial de Pagos & Auditoría */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#00E676]" />
              Historial de Transacciones & Auditoría Mercado Pago
            </h2>
            <p className="text-xs text-white/60">
              Registro trazable de pagos en Máquinas Point presenciales y Checkout API online.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por alumno o ID..."
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 outline-none focus:border-[#00E676] min-w-[200px]"
              />
            </div>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#00E676]"
            >
              <option value="all">Todos los Métodos</option>
              <option value="point_pos">Máquina POS Point</option>
              <option value="mp_checkout_api">Checkout API / Link</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white/50 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Fecha / ID MP</th>
                <th className="py-3 px-3">Alumno / Paciente</th>
                <th className="py-3 px-3">Servicio</th>
                <th className="py-3 px-3">Método / Cuotas</th>
                <th className="py-3 px-3 text-right">Monto Bruto</th>
                <th className="py-3 px-3 text-right">Comisión MP</th>
                <th className="py-3 px-3 text-right">Neto Gym</th>
                <th className="py-3 px-3 text-right">Liquid. Kine</th>
                <th className="py-3 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{tx.date}</span>
                    <span className="text-[10px] text-white/50">{tx.mpPaymentId}</span>
                  </td>
                  <td className="py-3 px-3 font-sans font-medium text-white">
                    {tx.memberName}
                  </td>
                  <td className="py-3 px-3 font-sans text-white/80">
                    {tx.serviceTitle}
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        tx.method === 'point_pos'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : tx.method === 'mp_checkout_api'
                          ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {tx.method === 'point_pos' ? '📱 POS Point' : tx.method === 'mp_checkout_api' ? '🌐 Checkout API' : '🏦 Transferencia'}
                      {tx.installments > 1 && ` (${tx.installments} cuotas)`}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-white">
                    {formatCLP(tx.grossAmount)}
                  </td>
                  <td className="py-3 px-3 text-right text-amber-300">
                    -{formatCLP(tx.mpFeeAmount)} ({tx.mpFeePercent}%)
                  </td>
                  <td className="py-3 px-3 text-right text-[#00E676] font-bold">
                    {formatCLP(tx.clinicShareAmount)}
                  </td>
                  <td className="py-3 px-3 text-right text-sky-300">
                    {formatCLP(tx.instructorShareAmount)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => setSelectedReceipt(tx)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold transition-colors font-sans"
                    >
                      Comprobante
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <p className="text-center py-8 text-xs text-white/40">
              No se encontraron transacciones registradas con los filtros actuales.
            </p>
          )}
        </div>
      </div>

      {/* Modal Terminal de Cobro Mercado Pago */}
      {isChargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0b1726] border border-[#00E676]/40 rounded-2xl p-5 sm:p-6 w-full max-w-xl space-y-4 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-[#00E676] tracking-wider">
                  Módulo de Pagos Pro-Funcional
                </span>
                <h3 className="text-xl font-bold mt-0.5">Terminal de Cobro Mercado Pago</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsChargeModalOpen(false)}
                className="text-white/50 hover:text-white text-sm bg-white/5 p-2 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Select Member and Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="text-white/70">
                Alumno / Paciente
                <select
                  value={chargeMemberId}
                  onChange={(e) => setChargeMemberId(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-[#00E676]"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.plan})
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-white/70">
                Servicio a Cobrar
                <select
                  value={chargeServiceId}
                  onChange={(e) => {
                    setChargeServiceId(e.target.value);
                    const s = services.find((x) => x.id === e.target.value);
                    if (s && !s.installmentsAllowed) setChargeInstallments(1);
                  }}
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-[#00E676]"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} - {formatCLP(s.price)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Payment Method Selector (POS Point vs API) */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-white/80 block">Selecciona la Vía de Integración Mercado Pago:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setChargeMethod('point_pos')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    chargeMethod === 'point_pos'
                      ? 'border-[#00E676] bg-[#00E676]/15 text-white'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="w-4 h-4 text-[#00E676]" />
                    <strong className="text-xs">Máquina POS Point (Física)</strong>
                  </div>
                  <p className="text-[11px] text-white/60">
                    Cobro presencial con tarjeta de débito (1.79%) o crédito (3.51%).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setChargeMethod('mp_checkout_api')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    chargeMethod === 'mp_checkout_api'
                      ? 'border-[#00E676] bg-[#00E676]/15 text-white'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-sky-400" />
                    <strong className="text-xs">Checkout API / Link Web / QR</strong>
                  </div>
                  <p className="text-[11px] text-white/60">
                    Cobro online inmediato o en cuotas (3.79% - 4.19%).
                  </p>
                </button>
              </div>
            </div>

            {/* Installments Option */}
            {selectedServiceForCharge?.installmentsAllowed && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2">
                <span className="font-semibold text-white block">Opciones de Pago en Cuotas:</span>
                <div className="flex gap-2">
                  {[1, 3, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setChargeInstallments(num)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                        chargeInstallments === num
                          ? 'bg-[#00E676] text-[#021826] border-[#00E676]'
                          : 'bg-black/40 text-white/70 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {num === 1 ? 'Al contado' : `${num} cuotas de ${formatCLP(Math.round(selectedServiceForCharge.price / num))}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Financial Breakdown Box */}
            <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 text-xs space-y-2">
              <span className="font-bold text-[#00E676] uppercase tracking-wider text-[10px] block">
                Desglose Financiero & Liquidación Automática
              </span>
              <div className="flex justify-between text-white/80">
                <span>Monto Bruto a Cobrar:</span>
                <strong className="text-white text-sm">{formatCLP(chargeCalculation.grossAmount)}</strong>
              </div>
              <div className="flex justify-between text-amber-300">
                <span>Comisión Mercado Pago ({chargeCalculation.mpFeePercent}% IVA incl.):</span>
                <span>-{formatCLP(chargeCalculation.mpFeeAmount)}</span>
              </div>
              <div className="flex justify-between text-white border-t border-white/10 pt-1 font-semibold">
                <span>Monto Neto Percibido:</span>
                <span>{formatCLP(chargeCalculation.netAmount)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] border-t border-white/5">
                <div className="p-2 rounded bg-sky-500/10 border border-sky-500/20 text-sky-200">
                  <span className="block text-[10px] text-white/60">Pago Profesional (70%):</span>
                  <strong>{formatCLP(chargeCalculation.instructorShareAmount)}</strong>
                </div>
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                  <span className="block text-[10px] text-white/60">Gimnasio / Clínica (30%):</span>
                  <strong>{formatCLP(chargeCalculation.clinicShareAmount)}</strong>
                </div>
              </div>
            </div>

            {/* Terminal State Visualizer */}
            {isProcessingCharge && chargeMethod === 'point_pos' && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2 animate-pulse">
                <Smartphone className="w-5 h-5 flex-shrink-0 text-amber-400" />
                <div>
                  <strong>Estado Terminal POS Point:</strong>{' '}
                  {pointTerminalStep === 'waiting_card' && 'Acerque o inserte la tarjeta en el lector...'}
                  {pointTerminalStep === 'pin' && 'Ingrese clave secreta / PIN en la máquina...'}
                  {pointTerminalStep === 'approved' && '¡Transacción autorizada! Imprimiendo comprobante...'}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsChargeModalOpen(false)}
                disabled={isProcessingCharge}
                className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteCharge}
                disabled={isProcessingCharge}
                className="px-5 py-2.5 rounded-xl bg-[#00E676] text-[#021826] text-xs font-bold hover:bg-[#00E676]/90 flex items-center gap-2 shadow-lg shadow-[#00E676]/20 disabled:opacity-50"
              >
                {isProcessingCharge ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Procesando Mercado Pago...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Confirmar Cobro ({formatCLP(chargeCalculation.grossAmount)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Nuevo Servicio */}
      {isNewServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={handleCreateServiceSubmit} className="bg-[#0b1726] border border-white/15 rounded-2xl p-5 sm:p-6 w-full max-w-lg space-y-4 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-[#00E676] tracking-wider">
                  Configuración de Tarifario
                </span>
                <h3 className="text-xl font-bold mt-0.5">Crear Nuevo Servicio</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewServiceModalOpen(false)}
                className="text-white/50 hover:text-white text-sm bg-white/5 p-2 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="sm:col-span-2 text-white/70">
                Nombre del Servicio
                <input
                  required
                  name="title"
                  placeholder="Ej: Sesión Kinesiología Post-Cirugía"
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-[#00E676]"
                />
              </label>

              <label className="text-white/70">
                Categoría
                <select
                  name="category"
                  required
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-[#00E676]"
                >
                  <option value="kinesiology">Kinesiología Clínica</option>
                  <option value="functional">Entrenamiento Funcional</option>
                  <option value="personalized">Entrenamiento Personalizado</option>
                </select>
              </label>

              <label className="text-white/70">
                Precio (CLP)
                <input
                  required
                  name="price"
                  type="number"
                  min="1000"
                  step="1000"
                  defaultValue="25000"
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-[#00E676]"
                />
              </label>

              <label className="text-white/70">
                Cantidad de Sesiones
                <input
                  required
                  name="sessionsCount"
                  type="number"
                  min="1"
                  max="50"
                  defaultValue="1"
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-[#00E676]"
                />
              </label>

              <label className="text-white/70">
                Duración (Minutos)
                <input
                  required
                  name="durationMinutes"
                  type="number"
                  min="15"
                  step="15"
                  defaultValue="45"
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-[#00E676]"
                />
              </label>

              <label className="sm:col-span-2 text-white/70">
                Descripción Detallada
                <textarea
                  required
                  name="description"
                  rows={2}
                  placeholder="Detalles sobre objetivos clínicos o deportivos..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white outline-none focus:border-[#00E676]"
                />
              </label>

              <label className="text-white/70">
                % Split Profesional (Kinesiólogo)
                <input
                  required
                  name="instructorRevenueSharePercent"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue="70"
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-[#00E676]"
                />
              </label>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="installmentsAllowed"
                  name="installmentsAllowed"
                  defaultChecked
                  className="w-4 h-4 rounded text-[#00E676] bg-black/40 border-white/10"
                />
                <label htmlFor="installmentsAllowed" className="text-xs text-white/80">
                  Permitir cuotas con Mercado Pago
                </label>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsNewServiceModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#00E676] text-[#021826] text-xs font-bold hover:bg-[#00E676]/90 shadow-md shadow-[#00E676]/20"
              >
                Guardar y Publicar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Comprobante Digital */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0b1726] border border-[#00E676]/50 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative text-white">
            <div className="text-center space-y-1 border-b border-white/10 pb-4">
              <span className="w-10 h-10 rounded-full bg-[#00E676]/20 border border-[#00E676]/40 text-[#00E676] flex items-center justify-center mx-auto mb-2">
                ✓
              </span>
              <h3 className="text-xl font-bold">Comprobante de Pago</h3>
              <p className="text-xs text-[#00E676] font-mono font-bold">ID Transacción: {selectedReceipt.mpPaymentId}</p>
            </div>

            <div className="space-y-2 text-xs bg-white/5 p-4 rounded-xl border border-white/10 font-mono">
              <div className="flex justify-between">
                <span className="text-white/60">Fecha:</span>
                <span className="text-white font-bold">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Alumno:</span>
                <span className="text-white font-bold">{selectedReceipt.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Servicio:</span>
                <span className="text-white font-bold">{selectedReceipt.serviceTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Método:</span>
                <span className="text-[#00E676] font-bold">
                  {selectedReceipt.method === 'point_pos' ? 'Máquina POS Point' : 'Mercado Pago Checkout'}
                  {selectedReceipt.installments > 1 && ` (${selectedReceipt.installments} cuotas)`}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-bold">
                <span className="text-white">Monto Pagado:</span>
                <span className="text-[#00E676]">{formatCLP(selectedReceipt.grossAmount)}</span>
              </div>
            </div>

            <p className="text-[11px] text-white/50 text-center">
              Las sesiones han sido acreditadas automáticamente en la cuenta del alumno.
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-2.5 rounded-xl bg-[#00E676] text-[#021826] text-xs font-bold hover:bg-[#00E676]/90 shadow-md"
              >
                Cerrar Comprobante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
