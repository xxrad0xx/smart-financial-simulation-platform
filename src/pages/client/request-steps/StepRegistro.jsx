import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useRequest } from '../../../context/RequestContext.jsx'
import { api } from '../../../lib/api.js'

export default function StepRegistro() {
  const { user } = useAuth()
  const { updateField, updateFields, setStep } = useRequest()
  const [checking, setChecking] = useState(false)

  const handleNext = async () => {
    if (!user?.cedula) return
    setChecking(true)
    try {
      // Pre-fill request context with user data
      updateFields({
        cedula: user.cedula,
        email: user.email,
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        telefono: user.telefono || '',
        fechaNacimiento: user.fechaNacimiento || '',
        direccion: user.direccion || '',
        ciudadResidencia: user.ciudadResidencia || '',
        estadoCivil: user.estadoCivil || '',
        empresa: user.empresa || '',
        antiguedadLaboral: user.antiguedadLaboral || '',
        ingresosMensuales: user.ingresosMensuales || 0,
        egresosMensuales: user.egresosMensuales || 0,
      })

      // Check for existing active requests
      const existing = await api.getRequestsByCedula(user.cedula)
      const active = existing.find((r) => !['Aprobado', 'Rechazado'].includes(r.estado))
      if (active) {
        const goToStatus = confirm(
          `Ya tiene una solicitud activa (${active.estado}). ¿Desea ver su estado?`,
        )
        if (goToStatus) {
          updateFields({
            existingRequestId: active.id,
            requestId: active.id,
            estado: active.estado,
            notasAsesor: active.notasAsesor || '',
            productoNombre: active.productoNombre,
            monto: active.monto,
          })
          setStep(8)
          return
        }
      }
      updateField('requestId', crypto.randomUUID())
      setStep(2)
    } catch {
      updateField('requestId', crypto.randomUUID())
      setStep(2)
    } finally {
      setChecking(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Confirmación de datos</h2>
        <p className="mt-1 text-sm text-slate-600">
          Verifique sus datos antes de iniciar la solicitud. La información se obtiene de su cuenta registrada.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Cédula</span>
            <p className="text-sm font-medium text-slate-900">{user.cedula}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Email</span>
            <p className="text-sm font-medium text-slate-900">{user.email}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Nombres</span>
            <p className="text-sm font-medium text-slate-900">{user.nombres || '—'}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Apellidos</span>
            <p className="text-sm font-medium text-slate-900">{user.apellidos || '—'}</p>
          </div>
          {user.telefono && (
            <div>
              <span className="text-xs font-medium uppercase text-slate-500">Teléfono</span>
              <p className="text-sm font-medium text-slate-900">{user.telefono}</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Si sus datos son incorrectos, puede actualizarlos en la siguiente pantalla de datos personales.
      </p>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={checking}
          className="rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: 'var(--sfici-primary)' }}
          onClick={handleNext}
        >
          {checking ? 'Verificando...' : 'Confirmar y continuar'}
        </button>
      </div>
    </div>
  )
}
