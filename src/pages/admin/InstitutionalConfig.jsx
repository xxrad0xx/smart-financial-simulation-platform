import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useInstitution } from '../../context/InstitutionalContext.jsx'

export default function InstitutionalConfig() {
  const { profile, setProfile } = useInstitution()
  const fileRef = useRef(null)

  const onLogo = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setProfile({ logoDataUrl: String(reader.result) })
    }
    reader.readAsDataURL(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl space-y-8"
    >
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-900">
          Configuración institucional
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Identidad visual y datos legales reutilizados en PDF y pantallas.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Identidad</p>
          <p className="mt-1 text-sm text-slate-600">Logo, colores y datos base para documentos.</p>
        </div>

        <div className="space-y-5 p-6">
          <label className="block text-sm font-medium text-slate-700">Logo institucional</label>
          <div className="flex flex-wrap items-center gap-4">
          {profile.logoDataUrl ? (
            <img
              src={profile.logoDataUrl}
              alt="Logo"
              className="h-16 w-auto max-w-[220px] rounded-lg bg-white object-contain shadow-sm ring-1 ring-slate-900/5"
            />
          ) : (
            <div className="flex h-16 w-36 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs font-medium text-slate-400">
              Sin logo
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onLogo} />
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            onClick={() => fileRef.current?.click()}
          >
            Subir imagen
          </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Color primario</span>
              <input
                type="color"
                className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm"
                value={profile.colorPrimario}
                onChange={(e) => setProfile({ colorPrimario: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Color secundario</span>
              <input
                type="color"
                className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm"
                value={profile.colorSecundario}
                onChange={(e) => setProfile({ colorSecundario: e.target.value })}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
          ['nombre', 'Nombre de la institución'],
          ['ruc', 'RUC o identificación legal'],
          ['direccion', 'Dirección física'],
          ['telefonos', 'Teléfonos'],
          ['email', 'Correo electrónico'],
          ['lema', 'Lema institucional'],
          ['pieDocumentos', 'Pie de página para PDF'],
            ].map(([key, label]) => (
              <label key={key} className={key === 'pieDocumentos' ? 'sm:col-span-2' : ''}>
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                  value={profile[key] ?? ''}
                  onChange={(e) => setProfile({ [key]: e.target.value })}
                />
              </label>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-600">
            Los cambios se guardan automáticamente en este dispositivo.
          </div>
        </div>
      </div>
    </motion.div>
  )
}
