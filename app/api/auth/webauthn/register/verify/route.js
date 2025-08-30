import { NextResponse } from 'next/server';
import { finishRegistration } from '@/lib/webauthn';
export async function POST(req) {
    const { userId, attestationResponse } = await req.json();
    if (!userId || !attestationResponse) {
        return NextResponse.json({ error: 'missing fields' }, { status: 400 });
    }
    try {
        const { credentialId } = await finishRegistration(userId, attestationResponse);
        return NextResponse.json({ ok: true, credentialId });
    }
    catch (e) {
        return NextResponse.json({ error: e.message || 'verify failed' }, { status: 400 });
    }
}
//# sourceMappingURL=route.js.map