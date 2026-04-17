import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Icons = {
  Chart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
};

export default function UsageChart({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="usage-chart">
      <div className="chart-header">
        <Icons.Chart />
        <span>Uso diario (7 días)</span>
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={history} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#64748B', fontSize: 10 }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#64748B', fontSize: 10 }} 
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
          />
          <Tooltip
            contentStyle={{ 
              background: '#1E293B', 
              border: '1px solid #334155', 
              borderRadius: '8px',
              fontSize: '12px',
              color: '#F8FAFC'
            }}
            labelStyle={{ color: '#94A3B8', marginBottom: '4px' }}
            formatter={(value) => [`${value.toLocaleString()} tokens`, 'Uso']}
          />
          <Bar dataKey="tokensUsed" radius={[4, 4, 0, 0]}>
            {history.map((entry, i) => (
              <Cell 
                key={i} 
                fill={entry.tokensUsed > 0 ? 'url(#gradient)' : '#334155'} 
              />
            ))}
          </Bar>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}