import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useInstitution } from '../context/InstitutionalContext.jsx'

export default function Login() {
  const { login, logout, isAuthenticated, user } = useAuth()
  const { profile } = useInstitution()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const suggestedRole = searchParams.get('role') || 'client'

  // If already authenticated, redirect
  useEffect(() => {
    if (!isAuthenticated || !user) return
    if (user.role === suggestedRole) {
      navigate(user.role === 'admin' ? '/admin' : '/cliente', { replace: true })
      return
    }
    // Session from another portal/role — clear it so user can log in correctly.
    logout()
  }, [isAuthenticated, user, suggestedRole, navigate, logout])

  const brand = useMemo(() => {
    const parts = String(profile.nombre || 'SFICI').split(' ')
    return {
      title: parts.length > 1 ? parts.slice(0, 2).join(' ') : parts[0],
      subtitle: parts.length > 2 ? parts.slice(2).join(' ') : '',
    }
  }, [profile.nombre])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const u = await login(email, password)
      navigate(u.role === 'admin' ? '/admin' : '/cliente', { replace: true })
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4"
      style={{ background: '#f8fafc' }}
    >
      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.07,
          backgroundImage: 'url("/pattern-money.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: '320px 320px',
          mixBlendMode: 'multiply',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(2,6,23,0.04), rgba(2,6,23,0.00) 65%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div
          className="overflow-hidden rounded-3xl border shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
          style={{ borderColor: 'rgba(2,6,23,0.10)', background: 'rgba(255,255,255,0.96)' }}
        >
          {/* Header */}
          <div
            className="relative px-8 pb-6 pt-8"
            style={{
              background:
                'linear-gradient(180deg, rgba(11,42,29,0.98) 0%, rgba(5,20,13,0.98) 100%)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 90% 70% at 0% 0%, rgba(22,163,74,0.16), transparent 60%)',
              }}
            />
            <div className="relative">
              <Link
                to="/"
                className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-white/60 transition hover:text-white/90"
              >
                ← Volver a SFICI
              </Link>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                {brand.title} {brand.subtitle && <span className="text-white/60">{brand.subtitle}</span>}
              </h1>
              <p className="mt-1 text-sm text-white/60">
                {suggestedRole === 'admin'
                  ? 'Acceso al panel de administración'
                  : 'Acceso al portal del cliente'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 px-8 py-7">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}

            <label className="block text-sm">
              <span className="font-medium text-slate-700">Correo electrónico</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={suggestedRole === 'admin' ? 'admin@sfici.com' : 'correo@ejemplo.com'}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">Contraseña</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
              style={{
                background: '#16A34A',
                boxShadow: '0 10px 30px rgba(22,163,74,0.25)',
              }}
            >
              {submitting ? 'Ingresando…' : 'Iniciar sesión'}
            </button>

            <div className="text-center text-sm text-slate-500">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="font-medium text-emerald-600 hover:text-emerald-700">
                Regístrate aquí
              </Link>
            </div>
          </form>
        </div>

        {/* Footer hint */}
        <p className="mt-4 text-center text-xs text-slate-400">
          {profile.nombre} · Sistema de simulación financiera
        </p>
      </motion.div>
    </div>
  )
}
