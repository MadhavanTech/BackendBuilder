import React from 'react'
import Backend from './context/Backend'
import { RouterProvider } from 'react-router-dom'
import router from './routing/router'

const App = () => {
  return (
    <Backend>
      <RouterProvider router={router} />
    </Backend>
  )
}

export default App