import React, { useEffect, useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { ShieldCheck, CreditCard, Sparkles, AlertCircle, Copy, Check, Loader2, X } from 'lucide-react';
import { formatCLP } from '../../data/paymentStore';

interface MercadoPagoBrickModalProps {
  isOpen: boolean;
  onClose: () => void;
  pack: {
    id: string;
    name: string;
    price: number;
    sessions: number;
  };
  member: {
    id: string;
    name: string;
    email?: string;
  };
  onSuccess: (paymentResult: any) => void;
}

const MP_PUBLIC_KEY =
  (import.meta as any).env?.VITE_MP_PUBLIC_KEY || 'APP_USR-94b0da71-7536-48d0-979f-764848198412';

const STATUS_DETAIL_MAP: Record<string, string> = {
  cc_rejected_bad_filled_card_number: 'Número de tarjeta incorrecto.',
  cc_rejected_bad_filled_date: 'Fecha de vencimiento incorrecta o tarjeta expirada (Simulación EXPI).',
  cc_rejected_bad_filled_security_code: 'Código de seguridad (CVV) incorrecto (Simulación SECU).',
  cc_rejected_bad_filled_other: 'Error en el formulario de pago (Simulación FORM).',
  cc_rejected_call_for_authorize: 'El banco requiere autorización telefónica (Simulación CALL).',
  cc_rejected_insufficient_amount: 'Fondos insuficientes en la tarjeta (Simulación FONT).',
  cc_rejected_other_reason: 'Rechazo general por error del emisor (Simulación OTE).',
  cc_rejected_card_disabled: 'La tarjeta está deshabilitada.',
  in_process: 'Pago pendiente / en proceso de acreditación (Simulación CONT).',
  max_attempts_exceeded: 'Superaste el límite de intentos permitidos con esta tarjeta. Intenta con otra tarjeta.',
  cc_rejected_max_attempts: 'Superaste el límite de intentos permitidos con esta tarjeta. Intenta con otra tarjeta.',
};

export const MercadoPagoBrickModal: React.FC<MercadoPagoBrickModalProps> = ({
  isOpen,
  onClose,
  pack,
  member,
  onSuccess,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (MP_PUBLIC_KEY) {
      try {
        initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-CL' });
      } catch (err) {
        console.warn('Error al inicializar SDK de Mercado Pago:', err);
      }
    }
  }, []);

  if (!isOpen) return null;

  const TEST_CARDS = [
    { label: 'Mastercard Crédito', number: '5416 7526 0258 2580', raw: '5416752602582580', cvv: '123' },
    { label: 'Visa Oficial', number: '4168 8188 4444 7115', raw: '4168818844447115', cvv: '123' },
    { label: 'Amex Crédito', number: '3757 7817 4461 804', raw: '375778174461804', cvv: '1234' },
    { label: 'Mastercard Débito', number: '5241 0198 2664 6950', raw: '5241019826646950', cvv: '123' },
    { label: 'Visa Débito', number: '4023 6535 2391 4373', raw: '4023653523914373', cvv: '123' },
  ];

  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCurrentCard = () => {
    const card = TEST_CARDS[activeCardIdx];
    navigator.clipboard.writeText(card.raw);
    setCopiedKey(card.label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const payerEmail = member.email || 'paciente.prueba@profuncional.cl';

  const handleSubmit = async (param: any) => {
    setErrorMessage(null);
    const nameParts = (member.name || 'Paciente ProFuncional').trim().split(' ');
    const firstName = nameParts[0] || 'Paciente';
    const lastName = nameParts.slice(1).join(' ') || 'ProFuncional';

    try {
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...param.formData,
          payer: {
            ...param.formData.payer,
            email: param.formData.payer?.email || payerEmail,
            first_name: firstName,
            last_name: lastName,
            phone: {
              area_code: '56',
              number: '912345678',
            },
          },
          description: pack.name,
          serviceId: pack.id,
          sessions: pack.sessions,
          memberId: member.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo procesar el pago.');
      }

      if (data.status === 'approved' || data.success) {
        onSuccess(data);
      } else {
        const detailMsg = STATUS_DETAIL_MAP[data.status_detail] || data.status_detail || data.status || 'Rechazado';
        setErrorMessage(`El pago fue rechazado: ${detailMsg}`);
      }
    } catch (err: any) {
      console.error('Error al procesar el pago con el backend:', err);
      setErrorMessage(err.message || 'Error de conexión al procesar el pago.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0b1726] border border-[#00E676]/40 rounded-2xl w-full max-w-lg shadow-2xl relative text-white max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Cabecera */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E676]/20 border border-[#00E676]/40 flex items-center justify-center text-[#00E676]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00E676] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Mercado Pago Checkout API (Bricks)
              </span>
              <h3 className="text-lg font-bold text-white">{pack.name}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/60 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Tarjeta de Resumen */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-white/60 block">Total a pagar:</span>
              <span className="text-xl font-black text-[#00E676]">{formatCLP(pack.price)}</span>
            </div>
            <div className="text-right">
              <span className="text-white/60 block">Sesiones incluidas:</span>
              <span className="text-sm font-bold text-white bg-white/10 px-2 py-0.5 rounded-md inline-block">
                +{pack.sessions} sesiones
              </span>
            </div>
          </div>

          {/* Banner de Tarjeta de Prueba (Sandbox Helper con Selector) */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2.5">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Sparkles className="w-4 h-4" />
                Tarjetas Sandbox Oficiales ({activeCardIdx + 1}/5)
              </span>
              <button
                type="button"
                onClick={copyCurrentCard}
                className="text-[11px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-2 py-1 rounded flex items-center gap-1 font-mono transition-colors"
              >
                {copiedKey === TEST_CARDS[activeCardIdx].label ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copiedKey === TEST_CARDS[activeCardIdx].label ? '¡Copiado!' : 'Copiar Tarjeta'}
              </button>
            </div>

            {/* Selector de tarjetas */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {TEST_CARDS.map((c, i) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setActiveCardIdx(i)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                    activeCardIdx === i
                      ? 'bg-amber-400 text-black font-bold shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-white/80'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-white/90 bg-black/30 p-2.5 rounded-lg border border-white/5">
              <div className="col-span-2">
                <span className="text-amber-300/70 block text-[9px] uppercase font-sans">
                  {TEST_CARDS[activeCardIdx].label}
                </span>
                <span className="text-[#00E676] font-bold">{TEST_CARDS[activeCardIdx].number}</span>
              </div>
              <div>
                <span className="text-amber-300/70 block text-[9px] uppercase font-sans">CVV / Vencimiento</span>
                {TEST_CARDS[activeCardIdx].cvv} · 11/30
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-amber-200/80 pt-1 border-t border-amber-500/20">
              <span>Titular: <strong className="text-white">APRO</strong> (o OTHE/FUND/CALL)</span>
              <span>Doc: <strong className="text-white">Otro: 123456789</strong></span>
            </div>
          </div>

          {/* Mensaje de Error si ocurre */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Loader mientras inicia el Payment Brick */}
          {!isReady && (
            <div className="py-10 flex flex-col items-center justify-center space-y-3 text-white/60">
              <Loader2 className="w-7 h-7 animate-spin text-[#00E676]" />
              <p className="text-xs">Cargando formulario seguro de Mercado Pago...</p>
            </div>
          )}

          {/* Componente Payment Brick oficial de Mercado Pago */}
          <div className={`transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
            <Payment
              initialization={{
                amount: pack.price,
                payer: {
                  email: payerEmail,
                },
              }}
              customization={{
                paymentMethods: {
                  creditCard: 'all',
                  debitCard: 'all',
                  prepaidCard: 'all',
                  ticket: 'all',
                  bankTransfer: 'all',
                  mercadoPago: 'all',
                },
                visual: {
                  style: {
                    theme: 'dark',
                    customVariables: {
                      baseColor: '#00E676',
                    },
                  },
                },
              }}
              onSubmit={handleSubmit}
              onError={(error) => {
                console.error('Error reportado por Payment Brick:', error);
                setErrorMessage('Error al inicializar la pasarela de Mercado Pago.');
              }}
              onReady={() => {
                setIsReady(true);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
