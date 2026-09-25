import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CX = 700;
const CY = 450;

const PATHS = [
  `M ${CX - 170} ${CY - 160} L ${CX - 330} ${CY - 330} L 160 ${CY - 330} L 160 200 L 40 200`,
  `M ${CX + 170} ${CY - 160} L ${CX + 330} ${CY - 330} L 1240 ${CY - 330} L 1240 200 L 1360 200`,
  `M ${CX - 170} ${CY + 230} L ${CX - 330} ${CY + 400} L 160 ${CY + 400} L 160 700 L 40 700`,
  `M ${CX + 170} ${CY + 230} L ${CX + 330} ${CY + 400} L 1240 ${CY + 400} L 1240 700 L 1360 700`,
];

const NODES = [
  { x: 40, y: 200, side: 'right' },
  { x: 1360, y: 200, side: 'left' },
  { x: 40, y: 700, side: 'right' },
  { x: 1360, y: 700, side: 'left' },
];

const COLORS = { ok: '#37e08a', err: '#ff5c5c' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Node({ x, y, side, color, active, delay }) {
  const boxW = 150;
  const boxH = 60;
  const bx = side === 'left' ? x : x - boxW;
  const by = y - boxH / 2;
  const tx = x - 8;

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
  );
}

const Login_Page = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailState, setEmailState] = useState(null); // null | true | false
  const [passwordState, setPasswordState] = useState(null); // null | true | false
  const [result, setResult] = useState(null); // null | 'ok' | 'err'
  const [pressed, setPressed] = useState(false);
  const [runId, setRunId] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const activeColor = result === 'ok' ? COLORS.ok : result === 'err' ? COLORS.err : '#8fe9ff';

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (!value.trim()) {
      setEmailState(null);
    } else {
      setEmailState(EMAIL_RE.test(value.trim()));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const trimmed = value.trim();
    if (!trimmed) {
      setPasswordState(null);
    } else {
      setPasswordState(trimmed.length >= 6);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailIsValid = EMAIL_RE.test(email.trim());
    const passwordIsValid = password.trim().length >= 6;

    setEmailState(email.trim() ? emailIsValid : null);
    setPasswordState(password.trim() ? passwordIsValid : null);

    setPressed(true);
    setRunId((id) => id + 1);

    if (!emailIsValid || !passwordIsValid) {
      setResult('err');
      setErrorMessage('Enter a valid email and a password with at least 6 characters.');
      setPressed(false);
      return;
    }

    try {
      await login(email.trim(), password);
      setResult('ok');
      setErrorMessage('');
      navigate(location.state?.from || '/app/dashboard', { replace: true });
    } catch (error) {
      setResult('err');
      const status = error?.response?.status || error?.status;
      if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
        setErrorMessage('The backend login request timed out. Check the backend logs and database connection.');
      } else if (error?.message === 'Failed to fetch') {
        setErrorMessage('Unable to connect to the backend. Please try again.');
      } else if (status === 401) {
        setErrorMessage('Invalid email or password');
      } else if (status === 403) {
        setErrorMessage('You do not have permission to sign in.');
      } else {
        setErrorMessage(error?.response?.data?.message || error?.message || 'Unable to sign in.');
      }
    } finally {
      setPressed(false);
    }
  };

  const emailWrapClass = `input-row field-wrap${emailState === true ? ' is-valid' : emailState === false ? ' is-invalid' : ''}`;
  const passwordWrapClass = `input-row field-wrap${passwordState === true ? ' is-valid' : passwordState === false ? ' is-invalid' : ''}`;

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

      <form className="input" id="loginForm" noValidate onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
        <div className="logo"></div>

        <h1>Welcome Back</h1>

        <div className="text">
          <p>Don't have an account yet?</p>
          <a href="/signup" onClick={(event) => { event.preventDefault(); navigate('/signup'); }}>Sign up</a>
        </div>

        <div className="fields">
          <div className={emailWrapClass}>
            <span className="icon">✉</span>
            <input
              type="email"
              id="email"
              placeholder="email address"
              value={email}
              onChange={handleEmailChange}
            />
          </div>

          <div className={passwordWrapClass}>
            <span className="icon">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
            />
            <span className="eye" onClick={() => setShowPassword((s) => !s)}>
              {showPassword ? '◎' : '◉'}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className={`login-btn${pressed ? ' pressed' : ''}`}
          id="submitBtn"
          disabled={pressed}
          aria-busy={pressed}
        >
          {pressed ? 'Signing in...' : 'Login'}
        </button>

        {errorMessage && <p role="alert" className="login-error">{errorMessage}</p>}

        <div className="divider"><span>OR</span></div>

        <footer className="optionse">
          <div className="option apple">◉</div>
          <div className="option google">G</div>
          <div className="option x">X</div>
        </footer>
      </form>
    </section>
  );
};

export default Login_Page;