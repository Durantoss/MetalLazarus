'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
async function api(path, body) {
    const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null,
    });
    if (!res.ok)
        throw new Error(await res.text());
    return res.json();
}
export default function PasskeyButtons({ userId }) {
    const [status, setStatus] = useState('');
    const register = async () => {
        try {
            setStatus('Preparing registration…');
            const options = await api('/api/auth/webauthn/register/options', { userId });
            const attestation = await startRegistration(options);
            const out = await api('/api/auth/webauthn/register/verify', {
                userId,
                attestationResponse: attestation,
            });
            setStatus('Passkey registered ✔');
        }
        catch (e) {
            setStatus(`Registration failed: ${e.message || e}`);
        }
    };
    const login = async () => {
        try {
            setStatus('Preparing authentication…');
            const options = await api('/api/auth/webauthn/login/options', { userId });
            const assertion = await startAuthentication(options);
            const out = await api('/api/auth/webauthn/login/verify', {
                userId,
                assertionResponse: assertion,
            });
            localStorage.setItem('ml.authToken', out.token);
            localStorage.setItem('ml.deviceId', out.deviceId);
            setStatus('Authenticated ✔ Token saved');
        }
        catch (e) {
            setStatus(`Login failed: ${e.message || e}`);
        }
    };
    return (_jsxs("div", { className: "flex flex-col gap-2 items-start", children: [_jsx("button", { onClick: register, className: "px-3 py-2 rounded bg-gray-200", children: "Register Passkey" }), _jsx("button", { onClick: login, className: "px-3 py-2 rounded bg-gray-800 text-white", children: "Login with Passkey" }), _jsx("span", { className: "text-sm text-muted-foreground", children: status })] }));
}
//# sourceMappingURL=PasskeyButtons.js.map