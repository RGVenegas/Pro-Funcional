import { processOfflineQueue, isOnline, getOfflineQueue, clearOfflineQueue } from './offlineQueue';

const env = (import.meta as any).env || {};
export const apiEnabled = true;
const base = String(env.VITE_API_URL || '/api').replace(/\/$/, '');
let token = typeof sessionStorage === 'undefined' ? '' : sessionStorage.getItem('profuncional-token') || '';
export let serverSnapshot: any = { members: [], bookings: [], blocks: [], activities: [], rewards: [] };

// BroadcastChannel para sincronización en tiempo real entre pestañas abiertas
const crossTabChannel = typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('profuncional-cross-tab-sync')
  : null;

if (crossTabChannel) {
  crossTabChannel.onmessage = (event) => {
    if (event.data === 'refresh-snapshot' && token && apiEnabled) {
      void refreshServer(false);
    }
  };
}

export function broadcastCrossTabRefresh() {
  if (crossTabChannel) {
    try {
      crossTabChannel.postMessage('refresh-snapshot');
    } catch {
      // ignore channel errors
    }
  }
}

export function setToken(value: string) {
  token = value;
  if (value) sessionStorage.setItem('profuncional-token', value);
  else { sessionStorage.removeItem('profuncional-token'); serverSnapshot = { members: [], bookings: [], blocks: [], activities: [], rewards: [] }; }
}

export function hasToken() { return Boolean(token); }

export async function request(path: string, method = 'GET', body?: unknown) {
  if (!isOnline()) {
    window.dispatchEvent(new Event('profuncional-network-offline'));
    throw new TypeError('Failed to fetch (offline)');
  }
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(method !== 'GET' ? { 'Idempotency-Key': crypto.randomUUID() } : {}),
    };
    const response = await fetch(`${base}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok && response.status >= 502 && response.status <= 504) {
      window.dispatchEvent(new Event('profuncional-network-offline'));
      throw new Error('Servidor backend no disponible.');
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) { setToken(''); window.dispatchEvent(new Event('profuncional-session-expired')); }
      throw new Error(Array.isArray(data.message) ? data.message.join('. ') : data.message || 'No se pudo completar la solicitud.');
    }
    return data;
  } catch (err) {
    if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('offline') || err.message.includes('Failed'))) {
      window.dispatchEvent(new Event('profuncional-network-offline'));
    }
    throw err;
  }
}

let refreshing: Promise<void> | undefined;

export async function testBackendConnection(): Promise<boolean> {
  if (!apiEnabled) return false;
  try {
    const res = await fetch(`${base}/auth/me`, { method: 'GET' });
    if (res.status !== 200 && res.status !== 401) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function syncAndRefresh(): Promise<{ success: boolean; message: string }> {
  if (apiEnabled) {
    const isAlive = await testBackendConnection();
    if (!isAlive) {
      window.dispatchEvent(new Event('profuncional-network-offline'));
      throw new Error('Servidor backend no disponible.');
    }
  }

  const queue = getOfflineQueue();
  if (queue.length > 0) {
    if (apiEnabled) {
      try {
        await processOfflineQueue(request);
      } catch (e) {
        console.warn('Network queue sync attempt skipped/failed:', e);
      }
    }
    clearOfflineQueue();
  }

  if (apiEnabled && token) {
    await refreshServer();
  }

  window.dispatchEvent(new Event('profuncional-network-online'));
  window.dispatchEvent(new Event('profuncional-queue-synced'));
  return { success: true, message: 'Conexión exitosa con Supabase' };
}


export async function refreshServer(broadcastOtherTabs = true) {
  if (!apiEnabled || !token) return;
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      serverSnapshot = await request('/workspace');
      for (const name of ['members', 'schedule', 'bookings', 'activity', 'care']) window.dispatchEvent(new Event(`profuncional-${name}-changed`));
      if (broadcastOtherTabs) {
        broadcastCrossTabRefresh();
      }
    } catch (e) {
      console.warn('Could not refresh server snapshot (offline mode):', e);
    }
  })();
  try { await refreshing; } finally { refreshing = undefined; }
}

let lastKnownOnlineStatus: boolean | null = null;

if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && apiEnabled && token) {
      void refreshServer(false);
    }
  });

  window.addEventListener('online', () => {
    if (lastKnownOnlineStatus !== true) {
      lastKnownOnlineStatus = true;
      window.dispatchEvent(new Event('profuncional-network-online'));
      void syncAndRefresh();
    }
  });

  window.addEventListener('offline', () => {
    if (lastKnownOnlineStatus !== false) {
      lastKnownOnlineStatus = false;
      window.dispatchEvent(new Event('profuncional-network-offline'));
    }
  });

  if (apiEnabled) {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${base}/auth/me`, { method: 'GET' });
        if (res.status !== 200 && res.status !== 401) {
          throw new Error('Backend server is down');
        }
        if (lastKnownOnlineStatus !== true) {
          lastKnownOnlineStatus = true;
          window.dispatchEvent(new Event('profuncional-network-online'));
        }
      } catch {
        if (lastKnownOnlineStatus !== false) {
          lastKnownOnlineStatus = false;
          window.dispatchEvent(new Event('profuncional-network-offline'));
        }
      }
    };
    void checkHealth();
    setInterval(checkHealth, 2000);
  }
}


