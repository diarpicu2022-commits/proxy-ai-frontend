const COLORS = {
  FREE: { bg: '#475569', text: '#F8FAFC' },
  PRO: { bg: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', text: '#F8FAFC' },
  ENTERPRISE: { bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', text: '#F8FAFC' },
};

const PLAN_LABELS = {
  FREE: 'Free',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
};

export default function PlanBadge({ plan }) {
  const color = COLORS[plan] || COLORS.FREE;
  const label = PLAN_LABELS[plan] || plan;
  
  return (
    <span 
      className="plan-badge"
      style={{ 
        background: color.bg,
        color: color.text,
      }}
    >
      {label}
    </span>
  );
}