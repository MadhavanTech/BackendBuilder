import React from 'react'
import Backend from './context/Backend'
import { AuthProvider } from './context/AuthContext'
import { RouterProvider } from 'react-router-dom'
import router from './routing/router'

const App = () => {
  return (
    <AuthProvider>
      <Backend>
        <RouterProvider router={router} />
      </Backend>
    </AuthProvider>
  )
}

export default App