import React, { useContext, useEffect, useRef, useState } from 'react'
import MaddyChatbot from './MaddyChatbot'
import '../style/TableConnection.css'
import { Appcontext } from '../context/Backend'
import { ArrowRight, Check, Link2, Menu, Sheet, Target } from 'lucide-react'

const TableConnection = () => {

  const { Tables, pendingConnection, setPendingConnection } = useContext(Appcontext)

  const TableConnection = [];

  const [parentTableName, setParentTableName] = useState(pendingConnection?.ParentTable || '')
  const [childTableName, setChildTableName] = useState(pendingConnection?.ChildTable || '')
  const [parentRelation, setParentRelation] = useState(pendingConnection?.ParentRelation || 'Onetoone')
  const [childRelation, setChildRelation] = useState(pendingConnection?.childRelation || 'Onetoone')
  const [showParentRelationMenu, setShowParentRelationMenu] = useState(false)
  const [showChildRelationMenu, setShowChildRelationMenu] = useState(false)
  const [selectedParentColumn, setSelectedParentColumn] = useState(pendingConnection?.ParentColumn || '')
  const [selectedChildColumn, setSelectedChildColumn] = useState(pendingConnection?.ChildColumn || '')
  const connectionsRef = useRef(null)
  const parentKeyRef = useRef(null)
  const childKeyRef = useRef(null)
  const [connector, setConnector] = useState(null)

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
  const childColumns = childTable?.colamnsname ?? []
  const childConstraints = childTable?.Constraints ?? []

  const parentKey = selectedParentColumn
  const childKey = selectedChildColumn

  useEffect(() => {
    setPendingConnection({
      ParentTable: parentTableName,
      ChildTable: childTableName,
      ParentColumn: selectedParentColumn,
      ChildColumn: selectedChildColumn,
      ParentRelation: parentRelation,
      childRelation,
    })
  }, [
    parentTableName,
    childTableName,
    selectedParentColumn,
    selectedChildColumn,
    parentRelation,
    childRelation,
    setPendingConnection,
  ])

  useEffect(() => {
    const updateConnector = () => {
      if (!connectionsRef.current || !parentKeyRef.current || !childKeyRef.current) {
        setConnector(null)
        return
      }

      const containerRect = connectionsRef.current.getBoundingClientRect()
      const parentRect = parentKeyRef.current.getBoundingClientRect()
      const childRect = childKeyRef.current.getBoundingClientRect()
      const startX = parentRect.right - containerRect.left
      const endX = childRect.left - containerRect.left
      const startY = parentRect.top + parentRect.height / 2 - containerRect.top
      const endY = childRect.top + childRect.height / 2 - containerRect.top
      const middleX = startX + (endX - startX) / 2
      const middleY = startY + (endY - startY) / 2

      setConnector({
        parent: {
          left: startX,
          top: startY,
          width: Math.max(middleX - startX - 14, 0),
          angle: Math.atan2(middleY - startY, middleX - 14 - startX) * (180 / Math.PI),
        },
        child: {
          left: middleX + 14,
          top: middleY,
          width: Math.max(endX - middleX - 14, 0),
          angle: Math.atan2(endY - middleY, endX - middleX - 14) * (180 / Math.PI),
        },
        node: {
          left: middleX,
          top: middleY,
        },
      })
    }

    const frameId = window.requestAnimationFrame(updateConnector)
    const resizeObserver = new ResizeObserver(updateConnector)

    if (connectionsRef.current) resizeObserver.observe(connectionsRef.current)
    if (parentKeyRef.current) resizeObserver.observe(parentKeyRef.current)
    if (childKeyRef.current) resizeObserver.observe(childKeyRef.current)

    window.addEventListener('resize', updateConnector)
    connectionsRef.current?.addEventListener('scroll', updateConnector)

    return () => {
      window.cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateConnector)
      connectionsRef.current?.removeEventListener('scroll', updateConnector)
    }
  }, [parentTableName, childTableName, selectedParentColumn, selectedChildColumn])

  const formatConstraint = (constraint) => {
    const normalizedConstraint = constraint.toLowerCase()
    const shortLabels = {
      'primary key': 'PK',
      'foreign key': 'FK',
      unique: 'UQ',
      check: 'CK',
      default: 'DF',
      'not null': 'NN',
      null: 'NULL',
      'auto increment': 'AI',
      unsigned: 'UN',
      zerofill: 'ZF',
      binary: 'BIN',
      enum: 'ENUM',
      set: 'SET',
      blob: 'BLOB',
      mediumblob: 'MBLOB',
      longblob: 'LBLOB',
      tinyblob: 'TBLOB',
      smallblob: 'SBLOB',
      mediumtext: 'MTEXT',
      longtext: 'LTEXT',
      tinytext: 'TTEXT',
      smalltext: 'STEXT'
    }

    if (shortLabels[normalizedConstraint]) return shortLabels[normalizedConstraint]
    return constraint || 'Column'
  }

  const renderRelationMenu = (selectedRelation, setSelectedRelation, closeMenu) => (
    <div className='relationMenu'>
      {relations.map((item) => (
        <button
          type='button'
          className={`relationOption${selectedRelation === item.value ? ' selected' : ''}`}
          key={item.value}
          onClick={() => {
            setSelectedRelation(item.value)
            closeMenu()
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  )

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
                    onChange={(event) => {
                      setParentTableName(event.target.value)
                      setSelectedParentColumn('')
                    }}
                   />
                 </div>


                </div>
              ))
            }

          </div>

        </div>

        <div className='Connection'>

          <div className='Connections' ref={connectionsRef}>

            <div className='ParentTable'>

              <div className='text'>

                <Sheet className=' text-blue-800' size={25} strokeWidth={2} />

                <h5>{parentTable?.TableNames || 'parent table'}</h5>

                <div className='relationControl'>
                  <button
                    type='button'
                    className='relationButton'
                    aria-label='Choose relationship type'
                    aria-expanded={showParentRelationMenu}
                    onClick={() => setShowParentRelationMenu((isOpen) => !isOpen)}
                  >
                    <Menu className='relationIcon' size={14} />
                  </button>
                  {showParentRelationMenu && renderRelationMenu(
                    parentRelation,
                    setParentRelation,
                    () => setShowParentRelationMenu(false)
                  )}
                </div>

              </div>


              <div className='ParentColums keyList'>
                {parentColumns.length ? parentColumns.map((column, index) => {
                  const constraint = parentConstraints[index] || ''
                  const selectable = constraint.toLowerCase() === 'primary key'
                  const selected = selectedParentColumn === column

                  return (
                    <button
                      type='button'
                      className={`columnRow keyRow ${selectable ? 'selectableKey' : 'disabledKey'}${selected ? ' selectedKey' : ''}`}
                      key={`${column}-${index}`}
                      ref={selected ? parentKeyRef : null}
                      disabled={!selectable}
                      onClick={() => setSelectedParentColumn(selected ? '' : column)}
                    >
                      <span className='columnName'>{column || 'Unnamed column'}</span>
                      <span className='keyLabel'>{formatConstraint(constraint)}</span>
                      <span className='columnPoint' />
                    </button>
                  )
                }) : (
                  <p>Select a parent table to view its columns.</p>
                )}
              </div>

            

            </div>

            <div className='ChildTable'>
              <div className='childKeyHeader'>
                <Sheet className='text-blue-800' size={25} strokeWidth={2} />
                <h5>{childTable?.TableNames || 'child table'}</h5>
                <div className='relationControl'>
                  <button
                    type='button'
                    className='relationButton'
                    aria-label='Choose relationship type'
                    aria-expanded={showChildRelationMenu}
                    onClick={() => setShowChildRelationMenu((isOpen) => !isOpen)}
                  >
                    <Menu className='relationIcon' size={14} />
                  </button>
                  {showChildRelationMenu && renderRelationMenu(
                    childRelation,
                    setChildRelation,
                    () => setShowChildRelationMenu(false)
                  )}
                </div>
              </div>

              <div className='ParentColums keyList'>
                {childColumns.length ? childColumns.map((column, index) => {
                  const constraint = childConstraints[index] || ''
                  const selectable = constraint.toLowerCase() === 'foreign key'
                  const selected = selectedChildColumn === column

                  return (
                    <button
                      type='button'
                      className={`columnRow keyRow ${selectable ? 'selectableKey' : 'disabledKey'}${selected ? ' selectedKey' : ''}`}
                      key={`${column}-${index}`}
                      ref={selected ? childKeyRef : null}
                      disabled={!selectable}
                      onClick={() => setSelectedChildColumn(selected ? '' : column)}
                    >
                      <span className='columnPoint' />
                      <span className='columnName'>{column || 'Unnamed column'}</span>
                      <span className='keyLabel'>{formatConstraint(constraint)}</span>
                    </button>
                  )
                }) : (
                  <p>Select a child table to view its columns.</p>
                )}
              </div>

            </div>

            {connector && (
              <div className='connectionBridge' aria-label='Primary key connected to foreign key'>
                <span
                  className='connectionLine'
                  style={{
                    left: connector.parent.left,
                    top: connector.parent.top,
                    width: connector.parent.width,
                    transform: `rotate(${connector.parent.angle}deg)`,
                  }}
                />
                <span
                  className='connectionLine'
                  style={{
                    left: connector.child.left,
                    top: connector.child.top,
                    width: connector.child.width,
                    transform: `rotate(${connector.child.angle}deg)`,
                  }}
                />
                <span
                  className='connectionNode'
                  style={{ left: connector.node.left, top: connector.node.top }}
                >
                <Link2 size={14} />
                </span>
              </div>
            )}

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
                    onChange={(event) => {
                      setChildTableName(event.target.value)
                      setSelectedChildColumn('')
                    }}
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