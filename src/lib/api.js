function getBaseUrl() {
  const raw = import.meta.env.VITE_API_URL
  if (!raw) return ''
  return String(raw).replace(/\/+$/, '')
}

async function request(path, { method = 'GET', body } = {}) {
  const url = `${getBaseUrl()}${path}`
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let payload
    try {
      payload = await res.json()
    } catch {
      payload = { error: await res.text() }
    }
    const msg = payload?.error || `Request failed (${res.status})`
    const err = new Error(msg)
    err.status = res.status
    err.payload = payload
    throw err
  }
  return await res.json()
}

export const api = {
  health: () => request('/api/health'),

  getCatalog: () => request('/api/catalog'),
  putCatalog: (catalog) => request('/api/catalog', { method: 'PUT', body: catalog }),

  getInstitutionProfile: () => request('/api/institution/profile'),
  putInstitutionProfile: (profile) =>
    request('/api/institution/profile', { method: 'PUT', body: profile }),

  listHistory: (limit = 200) => request(`/api/history?limit=${encodeURIComponent(limit)}`),
  addHistory: (entry) => request('/api/history', { method: 'POST', body: entry }),
  patchHistoryStatus: (id, estado) =>
    request(`/api/history/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: { estado },
    }),
}

