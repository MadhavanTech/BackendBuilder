import React, { useContext, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import '../style/Home.css'
import Navebare from '../component/Navebare'
import TopNave from '../component/TopNave'
import { Appcontext } from '../context/Backend'
import Footer from '../component/Footer'

const Home = () => {

  const { steps, setSteps } = useContext(Appcontext);
  const location = useLocation()
  const routeSteps = {
    database: 1,
    tables: 2,
    columns: 3,
    connection: 4,
    api: 5,
    backend: 6,
  }

  useEffect(() => {
    const currentStep = Object.entries(routeSteps).find(([route]) => location.pathname.endsWith(`/${route}`))?.[1]
    if (currentStep && currentStep !== steps) setSteps(currentStep)
  }, [location.pathname, setSteps, steps])
  const definitions = [
    ['Choose your database', 'Select the database engine for your project.'],
    ['How many tables do you need?', 'Define the number of tables and give them meaningful names.'],
    ['Define your columns', 'Add columns and choose the right data types for each table.'],
    ['Define your relationships', 'Set parent and child tables to define how the data connects.'],
    ['Configure your API', 'Choose the endpoints your backend should expose.'],
    ['Generate your backend', 'Review your configuration and generate the backend.'],
  ]
  const [title, description] = definitions[steps - 1]

  return (
   <div id="Home">

  <div id="content" className='bg-amber-50'>

    <div id="top">

      <TopNave />
     
    </div>

    <div id="header" >
      <span >Step {steps} of 6</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>

    <div id="main">
      <div id="workspace">
        <Outlet />
      </div>
      
    </div>

    <div id="footer">

      <Footer/>
      
    </div>

  </div>

</div>
  )
}

export default Home