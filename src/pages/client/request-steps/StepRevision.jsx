import { useEffect, useState } from 'react'
import { useRequest } from '../../../context/RequestContext.jsx'
import { api } from '../../../lib/api.js'
import { formatCurrency } from '../../../lib/currency.js'

const estadoBadge = {
  Pendiente: 'bg-amber-100 text-amber-800',
  Observacion: 'bg-orange-100 text-orange-800',
  'En revision': 'bg-blue-100 text-blue-800',
}

export default function StepRevision() {
  const ctx = useRequest()
  const { setStep, updateFields } = ctx
  const [refreshing, setRefreshing] = useState(false)

  const requestId = ctx.existingRequestId || ctx.requestId

  useEffect(() => {
    if (!requestId) return
    let cancelled = false

    const fetchStatus = async () => {
      setRefreshing(true)
      try {
        const data = await api.getRequest(requestId)
        if (!cancelled && data) {
          updateFields({ estado: data.estado, notasAsesor: data.notasAsesor || '' })
          if (['Aprobado', 'Rechazado'].includes(data.estado)) {
            setStep(9)
          }
        }
      } catch { /* ignore */ }
      if (!cancelled) setRefreshing(false)
    }

    fetchStatus()
    return () => { cancelled = true }
  }, [requestId, setStep, updateFields])

  const refreshStatus = async () => {
    if (!requestId) return
    setRefreshing(true)
    try {
      const data = await api.getRequest(requestId)
      if (data) {
        updateFields({ estado: data.estado, notasAsesor: data.notasAsesor || '' })
        if (['Aprobado', 'Rechazado'].includes(data.estado)) {
          setStep(9)
        }
      }
    } catch { /* ignore */ }
    setRefreshing(false)
  }

  const badgeClass = estadoBadge[ctx.estado] || 'bg-slate-100 text-slate-700'

  return (
    <div className="space-y-5 py-8 text-center">
      <div className="text-5xl">⏳</div>
      <h2 className="text-xl font-semibold text-slate-900">Solicitud en revisión</h2>
      <p className="mx-auto max-w-md text-sm text-slate-600">
        Su solicitud ha sido recibida y se encuentra en cola de revisión por un asesor de la institución.
      </p>

      <div className="mx-auto max-w-sm rounded-xl bg-slate-50 p-4 text-left text-sm">
        <div><strong>Solicitud:</strong> {requestId ? `#${requestId.slice(0, 8)}` : '—'}</div>
        <div><strong>Producto:</strong> {ctx.productoNombre || '—'}</div>
        <div><strong>Monto:</strong> {formatCurrency(ctx.monto)}</div>
        <div className="flex items-center gap-2">
          <strong>Estado:</strong>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>{ctx.estado}</span>
        </div>
      </div>

      <button type="button" disabled={refreshing} className="rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:opacity-50" onClick={refreshStatus}>
        {refreshing ? 'Consultando...' : 'Actualizar estado'}
      </button>
    </div>
  )
}
