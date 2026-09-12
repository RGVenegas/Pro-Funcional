export interface QueuedMutation {
  id: string;
  timestamp: number;
  path: string;
  method: string;
  payload?: unknown;
  description: string;
}

const QUEUE_KEY = 'profuncional-offline-queue';

export function getOfflineQueue(): QueuedMutation[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOfflineQueue(queue: QueuedMutation[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new Event('profuncional-queue-updated'));
  } catch (e) {
    console.error('Error saving offline queue:', e);
  }
}

export function enqueueMutation(
  path: string,
  method: string,
  payload?: unknown,
  description?: string
): QueuedMutation {
  const queue = getOfflineQueue();
  const newItem: QueuedMutation = {
    id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    path,
    method,
    payload,
    description: description || `${method} ${path}`,
  };

  queue.push(newItem);
  saveOfflineQueue(queue);
  return newItem;
}

export function removeMutation(id: string): void {
  const queue = getOfflineQueue();
  const filtered = queue.filter((item) => item.id !== id);
  saveOfflineQueue(filtered);
}

export function clearOfflineQueue(): void {
  saveOfflineQueue([]);
}

let isProcessing = false;

export async function processOfflineQueue(
  requestFn: (path: string, method: string, body?: unknown) => Promise<unknown>
): Promise<{ syncedCount: number; errors: number }> {
  if (isProcessing) return { syncedCount: 0, errors: 0 };
  const queue = getOfflineQueue();
  if (queue.length === 0) return { syncedCount: 0, errors: 0 };

  isProcessing = true;
  let syncedCount = 0;
  let errors = 0;

  try {
    const itemsToProcess = [...queue];
    for (const item of itemsToProcess) {
      try {
        await requestFn(item.path, item.method, item.payload);
        removeMutation(item.id);
        syncedCount++;
      } catch (err) {
        console.warn(`Error processing queued mutation ${item.id}:`, err);
        errors++;
        // Stop processing further items to preserve strict dependency order if one fails
        break;
      }
    }
  } finally {
    isProcessing = false;
  }

  if (syncedCount > 0) {
    window.dispatchEvent(new Event('profuncional-queue-synced'));
  }

  return { syncedCount, errors };
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}
