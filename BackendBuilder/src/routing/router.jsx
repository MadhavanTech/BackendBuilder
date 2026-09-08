import { createBrowserRouter, Navigate } from 'react-router-dom'
import Home from '../pages/Home'
import Database from '../component/Database'
import Tables from '../component/Tables'
import Columns from '../component/Columns'
import API from '../component/API'
import GBackend from '../component/GBackend'
import TableConnection from '../component/TableConnection'

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
        children: [
            { index: true, element: <Navigate to="database" replace /> },
            { path: 'database', element: <Database /> },
            { path: 'tables', element: <Tables /> },
            { path: 'columns', element: <Columns /> },
            { path: 'connection', element: <TableConnection /> },
            { path: 'api', element: <API /> },
            { path: 'backend', element: <GBackend /> },
        ],
    },
], {
    basename: import.meta.env.BASE_URL,
})

export default router