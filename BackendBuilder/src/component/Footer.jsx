import React, { useContext, useEffect } from 'react'
import '../style/footer.css'
import { Appcontext } from '../context/Backend'
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const { Databases, setDatabases, LoginStatus, setLoginStatus, NumberofTables, setNumberofTables,Defitions, setDefitions , TableNames, setTableNames, steps, setSteps , Tables, setTables , Table , Database, chatMessagesByScope: chatMessages, setChatMessagesByScope: setChatMessages } = useContext(Appcontext)

  const navigate = useNavigate()
  const routes = ['/database', '/tables', '/columns','/connection', '/api', '/backend']

     const moveToStep = (nextStep) => {

    
    if (nextStep > steps && steps === 1) {
      const databaseForm = document.querySelector('#database-form')

      if (databaseForm && !databaseForm.reportValidity()) {
        return
      }
    }

    if(nextStep > steps && steps === 2) {

        const tablesForm = document.querySelector('#tables-form')

        if(tablesForm && !tablesForm.reportValidity()){
          return 
        }

        // Only create tables if they haven't been created ye
          let arr = [];

          TableNames.forEach((table) => {

            console.log(table);
            
            arr.push(new Table(table))
             
          })

          setTables(arr);

        if (tablesForm && !tablesForm.reportValidity()) {
          return
        }

      }

      if(nextStep > steps && steps === 3) {

        const columnsForm = document.querySelector('#columns-form')


      }

    setSteps(nextStep)
    navigate(routes[nextStep - 1])
  }

  return (
    <footer className='footer'>
        <button className='back' onClick={() => moveToStep(Math.max(1, steps - 1))}>
            <ArrowLeft size={15} />Back</button>
        <button className='next' onClick={() => moveToStep(Math.min(6, steps + 1))}> 
            Next <ArrowRight size={17}/></button>
    </footer>
  )
}

export default Footer