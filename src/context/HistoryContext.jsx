import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.js'

const HistoryContext = createContext(null)

export function HistoryProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    api
      .listHistory(200)
      .then((rows) => {
        if (!alive) return
        setItems(Array.isArray(rows) ? rows : [])
        setError(null)
      })
      .catch((e) => {
        if (!alive) return
        setError(e)
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const value = useMemo(
    () => ({
      items,
      loading,
      error,
      add: async (entry) => {
        const created = await api.addHistory(entry)
        setItems((prev) => [created, ...prev].slice(0, 200))
        setError(null)
        return created
      },
      updateStatus: async (id, estado) => {
        setItems((prev) => prev.map((x) => (x.id === id ? { ...x, estado } : x)))
        try {
          await api.patchHistoryStatus(id, estado)
          setError(null)
        } catch (e) {
          setError(e)
          // best-effort refresh to reconcile
          const rows = await api.listHistory(200)
          setItems(Array.isArray(rows) ? rows : [])
          throw e
        }
      },
    }),
    [items, loading, error],
  )

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
}

export function useHistory() {
  const ctx = useContext(HistoryContext)
  if (!ctx) throw new Error('useHistory dentro de HistoryProvider')
  return ctx
}
