import { Check, DatabaseZap, Lock, Link, User, Bot } from 'lucide-react';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import '../style/Database.css'
import { Appcontext } from '../context/Backend';
import client from '../api/client';
import { normalizeFriendlyErrorMessage } from '../utils/backendApi';

const initialForm = {
  dbName: '',
  connectionUrl: '',
  password: '',
  dbType: '',
  username: ''
}

const DEFAULT_DATABASE_TYPE = 'PostgreSQL'

const statusSteps = [
  { key: 'input', label: 'Input started', value: 33 },
  { key: 'send', label: 'Data sent', value: 66 },
  { key: 'connect', label: 'Connected', value: 100 }
]

const Databases = () => {
  const { setDatabases, activeDatabase, setActiveDatabase, Database, backendApi, userId, currentUser } = useContext(Appcontext)
  const [form, setForm] = useState(initialForm)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Waiting for details')
  const [botResponse, setBotResponse] = useState('I will check the database connection automatically once the details are complete.')
  const [isConnected, setIsConnected] = useState(null)
  const [activeStep, setActiveStep] = useState(0)
  const requestInFlight = useRef(false)

  useEffect(() => {
    if (!activeDatabase) {
      setForm(initialForm)
      setProgress(0)
      setStatus('Waiting for details')
      setBotResponse('I will check the database connection automatically once the details are complete.')
      setIsConnected(null)
      setActiveStep(0)
      return
    }

    const loadedForm = {
      dbName: activeDatabase.DBname || activeDatabase.dbName || activeDatabase.name || '',
      connectionUrl: activeDatabase.DBurl || activeDatabase.dbUrl || activeDatabase.connectionUrl || '',
      password: activeDatabase.Password || activeDatabase.password || '',
      dbType: activeDatabase.type || activeDatabase.databaseType || DEFAULT_DATABASE_TYPE,
      username: activeDatabase.Username || activeDatabase.username || '',
    }

    setForm(loadedForm)
    setProgress(100)
    setStatus('Database details loaded')
    setBotResponse('This saved database is ready to continue through the builder.')
    setIsConnected(true)
    setActiveStep(2)
  }, [activeDatabase])

  const steps = useMemo(() => statusSteps.map((step, index) => ({
    ...step,
    done: index === 0 ? progress >= 33 : index === 1 ? progress >= 66 || isConnected === true : isConnected === true,
    active: activeStep === index && !isConnected,
    failed: isConnected === false && index === 2
  })), [progress, isConnected, activeStep])

  const handleChange = (event) => {
    const { name, value } = event.target
    const nextForm = { ...form, [name]: value }
    setForm(nextForm)

    const fieldMap = {
      dbName: 'DBname',
      connectionUrl: 'DBurl',
      password: 'Password',
      dbType: 'type',
      username: 'Username',
    }

    const draftDatabase = {
      DBname: nextForm.dbName.trim() || activeDatabase?.DBname || activeDatabase?.dbName || activeDatabase?.name || 'Database',
      DBurl: nextForm.connectionUrl.trim() || activeDatabase?.DBurl || activeDatabase?.dbUrl || activeDatabase?.connectionUrl || '',
      Password: nextForm.password || activeDatabase?.Password || activeDatabase?.password || '',
      type: nextForm.dbType || activeDatabase?.type || activeDatabase?.databaseType || activeDatabase?.dbType || DEFAULT_DATABASE_TYPE,
      Username: nextForm.username.trim() || activeDatabase?.Username || activeDatabase?.username || '',
      projectName: nextForm.dbName.trim() || activeDatabase?.projectName || activeDatabase?.DBname || activeDatabase?.dbName || activeDatabase?.name || 'Database',
      status: 'In Progress',
      Tables: Array.isArray(activeDatabase?.Tables) ? activeDatabase.Tables : [],
      DBconnection: Array.isArray(activeDatabase?.DBconnection) ? activeDatabase.DBconnection : [],
    }

    setActiveDatabase((database) => ({
      ...(database || {}),
      ...draftDatabase,
      [fieldMap[name]]: value,
    }))

    setDatabases((previousDatabases) => {
      const baseDatabases = Array.isArray(previousDatabases) ? previousDatabases : []
      if (!baseDatabases.length) {
        return [draftDatabase]
      }

      const nextList = [...baseDatabases]
      const lastIndex = nextList.length - 1
      nextList[lastIndex] = {
        ...nextList[lastIndex],
        ...draftDatabase,
        [fieldMap[name]]: value,
      }
      return nextList
    })

    const hasAnyValue = Object.values(nextForm).some((item) => item.trim() !== '')
    const allFilled = Object.values(nextForm).every((item) => item.trim() !== '')

    if (!hasAnyValue) {
      setProgress(0)
      setStatus('Waiting for details')
      setBotResponse('I will check the database connection automatically once the details are complete.')
      setIsConnected(null)
      setActiveStep(0)
      return
    }

    if (!allFilled) {
      setProgress(33)
      setStatus('User is entering the details...')
      setBotResponse('I am collecting the database credentials to verify the connection.')
      setIsConnected(null)
      setActiveStep(0)
      return
    }

    setProgress(66)
    setStatus('Sending data to backend...')
    setBotResponse('Checking the database connection and validating the credentials now...')
    setActiveStep(1)
    setIsConnected(null)
  }

  const testConnection = async () => {
    if (requestInFlight.current) return

    requestInFlight.current = true

    try {
      setStatus('Checking the database connection...')
      setBotResponse('I am contacting the backend and validating the database connection details.')
      setProgress(66)
      setActiveStep(1)
      setIsConnected(null)

      const databasePayload = {
        DBname: form.dbName.trim(),
        Username: form.username.trim(),
        Password: form.password,
        DBurl: form.connectionUrl.trim(),
        type: form.dbType,
      }

      const response = await client.post('/api/database/test-connection', databasePayload)

      const payload = response?.data && typeof response.data === 'object' ? response.data : {}
      const backendMessage = payload.message || payload.response || payload.details || payload.error || payload.status || 'No response message received from backend.'
      const isSuccess = payload.success ?? (response.status >= 200 && response.status < 300)
      const finalMessage = isSuccess
        ? `Connection successful. ${backendMessage}`
        : `Connection failed. ${backendMessage}`

      if (isSuccess) {
        const authenticatedUserId = userId || currentUser?.id || currentUser?.userId

        if (!authenticatedUserId) {
          throw new Error('You must be signed in before saving a database.')
        }

        if (!activeDatabase) {
          await backendApi.addDatabaseToUser(authenticatedUserId, databasePayload)
          const createdDatabase = new Database(
            databasePayload.DBname,
            databasePayload.Username,
            databasePayload.Password,
            databasePayload.DBurl,
            databasePayload.type
          )
          setActiveDatabase(createdDatabase)
          setDatabases((previousDatabases) => [...previousDatabases, createdDatabase])
        }
      }

      setIsConnected(isSuccess)
      setProgress(isSuccess ? 100 : 66)
      setActiveStep(isSuccess ? 2 : 1)
      setStatus(finalMessage)
      setBotResponse(finalMessage)
    } catch (error) {
      console.error('Connection error:', error)
      const backendError = error?.response?.data?.message || error?.response?.data?.error || error?.message
      const fallbackMessage = normalizeFriendlyErrorMessage(
        backendError || 'Connection failed. The backend is unreachable or the database credentials are invalid.'
      )
      setIsConnected(false)
      setProgress(66)
      setActiveStep(1)
      setStatus(fallbackMessage)
      setBotResponse(fallbackMessage)
    } finally {
      requestInFlight.current = false
    }
  }

  useEffect(() => {
    const allFilled = Object.values(form).every((item) => item.trim() !== '')
    if (allFilled && progress === 66 && isConnected === null) {
      const timer = setTimeout(testConnection, 2200)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, progress])

  return (
    <form id='database-form' className='Database' onSubmit={(event) => event.preventDefault()}>

      <div className='part11'>

        <div className='name'>
          <h5>Database Name</h5>
          <div>
            <DatabaseZap className='icon' />
            <input name='dbName' type='text' value={form.dbName} onChange={handleChange} required />
          </div>
          <p>Enter your database name</p>
        </div>

        <div className='url'>
          <h5>Connection URL</h5>
          <div>
            <Link className='icon' />
            <input name='connectionUrl' type='url' value={form.connectionUrl} onChange={handleChange} required />
          </div>
          <p>Enter your database connection URL</p>
        </div>

        <div className='password'>
          <h5>Password</h5>
          <div>
            <Lock className='icon' />
            <input name='password' type='password' value={form.password} onChange={handleChange} required />
          </div>
          <p>Enter your database password</p>
        </div>

        <button type='button' onClick={testConnection}>Test Connection</button>

      </div>

        <div className='part2'>

          <div>

            <h5>Database Type</h5>
            <select name='dbType' className='typeDB' value={form.dbType} onChange={handleChange} required>
              <option value='' disabled>Select database type</option>
              <option value='SQL'>SQL</option>
              <option value='PostgreSQL'>PostgreSQL</option>
              <option value='MySQL'>MySQL</option>
              <option value='MongoDB'>MongoDB</option>
            </select>
            <p>Select your database type</p>
          </div>

          <div>

            <h5>Username</h5>
            <div>
              <User className='icon' />
              <input name='username' type='text' value={form.username} onChange={handleChange} required />
            </div>
            <p>Enter your database username</p>

          </div>

        </div>

        <div className={`ConnectionStatus ${isConnected === false ? 'error' : ''}`}>

          <div className='statusHeader'>
            <div className='logoBox'>
              <Bot size={20} />
            </div>
            <div className='text'>
              <h4>Connection Status {isConnected === false? 'Failed' : 'Success'}</h4>
            </div>
          </div>

          <div className='statusProgress'>
            <div className='statusBar'>
              <span className={`statusFill ${isConnected === false ? 'errorFill' : ''}`} style={{ width: `${progress}%` }}></span>
            </div>
            <span className='statusValue'>{progress}%</span>
          </div>

          <div className='statusList'>
            {steps.map((step) => (
              <div key={step.key} className={`statusItem ${step.done ? 'done' : ''} ${step.active ? 'active' : ''} ${step.failed ? 'failed' : ''}`}>
                <span className='statusDot'>
                  {step.done ? (step.failed ? '!' : <Check size={12} />) : step.value + '%'}
                </span>
                <span className='statusText'>{step.label}</span>
              </div>
            ))}
          </div>

          <div className='botResponse'>
            <div className='botResponseHeader'>
              <span className='botBadge'>Bot</span>
              <span className='botLabel'>Connection Check</span>
            </div>
            <p>{botResponse}</p>
          </div>

        </div>

      </form>
  )
}

export default Databases