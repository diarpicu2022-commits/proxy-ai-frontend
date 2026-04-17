import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function UsageChart({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <div style={{ marginTop: '16px' }}>
      <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '8px' }}>
        Uso diario (últimos 7 días)
      </p>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={history} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', fontSize: '12px' }}
            labelStyle={{ color: '#e5e7eb' }}
            formatter={(v) => [`${v} tokens`, 'Uso']}
          />
          <Bar dataKey="tokensUsed" radius={[3, 3, 0, 0]}>
            {history.map((entry, i) => (
              <Cell key={i} fill={entry.tokensUsed > 0 ? '#7c3aed' : '#374151'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
