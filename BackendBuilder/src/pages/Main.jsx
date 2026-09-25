import React from 'react'
import { Outlet } from 'react-router-dom'
import Navebare from '../component/Navebare'
import '../style/Main.css'

const Main = () => {
  return (
    <div className='mainShell'>
      <aside className='mainNav'><Navebare /></aside>
      <main className='mainContent'><Outlet /></main>
    </div>
  )
}

export default Main