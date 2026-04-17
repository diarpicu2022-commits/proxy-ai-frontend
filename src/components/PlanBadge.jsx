const COLORS = {
  FREE: { bg: '#6b7280', text: '#fff' },
  PRO: { bg: '#7c3aed', text: '#fff' },
  ENTERPRISE: { bg: '#d97706', text: '#fff' },
};

export default function PlanBadge({ plan }) {
  const color = COLORS[plan] || COLORS.FREE;
  return (
    <span style={{
      background: color.bg,
      color: color.text,
      padding: '4px 12px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: '700',
      letterSpacing: '1px',
    }}>
      {plan}
    </span>
  );
}
