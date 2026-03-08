import React, { useState, useEffect } from 'react'

export function HealthCheck() {
  const [backendStatus, setBackendStatus] = useState('checking')
  const [details, setDetails] = useState('')

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
        const healthUrl = baseUrl.replace(/\/api$/, '/api/health')
        
        console.log('Checking backend health:', healthUrl)
        
        const response = await fetch(healthUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (response.ok) {
          const data = await response.json()
          setBackendStatus('connected')
          setDetails(`✅ Backend is running\n${JSON.stringify(data, null, 2)}`)
        } else {
          setBackendStatus('error')
          setDetails(`❌ Backend returned ${response.status}: ${response.statusText}`)
        }
      } catch (err) {
        setBackendStatus('disconnected')
        setDetails(`❌ Cannot reach backend\n\nError: ${err.message}\n\nMake sure:\n1. Backend is running: npm start\n2. Backend is on port 3000\n3. No firewall blocking localhost:3000`)
      }
    }

    checkBackend()
  }, [])

  const statusColor = {
    checking: 'bg-yellow-100 text-yellow-800',
    connected: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    disconnected: 'bg-red-100 text-red-800'
  }

  return (
    <div className={`p-6 rounded-lg ${statusColor[backendStatus] || 'bg-gray-100'}`}>
      <h2 className="text-xl font-bold mb-4">Backend Health Check</h2>
      <p className="whitespace-pre-wrap font-mono text-sm">{details}</p>
    </div>
  )
}
