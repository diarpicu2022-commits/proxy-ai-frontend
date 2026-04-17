export default function QuotaIndicator({ quota }) {
  if (!quota) return null;

  const isEnterprise = quota.plan === 'ENTERPRISE';
  const pct = isEnterprise ? 0 : Math.min(100, (quota.tokensUsed / quota.totalTokens) * 100);
  const barColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#22c55e';

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
        <span style={{ color: '#9ca3af' }}>Tokens mensuales</span>
        <span style={{ color: '#e5e7eb', fontWeight: '600' }}>
          {isEnterprise ? '∞ ilimitado' : `${quota.tokensUsed.toLocaleString()} / ${quota.totalTokens.toLocaleString()}`}
        </span>
      </div>
      <div style={{ background: '#374151', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
        {!isEnterprise && (
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
            transition: 'width 0.5s ease',
            borderRadius: '4px',
          }} />
        )}
        {isEnterprise && (
          <div style={{ width: '100%', height: '100%', background: '#d97706', borderRadius: '4px' }} />
        )}
      </div>
      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
        Reset: {quota.resetDate}
      </div>
    </div>
  );
}
