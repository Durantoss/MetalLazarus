'use client';
import { useSecureWebSocket } from '@/hooks/useSecureWebSocket';
import { useState } from 'react';

export default function ChatBox() {
  const { status, sendMessage } = useSecureWebSocket();
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage({ type: 'chat', content: text });
    setText('');
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>WS Status:</strong> {status}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button onClick={handleSend} style={{ padding: '0.5rem 1rem' }}>
          Send
        </button>
      </div>
    </div>
  );
}