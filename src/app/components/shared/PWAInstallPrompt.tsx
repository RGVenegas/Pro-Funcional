import React, { useState, useEffect } from 'react';
import { Download, Share2, X, Smartphone, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Detectar si ya está instalada / abierta como standalone
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(Boolean(isStandaloneMode));

    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isAppleDevice);

    // Revisar si fue descartado recientemente (últimas 24 horas)
    const lastDismissed = localStorage.getItem('profuncional-pwa-dismissed');
    if (lastDismissed) {
      const elapsed = Date.now() - parseInt(lastDismissed, 10);
      if (elapsed < 24 * 60 * 60 * 1000) {
        setDismissed(true);
      }
    }

    // Escuchar evento de instalación estándar
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setDeferredPrompt(null);
      setTimeout(() => setDismissed(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledSuccess(true);
        setTimeout(() => setDismissed(true), 3000);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('profuncional-pwa-dismissed', Date.now().toString());
  };

  // Si ya está abierta como app o el usuario lo descartó, no mostramos nada
  if (isStandalone || dismissed) {
    return null;
  }

  // Si no hay evento ni es iOS, o ya se instaló
  if (!deferredPrompt && !isIOS && !installedSuccess) {
    return null;
  }

  return (
    <>
      <div 
        role="region"
        aria-label="Instalación de Aplicación Móvil"
        className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <div className="relative rounded-2xl bg-[#030f1d]/95 border border-[#00E676]/30 p-4 shadow-2xl backdrop-blur-xl text-white">
          <button
            onClick={handleDismiss}
            aria-label="Cerrar aviso de instalación"
            className="absolute top-2.5 right-2.5 text-white/50 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-[#010A01] border border-white/10 flex items-center justify-center p-1.5 flex-shrink-0 shadow-inner">
              <img src="/favicon.png" alt="Icono ProFuncional" className="h-full w-full object-contain" />
            </div>

            <div className="flex-1 pr-6">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00E676]">App Móvil</span>
                <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded-full font-medium">Oficial</span>
              </div>
              <h4 className="text-sm font-black text-white mt-0.5">Instalar ProFuncional</h4>
              <p className="text-xs text-white/70 mt-0.5 leading-snug">
                Accede en 1 toque a tus horas, ficha de evolución y credencial QR sin abrir el navegador.
              </p>

              {installedSuccess ? (
                <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-[#00E676]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Aplicación instalada con éxito!</span>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00E676] hover:bg-[#00E676]/90 text-black font-extrabold text-xs shadow-lg shadow-[#00E676]/20 transition-all active:scale-95"
                  >
                    {isIOS ? <Share2 className="w-3.5 h-3.5 text-black" /> : <Download className="w-3.5 h-3.5 text-black" />}
                    <span>{isIOS ? 'Cómo Instalar en iPhone' : 'Instalar en Celular'}</span>
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-2 text-xs font-medium text-white/60 hover:text-white transition-colors"
                  >
                    Ahora no
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Guía para iPhone / Safari */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#030f1d] border border-white/20 p-6 text-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#00E676]" />
                <h3 className="font-black text-base">Instalar en iPhone (iOS)</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-white/50 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-white/70 mt-3 leading-relaxed">
              Sigue estos 2 sencillos pasos en Safari para agregar la app a tu pantalla de inicio:
            </p>

            <ol className="mt-4 space-y-3 text-xs text-white/90">
              <li className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00E676]/20 text-[#00E676] font-black flex items-center justify-center text-xs">1</span>
                <div>
                  Toca el botón <span className="font-bold text-white">Compartir</span> de Safari (ícono con un cuadrado y flecha hacia arriba <Share2 className="inline w-3.5 h-3.5 text-[#00E676] mx-0.5" />).
                </div>
              </li>
              <li className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00E676]/20 text-[#00E676] font-black flex items-center justify-center text-xs">2</span>
                <div>
                  Desplaza hacia abajo y selecciona <span className="font-bold text-[#00E676]">"Agregar a pantalla de inicio"</span>.
                </div>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#00E676] text-black font-extrabold text-xs shadow-lg shadow-[#00E676]/20"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
