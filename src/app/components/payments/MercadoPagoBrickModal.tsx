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
  const [copiedCard, setCopiedCard] = useState(false);

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

  const testCardNumber = '5416 7526 0258 2580';

  const copyTestCard = () => {
    navigator.clipboard.writeText('5416752602582580');
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2500);
  };

  const payerEmail = member.email || 'paciente.prueba@profuncional.cl';

  const handleSubmit = async (param: any) => {
    setErrorMessage(null);
    try {
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...param.formData,
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

          {/* Banner de Tarjeta de Prueba (Sandbox Helper) */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Sparkles className="w-4 h-4" />
                Modo Sandbox (Datos de Prueba)
              </span>
              <button
                type="button"
                onClick={copyTestCard}
                className="text-[11px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-2 py-1 rounded flex items-center gap-1 font-mono transition-colors"
              >
                {copiedCard ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCard ? '¡Copiado!' : 'Copiar Tarjeta'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-white/90">
              <div>
                <span className="text-amber-300/70 block text-[9px] uppercase">Número</span>
                {testCardNumber}
              </div>
              <div>
                <span className="text-amber-300/70 block text-[9px] uppercase">Vencimiento / CVV</span>
                11/30 · 123
              </div>
              <div>
                <span className="text-amber-300/70 block text-[9px] uppercase">RUT Chileno Válido</span>
                11.111.111-1
              </div>
            </div>
            <p className="text-[11px] text-amber-300/90 leading-tight pt-1 border-t border-amber-500/20">
              💡 <strong>Regla de Mercado Pago:</strong> Realiza la prueba en una <strong>Ventana de Incógnito</strong>. Si tienes abierta tu sesión de vendedor de Mercado Pago en esta misma ventana, el sistema bloqueará la compra con <em>"Unauthorized use of live credentials"</em>.
            </p>
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
