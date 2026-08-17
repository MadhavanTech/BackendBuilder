import React, { useContext } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Appcontext } from '../context/Backend'

export default function RequireAuth() {
  const { LoginStatus } = useContext(Appcontext)
  const location = useLocation()

  if (LoginStatus) return <Outlet />

  return <Navigate to="/login" state={{ from: location }} replace />
}
