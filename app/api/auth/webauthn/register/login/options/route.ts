import { NextResponse } from 'next/server';
import { startAuthentication } from '@/lib/webauthn';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: 'user not found' }, { status: 404 });
  }

  const options = await startAuthentication(userId);
  return NextResponse.json(options);
}