import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Appcontext } from '../context/Backend'
import './Style.css'

const CX = 700
const CY = 450

const PATHS = [
  `M ${CX - 170} ${CY - 160} L ${CX - 330} ${CY - 330} L 160 ${CY - 330} L 160 200 L 40 200`,
  `M ${CX + 170} ${CY - 160} L ${CX + 330} ${CY - 330} L 1240 ${CY - 330} L 1240 200 L 1360 200`,
  `M ${CX - 170} ${CY + 230} L ${CX - 330} ${CY + 400} L 160 ${CY + 400} L 160 700 L 40 700`,
  `M ${CX + 170} ${CY + 230} L ${CX + 330} ${CY + 400} L 1240 ${CY + 400} L 1240 700 L 1360 700`,
]

const NODES = [
  { x: 40, y: 200, side: 'right' },
  { x: 1360, y: 200, side: 'left' },
  { x: 40, y: 700, side: 'right' },
  { x: 1360, y: 700, side: 'left' },
]

const COLORS = { ok: '#37e08a', err: '#ff5c5c' }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Node({ x, y, side, color, active, delay }) {
  const boxW = 150
  const boxH = 60
  const bx = side === 'left' ? x : x - boxW
  const by = y - boxH / 2
  const tx = x - 8

  return (
    <g>
      <rect
        x={bx}
        y={by}
        width={boxW}
        height={boxH}
        rx={8}
        fill="#0c0d10"
        stroke={active ? color : '#242830'}
        strokeWidth={1}
        style={active ? { animation: 'circuitNodeGlow 1.4s ease-in-out infinite', animationDelay: `${delay}s` } : undefined}
      />
      {Array.from({ length: 3 }).map((_, r) =>
        Array.from({ length: 5 }).map((_, c) => (
          <circle key={`${r}-${c}`} cx={bx + 16 + c * 22} cy={by + 16 + r * 16} r={1.4} fill="#3a3f47" />
        ))
      )}
      <rect
        x={tx}
        y={y - 8}
        width={16}
        height={16}
        fill={active ? color : '#4a4f58'}
        style={
          active
            ? { filter: `drop-shadow(0 0 6px ${color})`, animation: 'circuitDotGlow 1.4s ease-in-out infinite', animationDelay: `${delay}s` }
            : undefined
        }
      />
    </g>
  )
}

