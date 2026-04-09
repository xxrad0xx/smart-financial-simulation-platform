import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.js'

const defaultProfile = {
  nombre: 'Institución Financiera Demo',
  ruc: '1790012345001',
  direccion: 'Av. Principal 123, Quito',
  telefonos: '+593 2 000 0000',
  email: 'contacto@institucion.demo',
  lema: 'Tu aliado en crédito e inversión',
  pieDocumentos:
    'Este documento es referencial. Las condiciones definitivas se formalizan en el contrato respectivo.',
  colorPrimario: '#0A2540',
  colorSecundario: '#0F2A44',
  logoDataUrl: null,
}

const InstitutionalContext = createContext(null)

export function InstitutionalProvider({ children }) {
  const [profile, setProfile] = useState(defaultProfile)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    api
      .getInstitutionProfile()
      .then((p) => {
        if (!alive) return
        setProfile({ ...defaultProfile, ...p })
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
      profile,
      loading,
      error,
      setProfile: (next) => {
        setProfile((p) => {
          const merged = typeof next === 'function' ? next(p) : { ...p, ...next }
          api
            .putInstitutionProfile(merged)
            .then((saved) => {
              setProfile({ ...defaultProfile, ...saved })
              setError(null)
            })
            .catch((e) => setError(e))
          return merged
        })
      },
      reset: () => {
        api
          .putInstitutionProfile(defaultProfile)
          .then((saved) => {
            setProfile({ ...defaultProfile, ...saved })
            setError(null)
          })
          .catch((e) => setError(e))
      },
    }),
    [profile, loading, error],
  )

  return (
    <InstitutionalContext.Provider value={value}>
      <div
        className="min-h-dvh"
        style={
          {
            '--sfici-primary': profile.colorPrimario,
            '--sfici-secondary': profile.colorSecundario,
          }
        }
      >
        {children}
      </div>
    </InstitutionalContext.Provider>
  )
}

export function useInstitution() {
  const ctx = useContext(InstitutionalContext)
  if (!ctx) throw new Error('useInstitution debe usarse dentro de InstitutionalProvider')
  return ctx
}
