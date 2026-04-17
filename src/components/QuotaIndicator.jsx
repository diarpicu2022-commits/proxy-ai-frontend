import React from 'react';

const Icons = {
  Tokens: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M2 12h20"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
};

export default function QuotaIndicator({ quota }) {
  if (!quota) return null;

  const isEnterprise = quota.plan === 'ENTERPRISE';
  const pct = isEnterprise ? 0 : Math.min(100, (quota.tokensUsed / quota.totalTokens) * 100);
  const barColor = pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#22C55E';

  return (
    <div className="quota-indicator">
      <div className="quota-header">
        <div className="quota-label">
          <Icons.Tokens />
          <span>Tokens Mensuales</span>
        </div>
        <span className="quota-value">
          {isEnterprise ? '∞' : `${quota.tokensUsed.toLocaleString()} / ${quota.totalTokens.toLocaleString()}`}
        </span>
      </div>
      <div className="quota-bar">
        {!isEnterprise && (
          <div 
            className="quota-fill" 
            style={{ 
              width: `${pct}%`,
              background: barColor
            }} 
          />
        )}
        {isEnterprise && (
          <div className="quota-fill unlimited" />
        )}
      </div>
      {!isEnterprise && (
        <div className="quota-footer">
          <Icons.Calendar />
          <span>Reset: {quota.resetDate}</span>
        </div>
      )}
      {isEnterprise && (
        <div className="quota-footer unlimited">
          <span>Plan ilimitado activo</span>
        </div>
      )}
    </div>
  );
}