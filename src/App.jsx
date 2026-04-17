import { useState, useEffect, useCallback } from 'react';
import { getQuotaStatus, getQuotaHistory } from './api';
import ChatInterface from './components/ChatInterface';
import QuotaIndicator from './components/QuotaIndicator';
import RateLimitCounter from './components/RateLimitCounter';
import UsageChart from './components/UsageChart';
import PlanBadge from './components/PlanBadge';
import UpgradeModal from './components/UpgradeModal';
import './App.css';

export default function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem('ai_userId') || '');
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
    localStorage.setItem('ai_userId', id);
    setUserId(id);
  };

  if (!userId) {
    return (
      <div style={{
        minHeight: '100vh', background: '#030712', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: '#111827', border: '1px solid #1f2937', borderRadius: '16px',
          padding: '48px 40px', width: '360px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <h1 style={{ color: '#e5e7eb', marginBottom: '8px', fontSize: '22px' }}>ThoughtFlow</h1>
          <p style={{ color: '#6b7280', marginBottom: '28px', fontSize: '14px' }}>
            Patrón Proxy · Rate Limiting · Cuotas por Plan
          </p>
          <input
            value={loginInput}
            onChange={e => setLoginInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Tu nombre de usuario"
            style={{
              width: '100%', padding: '12px', borderRadius: '8px',
              border: '1px solid #374151', background: '#1f2937',
              color: '#e5e7eb', fontSize: '15px', boxSizing: 'border-box',
              outline: 'none', marginBottom: '12px',
            }}
          />
          <button onClick={login} style={{
            width: '100%', padding: '12px', borderRadius: '8px',
            border: 'none', background: '#7c3aed', color: '#fff',
            fontWeight: '700', fontSize: '15px', cursor: 'pointer',
          }}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', flexDirection: 'column' }}>
      {showUpgrade && (
        <UpgradeModal
          userId={userId}
          onClose={() => setShowUpgrade(false)}
          onUpgraded={fetchQuota}
        />
      )}

      <header style={{
        background: '#111827', borderBottom: '1px solid #1f2937',
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <span style={{ color: '#e5e7eb', fontWeight: '700', fontSize: '16px' }}>ThoughtFlow</span>
          <span style={{ color: '#4b5563', fontSize: '13px' }}>· Patrón Proxy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#6b7280', fontSize: '13px' }}>@{userId}</span>
          {quota && <PlanBadge plan={quota.plan} />}
          {quota && quota.plan === 'FREE' && (
            <button
              onClick={() => setShowUpgrade(true)}
              style={{
                padding: '6px 14px', borderRadius: '6px', border: '1px solid #7c3aed',
                background: 'transparent', color: '#7c3aed', fontSize: '13px', cursor: 'pointer',
              }}
            >
              Upgrade
            </button>
          )}
          <button
            onClick={() => { localStorage.removeItem('ai_userId'); setUserId(''); }}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #374151', background: 'transparent', color: '#6b7280', fontSize: '12px', cursor: 'pointer' }}
          >
            Salir
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', height: 'calc(100vh - 57px)' }}>
        <aside style={{
          width: '280px', background: '#111827', borderRight: '1px solid #1f2937',
          padding: '20px', overflowY: 'auto', flexShrink: 0,
        }}>
          <QuotaIndicator quota={quota} />
          <RateLimitCounter quota={quota} />
          <UsageChart history={history} />
          {quota && quota.plan === 'FREE' && (
            <button
              onClick={() => setShowUpgrade(true)}
              style={{
                width: '100%', marginTop: '20px', padding: '10px',
                borderRadius: '8px', border: 'none', background: '#7c3aed',
                color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '13px',
              }}
            >
              Actualizar a PRO
            </button>
          )}
        </aside>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
