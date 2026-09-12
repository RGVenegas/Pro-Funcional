import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getOfflineQueue, isOnline } from '../data/offlineQueue';
import { syncAndRefresh } from '../data/api';

export const OfflineStatusBanner: React.FC = () => {
  const [online, setOnline] = useState<boolean>(isOnline());
  const [queueCount, setQueueCount] = useState<number>(getOfflineQueue().length);
  const [syncedMessage, setSyncedMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);

  useEffect(() => {
    const updateQueue = () => {
      setQueueCount(getOfflineQueue().length);
    };

    const handleOffline = () => {
      setOnline(false);
      updateQueue();
    };

    const handleOnline = () => {
      setOnline(true);
      updateQueue();
    };

    const handleSynced = () => {
      updateQueue();
      setSyncedMessage('✅ Sincronizado con Supabase');
      setTimeout(() => setSyncedMessage(null), 4000);
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
    };
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await syncAndRefresh();
    } finally {
      setSyncing(false);
    }
  };

  if (online && queueCount === 0 && !syncedMessage) {
    return null;
  }

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs font-medium text-slate-200 transition-all flex items-center justify-between shadow-sm z-50">
      {!online ? (
        <div className="flex items-center space-x-2 text-amber-400">
          <WifiOff className="w-4 h-4 animate-pulse text-amber-400" />
          <span>
            <strong>Modo Offline</strong> — Guardando cambios localmente{' '}
            {queueCount > 0 && `(${queueCount} ${queueCount === 1 ? 'operación pendiente' : 'operaciones pendientes'})`}
          </span>
        </div>
      ) : queueCount > 0 ? (
        <div className="flex items-center space-x-2 text-sky-400">
          <Wifi className="w-4 h-4 text-sky-400" />
          <span>
            {queueCount} {queueCount === 1 ? 'operación pendiente' : 'operaciones pendientes'} de sincronizar con Supabase
          </span>
        </div>
      ) : syncedMessage ? (
        <div className="flex items-center space-x-2 text-emerald-400 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncedMessage}</span>
        </div>
      ) : null}

      {online && queueCount > 0 && (
        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="flex items-center space-x-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-md text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Sincronizando...' : 'Sincronizar ahora'}</span>
        </button>
      )}
    </div>
  );
};
