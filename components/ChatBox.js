'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSecureWebSocket } from '@/hooks/useSecureWebSocket';
import { useState } from 'react';
export default function ChatBox() {
    const { status, sendMessage } = useSecureWebSocket();
    const [text, setText] = useState('');
    const handleSend = () => {
        if (!text.trim())
            return;
        sendMessage({ type: 'chat', content: text });
        setText('');
    };
    return (_jsxs("div", { style: { maxWidth: 400, margin: '0 auto', padding: '1rem' }, children: [_jsxs("div", { style: { marginBottom: '0.5rem' }, children: [_jsx("strong", { children: "WS Status:" }), " ", status] }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem' }, children: [_jsx("input", { value: text, onChange: (e) => setText(e.target.value), placeholder: "Type a message...", style: { flex: 1, padding: '0.5rem' } }), _jsx("button", { onClick: handleSend, style: { padding: '0.5rem 1rem' }, children: "Send" })] })] }));
}
//# sourceMappingURL=ChatBox.js.map