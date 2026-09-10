const env = (import.meta as any).env || {};
export const apiEnabled = Boolean(env.VITE_API_URL);
const base = String(env.VITE_API_URL || '').replace(/\/$/, '');
let token = typeof sessionStorage === 'undefined' ? '' : sessionStorage.getItem('profuncional-token') || '';
export let serverSnapshot: any = { members: [], bookings: [], blocks: [], activities: [], rewards: [] };
export function setToken(value: string) {
  token = value;
  if (value) sessionStorage.setItem('profuncional-token', value);
  else { sessionStorage.removeItem('profuncional-token'); serverSnapshot = { members: [], bookings: [], blocks: [], activities: [], rewards: [] }; }
}
export function hasToken() { return Boolean(token); }
export async function request(path: string, method = 'GET', body?: unknown) {
  const response = await fetch(`${base}${path}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) { setToken(''); window.dispatchEvent(new Event('profuncional-session-expired')); }
    throw new Error(Array.isArray(data.message) ? data.message.join('. ') : data.message || 'No se pudo completar la solicitud.');
  }
  return data;
}
let refreshing: Promise<void> | undefined;
export async function refreshServer() {
  if (!apiEnabled || !token) return;
  if (refreshing) return refreshing;
  refreshing = (async () => {
    serverSnapshot = await request('/workspace');
    for (const name of ['members', 'schedule', 'bookings', 'activity', 'care']) window.dispatchEvent(new Event(`profuncional-${name}-changed`));
  })();
  try { await refreshing; } finally { refreshing = undefined; }
}
