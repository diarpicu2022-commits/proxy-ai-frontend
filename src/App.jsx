import { useState, useEffect, useCallback } from 'react';
import { getQuotaStatus, getQuotaHistory } from './api';
import ChatInterface from './components/ChatInterface';
import QuotaIndicator from './components/QuotaIndicator';
import RateLimitCounter from './components/RateLimitCounter';
import UsageChart from './components/UsageChart';
import PlanBadge from './components/PlanBadge';
import UpgradeModal from './components/UpgradeModal';
import './App.css';

const Icons = {
  Logo: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  ),
};

export default function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem('tf_userId') || '');
  const [loginInput, setLoginInput] = useState('');
  const [quota, setQuota] = useState(null);
  const [history, setHistory] = useState([]);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const fetchQuota = useCallback(async () => {
    if (!userId) return;
    try {
      const [qRes, hRes] = await Promise.all([
        getQuotaStatus(userId),
        getQuotaHistory(userId),
      ]);
      setQuota(qRes.data);
      setHistory(hRes.data);
    } catch {}
  }, [userId]);

  useEffect(() => {
    fetchQuota();
    const interval = setInterval(fetchQuota, 5000);
    return () => clearInterval(interval);
  }, [fetchQuota]);

  const login = () => {
    if (!loginInput.trim()) return;
    const id = loginInput.trim();
    localStorage.setItem('tf_userId', id);
    setUserId(id);
  };

  if (!userId) {
    return (
      <div className="login-container">
        <div className="login-card fade-in">
          <div className="login-header">
            <div className="login-icon">
              <Icons.Sparkles />
            </div>
            <h1>ThoughtFlow</h1>
            <p className="login-subtitle">Tu asistente de IA con límites inteligentes</p>
          </div>
          <div className="login-form">
            <div className="input-group">
              <Icons.User />
              <input
                type="text"
                value={loginInput}
                onChange={e => setLoginInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()}
                placeholder="Ingresa tu nombre de usuario"
                autoFocus
              />
            </div>
            <button onClick={login} className="login-btn">
              <span>Comenzar</span>
              <Icons.Send />
            </button>
          </div>
          <div className="login-features">
            <div className="feature">
              <span className="feature-dot green"></span>
              <span>Rate Limiting</span>
            </div>
            <div className="feature">
              <span className="feature-dot purple"></span>
              <span>Cuotas por Plan</span>
            </div>
            <div className="feature">
              <span className="feature-dot blue"></span>
              <span>Historial 7 días</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {showUpgrade && (
        <UpgradeModal
          userId={userId}
          onClose={() => setShowUpgrade(false)}
          onUpgraded={fetchQuota}
        />
      )}

      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <Icons.Logo />
            <span>ThoughtFlow</span>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="username">@{userId}</span>
            {quota && <PlanBadge plan={quota.plan} />}
          </div>
          {quota && quota.plan === 'FREE' && (
            <button className="upgrade-btn" onClick={() => setShowUpgrade(true)}>
              Upgrade
            </button>
          )}
          <button className="logout-btn" onClick={() => { localStorage.removeItem('tf_userId'); setUserId(''); }}>
            <Icons.Logout />
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <div className="sidebar-section">
            <QuotaIndicator quota={quota} />
          </div>
          <div className="sidebar-section">
            <RateLimitCounter quota={quota} />
          </div>
          <div className="sidebar-section">
            <UsageChart history={history} />
          </div>
          {quota && quota.plan === 'FREE' && (
            <button className="upgrade-sidebar-btn" onClick={() => setShowUpgrade(true)}>
              Actualizar a PRO
            </button>
          )}
        </aside>

        <main className="main-content">
          <ChatInterface
            userId={userId}
            quota={quota}
            onResponse={fetchQuota}
            onRateLimit={fetchQuota}
            onQuotaExceeded={() => setShowUpgrade(true)}
          />
        </main>
      </div>
    </div>
  );
}