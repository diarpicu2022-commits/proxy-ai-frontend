import { useState, useRef, useEffect } from 'react';
import { generateText } from '../api';

function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}

const Icons = {
  Sparkles: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  ),
  Loader: () => (
    <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
};

export default function ChatInterface({ userId, quota, onResponse, onRateLimit, onQuotaExceeded }) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

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
    setMessages(prev => [...prev, { role: 'user', text: userMessage, timestamp: Date.now() }]);
    setLoading(true);

    try {
      const res = await generateText(userId, userMessage);
      const data = res.data;
      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.generatedText,
        tokens: data.tokensUsed,
        time: data.processingTimeMs,
        cached: data.processingTimeMs === 0,
        timestamp: Date.now()
      }]);
      onResponse();
    } catch (err) {
      const status = err.response?.status;
      const errData = err.response?.data || {};

      if (status === 429) {
        setError(`Rate limit alcanzado. Intenta en ${errData.retryAfter || 60}s`);
        onRateLimit(errData.retryAfter || 60);
      } else if (status === 402) {
        onQuotaExceeded();
      } else {
        setError('Error de conexión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages" ref={containerRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="empty-icon">
              <Icons.Sparkles />
            </div>
            <h3>¿En qué puedo ayudarte?</h3>
            <p>Envía un mensaje para comenzar una conversación</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div 
              key={i} 
              className={`message message-${msg.role} fade-in`}
              style={{ animationDelay: '0ms' }}
            >
              <div className="message-content">
                <p>{msg.text}</p>
                {msg.role === 'ai' && (
                  <div className="message-meta">
                    {msg.cached ? (
                      <span className="meta-cached">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                        cached
                      </span>
                    ) : (
                      <span>{msg.tokens} tokens</span>
                    )}
                    <span>{msg.time}ms</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="message message-ai fade-in">
            <div className="message-content loading">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="message-error fade-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-container">
        {estimatedTokens > 0 && !isQuotaExhausted && (
          <div className="token-estimate">
            <span className="token-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20"/>
              </svg>
            </span>
            ~{estimatedTokens} tokens de entrada
          </div>
        )}
        
        {isQuotaExhausted && (
          <div className="quota-exhausted">
            Cuota mensual agotada
          </div>
        )}
        
        <div className="chat-input-wrapper">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading || isAtRateLimit || isQuotaExhausted}
            placeholder={isAtRateLimit ? 'Rate limit alcanzado...' : isQuotaExhausted ? 'Cuota agotada...' : 'Escribe tu mensaje... (Enter para enviar)'}
            rows={1}
            className="chat-input"
          />
          <button 
            className={`send-btn ${(!prompt.trim() || loading || isAtRateLimit || isQuotaExhausted) ? 'disabled' : ''}`}
            onClick={sendMessage}
            disabled={loading || !prompt.trim() || isAtRateLimit || isQuotaExhausted}
          >
            {loading ? <Icons.Loader /> : <Icons.Sparkles />}
          </button>
        </div>
      </div>
    </div>
  );
}