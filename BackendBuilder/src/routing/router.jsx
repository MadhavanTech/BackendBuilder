import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from '../component/ProtectedRoute'
import Main from '../pages/Main'
import LoginPage from '../pages/Login_Page'
import SignUpPage from '../pages/Sing_Page'
import Dashboard from '../pages/Dashboad'
import NewProject from '../pages/NewProject'
import Projects from '../pages/Projects'
import Templates from '../pages/Templates'
import Settings from '../pages/Settings'
import Documentation from '../pages/Documentation.jsx'
import Support from '../pages/Support'
import Database from '../component/Database'
import Tables from '../component/Tables'
import Columns from '../component/Columns'
import API from '../component/API'
import GBackend from '../component/GBackend'
import TableConnection from '../component/TableConnection'

const RootRedirect = () => {
    const { user, loading } = useAuth()

    if (loading) {
        return null
    }

    return <Navigate to={user ? '/app/dashboard' : '/login'} replace />
}

const builderRoutes = [
    { index: true, element: <Navigate to='database' replace /> },
    { path: 'database', element: <Database /> },
    { path: 'tables', element: <Tables /> },
    { path: 'columns', element: <Columns /> },
    { path: 'connection', element: <TableConnection /> },
    { path: 'api', element: <API /> },
    { path: 'backend', element: <GBackend /> },
]

const router = createBrowserRouter([
    { path: '/signup', element: <SignUpPage /> },
    { path: '/login', element: <LoginPage /> },
    {
        path: '/',
        element: <RootRedirect />,
    },
    {
        path: '/app',
        element: <ProtectedRoute><Main /></ProtectedRoute>,
        children: [
            { index: true, element: <Navigate to='/app/dashboard' replace /> },
            { path: 'dashboard', element: <Dashboard /> },
            { path: 'new-project', element: <NewProject />, children: builderRoutes },
            { path: 'projects', element: <Projects /> },
            { path: 'templates', element: <Templates /> },
            { path: 'settings', element: <Settings /> },
            { path: 'docs', element: <Documentation /> },
            { path: 'support', element: <Support /> },
        ],
    },
], {
    basename: import.meta.env.BASE_URL,
})

export default router