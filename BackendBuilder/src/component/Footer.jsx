import React, { useContext } from 'react'
import '../style/footer.css'
import { Appcontext } from '../context/Backend'
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const { Databases, setDatabases, activeDatabase, LoginStatus, setLoginStatus, NumberofTables, setNumberofTables,Defitions, setDefitions , TableNames, setTableNames, steps, setSteps , Tables, setTables , Table , Database, Connections, setConnections, pendingConnection, setPendingConnection, TableConnections, saveProgress, chatMessagesByScope: chatMessages, setChatMessagesByScope: setChatMessages } = useContext(Appcontext)

  const navigate = useNavigate()
  const routes = ['/app/new-project/database', '/app/new-project/tables', '/app/new-project/columns','/app/new-project/connection', '/app/new-project/api', '/app/new-project/backend']

    const moveToStep = async (nextStep) => {

    
    if (nextStep > steps && steps === 1) {
      const databaseForm = document.querySelector('#database-form')

      if (databaseForm && !activeDatabase && !databaseForm.reportValidity()) {
        return
      }
    }

    if(nextStep > steps && steps === 2) {

        const tablesForm = document.querySelector('#tables-form')

        if(tablesForm && !tablesForm.reportValidity()){
          return 
        }

        // Preserve loaded tables and their columns when opening an existing project.
        if (Tables.length === 0) {
          const arr = TableNames.map((table) => new Table(table))
          setTables(arr)
        }

        if (tablesForm && !tablesForm.reportValidity()) {
          return
        }

        if (typeof saveProgress === 'function') {
          saveProgress({ silent: true }).catch(() => {})
        }

      }

      if(nextStep > steps && steps === 3) {

        const columnsForm = document.querySelector('#columns-form')

        if (columnsForm && !columnsForm.reportValidity()) {
          return
        }

        if (typeof saveProgress === 'function') {
          saveProgress({ silent: true }).catch(() => {})
        }

      }

      if (nextStep > steps && steps === 4 && pendingConnection?.ParentTable && pendingConnection?.ChildTable && pendingConnection?.ParentColumn && pendingConnection?.ChildColumn) {
        const connectionExists = Connections.some((connection) => (
          connection.ParentTable === pendingConnection.ParentTable &&
          connection.ChildTable === pendingConnection.ChildTable &&
          connection.ParentRelation === pendingConnection.ParentRelation &&
          connection.childRelation === pendingConnection.childRelation
        ))

        if (!connectionExists) {
          setConnections((previousConnections) => [
            ...previousConnections,
            new TableConnections(
              pendingConnection.ParentTable,
              pendingConnection.ChildTable,
              pendingConnection.ParentColumn,
              pendingConnection.ChildColumn,
              pendingConnection.ParentRelation,
              pendingConnection.childRelation
            )
          ])
        }

        setPendingConnection(null)
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