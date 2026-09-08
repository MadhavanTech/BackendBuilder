import React, { useContext, useState } from 'react'
import MaddyChatbot from './MaddyChatbot'
import '../style/TableConnection.css'
import { Appcontext } from '../context/Backend'
import { ArrowRight, Check, Link2, Menu, Sheet, Target } from 'lucide-react'

const TableConnection = () => {

  const { Tables, TableConnections } = useContext(Appcontext)

  const TableConnection = [];

  const [parentTableName, setParentTableName] = useState('')
  const [childTableName, setChildTableName] = useState('')
  const [relation, setRelation] = useState('Onetoone')
  const [showRelationMenu, setShowRelationMenu] = useState(false)

  const relations = [
    { value: 'Onetoone', label: 'One To One' },
    { value: 'Onetomany', label: 'One To Many' },
    { value: 'manytoone', label: 'Many To One' },
    { value: 'manytomany', label: 'Many To Many' },
  ]

  const parentTable = Tables.find(
    (table) => table.TableNames === parentTableName
  )

  const childTable = Tables.find(
    (table) => table.TableNames === childTableName
  )

  const parentColumns = parentTable?.colamnsname ?? []
  const parentConstraints = parentTable?.Constraints ?? []

  return (
    <div className='componentWithChat'>
      <div className='workflowPage'>

        <div className='parent'>

          <div className='text'>
            
            <h4>Parent Table</h4>
            <p>Select a table to act as the parent </p>

          </div>

          <div className='Tables'>

            {
              Tables.map((table, index) => (
                <div key={index} className='Tablesnams'>

                  <Sheet className='tableSheetIcon' size={25} strokeWidth={2} />

                 <div className='text'>
                   <h4>{table.TableNames}</h4>

                   <p><span>{table.colamnsname.length}</span> columns</p>

                 </div>

                 <div className='radio'>
                   <input
                     type='radio'
                     name='ParentTable'
                     value={table.TableNames}
                     checked={parentTableName === table.TableNames}
                     onChange={(event) => setParentTableName(event.target.value)}
                   />
                 </div>


                </div>
              ))
            }

          </div>

        </div>

        <div className='Connection'>

          <div className='Connections'>

            <div className='ParentTable'>

              <div className='text'>

                <Sheet className=' text-blue-800' size={25} strokeWidth={2} />

                <h5>{parentTable?.TableNames || 'parent table'}</h5>

                <div className='relationControl'>
                  <button
                    type='button'
                    className='relationButton'
                    aria-label='Choose relationship type'
                    aria-expanded={showRelationMenu}
                    onClick={() => setShowRelationMenu((isOpen) => !isOpen)}
                  >
                    <Menu className='relationIcon' size={14} />
                  </button>
                  {showRelationMenu && (
                    <div className='relationMenu'>
                      {relations.map((item) => (
                        <button
                          type='button'
                          className={`relationOption${relation === item.value ? ' selected' : ''}`}
                          key={item.value}
                          onClick={() => {
                            setRelation(item.value)
                            setShowRelationMenu(false)
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>


              <div className='ParentColums'>

                {
                  parentConstraints.length ? parentConstraints.map((constraint, index) => (
                    <div className='colums'>

                      <span></span>

                      <div className='columsselect'>
                        <h5>{constraint}</h5>
                        <span></span>
                      </div>

                    </div>
                  )) : (
                    <p>Select a parent table to view its columns.</p>
                  )
                }

              </div>

            

            </div>

            <div className='ChildTable'>

            </div>


          </div>

        </div>

        <div className='Child'>

          <div className='text'>

            <h4>Child Table</h4>
            <p>Select a table to act as the child </p>
          </div>

          <div className='Tables'>

            {
              Tables.map((table, index)=> (

                <div key={index} className='Tablesnams'>

                  <Sheet className='tableSheetIcon' size={25} strokeWidth={2} />

                   <div className='text'>
                   <h4>{table.TableNames}</h4>

                   <p><span>{table.colamnsname.length}</span> columns</p>

                 </div>

                 <div className='radio'>
                   <input
                     type='radio'
                     name='ChildTable'
                     value={table.TableNames}
                     checked={childTableName === table.TableNames}
                     onChange={(event) => setChildTableName(event.target.value)}
                   />
                 </div>

                </div>
              ))
            }


          </div>


        </div>

      </div>
      <aside className='componentChat'>
        <MaddyChatbot conversationKey='connection' />
      </aside>
    </div>
  )
}

export default TableConnection