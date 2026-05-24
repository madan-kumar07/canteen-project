const HOST = window.location.hostname;
const BASE = import.meta.env.VITE_API_URL || `http://${HOST}:5000/api`;

async function req(path, opts = {}, retries = 2) {
  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      signal: ctrl.signal,
      ...opts,
    });
    clearTimeout(tid);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || `Request failed (${res.status})`);
    }
    return res.json();
  } catch (e) {
    clearTimeout(tid);
    if (retries > 0 && e.name !== 'AbortError') {
      await new Promise(r => setTimeout(r, 600));
      return req(path, opts, retries - 1);
    }
    throw e;
  }
}

/* ── Auth ── */
export const apiLogin       = (u, p)          => req('/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) });

/* ── Menu ── */
export const apiGetMenu     = ()              => req('/menu');
export const apiAddItem     = (item)          => req('/menu', { method: 'POST', body: JSON.stringify(item) });
export const apiDeleteItem  = (id)            => req(`/menu/${id}`, { method: 'DELETE' });
export const apiToggleAvail = (id)            => req(`/menu/${id}/toggle`, { method: 'PUT' });
export const apiUpdatePrice = (id, price)     => req(`/menu/${id}/price`, { method: 'PUT', body: JSON.stringify({ price }) });
export const apiUpdateItem  = (id, data)      => req(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(data) });

/* ── Orders ── */
export const apiGetOrders     = ()            => req('/orders');
export const apiGetOrder      = (id)          => req(`/orders/${id}`);
export const apiPlaceOrder    = (data)        => req('/orders', { method: 'POST', body: JSON.stringify(data) });
export const apiUpdateStatus  = (id, status)  => req(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
export const apiCancelOrder   = (id)          => req(`/orders/${id}/cancel`, { method: 'POST' });
export const apiVerifyOrder   = (id)          => req(`/orders/${id}/verify`, { method: 'POST' });
export const apiRateOrder     = (id, ratings) => req(`/orders/${id}/rate`, { method: 'POST', body: JSON.stringify({ ratings }) });

/* ── Analytics ── */
export const apiGetAnalytics  = ()            => req('/analytics');
export const apiGetReport     = ()            => req('/admin/report');
export const apiGetDbStats    = ()            => req('/admin/db-stats');
export const apiGetQueue      = ()            => req('/queue');
export const apiGetAdvanced   = ()            => req('/analytics/advanced');

/* ── Admin ── */
export const apiClearCompleted = ()           => req('/admin/clear-completed', { method: 'DELETE' });
export const apiResetOrders    = ()           => req('/admin/reset-orders',    { method: 'DELETE' });
export const apiGetInventory   = ()           => req('/admin/inventory');
export const apiUpdateStock    = (id, qty)    => req(`/admin/inventory/${id}`, { method: 'PUT', body: JSON.stringify({ stock: qty }) });
export const apiGetScanLogs    = ()           => req('/admin/scan-logs');

/* ── Payment ── */
export const apiCreatePayment = (amount)      => req('/payment/create-order', { method: 'POST', body: JSON.stringify({ amount }) });
export const apiVerifyPayment = (data)        => req('/payment/verify', { method: 'POST', body: JSON.stringify(data) });

/* ── AI ── */
export const apiRecommend     = (cart)        => req('/ai/recommend', { method: 'POST', body: JSON.stringify({ cart }) });
