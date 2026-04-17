import { useEffect, useState } from 'react';

const Icons = {
  Zap: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Clock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
};

export default function RateLimitCounter({ quota }) {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { return 60; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!quota) return null;

  const used = quota.requestsThisMinute;
  const limit = quota.requestsPerMinute;
  const isEnterprise = quota.plan === 'ENTERPRISE';
  const atLimit = !isEnterprise && used >= limit;
  const pct = isEnterprise ? 0 : (used / limit) * 100;

  return (
    <div className={`rate-limit-counter ${atLimit ? 'at-limit' : ''}`}>
      <div className="rate-header">
        <div className="rate-label">
          <Icons.Zap />
          <span>Requests / min</span>
        </div>
        <span className="rate-value">
          {isEnterprise ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>
      
      <div className="rate-bar">
        <div 
          className="rate-fill" 
          style={{ 
            width: isEnterprise ? '0%' : `${Math.min(pct, 100)}%`,
            background: atLimit ? '#EF4444' : 'var(--accent)'
          }} 
        />
      </div>
      
      <div className="rate-footer">
        <Icons.Clock />
        <span>Reset en <strong>{countdown}s</strong></span>
      </div>
      
      {atLimit && (
        <div className="rate-limit-warning">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>Rate limit alcanzado. Espera {countdown}s</span>
        </div>
      )}
    </div>
  );
}