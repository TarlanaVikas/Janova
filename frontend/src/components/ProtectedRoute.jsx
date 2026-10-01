import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto px-8 py-7 max-w-[1400px]">
        {children}
      </main>
    </div>
  )
}
