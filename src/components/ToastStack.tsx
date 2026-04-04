import { useEffect } from 'react'

export type ToastKind = 'error' | 'warning' | 'info'

export interface ToastItem {
  id: number
  message: string
  kind: ToastKind
}

interface Props {
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}

export function ToastStack({ toasts, onDismiss }: Props) {
  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[1000] flex max-w-md flex-col gap-3"
      role="region"
      aria-label="Уведомления"
    >
      {toasts.map((t) => (
        <ToastRow key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastRow({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: (id: number) => void
}) {
  useEffect(() => {
    const ms = toast.kind === 'error' ? 8000 : 5000
    const timer = window.setTimeout(() => onDismiss(toast.id), ms)
    return () => window.clearTimeout(timer)
  }, [toast.id, toast.kind, onDismiss])

  const border =
    toast.kind === 'error'
      ? 'border-red-400/50'
      : toast.kind === 'warning'
        ? 'border-amber-400/50'
        : 'border-white/20'

  return (
    <div
      className={`pointer-events-auto rounded-2xl border ${border} bg-[#1e1a32]/95 px-4 py-3 text-sm text-slate-100 shadow-xl backdrop-blur-md`}
      role="alert"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="leading-relaxed">{toast.message}</p>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 rounded-lg px-2 py-1 text-slate-400 hover:bg-white/10 hover:text-white"
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
    </div>
  )
}
