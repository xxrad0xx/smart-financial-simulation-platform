import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext.jsx'
import { api } from '../../lib/api.js'
import { formatCurrency } from '../../lib/currency.js'

const estadoBadge = {
  Pendiente: 'bg-amber-100 text-amber-800',
  Observacion: 'bg-orange-100 text-orange-800',
  'En revision': 'bg-blue-100 text-blue-800',
  Aprobado: 'bg-green-100 text-green-800',
  Rechazado: 'bg-red-100 text-red-800',
}

export default function ClientRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.cedula) {
      Promise.resolve().then(() => setLoading(false))
      return
    }

    let cancelled = false
    const fetchRequests = async () => {
      try {
        const data = await api.getRequestsByCedula(user.cedula)
        if (!cancelled) setRequests(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setRequests([])
      }
      if (!cancelled) setLoading(false)
    }

    fetchRequests()
    return () => { cancelled = true }
  }, [user?.cedula])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Mis solicitudes</h1>
        <p className="mt-1 text-sm text-slate-600">
          Solicitudes de crédito asociadas a su cuenta ({user?.cedula || '—'}).
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
          <table className="min-w-full text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-slate-200/70 bg-gradient-to-b from-white via-slate-50/90 to-slate-50 text-slate-500 backdrop-blur">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Notas del asesor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests && requests.map((r) => (
                <tr
                  key={r.id}
                  className={[
                    'group transition-colors',
                    'odd:bg-white even:bg-slate-50/40',
                    'hover:bg-emerald-50/30',
                  ].join(' ')}
                >
                  <td className="px-4 py-3">{new Date(r.fechaCreacion).toLocaleDateString('es-EC')}</td>
                  <td className="px-4 py-3">{r.productoNombre}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-slate-800">{formatCurrency(r.monto)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${estadoBadge[r.estado] || 'bg-slate-100 text-slate-700'}`}>{r.estado}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{r.notasAsesor || '—'}</td>
                </tr>
              ))}
              {(!requests || requests.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">No se encontraron solicitudes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}
