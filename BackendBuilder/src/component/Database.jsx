import { Check, DatabaseZap, Lock, Link, User, Bot } from 'lucide-react';
import React, { useContext, useEffect, useMemo, useState } from 'react'
import '../style/Database.css'
import { Appcontext } from '../context/Backend';

const initialForm = {
  dbName: '',
  connectionUrl: '',
  password: '',
  dbType: '',
  username: ''
}

const statusSteps = [
  { key: 'input', label: 'Input started', value: 33 },
  { key: 'send', label: 'Data sent', value: 66 },
  { key: 'connect', label: 'Connected', value: 100 }
]

const Databases = () => {
  const { setDatabases, Database } = useContext(Appcontext)
  const [form, setForm] = useState(initialForm)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Waiting for details')
  const [botResponse, setBotResponse] = useState('I will check the database connection automatically once the details are complete.')
  const [isConnected, setIsConnected] = useState(null)
  const [activeStep, setActiveStep] = useState(0)

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
    try {
      setStatus('Checking the database connection...')
      setBotResponse('I am contacting the backend and validating the database connection details.')
      setProgress(66)
      setActiveStep(1)
      setIsConnected(null)

      const dbObject = new Database(form.dbName, form.username, form.password, form.connectionUrl, form.dbType)
      setDatabases(prev => [...prev, dbObject])

      const response = await fetch('http://localhost:8080/api/database/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dbObject)
      })

      const result = await response.json().catch(() => ({}))
      const payload = result && typeof result === 'object' ? result : {}
      const backendMessage = payload.message || payload.response || payload.details || payload.error || payload.status || 'No response message received from backend.'
      const isSuccess = payload.success ?? response.ok
      const finalMessage = isSuccess
        ? `Connection successful. ${backendMessage}`
        : `Connection failed. ${backendMessage}`

      setIsConnected(isSuccess)
      setProgress(isSuccess ? 100 : 66)
      setActiveStep(isSuccess ? 2 : 1)
      setStatus(finalMessage)
      setBotResponse(finalMessage)
    } catch (error) {
      console.error('Connection error:', error)
      const fallbackMessage = 'Connection failed. The backend is unreachable or the database credentials are invalid.'
      setIsConnected(false)
      setProgress(66)
      setActiveStep(1)
      setStatus(fallbackMessage)
      setBotResponse(fallbackMessage)
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