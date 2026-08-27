import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, Check } from 'lucide-react';
import { AuthUser } from '../auth/Login';

interface DigitalCardProps {
  user: AuthUser;
}

export function DigitalCard({ user: account }: DigitalCardProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const user = {
    id: 'PF-2025-001234',
    name: account.name,
    plan: account.plan ?? 'Premium',
    memberSince: '2024-01-15',
    expirationDate: '2025-02-15',
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
        <div className="rounded-xl border border-[#09C82C]/40 bg-[#09C82C]/15 p-4 text-[#09C82C] flex items-center justify-center gap-2">
          <Check className="h-5 w-5" />
          <span className="text-sm font-medium">{feedback}</span>
        </div>
      )}

      {/* Digital Card */}
      <div className="relative">
        {/* Card Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#09C82C]/20 to-[#09C82C]/5 blur-3xl" />
        
        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-[#09C82C]/10 to-transparent rounded-2xl p-8 backdrop-blur-sm border border-[#09C82C]/20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#09C82C]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#09C82C]/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-6 h-6 text-[#09C82C]" />
                  <h2 className="text-2xl font-bold tracking-[-0.04em] text-white">PRO<span className="text-[#09C82C]">FUNCIONAL</span></h2>
                </div>
                <p className="text-sm text-white/60">Centro Kinésico-Deportivo</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/60 mb-1">ID de miembro</p>
                <p className="font-mono text-sm font-medium text-[#F7F7F7]">{user.id}</p>
              </div>
            </div>

            {/* Member Info */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 bg-[#09C82C]/20 rounded-full flex items-center justify-center border-2 border-[#09C82C]">
                  <span className="text-3xl font-bold text-[#09C82C]">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1 text-[#F7F7F7]">{user.name}</h3>
                  <p className="text-[#09C82C] font-semibold">Miembro {user.plan}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/60 mb-1">Miembro desde</p>
                  <p className="font-medium text-[#F7F7F7]">{new Date(user.memberSince).toLocaleDateString('es-CL')}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">Vigente hasta</p>
                  <p className="font-medium text-[#F7F7F7]">{new Date(user.expirationDate).toLocaleDateString('es-CL')}</p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center">
              <QRCodeSVG
                value={`PROFUNCIONAL:${user.id}`}
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#010A01"
              />
              <p className="text-[#010A01] text-sm font-semibold mt-4">Escanea en el tótem de entrada</p>
            </div>

            {/* Status Badge */}
            <div className="mt-6 text-center">
              <span className="inline-block px-4 py-2 bg-[#09C82C]/20 text-[#09C82C] rounded-full text-sm font-semibold border border-[#09C82C]/30">
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
            <span className="text-[#09C82C] font-bold mt-0.5">1.</span>
            <span>Presenta este código QR en el lector de la entrada del gimnasio</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#09C82C] font-bold mt-0.5">2.</span>
            <span>Espera la confirmación con el pitido y check verde en pantalla</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#09C82C] font-bold mt-0.5">3.</span>
            <span>Tu ingreso y racha quedarán registrados automáticamente</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#09C82C] font-bold mt-0.5">4.</span>
            <span>Mantén el brillo del teléfono alto para una lectura inmediata</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => showFeedback('Pase guardado en tu dispositivo')}
          className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium text-white"
        >
          Guardar en billetera
        </button>
        <button
          onClick={() => showFeedback('Enlace de credencial copiado')}
          className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium text-white"
        >
          Compartir
        </button>
      </div>
    </div>
  );
}