'use client';
import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

async function api(path: string, body?: any) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function PasskeyButtons({ userId }: { userId: string }) {
  const [status, setStatus] = useState<string>('');

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
    } catch (e: any) {
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
    } catch (e: any) {
      setStatus(`Login failed: ${e.message || e}`);
    }
  };

  return (
    <div className="flex flex-col gap-2 items-start">
      <button onClick={register} className="px-3 py-2 rounded bg-gray-200">
        Register Passkey
      </button>
      <button onClick={login} className="px-3 py-2 rounded bg-gray-800 text-white">
        Login with Passkey
      </button>
      <span className="text-sm text-muted-foreground">{status}</span>
    </div>
  );
}