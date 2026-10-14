import { getMemberByEmail } from '../../data/gymStore';
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, Check } from 'lucide-react';
import { AuthUser } from '../auth/Login';

import { Logo } from '../shared/Logo';

interface DigitalCardProps {
  user: AuthUser;
}

export function DigitalCard({ user: account }: DigitalCardProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const memberRecord = getMemberByEmail(account.email);
  const user = {
    id: memberRecord?.id || account.email,
    name: account.name,
    plan: account.plan ?? 'Premium',
    memberSince: getMemberByEmail(account.email)?.joinDate || '',
    expirationDate: getMemberByEmail(account.email)?.nextBilling || '',
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-[#F7F7F7]">Tarjeta digital de membresía</h1>
        <p className="text-white/60">Usa este código QR para ingresar a las instalaciones de ProFuncional</p>
      </div>

      {feedback && (
        <div className="rounded-xl border border-[#00E676]/40 bg-[#00E676]/15 p-4 text-[#00E676] flex items-center justify-center gap-2">
          <Check className="h-5 w-5" />
          <span className="text-sm font-medium">{feedback}</span>
        </div>
      )}

      {/* Digital Card */}
      <div className="relative">
        {/* Card Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E676]/20 to-[#00E676]/5 blur-3xl" />
        
        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-[#00E676]/10 to-transparent rounded-2xl p-4 sm:p-8 backdrop-blur-sm border border-[#00E676]/20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E676]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00E676]/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-6 sm:mb-8">
              <div>
                <Logo size="sm" />
                <p className="text-[11px] sm:text-xs text-white/60 mt-1">Centro Kinésico-Deportivo</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] sm:text-xs text-white/60 mb-0.5">ID de miembro</p>
                <p className="font-mono text-xs sm:text-sm font-medium text-[#F7F7F7]">{user.id}</p>
              </div>
            </div>

            {/* Member Info */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#00E676]/20 rounded-full flex items-center justify-center border-2 border-[#00E676]">
                  <span className="text-xl sm:text-3xl font-bold text-[#00E676]">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold mb-0.5 text-[#F7F7F7]">{user.name}</h3>
                  <p className="text-xs sm:text-sm text-[#00E676] font-semibold">Miembro {user.plan}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs">
                <div>
                  <p className="text-[11px] text-white/60 mb-0.5">Miembro desde</p>
                  <p className="font-medium text-[#F7F7F7]">{new Date(user.memberSince).toLocaleDateString('es-CL')}</p>
                </div>
                <div>
                  <p className="text-[11px] text-white/60 mb-0.5">Vigente hasta</p>
                  <p className="font-medium text-[#F7F7F7]">{new Date(user.expirationDate).toLocaleDateString('es-CL')}</p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col items-center">
              <QRCodeSVG
                value={`PROFUNCIONAL:${user.id}`}
                size={160}
                level="H"
                includeMargin={true}
                fgColor="#021826"
              />
              <p className="text-[#021826] text-xs sm:text-sm font-semibold mt-2.5">Escanea en el tótem de entrada</p>
            </div>

            {/* Status Badge */}
            <div className="mt-6 text-center">
              <span className="inline-block px-4 py-2 bg-[#00E676]/20 text-[#00E676] rounded-full text-sm font-semibold border border-[#00E676]/30">
                Membresía activa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <h3 className="font-semibold mb-3 text-[#F7F7F7]">Instrucciones de uso</h3>
        <ul className="space-y-2 text-sm text-white/80">
          <li className="flex items-start gap-2">
            <span className="text-[#00E676] font-bold mt-0.5">1.</span>
            <span>Presenta este código QR en el lector de la entrada del gimnasio</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00E676] font-bold mt-0.5">2.</span>
            <span>Espera la confirmación con el pitido y check verde en pantalla</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00E676] font-bold mt-0.5">3.</span>
            <span>Tu ingreso y racha quedarán registrados automáticamente</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00E676] font-bold mt-0.5">4.</span>
            <span>Mantén el brillo del teléfono alto para una lectura inmediata</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(`PROFUNCIONAL:${user.id}`);
            }
            showFeedback('Pase guardado en el dispositivo para acceso offline');
          }}
          className="flex-1 min-h-[44px] px-6 py-3 bg-[#00E676]/15 hover:bg-[#00E676]/25 border border-[#00E676]/30 rounded-xl transition-all font-bold text-xs text-[#00E676] flex items-center justify-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-[#00E676]" />
          <span>Guardar en Dispositivo</span>
        </button>
        <button
          onClick={async () => {
            const shareText = `Pase Digital ProFuncional: ${user.name} (ID Socio: ${user.id}) - Plan: ${user.plan}`;
            if (navigator.share) {
              try {
                await navigator.share({
                  title: 'Mi Pase Digital ProFuncional',
                  text: shareText,
                  url: window.location.origin,
                });
                showFeedback('¡Credencial compartida!');
              } catch {
                // usuario canceló share
              }
            } else if (navigator.clipboard) {
              await navigator.clipboard.writeText(shareText);
              showFeedback('Detalles de tu carnet copiados al portapapeles');
            }
          }}
          className="flex-1 min-h-[44px] px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-colors font-bold text-xs text-white flex items-center justify-center gap-2"
        >
          <span>Compartir Credencial</span>
        </button>
      </div>
    </div>
  );
}