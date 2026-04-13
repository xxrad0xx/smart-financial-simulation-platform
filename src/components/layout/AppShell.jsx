import { motion } from 'framer-motion'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useInstitution } from '../../context/InstitutionalContext.jsx'

const adminLinks = [
  { to: '/admin', label: 'Resumen', end: true },
  { to: '/admin/config', label: 'Configuración institucional' },
  { to: '/admin/creditos', label: 'Tipos de crédito' },
  { to: '/admin/cobros', label: 'Cobros indirectos' },
  { to: '/admin/inversiones', label: 'Productos de inversión' },
  { to: '/admin/solicitudes', label: 'Solicitudes de crédito' },
]

const clientLinks = [
  { to: '/cliente', label: 'Inicio', end: true },
  { to: '/cliente/simulacion', label: 'Simulación de crédito' },
  { to: '/cliente/inversion', label: 'Inversiones' },
  { to: '/cliente/historial', label: 'Historial', auth: true },
  { to: '/cliente/solicitud', label: 'Solicitud en línea', auth: true },
  { to: '/cliente/solicitudes', label: 'Mis solicitudes', auth: true },
]

export default function AppShell({ mode }) {
  const { profile } = useInstitution()
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const links = mode === 'admin' ? adminLinks : clientLinks
  const title = mode === 'admin' ? 'Panel administrador' : 'Portal cliente'
  const isAdmin = mode === 'admin'
  const isRoleMatch = isAuthenticated && user ? (isAdmin ? user.role === 'admin' : user.role === 'client') : false

  const handleLogout = () => {
    logout()
    navigate(mode === 'admin' ? '/login' : '/cliente', { replace: true })
  }

  const displayName = user
    ? user.nombres
      ? `${user.nombres} ${user.apellidos || ''}`.trim()
      : user.email
    : ''

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <motion.aside
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className={[
          'w-full shrink-0 md:w-72',
          isAdmin
            ? 'border-b border-slate-200 bg-white/80 text-slate-900 backdrop-blur md:border-b-0 md:border-r'
            : 'border-b border-slate-200 bg-white md:border-b-0 md:border-r',
        ].join(' ')}
      >
        <div className="flex h-full min-h-0 flex-col gap-3 p-5">
          <Link
            to="/"
            className={[
              'text-sm font-semibold transition-colors',
              isAdmin ? 'text-slate-600 hover:text-slate-900' : 'text-slate-500 hover:text-slate-800',
            ].join(' ')}
          >
            ← SFICI
          </Link>

          <div
            className={[
              'relative overflow-hidden rounded-2xl p-4',
              isAdmin ? 'border border-slate-200 bg-white' : 'border border-slate-200 bg-slate-50',
            ].join(' ')}
          >
            {isAdmin && (
              <div
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                  background:
                    'radial-gradient(circle at 15% 10%, rgba(22,163,74,0.10), transparent 55%), radial-gradient(circle at 95% 0%, rgba(212,175,55,0.06), transparent 60%)',
                }}
              />
            )}
            <div className="relative">
              <p
                className={[
                  'font-[family-name:var(--font-display)] text-lg font-semibold',
                  isAdmin ? 'text-slate-900' : 'text-slate-900',
                ].join(' ')}
              >
                {profile.nombre}
              </p>
              <p
                className={[
                  'text-xs uppercase tracking-wide',
                  isAdmin ? 'text-slate-500' : 'text-slate-500',
                ].join(' ')}
              >
                {title}
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  [
                    'relative rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    isAdmin
                      ? isActive
                        ? 'text-slate-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      : isActive
                        ? 'text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  ].join(' ')
                }
                style={({ isActive }) => {
                  if (!isAdmin) return isActive ? { backgroundColor: 'var(--sfici-primary)' } : undefined
                  return isActive
                    ? {
                        backgroundColor: 'rgba(15,23,42,0.03)',
                        boxShadow: `inset 0 0 0 1px rgba(15,23,42,0.06), inset 3px 0 0 0 var(--sfici-primary)`,
                      }
                    : undefined
                }}
              >
                {l.label}
                {l.auth && !isAuthenticated && (
                  <span className="ml-1.5 text-[10px] text-slate-400">🔒</span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User info / login section */}
          <div className="mt-auto border-t border-slate-100 pt-4">
            {isRoleMatch ? (
              <>
                <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2">
                  <p className="truncate text-sm font-medium text-slate-800">{displayName}</p>
                  <p className="truncate text-xs text-slate-500">
                    {user?.role === 'admin' ? 'Administrador' : user?.cedula || user?.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                to={isAdmin ? '/login?role=admin' : '/login?role=client'}
                className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-white transition"
                style={{ backgroundColor: 'var(--sfici-primary)' }}
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </motion.aside>

      <main
        className={[
          'relative min-h-dvh flex-1 p-4 md:p-8',
          isAdmin ? 'bg-slate-50' : 'bg-slate-50',
        ].join(' ')}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: '#f8fafc',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: isAdmin ? 0.10 : 0.07,
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
            background: isAdmin
              ? 'radial-gradient(circle at 70% 20%, rgba(22,163,74,0.08), transparent 55%), radial-gradient(circle at 10% 0%, rgba(212,175,55,0.05), transparent 60%)'
              : 'radial-gradient(circle at 70% 20%, rgba(22,163,74,0.06), transparent 55%), radial-gradient(circle at 10% 0%, rgba(212,175,55,0.04), transparent 60%)',
          }}
        />
        <div className={isAdmin ? 'relative z-10 text-slate-900' : 'relative z-10'}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
