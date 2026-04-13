import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * Protects a route by role.
 * - While loading auth, shows a spinner.
 * - If not authenticated, redirects to /login.
 * - If authenticated but wrong role, redirects to /login for that role.
 */
export default function ProtectedRoute({ role, children }) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
          <p className="text-sm text-slate-500">Verificando sesión…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={role ? `/login?role=${role}` : '/login'} replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={`/login?role=${role}`} replace />
  }

  return children
}

/**
 * Lighter guard for individual pages that require a logged-in client.
 * Redirects to /login if not authenticated, but does NOT enforce role
 * (used inside already-public route groups like /cliente).
 */
export function RequireAuth({ role, children }) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={role ? `/login?role=${role}` : '/login'} replace />
  }

  if (role && user?.role !== role) {
    return <Navigate to={`/login?role=${role}`} replace />
  }

  return children
}
