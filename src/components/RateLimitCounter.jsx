import { useEffect, useState } from 'react';

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

  return (
    <div style={{
      background: atLimit ? '#450a0a' : '#1f2937',
      border: `1px solid ${atLimit ? '#ef4444' : '#374151'}`,
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '13px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#9ca3af' }}>
          Requests / min: <strong style={{ color: atLimit ? '#ef4444' : '#e5e7eb' }}>
            {isEnterprise ? `${used} / ∞` : `${used} / ${limit}`}
          </strong>
        </span>
        <span style={{ color: '#6b7280', fontSize: '11px' }}>
          Reset en <strong style={{ color: '#e5e7eb' }}>{countdown}s</strong>
        </span>
      </div>
      {atLimit && (
        <div style={{ color: '#ef4444', marginTop: '4px', fontSize: '12px' }}>
          Rate limit alcanzado. Espera {countdown}s para continuar.
        </div>
      )}
    </div>
  );
}
