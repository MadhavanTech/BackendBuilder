import React, { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import '../style/Home.css'
import Navebare from '../component/Navebare'
import TopNave from '../component/TopNave'
import { Appcontext } from '../context/Backend'
import Footer from '../component/Footer'

const Home = () => {

  const { steps } = useContext(Appcontext);
  const definitions = [
    ['Choose your database', 'Select the database engine for your project.'],
    ['How many tables do you need?', 'Define the number of tables and give them meaningful names.'],
    ['Define your tables', 'Add tables and define their relationships.'],
    ['Define your columns', 'Add columns and choose the right data types for each table.'],
    ['Configure your API', 'Choose the endpoints your backend should expose.'],
    ['Generate your backend', 'Review your configuration and generate the backend.'],
  ]
  const [title, description] = definitions[steps - 1]

  return (
   <div id="Home">

  <div id="nav">

    <Navebare />
   
  </div>

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