import React, { useContext, useEffect, useState } from 'react'
import { Appcontext } from '../context/Backend'
import { Plus, Trash2 } from 'lucide-react'
import MaddyChatbot from './MaddyChatbot'
import '../style/Columns.css'

const Columns = () => {
  const { NumberofTables, setNumberofTables, TableNames, setTableNames, Tables, setTables, setSteps, setDefitions } = useContext(Appcontext)
  const [calums, setCalums] = useState(0)
  const [Tablesname, setTablesname] = useState('')
  const [columns, setColumns] = useState([])

  const tableOptions = Tables.length > 0
    ? Tables.map((Table) => Table.TableNames)
    : TableNames.filter(Boolean)

  useEffect(() => {
    if (!Tablesname) {
      setColumns([])
      setCalums(0)
      return
    }

    const selectedTable = Tables.find((Table) => Table.TableNames === Tablesname)

    if (!selectedTable) {
      setColumns([])
      setCalums(0)
      return
    }

    const columnNames = Array.isArray(selectedTable.colamnsname) ? selectedTable.colamnsname : []
    const dataTypes = Array.isArray(selectedTable.Datatype) ? selectedTable.Datatype : []
    const lengths = Array.isArray(selectedTable.Length) ? selectedTable.Length : []
    const constraints = Array.isArray(selectedTable.Constraints) ? selectedTable.Constraints : []

    const totalColumns = Math.max(columnNames.length, dataTypes.length, lengths.length, constraints.length)

    const existingColumns = Array.from({ length: totalColumns }, (_, index) => ({
    columnName: columnNames[index] || '',
      dataType: dataTypes[index] || '',
      length: lengths[index] || '',
      constraint: constraints[index] || ''
    }))

    setColumns(existingColumns)
    setCalums(existingColumns.length)
  }, [Tablesname, Tables])

  const handleChange = (event) => {
    setTablesname(event.target.value)
  }

  const updateTables = (updatedColumns) => {
    setTables((previousTables) =>
      previousTables.map((Table) => {
        if (Table.TableNames !== Tablesname) return Table

        return {
          ...Table,
          colamnsname: updatedColumns.map((column) => column.columnName),
          Datatype: updatedColumns.map((column) => column.dataType),
          Length: updatedColumns.map((column) => column.length),
          Constraints: updatedColumns.map((column) => column.constraint)
        }
      })
    )
  }

  const addColumn = () => {
    const updatedColumns = [
      ...columns,
      {
        columnName: '',
        dataType: '',
        length: '',
        constraint: ''
      }
    ]

    setColumns(updatedColumns)
    setCalums(updatedColumns.length)
    updateTables(updatedColumns)
  }
    const deleteColumn = (index) => {
    const updatedColumns = columns.filter((_, columnIndex) => columnIndex !== index)
    setColumns(updatedColumns)
    setCalums(updatedColumns.length)
    updateTables(updatedColumns)
  }

  const updateColumn = (index, field, value) => {
    const updatedColumns = columns.map((column, columnIndex) =>
      columnIndex === index
        ? { ...column, [field]: value }
        : column
    )

    setColumns(updatedColumns)
    updateTables(updatedColumns)
  }

  return (
    <div className='componentWithChat'>
    <div className='columns'>
        <div className='calaum'>
        <div className='nave'>
            <h4>Table:{Tablesname}</h4>
            <select id="Selecttable" value={Tablesname} onChange={handleChange}>
              <option value="" disabled>Change Table</option>
              {tableOptions.map((tableName) => (
                <option key={tableName} value={tableName}>{tableName}</option>
              ))}
            </select>
          </div>

          <div className='constains'>
            <table>
              <thead>
                <tr>
                  <th>Colum Name</th>
                  <th>Data Type</th>
                  <th>Length/Value</th>
                  <th>Constraints</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {columns.map((column, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={column.columnName}
                        required
                        onChange={(event) => updateColumn(index, 'columnName', event.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        value={column.dataType}
                        onChange={(event) => updateColumn(index, 'dataType', event.target.value)}
                      >
                        <option value="">Select Type</option>
                        <option value="varchar">varchar</option>
                        <option value="int">int</option>
                        <option value="float">float</option>
                        <option value="date">date</option>
                        <option value="time">time</option>
                        <option value="datetime">datetime</option>
                        <option value="char">char</option>
                        <option value="text">text</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={column.length}
                        required
                        onChange={(event) => updateColumn(index, 'length', event.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        value={column.constraint}
                        onChange={(event) => updateColumn(index, 'constraint', event.target.value)}
                      >
                        <option value="">Select Constraint</option>
                        <option value="primary key">Primary key</option>
                        <option value="foreign key">Foreign key</option>
                        <option value="unique">Unique</option>
                        <option value="check">Check</option>
                        <option value="default">Default</option>
                        <option value="not null">Not null</option>
                        <option value="null">Null</option>
                        <option value="auto increment">Auto increment</option>
                        <option value="unsigned">Unsigned</option>
                        <option value="zerofill">Zerofill</option>
                        <option value="binary">Binary</option>
                        <option value="enum">Enum</option>
                        <option value="set">Set</option>
                        <option value="blob">Blob</option>
                        <option value="mediumblob">Mediumblob</option>
                        <option value="longblob">Longblob</option>
                        <option value="tinyblob">Tinyblob</option>
                        <option value="smallblob">Smallblob</option>
                        <option value="mediumtext">Mediumtext</option>
                        <option value="longtext">Longtext</option>
                        <option value="tinytext">Tinytext</option>
                        <option value="smalltext">Smalltext</option>
                      </select>
                    </td>
                    <td>
                      <div onClick={() => deleteColumn(index)} className='delete'>
                        <h4><Trash2 size={16} /></h4>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div onClick={addColumn} className='addcalaums'>
              <h4><Plus size={16} /> Add Column</h4>
            </div>
          </div>
        </div>
      </div>

      <aside className='componentChat'>
        <MaddyChatbot conversationKey='columns' />
      </aside>
    </div>
  )
}

export default Columns