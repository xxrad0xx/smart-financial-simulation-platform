import { lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RequestProvider, useRequest } from '../../context/RequestContext.jsx'

const StepRegistro = lazy(() => import('./request-steps/StepRegistro.jsx'))
const StepDatosPersonales = lazy(() => import('./request-steps/StepDatosPersonales.jsx'))
const StepProducto = lazy(() => import('./request-steps/StepProducto.jsx'))
const StepSimulacion = lazy(() => import('./request-steps/StepSimulacion.jsx'))
const StepConfirmacion = lazy(() => import('./request-steps/StepConfirmacion.jsx'))
const StepDocumentos = lazy(() => import('./request-steps/StepDocumentos.jsx'))
const StepBiometria = lazy(() => import('./request-steps/StepBiometria.jsx'))
const StepRevision = lazy(() => import('./request-steps/StepRevision.jsx'))
const StepResultado = lazy(() => import('./request-steps/StepResultado.jsx'))

const steps = [
  { id: 1, title: 'Confirmación de datos', component: StepRegistro },
  { id: 2, title: 'Datos personales', component: StepDatosPersonales },
  { id: 3, title: 'Selección de producto', component: StepProducto },
  { id: 4, title: 'Simulación', component: StepSimulacion },
  { id: 5, title: 'Confirmación', component: StepConfirmacion },
  { id: 6, title: 'Documentos', component: StepDocumentos },
  { id: 7, title: 'Validación biométrica', component: StepBiometria },
  { id: 8, title: 'Revisión', component: StepRevision },
  { id: 9, title: 'Resultado', component: StepResultado },
]

function FlowContent() {
  const { step, setStep } = useRequest()
  const current = steps.find((s) => s.id === step)
  const StepComponent = current?.component

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Solicitud en línea</h1>
        <p className="mt-1 text-sm text-slate-600">
          Flujo digital de punta a punta con validación biométrica.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={s.id > step}
            onClick={() => s.id <= step && setStep(s.id)}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition',
              step === s.id
                ? 'text-white shadow'
                : s.id < step
                  ? 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed',
            ].join(' ')}
            style={step === s.id ? { backgroundColor: 'var(--sfici-primary)' } : undefined}
          >
            {s.id}. {s.title}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
              </div>
            }
          >
            {StepComponent && <StepComponent />}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

export default function RequestFlow() {
  return (
    <RequestProvider>
      <FlowContent />
    </RequestProvider>
  )
}
