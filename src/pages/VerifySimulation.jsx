import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { useHistory } from '../context/HistoryContext.jsx'
import { formatCurrency } from '../lib/currency.js'

export default function VerifySimulation() {
  const { id } = useParams()
  const { loading: authLoading, isAuthenticated, user } = useAuth()
  const { items, loading: historyLoading, error } = useHistory()

  const item = useMemo(() => items.find((x) => String(x.id) === String(id)), [items, id])

  if (authLoading || historyLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'client') {
    return <Navigate to="/login?role=client" replace />
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Verificación de simulación</h1>
          <p className="mt-1 text-sm text-slate-600">
            Confirma los datos básicos usando el código de verificación.
          </p>
        </div>
        <Link
          to="/cliente/historial"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
        >
          Ver historial
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Código</p>
        <p className="mt-2 font-mono text-sm text-slate-800">{id}</p>
        <p className="mt-1 text-xs text-slate-500">
          Este código identifica una simulación guardada en tu historial.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm ring-1 ring-slate-900/5">
          No se pudo cargar el historial. Intenta nuevamente.
        </div>
      )}

      {item ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resumen</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Fecha</dt>
              <dd className="font-medium text-slate-900">{new Date(item.fecha).toLocaleString('es-EC')}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Producto</dt>
              <dd className="font-medium text-slate-900">{item.tipoCredito}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Monto</dt>
              <dd className="font-medium text-slate-900 tabular-nums">{formatCurrency(item.monto)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Total a pagar</dt>
              <dd className="font-medium text-slate-900 tabular-nums">{formatCurrency(item.totalPagar)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Método</dt>
              <dd className="font-medium text-slate-900">{item.metodo === 'frances' ? 'Francés' : 'Alemán'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Estado</dt>
              <dd className="font-medium text-slate-900">{item.estado}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm ring-1 ring-slate-900/5">
          No encontramos esta simulación en tu historial. Asegúrate de haber presionado “Guardar en historial” al generar
          la simulación.
        </div>
      )}
    </motion.div>
  )
}

