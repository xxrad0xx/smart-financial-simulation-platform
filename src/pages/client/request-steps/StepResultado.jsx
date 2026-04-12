import { useEffect } from 'react'
import { useRequest } from '../../../context/RequestContext.jsx'
import { api } from '../../../lib/api.js'

export default function StepResultado() {
  const ctx = useRequest()
  const { setStep, updateFields, resetRequest } = ctx
  const requestId = ctx.existingRequestId || ctx.requestId

  useEffect(() => {
    if (!requestId) return
    api.getRequest(requestId).then((data) => {
      if (data) updateFields({ estado: data.estado, notasAsesor: data.notasAsesor || '' })
    }).catch(() => {})
  }, [requestId])

  // If not a final state, go back to review
  if (!['Aprobado', 'Rechazado'].includes(ctx.estado)) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-slate-600">Su solicitud aún no tiene un resultado final.</p>
        <button type="button" className="mt-4 rounded-lg border px-4 py-2 text-sm" onClick={() => setStep(8)}>Ver estado</button>
      </div>
    )
  }

  const isApproved = ctx.estado === 'Aprobado'

  return (
    <div className="space-y-5 py-8 text-center">
      <div className="text-5xl">{isApproved ? '✅' : '❌'}</div>
      <h2 className="text-xl font-semibold" style={{ color: isApproved ? '#166534' : '#991b1b' }}>
        Solicitud {isApproved ? 'aprobada' : 'rechazada'}
      </h2>
      <p className="mx-auto max-w-md text-sm text-slate-600">
        {isApproved
          ? 'Su crédito ha sido aprobado. Un asesor se comunicará con usted para los siguientes pasos.'
          : 'Lamentablemente su solicitud no fue aprobada en esta ocasión.'}
      </p>

      {ctx.notasAsesor && (
        <div className={['mx-auto max-w-md rounded-xl border p-4 text-left text-sm', isApproved ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'].join(' ')}>
          <p className="font-medium" style={{ color: isApproved ? '#166534' : '#991b1b' }}>
            {isApproved ? 'Notas del asesor:' : 'Motivo:'}
          </p>
          <p className="mt-1" style={{ color: isApproved ? '#15803d' : '#dc2626' }}>"{ctx.notasAsesor}"</p>
        </div>
      )}

      <button type="button" className="rounded-lg px-5 py-2 text-sm font-medium text-white" style={{ backgroundColor: 'var(--sfici-primary)' }} onClick={resetRequest}>
        Nueva solicitud
      </button>
    </div>
  )
}
