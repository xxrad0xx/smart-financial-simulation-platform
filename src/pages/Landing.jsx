import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInstitution } from '../context/InstitutionalContext.jsx'
import HeroArt from '../components/landing/HeroArt.jsx'

export default function Landing() {
  const { profile } = useInstitution()
  const navigate = useNavigate()
  const [leavingTo, setLeavingTo] = useState(null)
  const systemVersion = import.meta.env.VITE_APP_VERSION || 'v1.0'
  const tagline =
    profile.lema === 'Tu aliado en crédito e inversión'
      ? 'Simulación financiera precisa para decisiones seguras.'
      : profile.lema

  const brand = useMemo(() => {
    const parts = String(profile.nombre || 'SFICI').split(' ')
    return {
      kicker: 'SFICI',
      title: parts.length > 1 ? parts.slice(0, 2).join(' ') : parts[0],
      subtitle: parts.length > 2 ? parts.slice(2).join(' ') : 'Simulador financiero',
    }
  }, [profile.nombre])

  const go = (to) => {
    if (leavingTo) return
    setLeavingTo(to)
    window.setTimeout(() => navigate(to), 260)
  }

  return (
    <div
      className="relative min-h-dvh overflow-hidden text-white"
      style={{
        // white patterned background (like reference)
        background: '#f8fafc',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.11,
          backgroundImage: `url("/pattern-money.png")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '320px 320px',
          mixBlendMode: 'multiply',
          filter: 'blur(0.15px)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          // keep overall background clean and premium
          background: 'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(2,6,23,0.04), rgba(2,6,23,0.00) 65%)',
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: leavingTo ? 0.92 : 1 }}
        transition={{ duration: 0.26, ease: 'easeOut' }}
        className="relative z-10 mx-auto flex max-w-6xl items-center px-6 py-14 md:min-h-dvh md:py-20"
      >
        <div
          className="relative w-full overflow-hidden rounded-[32px] border shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
          style={{
            borderColor: 'rgba(2,6,23,0.12)',
            background: 'rgba(255,255,255,0.85)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 20% 15%, rgba(22,163,74,0.08), transparent 55%), radial-gradient(circle at 88% 0%, rgba(212,175,55,0.04), transparent 60%)',
            }}
          />

          <div className="relative grid md:grid-cols-[1fr_28px_1fr]">
            <motion.section
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative p-7 md:p-10"
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(11,42,29,0.98) 0%, rgba(5,20,13,0.98) 60%, rgba(2,6,23,0.98) 100%)',
                }}
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse 90% 70% at 0% 0%, rgba(22,163,74,0.16), transparent 60%)',
                }}
              />

              <div className="relative space-y-7">
                <div className="inline-flex items-center gap-3">
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                    {brand.kicker}
                  </span>
                  <span className="text-xs text-white/70">{systemVersion}</span>
                </div>

                <div className="space-y-3">
                  <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
                    <span className="text-white">{brand.title}</span>{' '}
                    <span className="text-white/70">{brand.subtitle}</span>
                  </h1>
                  <p className="max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
                    {tagline}
                  </p>
                </div>

                <div
                  className="relative overflow-hidden rounded-3xl border p-5"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderColor: 'rgba(255,255,255,0.14)',
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-50"
                    style={{
                      background:
                        'radial-gradient(ellipse 55% 55% at 12% 25%, rgba(22,163,74,0.14), transparent 62%)',
                    }}
                  />
                  <div className="relative aspect-[72/52] w-full">
                    <HeroArt />
                  </div>
                </div>

                <p className="text-xs text-white/65">
                  {profile.nombre} · Simulaciones financieras con enfoque institucional
                </p>
              </div>
            </motion.section>

            {/* divider column (not overlaid) */}
            <div className="relative hidden md:block">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(11,42,29,0.00) 0%, rgba(11,42,29,0.26) 38%, rgba(255,255,255,0.55) 70%, rgba(255,255,255,0.00) 100%)',
                }}
              />
              <div
                className="absolute inset-y-10 left-1/2 w-px -translate-x-1/2"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.00) 0%, rgba(255,255,255,0.30) 18%, rgba(255,255,255,0.30) 82%, rgba(255,255,255,0.00) 100%)',
                }}
              />
            </div>

            <motion.aside
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
              className="relative p-7 md:p-10"
              style={{
                background: 'rgba(255,255,255,0.92)',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse 85% 65% at 18% 10%, rgba(22,163,74,0.10), transparent 62%), radial-gradient(ellipse 60% 45% at 90% 0%, rgba(212,175,55,0.06), transparent 60%)',
                }}
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65)',
                }}
              />

              <div className="relative space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">Accesos</p>
                  <p className="text-xs text-slate-600">Accede según tu perfil y comienza ya.</p>
                </div>

                <div className="grid gap-4">
            <motion.button
              type="button"
              onClick={() => go('/admin')}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.995 }}
              disabled={Boolean(leavingTo)}
              className={[
                'group relative w-full overflow-hidden rounded-2xl border p-6 text-left transition disabled:cursor-not-allowed disabled:opacity-70',
                'hover:-translate-y-[1px] hover:shadow-[0_18px_50px_-32px_rgba(2,6,23,0.35)]',
              ].join(' ')}
              style={{
                background: 'rgba(255,255,255,0.98)',
                borderColor:
                  leavingTo === '/admin' ? '#16A34A' : 'rgba(2,6,23,0.10)',
              }}
            >
              <div
                className="pointer-events-none absolute inset-y-4 left-4 w-1 rounded-full opacity-80"
                style={{ background: 'linear-gradient(180deg, #16A34A, rgba(22,163,74,0.10))' }}
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 60% at 0% 30%, rgba(22,163,74,0.10), transparent 55%)',
                }}
              />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-900">
                    Administrador
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Catálogos, tasas, cobros, identidad institucional y revisión de solicitudes.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {['Configuración', 'Tipos de Créditos', 'Cobros'].map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-2 text-[11px] font-medium leading-none text-slate-500"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                    <span className="leading-none tracking-[0.01em]">{t}</span>
                  </span>
                ))}
              </div>

              <div className="mt-5">
                <span
                  className="inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition"
                  style={{
                    background: '#16A34A',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                  }}
                >
                  Acceder como Administrador
                </span>
              </div>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => go('/cliente')}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.995 }}
              disabled={Boolean(leavingTo)}
              className={[
                'group relative w-full overflow-hidden rounded-2xl border p-6 text-left transition disabled:cursor-not-allowed disabled:opacity-70',
                'hover:-translate-y-[1px] hover:shadow-[0_18px_50px_-32px_rgba(2,6,23,0.35)]',
              ].join(' ')}
              style={{
                background: 'rgba(255,255,255,0.98)',
                borderColor:
                  leavingTo === '/cliente' ? '#16A34A' : 'rgba(2,6,23,0.10)',
              }}
            >
              <div
                className="pointer-events-none absolute inset-y-4 left-4 w-1 rounded-full opacity-80"
                style={{ background: 'linear-gradient(180deg, #16A34A, rgba(22,163,74,0.10))' }}
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 60% at 0% 30%, rgba(22,163,74,0.10), transparent 55%)',
                }}
              />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-900">
                    Cliente
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Simula créditos e inversiones, compara métodos, genera PDF y crea solicitudes.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {['Simulaciones en tiempo real', 'Inversiones', 'Historial-Exportación PDF'].map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-2 text-[11px] font-medium leading-none text-slate-500"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                    <span className="leading-none tracking-[0.01em]">{t}</span>
                  </span>
                ))}
              </div>

              <div className="mt-5">
                <span
                  className="inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition"
                  style={{
                    background: '#16A34A',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                  }}
                >
                  Acceder como Cliente
                </span>
              </div>
            </motion.button>
                </div>

          <div
            className="relative mt-4 overflow-hidden rounded-2xl border p-4 text-xs shadow-[0_16px_40px_-34px_rgba(2,6,23,0.35)]"
            style={{
              background: 'rgba(22,163,74,0.05)',
              borderColor: 'rgba(2,6,23,0.10)',
              color: '#475569',
            }}
          >
            <div
              className="pointer-events-none absolute inset-y-4 left-4 w-1 rounded-full opacity-80"
              style={{ background: 'linear-gradient(180deg, #16A34A, rgba(22,163,74,0.10))' }}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  'radial-gradient(ellipse 75% 80% at 0% 10%, rgba(22,163,74,0.10), transparent 60%)',
              }}
            />
            <div className="relative pl-4">
              <p className="font-semibold text-slate-900">Seguridad y privacidad</p>
              <p className="mt-1">
              Protegemos tu información con controles de acceso y almacenamiento seguro. Tus simulaciones se guardan para que puedas consultarlas cuando lo necesites.
              </p>
            </div>
          </div>
              </div>
            </motion.aside>
          </div>
        </div>

        {leavingTo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.26 }}
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
