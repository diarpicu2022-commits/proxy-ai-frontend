import { useState, useRef, useEffect } from 'react';
import { generateText } from '../api';

function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}

export default function ChatInterface({ userId, quota, onResponse, onRateLimit, onQuotaExceeded }) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const isAtRateLimit = quota && quota.plan !== 'ENTERPRISE' && quota.requestsThisMinute >= quota.requestsPerMinute;
  const isQuotaExhausted = quota && quota.plan !== 'ENTERPRISE' && quota.tokensRemaining <= 0;
  const estimatedTokens = estimateTokens(prompt);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!prompt.trim() || loading || isAtRateLimit || isQuotaExhausted) return;
    const userMessage = prompt.trim();
    setPrompt('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await generateText(userId, userMessage);
      const data = res.data;
      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.generatedText,
        tokens: data.tokensUsed,
        time: data.processingTimeMs,
      }]);
      onResponse();
    } catch (err) {
      const status = err.response?.status;
      const errData = err.response?.data || {};

      if (status === 429) {
        setError(`Rate limit: ${errData.message}`);
        onRateLimit(errData.retryAfter || 60);
      } else if (status === 402) {
        onQuotaExceeded();
      } else {
        setError('Error al conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#4b5563', marginTop: '60px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤖</div>
            <p>Envía un mensaje para comenzar</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '75%',
              background: msg.role === 'user' ? '#7c3aed' : '#1f2937',
              color: '#e5e7eb',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding: '12px 16px',
              fontSize: '14px',
              lineHeight: '1.6',
            }}>
              {msg.text}
              {msg.role === 'ai' && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#6b7280' }}>
                  {msg.tokens} tokens · {msg.time}ms
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#1f2937', borderRadius: '16px', padding: '12px 20px', color: '#6b7280', fontSize: '14px' }}>
              Generando respuesta...
            </div>
          </div>
        )}
        {error && (
          <div style={{ background: '#450a0a', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 14px', color: '#fca5a5', fontSize: '13px' }}>
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid #1f2937' }}>
        {estimatedTokens > 0 && !isQuotaExhausted && (
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
            Estimado: ~{estimatedTokens} tokens de entrada
          </div>
        )}
        {isQuotaExhausted && (
          <div style={{ fontSize: '13px', color: '#ef4444', marginBottom: '8px', textAlign: 'center' }}>
            Cuota mensual agotada
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading || isAtRateLimit || isQuotaExhausted}
            placeholder={isAtRateLimit ? 'Rate limit alcanzado...' : isQuotaExhausted ? 'Cuota agotada...' : 'Escribe tu pregunta... (Enter para enviar)'}
            rows={2}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: '8px',
              border: '1px solid #374151', background: '#1f2937',
              color: '#e5e7eb', resize: 'none', fontSize: '14px',
              outline: 'none', fontFamily: 'inherit',
              opacity: (isAtRateLimit || isQuotaExhausted) ? 0.5 : 1,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !prompt.trim() || isAtRateLimit || isQuotaExhausted}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: (loading || !prompt.trim() || isAtRateLimit || isQuotaExhausted) ? '#374151' : '#7c3aed',
              color: '#fff', cursor: (loading || !prompt.trim() || isAtRateLimit || isQuotaExhausted) ? 'not-allowed' : 'pointer',
              fontWeight: '700', fontSize: '14px', alignSelf: 'flex-end',
              transition: 'background 0.2s',
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
