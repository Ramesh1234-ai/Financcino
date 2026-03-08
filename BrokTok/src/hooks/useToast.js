// BrokTok/src/hooks/useToast.js
import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)

  const show = useCallback((message, type = 'info', duration = 3000) => {
    setToast({ id: Date.now(), message, type })
    if (duration > 0) {
      setTimeout(() => setToast(null), duration)
    }
  }, [])

  const dismiss = useCallback(() => {
    setToast(null)
  }, [])

  return { toast, show, dismiss }
}
