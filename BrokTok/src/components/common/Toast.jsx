// BrokTok/src/components/common/Toast.jsx
import React from 'react'
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react'

export function Toast({ message, type = 'info', onDismiss }) {
  if (!message) return null

  const icons = {
    success: <CheckCircle className="text-green-400" size={20} />,
    error: <XCircle className="text-red-400" size={20} />,
    warning: <AlertCircle className="text-yellow-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />,
  }

  const bgColors = {
    success: 'bg-green-900/80 border border-green-700 text-green-100',
    error: 'bg-red-900/80 border border-red-700 text-red-100',
    warning: 'bg-yellow-900/80 border border-yellow-700 text-yellow-100',
    info: 'bg-blue-900/80 border border-blue-700 text-blue-100',
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:right-4 md:left-auto md:w-96 z-50">
      <div
        className={`flex items-center gap-3 rounded-lg px-4 py-3 ${bgColors[type]} backdrop-blur-sm`}
      >
        {icons[type]}
        <span className="flex-1 text-sm">{message}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
