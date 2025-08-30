import { NextResponse } from 'next/server';
import { startRegistration } from '@/lib/webauthn';
import { prisma } from '@/lib/prisma';
export async function POST(req) {
    const { userId } = await req.json();
    if (!userId) {
        return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return NextResponse.json({ error: 'user not found' }, { status: 404 });
    }
    const options = await startRegistration(user.id, user.stagename || user.email || user.id);
    return NextResponse.json(options);
}
//# sourceMappingURL=route.js.map