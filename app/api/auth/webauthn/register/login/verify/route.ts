import { NextResponse } from 'next/server';
import { finishAuthentication } from '@/lib/webauthn';
import { signAccessToken } from '@/lib/jwt';

export async function POST(req: Request) {
  const { userId, assertionResponse } = await req.json();
  if (!userId || !assertionResponse) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  try {
    const { credentialId } = await finishAuthentication(userId, assertionResponse);
    const token = signAccessToken(userId, credentialId);

    return NextResponse.json({
      ok: true,
      token,
      deviceId: credentialId,
      expiresIn: Number(process.env.JWT_TTL_SECONDS || 900),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'verify failed' },
      { status: 400 }
    );
  }
}