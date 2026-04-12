import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../../lib/api.js'
import { formatCurrency } from '../../lib/currency.js'

const estadoBadge = {
  Pendiente: 'bg-amber-100 text-amber-800',
  Observacion: 'bg-orange-100 text-orange-800',
  'En revision': 'bg-blue-100 text-blue-800',
  Aprobado: 'bg-green-100 text-green-800',
  Rechazado: 'bg-red-100 text-red-800',
}

export default function RequestsAdmin() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getRequests(500).then((data) => {
      setRequests(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const metrics = useMemo(() => ({
    pendientes: requests.filter((r) => r.estado === 'Pendiente').length,
    enRevision: requests.filter((r) => r.estado === 'En revision').length,
    aprobadas: requests.filter((r) => r.estado === 'Aprobado').length,
    montoTotal: requests.reduce((s, r) => s + r.monto, 0),
  }), [requests])

  if (loading) {
    return <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" /></div>
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Solicitudes de crédito</h1>
        <p className="mt-1 text-sm text-slate-600">Gestión y revisión de solicitudes enviadas por clientes.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Pendientes', value: metrics.pendientes, color: '#f59e0b' },
          { label: 'En revisión', value: metrics.enRevision, color: '#3b82f6' },
          { label: 'Aprobadas', value: metrics.aprobadas, color: '#22c55e' },
          { label: 'Monto total', value: formatCurrency(metrics.montoTotal), color: '#64748b' },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <div className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
            <div className="mt-1 text-xs text-slate-500">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2">Cédula</th>
              <th className="px-3 py-2">Producto</th>
              <th className="px-3 py-2">Monto</th>
              <th className="px-3 py-2">Biometría</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const score = r.biometriaScore != null ? Math.round(r.biometriaScore * 100) : null
              const nivel = score == null ? null : score >= 45 ? 'Muy alto' : score >= 40 ? 'Alto' : score >= 33 ? 'Medio' : score >= 20 ? 'Bajo' : 'Muy bajo'
              return (
                <tr key={r.id} className="border-b border-slate-50">
                  <td className="px-3 py-2">{new Date(r.fechaCreacion).toLocaleDateString('es-EC')}</td>
                  <td className="px-3 py-2">{r.nombres} {r.apellidos}</td>
                  <td className="px-3 py-2">{r.cedula}</td>
                  <td className="px-3 py-2">{r.productoNombre}</td>
                  <td className="px-3 py-2">{formatCurrency(r.monto)}</td>
                  <td className="px-3 py-2">
                    {nivel != null ? (
                      <span style={{ color: r.biometriaAprobada ? '#22c55e' : '#f59e0b' }}>
                        {r.biometriaAprobada ? '✓' : '⚠'} {nivel}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${estadoBadge[r.estado] || 'bg-slate-100 text-slate-700'}`}>{r.estado}</span>
                  </td>
                  <td className="px-3 py-2">
                    <Link to={`/admin/solicitudes/${r.id}`} className="text-sky-600 hover:underline">Ver detalle</Link>
                  </td>
                </tr>
              )
            })}
            {requests.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-slate-400">No hay solicitudes registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