const Sing_Page = ({ onSwitchToLogin }) => {
  const navigate = useNavigate()
  const { setLoginStatus } = useContext(Appcontext)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [nameState, setNameState] = useState(null)
  const [emailState, setEmailState] = useState(null)
  const [passwordState, setPasswordState] = useState(null)
  const [confirmState, setConfirmState] = useState(null)

  const [result, setResult] = useState(null) // null | 'ok' | 'err'
  const [pressed, setPressed] = useState(false)
  const [runId, setRunId] = useState(0)

  const activeColor = result === 'ok' ? COLORS.ok : result === 'err' ? COLORS.err : '#8fe9ff'

  const handleNameChange = (e) => {
    const value = e.target.value
    setName(value)
    setNameState(value.trim() ? value.trim().length >= 2 : null)
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    setEmailState(value.trim() ? EMAIL_RE.test(value.trim()) : null)
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)
    const trimmed = value.trim()
    setPasswordState(trimmed ? trimmed.length >= 6 : null)
    if (confirmPassword) {
      setConfirmState(confirmPassword === value)
    }
  }

  const handleConfirmChange = (e) => {
    const value = e.target.value
    setConfirmPassword(value)
    setConfirmState(value ? value === password : null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const nameIsValid = name.trim().length >= 2
    const emailIsValid = EMAIL_RE.test(email.trim())
    const passwordIsValid = password.trim().length >= 6
    const confirmIsValid = confirmPassword.length > 0 && confirmPassword === password

    setNameState(name.trim() ? nameIsValid : null)
    setEmailState(email.trim() ? emailIsValid : null)
    setPasswordState(password.trim() ? passwordIsValid : null)
    setConfirmState(confirmPassword ? confirmIsValid : null)

    setPressed(true)
    setTimeout(() => setPressed(false), 350)

    const allValid = nameIsValid && emailIsValid && passwordIsValid && confirmIsValid
    setResult(allValid ? 'ok' : 'err')
    setRunId((id) => id + 1)

    if (allValid) {
      // mark user as logged in and navigate to home after short delay
      setLoginStatus(true)
      setTimeout(() => {
        navigate('/home')
      }, 700)
    }
  }

  const wrapClass = (state) =>
    `input-row field-wrap${state === true ? ' is-valid' : state === false ? ' is-invalid' : ''}`

  return (
    <section className="screen">
      <style>{`
        @keyframes circuitTravel {
          0%   { opacity: 1; stroke-dashoffset: 2000; }
          8%   { opacity: 1; }
          85%  { opacity: 1; }
          100% { opacity: 0; stroke-dashoffset: 0; }
        }
        @keyframes circuitNodeGlow {
          0%, 100% { opacity: .45; }
          50%      { opacity: 1; }
        }
        @keyframes circuitDotGlow {
          0%, 100% { opacity: .5; }
          50%      { opacity: 1; }
        }
        .pulse-line {
          fill: none;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-dasharray: 140 2000;
          stroke-dashoffset: 2000;
          opacity: 0;
        }
        .pulse-line.run {
          animation: circuitTravel 1.4s cubic-bezier(.4,0,.2,1) infinite;
        }
      `}</style>

      <svg
        id="circuit-bg"
        viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
      >
        {PATHS.map((d, i) => (
          <path key={`static-${i}`} d={d} fill="none" stroke="#2b2f36" strokeWidth={1.5} />
        ))}

        {PATHS.map((d, i) => (
          <path
            key={`pulse-${runId}-${i}`}
            d={d}
            className={`pulse-line ${result ? 'run' : ''}`}
            stroke={activeColor}
            style={{
              filter: `drop-shadow(0 0 6px ${activeColor}) drop-shadow(0 0 14px ${activeColor}99)`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}

        {NODES.map((n, i) => (
          <Node key={i} x={n.x} y={n.y} side={n.side} color={activeColor} active={!!result} delay={i * 0.3 + 1.1} />
        ))}
      </svg>

      <form className="input" id="signupForm" noValidate onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
        <div className="logo"></div>

        <h1>Create Account</h1>

        <div className="text">
          <p>Already have an account?</p>
          <Link to="/login">Login</Link>
        </div>

        <div className="fields">
          <div className={wrapClass(nameState)}>
            <span className="icon">👤</span>
            <input type="text" id="fullName" placeholder="full name" value={name} onChange={handleNameChange} />
          </div>

          <div className={wrapClass(emailState)}>
            <span className="icon">✉</span>
            <input type="email" id="signupEmail" placeholder="email address" value={email} onChange={handleEmailChange} />
          </div>

          <div className={wrapClass(passwordState)}>
            <span className="icon">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              id="signupPassword"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
            />
            <span className="eye" onClick={() => setShowPassword((s) => !s)}>
              {showPassword ? '◎' : '◉'}
            </span>
          </div>

          <div className={wrapClass(confirmState)}>
            <span className="icon">🔒</span>
            <input
              type={showConfirm ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={handleConfirmChange}
            />
            <span className="eye" onClick={() => setShowConfirm((s) => !s)}>
              {showConfirm ? '◎' : '◉'}
            </span>
          </div>
        </div>

        <button type="submit" className={`login-btn${pressed ? ' pressed' : ''}`} id="signupBtn">
          Sign Up
        </button>

        <div className="divider"><span>OR</span></div>

        <footer className="optionse">
          <div className="option apple">◉</div>
          <div className="option google">G</div>
          <div className="option x">X</div>
        </footer>
      </form>
    </section>
  )
}

export default Sing_Page