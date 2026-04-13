import { useCallback, useEffect, useState } from 'react'

const VARIANTS = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-slate-800 text-white',
}

let pushToast = () => {}

export function useToast() {
  return useCallback((message, variant = 'success', duration = 4000) => {
    pushToast({ message, variant, duration, id: Date.now() })
  }, [])
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    pushToast = (t) => setToasts((prev) => [...prev, t])
    return () => { pushToast = () => {} }
  }, [])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDone={() => remove(t.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDone }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, toast.duration)
    return () => clearTimeout(timer)
  }, [toast.duration, onDone])

  return (
    <div
      role="status"
      className={[
        'pointer-events-auto flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg ring-1 ring-slate-900/10 transition-all duration-300',
        VARIANTS[toast.variant] || VARIANTS.info,
        visible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
      ].join(' ')}
    >
      {toast.variant === 'success' && <span aria-hidden="true">✓</span>}
      {toast.variant === 'error' && <span aria-hidden="true">✗</span>}
      <span>{toast.message}</span>
      <button
        type="button"
        aria-label="Cerrar notificación"
        className="ml-2 rounded p-0.5 opacity-70 hover:opacity-100"
        onClick={() => { setVisible(false); setTimeout(onDone, 300) }}
      >
        ×
      </button>
    </div>
  )
}
