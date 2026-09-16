import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { getOfflineQueue, isOnline } from '../data/offlineQueue';
import { testBackendConnection } from '../data/api';

export const OfflineStatusBanner: React.FC = () => {
  const [online, setOnline] = useState<boolean>(isOnline());
  const [queueCount, setQueueCount] = useState<number>(() => getOfflineQueue().length);
  const [syncedMessage, setSyncedMessage] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<'idle' | 'evaluating' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const evalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasOfflineRef = useRef<boolean>(!isOnline());

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
      if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
      setOnline(false);
      setSyncedMessage(null);
      setSyncState('failed');
      setErrorMessage('Se perdió la conexión con Supabase — Operando en Modo Offline');
      updateQueue();
    };

    const handleOnline = () => {
      updateQueue();
      if (wasOfflineRef.current || !online) {
        wasOfflineRef.current = false;
        setSyncState('evaluating');
        if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
        evalTimerRef.current = setTimeout(() => {
          setOnline(true);
          setErrorMessage(null);
          showTemporarySuccess('Conexión exitosa con Supabase — Todos los datos están al día');
        }, 1200);
      } else {
        setOnline(true);
        setErrorMessage(null);
        setSyncState('idle');
      }
    };

    const handleSynced = () => {
      updateQueue();
      handleOnline();
    };

    // Initial health check on mount
    void (async () => {
      const alive = await testBackendConnection();
      setOnline(alive);
      if (!alive) {
        wasOfflineRef.current = true;
        setSyncState('failed');
        setErrorMessage('Se perdió la conexión con Supabase — Operando en Modo Offline');
      }
    })();

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
      if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
    };
  }, []);

  // Hide banner completely when online, no pending operations, and no active message/evaluation
  if (online && queueCount === 0 && !syncedMessage && syncState === 'idle') {
    return null;
  }

  return (
    <div
      className={`w-full border-b px-4 py-2.5 text-xs font-medium transition-all flex items-center justify-between shadow-lg z-50 animate-fadeIn ${
        !online || syncState === 'failed'
          ? 'bg-amber-950/90 border-amber-500/40 text-amber-200'
          : syncState === 'evaluating'
          ? 'bg-sky-950/90 border-sky-500/40 text-sky-200'
          : 'bg-[#0b1726] border-white/10 text-white'
      }`}
    >
      {syncState === 'evaluating' ? (
        <div className="flex items-center space-x-2 text-sky-300">
          <Loader2 className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
          <span>
            <strong>Evaluando conexión con Supabase...</strong> Verificando disponibilidad del backend
          </span>
        </div>
      ) : !online || syncState === 'failed' ? (
        <div className="flex items-center space-x-2 text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
          <span>
            <strong>{errorMessage || 'Se perdió la conexión con Supabase — Operando en Modo Offline'}</strong>
            {queueCount > 0 && ` (${queueCount} ${queueCount === 1 ? 'operación pendiente' : 'operaciones pendientes'})`}
          </span>
        </div>
      ) : syncedMessage ? (
        <div className="flex items-center space-x-2 text-[#00E676]">
          <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
          <span className="font-semibold">{syncedMessage}</span>
        </div>
      ) : queueCount > 0 ? (
        <div className="flex items-center space-x-2 text-sky-400">
          <Wifi className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            {queueCount} {queueCount === 1 ? 'operación pendiente' : 'operaciones pendientes'} por sincronizar con Supabase
          </span>
        </div>
      ) : null}
    </div>
  );
};
