import { useState } from 'react';
import { upgradePlan } from '../api';

const Icons = {
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  CreditCard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Loader: () => (
    <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
};

const PLANS = [
  {
    id: 'PRO',
    name: 'Pro',
    price: '$9.99',
    period: '/mes',
    features: ['500k tokens/mes', '60 requests/min', 'Soporte prioritario'],
    popular: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: '$49.99',
    period: '/mes',
    features: ['Tokens ilimitados', 'Sin límite de requests', 'Soporte dedicado'],
    popular: false,
  },
];

export default function UpgradeModal({ userId, onClose, onUpgraded }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('plan');
  const [selectedPlan, setSelectedPlan] = useState('PRO');

  const handlePayment = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    try {
      await upgradePlan(userId, selectedPlan);
      setStep('success');
      setTimeout(() => {
        onUpgraded();
        onClose();
      }, 1500);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <Icons.Close />
        </button>

        {step === 'plan' && (
          <>
            <div className="modal-header">
              <h2>Actualizar Plan</h2>
              <p>Elige el plan que mejor se adapte a tus necesidades</p>
            </div>
            <div className="plans-grid">
              {PLANS.map(plan => (
                <div 
                  key={plan.id}
                  className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && <span className="plan-badge-tag">Más popular</span>}
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    <span className="price">{plan.price}</span>
                    <span className="period">{plan.period}</span>
                  </div>
                  <ul className="plan-features">
                    {plan.features.map((f, i) => (
                      <li key={i}>
                        <Icons.Check />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="plan-select">
                    <div className="radio-dot" />
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>Cancelar</button>
              <button className="btn-continue" onClick={() => setStep('payment')}>
                Continuar
              </button>
            </div>
          </>
        )}

        {step === 'payment' && (
          <>
            <div className="modal-header">
              <h2>Payment</h2>
              <p>Plan {selectedPlan} - {PLANS.find(p => p.id === selectedPlan)?.price}/mes</p>
            </div>
            <div className="payment-form">
              <div className="input-group">
                <Icons.CreditCard />
                <input type="text" placeholder="Número de tarjeta" defaultValue="4242 4242 4242 4242" disabled />
              </div>
              <div className="payment-row">
                <div className="input-group compact">
                  <input type="text" placeholder="MM/AA" defaultValue="12/28" disabled />
                </div>
                <div className="input-group compact">
                  <input type="text" placeholder="CVV" defaultValue="123" disabled />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setStep('plan')}>Atrás</button>
              <button className="btn-pay" onClick={handlePayment} disabled={loading}>
                {loading ? <><Icons.Loader /> Procesando...</> : `Pagar y activar ${selectedPlan}`}
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <div className="success-state">
            <div className="success-icon">
              <Icons.Check />
            </div>
            <h2>¡Plan activated!</h2>
            <p>Ahora tienes acceso a {selectedPlan}</p>
          </div>
        )}
      </div>
    </div>
  );
}