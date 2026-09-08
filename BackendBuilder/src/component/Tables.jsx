import React, { useContext, useEffect } from 'react'
import '../style/Tables.css'
import { Appcontext } from '../context/Backend'
import { Trash2 } from 'lucide-react'
import MaddyChatbot from './MaddyChatbot'

const Tables = () => {

  const {
    NumberofTables,
    setNumberofTables,
    TableNames,
    Tables,
    setTables,
    setTableNames,
    setDefitions
  } = useContext(Appcontext)

  const Increase = () => {
    setNumberofTables(NumberofTables + 1)
  }

  const Decrease = (index) => {
    if (NumberofTables <= 0) return

    setNumberofTables(NumberofTables - 1)

    setTableNames((previous) =>
      previous.filter((_, i) => i !== index)
    )

    setTables((previous) =>
      previous.filter((_, i) => i !== index)
    )
  }

  const onchangeTableName = (index, value) => {

    const newName = value.trim()

    const duplicate = TableNames.some(
      (name, i) =>
        i !== index &&
        name &&
        name.toLowerCase() === newName.toLowerCase()
    )

    if (duplicate) {
      alert('This table name is already taken. Please choose a different one.')
      return
    }

    setTableNames((previous) => {
      const updated = [...previous]
      updated[index] = value
      return updated
    })

    setTables((previousTables) => {

      const updatedTables = [...previousTables]

      const existingTableIndex = updatedTables.findIndex(
        (table) => table.TableIndex === index
      )

      if (existingTableIndex !== -1) {

        updatedTables[existingTableIndex] = {
          ...updatedTables[existingTableIndex],
          TableNames: value
        }

      } else {

        updatedTables.push({
          TableIndex: index,
          TableNames: value,
          colamnsname: [],
          Datatype: [],
          Length: [],
          Constraints: []
        })

      }

      return updatedTables
    })
  }

  useEffect(() => {
    setDefitions([
      'How many tables do you need?',
      'Define the number of tables and give them meaningful names.'
    ])
  }, [setDefitions])

  return (
    <form
      id='tables-form'
      className='main'
      onSubmit={(event) => {
        event.preventDefault()
      }}
    >

      <div className='numberofTables'>

        <h5>Number of Tables</h5>

        <div className='count'>

          <div
            onClick={() => Decrease(NumberofTables - 1)}
            className="part1"
          >
            <h5>-</h5>
          </div>

          <div className="part2">
            <h3>{NumberofTables}</h3>
          </div>

          <div
            onClick={Increase}
            className="part3"
          >
            <h3>+</h3>
          </div>

        </div>

        <p>You can add more tables later</p>

      </div>

      <div className='calaums'>

        <h6>Table Names</h6>

        <div className='TableNames'>

          {Array.from(
            { length: NumberofTables },
            (_, index) => (

              <div
                key={index}
                className='calums'
              >

                <div className='num'>
                  {index + 1}
                </div>

                <input
                  required
                  value={TableNames[index] || ''}
                  onChange={(e) =>
                    onchangeTableName(
                      index,
                      e.target.value
                    )
                  }
                  className='name'
                  type="text"
                  placeholder='New Table'
                />

                <div
                  className='remove'
                  onClick={() => Decrease(index)}
                >
                  <Trash2 size={16} />
                </div>

              </div>

            )
          )}

          <div
            onClick={Increase}
            className='AddTables'
          >
            <h5>
              <span>+</span> Add Another Table
            </h5>
          </div>

        </div>

        <div>

        </div>

      </div>

      <div className='NextStep'>

        <MaddyChatbot
          conversationKey='tables'
        />

      </div>

    </form>
  )
}

export default Tables