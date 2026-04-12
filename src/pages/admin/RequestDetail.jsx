import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../../lib/api.js'
import { formatCurrency } from '../../lib/currency.js'
import { useToast } from '../../components/ui/Toast.jsx'

const ESTADOS = ['Pendiente', 'Observacion', 'En revision', 'Aprobado', 'Rechazado']

export default function RequestDetail() {
  const { id } = useParams()
  const toast = useToast()
  const [req, setReq] = useState(null)
  const [loading, setLoading] = useState(true)
  const [estado, setEstado] = useState('')
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)
  const [docModal, setDocModal] = useState(null)

  useEffect(() => {
    api.getRequest(id).then((data) => {
      setReq(data)
      setEstado(data?.estado || '')
      setNotas(data?.notasAsesor || '')
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await api.reviewRequest(id, { estado, notasAsesor: notas })
      setReq(updated)
      toast('Decisión guardada correctamente', 'success')
    } catch {
      toast('Error al guardar la decisión', 'error')
    }
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" /></div>
  if (!req) return <p className="text-sm text-slate-600">Solicitud no encontrada.</p>

  const score = req.biometriaScore != null ? Math.round(req.biometriaScore * 100) : null
  const nivelSimilitud = score == null ? null : score >= 45 ? 'Muy alto' : score >= 40 ? 'Alto' : score >= 33 ? 'Medio' : score >= 20 ? 'Bajo' : 'Muy bajo'
  const capacidad = req.ingresosMensuales - req.egresosMensuales
  const relacionCuota = req.ingresosMensuales > 0 ? ((req.cuotaMensual / req.ingresosMensuales) * 100).toFixed(1) : 0

  const documentos = [
    { label: 'Cédula frontal', data: req.docCedulaFrontal },
    { label: 'Cédula trasera', data: req.docCedulaTrasera },
    { label: 'Selfie del cliente', data: req.selfieBase64 },
    { label: 'Comprobante de ingresos', data: req.docComprobanteIngresos },
    { label: 'Planilla de servicios', data: req.docPlanillaServicios },
    { label: 'Declaración de impuestos', data: req.docDeclaracionImpuestos },
  ].filter((d) => d.data)

  const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400'

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/solicitudes" className="text-sm text-sky-600 hover:underline">← Solicitudes</Link>
        <h1 className="text-2xl font-semibold text-slate-900">Detalle de solicitud</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-5">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Datos del cliente</h3>
            <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm space-y-1">
              <div><strong>Nombres:</strong> {req.nombres} {req.apellidos}</div>
              <div><strong>Cédula:</strong> {req.cedula}</div>
              <div><strong>Email:</strong> {req.email}</div>
              <div><strong>Teléfono:</strong> {req.telefono}</div>
              <div><strong>Dirección:</strong> {req.direccion}, {req.ciudadResidencia}</div>
              <div><strong>Estado civil:</strong> {req.estadoCivil}</div>
              <div><strong>Empresa:</strong> {req.empresa} ({req.antiguedadLaboral})</div>
              <div><strong>Ingresos:</strong> {formatCurrency(req.ingresosMensuales)}/mes</div>
              <div><strong>Egresos:</strong> {formatCurrency(req.egresosMensuales)}/mes</div>
              <div><strong>Capacidad de pago:</strong> {formatCurrency(capacidad)}/mes</div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Crédito solicitado</h3>
            <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm space-y-1">
              <div><strong>Producto:</strong> {req.productoNombre}</div>
              <div><strong>Monto:</strong> {formatCurrency(req.monto)}</div>
              <div><strong>Plazo:</strong> {req.plazoMeses} meses ({req.periodicidad})</div>
              <div><strong>Método:</strong> {req.metodoAmortizacion === 'frances' ? 'Francés' : 'Alemán'}</div>
              <div><strong>Cuota:</strong> {formatCurrency(req.cuotaMensual)}</div>
              <div><strong>Total a pagar:</strong> {formatCurrency(req.totalPagar)}</div>
              <div><strong>Relación cuota/ingreso:</strong> {relacionCuota}%</div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Validación biométrica</h3>
            <div className={['mt-2 rounded-xl border p-4', req.biometriaAprobada ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'].join(' ')}>
              <div className="flex items-center gap-3">
                {req.docCedulaFrontal && <img src={req.docCedulaFrontal} alt="Cédula" className="h-16 w-16 rounded-lg object-cover" />}
                {req.selfieBase64 && <img src={req.selfieBase64} alt="Selfie" className="h-16 w-16 rounded-full object-cover" />}
                <div className="text-sm">
                  <p className="font-semibold" style={{ color: req.biometriaAprobada ? '#166534' : '#9a3412' }}>
                    {req.biometriaAprobada ? '✓ Aprobado' : '⚠ Observación'}
                  </p>
                  {nivelSimilitud != null && <p style={{ color: req.biometriaAprobada ? '#15803d' : '#c2410c' }}>Coincidencia: {nivelSimilitud}</p>}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Documentos</h3>
            <div className="mt-2 space-y-2">
              {documentos.map((d) => (
                <div key={d.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span>{d.label}</span>
                  <button type="button" className="text-sky-600 hover:underline" onClick={() => setDocModal(d)}>Ver</button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Acción del asesor</h3>
            <div className="mt-2 space-y-3">
              <label className="block text-sm">
                <span className="text-slate-600">Cambiar estado</span>
                <select className={inputClass} value={estado} onChange={(e) => setEstado(e.target.value)}>
                  {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">Notas / observaciones</span>
                <textarea className={inputClass} rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ingrese observaciones para el cliente..." />
              </label>
              <button type="button" disabled={saving} className="rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: 'var(--sfici-primary)' }} onClick={handleSave}>
                {saving ? 'Guardando...' : 'Guardar decisión'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document modal */}
      {docModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setDocModal(null)}>
          <div className="max-h-[90vh] max-w-2xl overflow-auto rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium">{docModal.label}</h3>
              <button type="button" className="text-sm text-slate-500 hover:text-slate-800" onClick={() => setDocModal(null)}>Cerrar</button>
            </div>
            {docModal.data.startsWith('data:image') ? (
              <img src={docModal.data} alt={docModal.label} className="max-w-full rounded-lg" />
            ) : (
              <iframe src={docModal.data} title={docModal.label} className="h-[70vh] w-full rounded-lg" />
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
