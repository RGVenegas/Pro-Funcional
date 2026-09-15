import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { getOfflineQueue, isOnline } from '../data/offlineQueue';
import { syncAndRefresh } from '../data/api';

export const OfflineStatusBanner: React.FC = () => {
  const [online, setOnline] = useState<boolean>(isOnline());
  const [queueCount, setQueueCount] = useState<number>(() => getOfflineQueue().length);
  const [syncedMessage, setSyncedMessage] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<'idle' | 'evaluating' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wasOfflineRef = useRef<boolean>(!isOnline() || getOfflineQueue().length > 0);

  const showTemporarySuccess = (msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSyncedMessage(msg);
    setErrorMessage(null);
    setSyncState('success');
    timerRef.current = setTimeout(() => {
      setSyncedMessage(null);
      setSyncState('idle');
    }, 4000);
  };

  useEffect(() => {
    const updateQueue = () => {
      setQueueCount(getOfflineQueue().length);
    };

    const handleOffline = () => {
      wasOfflineRef.current = true;
      setOnline(false);
      setSyncedMessage(null);
      setSyncState('idle');
      updateQueue();
    };

    const handleOnline = () => {
      setOnline(true);
      updateQueue();
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        showTemporarySuccess('Conexión exitosa con Supabase — Todos los datos están al día');
      }
    };

    const handleSynced = () => {
      updateQueue();
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        showTemporarySuccess('Conexión exitosa con Supabase — Sincronización completada');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('profuncional-network-offline', handleOffline);
    window.addEventListener('profuncional-network-online', handleOnline);
    window.addEventListener('profuncional-queue-updated', updateQueue);
    window.addEventListener('profuncional-queue-synced', handleSynced);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('profuncional-network-offline', handleOffline);
      window.removeEventListener('profuncional-network-online', handleOnline);
      window.removeEventListener('profuncional-queue-updated', updateQueue);
      window.removeEventListener('profuncional-queue-synced', handleSynced);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleManualSync = async () => {
    setSyncState('evaluating');
    setErrorMessage(null);
    try {
      await syncAndRefresh();
      setOnline(true);
      setQueueCount(0);
      showTemporarySuccess('Conexión exitosa con Supabase — Sincronización completada');
    } catch (e) {
      setOnline(false);
      setSyncState('failed');
      setErrorMessage('❌ Conexión fallida — El servidor backend no responde. Guardando cambios localmente.');
    }
  };

  if (online && queueCount === 0 && !syncedMessage && syncState === 'idle') {
    return null;
  }

  return (
    <div className="w-full bg-[#0b1726] border-b border-white/10 px-4 py-2.5 text-xs font-medium text-white transition-all flex items-center justify-between shadow-lg z-50 animate-fadeIn">
      {syncState === 'evaluating' ? (
        <div className="flex items-center space-x-2 text-sky-300">
          <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
          <span>
            <strong>Evaluando conexión con Supabase...</strong> Verificando disponibilidad del backend
          </span>
        </div>
      ) : syncState === 'failed' || errorMessage ? (
        <div className="flex items-center space-x-2 text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse flex-shrink-0" />
          <span>
            <strong>Conexión fallida</strong> — El servidor backend no responde. Guardando cambios localmente{' '}
            {queueCount > 0 && `(${queueCount} ${queueCount === 1 ? 'operación pendiente' : 'operaciones pendientes'})`}
          </span>
        </div>
      ) : !online ? (
        <div className="flex items-center space-x-2 text-amber-400">
          <WifiOff className="w-4 h-4 animate-pulse text-amber-400 flex-shrink-0" />
          <span>
            <strong>Se perdió la conexión con Supabase</strong> — Operando en Modo Offline{' '}
            {queueCount > 0 && `(${queueCount} ${queueCount === 1 ? 'operación pendiente' : 'operaciones pendientes'})`}
          </span>
        </div>
      ) : syncedMessage ? (
        <div className="flex items-center space-x-2 text-[#00E676]">
          <CheckCircle2 className="w-4 h-4 text-[#00E676] flex-shrink-0" />
          <span className="font-semibold">{syncedMessage}</span>
        </div>
      ) : queueCount > 0 ? (
        <div className="flex items-center space-x-2 text-sky-400">
          <Wifi className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span>
            {queueCount} {queueCount === 1 ? 'operación pendiente' : 'operaciones pendientes'} por sincronizar con Supabase
          </span>
        </div>
      ) : null}

      {(queueCount > 0 || !online || syncState === 'failed') && syncState !== 'evaluating' && (
        <button
          onClick={handleManualSync}
          className="flex items-center space-x-1.5 bg-[#00E676]/20 hover:bg-[#00E676]/30 text-[#00E676] border border-[#00E676]/40 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sincronizar ahora</span>
        </button>
      )}
    </div>
  );
};
