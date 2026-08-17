import React, { useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Backend, { Appcontext } from './context/Backend'
import Home from './pages/Home'
import Login_Page from './pages/Login_Page'
import Sing_Page from './pages/Sing_Page'
import RequireAuth from './routing/RequireAuth'

function MainRoutes() {
  const { LoginStatus } = useContext(Appcontext)

  return (
    <Routes>
      <Route path="/" element={LoginStatus ? <Home /> : <Login_Page />} />
      <Route path="/login" element={<Login_Page />} />
      <Route path="/signup" element={<Sing_Page />} />

      <Route element={<RequireAuth />}>
        <Route path="/home" element={<Home />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

const App = () => {
  return (
    <Backend>
      <BrowserRouter>
        <MainRoutes />
      </BrowserRouter>
    </Backend>
  )
}

export default App