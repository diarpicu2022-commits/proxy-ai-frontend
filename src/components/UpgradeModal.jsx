import { useState } from 'react';
import { upgradePlan } from '../api';

export default function UpgradeModal({ userId, onClose, onUpgraded }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('plan'); // 'plan' | 'payment' | 'success'
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
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#111827', border: '1px solid #374151', borderRadius: '12px',
        padding: '32px', maxWidth: '440px', width: '90%',
      }}>
        {step === 'plan' && (
          <>
            <h2 style={{ color: '#e5e7eb', marginBottom: '8px' }}>Actualizar Plan</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
              Has agotado tu cuota mensual. Mejora tu plan para continuar.
            </p>
            {['PRO', 'ENTERPRISE'].map(plan => (
              <div key={plan}
                onClick={() => setSelectedPlan(plan)}
                style={{
                  border: `2px solid ${selectedPlan === plan ? '#7c3aed' : '#374151'}`,
                  borderRadius: '8px', padding: '16px', marginBottom: '12px',
                  cursor: 'pointer', background: selectedPlan === plan ? '#1e1033' : 'transparent',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#e5e7eb', fontWeight: '700' }}>{plan}</span>
                  <span style={{ color: '#7c3aed', fontWeight: '700' }}>
                    {plan === 'PRO' ? '$9.99/mes' : '$49.99/mes'}
                  </span>
                </div>
                <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
                  {plan === 'PRO' ? '500k tokens/mes · 60 req/min' : 'Tokens ilimitados · Sin límite de requests'}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #374151', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={() => setStep('payment')} style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                Continuar
              </button>
            </div>
          </>
        )}

        {step === 'payment' && (
          <>
            <h2 style={{ color: '#e5e7eb', marginBottom: '8px' }}>Simulación de Pago</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Plan {selectedPlan} — {selectedPlan === 'PRO' ? '$9.99/mes' : '$49.99/mes'}</p>
            <input placeholder="Número de tarjeta" disabled style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #374151', background: '#1f2937', color: '#6b7280', marginBottom: '10px', boxSizing: 'border-box' }} defaultValue="**** **** **** 4242" />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input placeholder="MM/AA" disabled style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #374151', background: '#1f2937', color: '#6b7280', boxSizing: 'border-box' }} defaultValue="12/28" />
              <input placeholder="CVV" disabled style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #374151', background: '#1f2937', color: '#6b7280', boxSizing: 'border-box' }} defaultValue="***" />
            </div>
            <button onClick={handlePayment} disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: loading ? '#4b5563' : '#22c55e', color: '#fff', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px' }}>
              {loading ? 'Procesando...' : `Pagar y activar ${selectedPlan}`}
            </button>
          </>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ color: '#22c55e' }}>Plan {selectedPlan} activado</h2>
            <p style={{ color: '#9ca3af' }}>Ya puedes continuar usando la plataforma.</p>
          </div>
        )}
      </div>
    </div>
  );
}
