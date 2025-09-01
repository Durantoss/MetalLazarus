import { prisma } from './prisma.js';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers';

const rpID = process.env.WEBAUTHN_RP_ID!;
const rpName = process.env.WEBAUTHN_RP_NAME || 'Metal Lazarus';
const origin = process.env.WEBAUTHN_ORIGIN!;

export async function startRegistration(userId: string, userName: string) {
  const existing = await prisma.passkey.findMany({ where: { userId } });
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: isoUint8Array.fromUTF8String(userId),
    userName: userName || userId,
    // prevent re-registration of same credential
    excludeCredentials: existing.map(c => ({
      id: c.id,
      type: 'public-key' as const,
      transports: (c.transports || '').split(',').filter(Boolean) as any,
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
    attestationType: 'none',
  });

  await prisma.webAuthnChallenge.create({
    data: { userId, type: 'registration', challenge: options.challenge },
  });

  return options;
}

export async function finishRegistration(userId: string, responseJSON: any) {
  const record = await prisma.webAuthnChallenge.findFirst({
    where: { userId, type: 'registration' },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) throw new Error('No registration challenge');

  let verification: VerifiedRegistrationResponse;
  verification = await verifyRegistrationResponse({
    response: responseJSON,
    expectedChallenge: record.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: true,
  });

  await prisma.webAuthnChallenge.delete({ where: { id: record.id } });

  const { verified, registrationInfo } = verification;
  if (!verified || !registrationInfo) throw new Error('Registration failed');

  const credentialId = registrationInfo.credential.id;
  const publicKey = isoBase64URL.fromBuffer(registrationInfo.credential.publicKey);

  await prisma.passkey.upsert({
    where: { id: credentialId },
    update: {
      publicKey,
      counter: registrationInfo.credential.counter || 0,
      lastUsedAt: new Date(),
    },
    create: {
      id: credentialId,
      userId,
      publicKey,
      counter: registrationInfo.credential.counter || 0,
      transports: (responseJSON.response?.transports || []).join(','),
      deviceName: responseJSON.clientExtensionResults?.devicePubKey?.alg || null,
    },
  });

  return { credentialId };
}

export async function startAuthentication(userId: string) {
  const credentials = await prisma.passkey.findMany({ where: { userId } });
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'preferred',
    allowCredentials: credentials.map(c => ({
      id: c.id,
      type: 'public-key' as const,
      transports: (c.transports || '').split(',').filter(Boolean) as any,
    })),
  });

  await prisma.webAuthnChallenge.create({
    data: { userId, type: 'authentication', challenge: options.challenge },
  });

  return options;
}

export async function finishAuthentication(userId: string, responseJSON: any) {
  const record = await prisma.webAuthnChallenge.findFirst({
    where: { userId, type: 'authentication' },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) throw new Error('No authentication challenge');

  const credId = responseJSON.id as string;
  const passkey = await prisma.passkey.findUnique({ where: { id: credId } });
  if (!passkey || passkey.userId !== userId) throw new Error('Unknown credential');

  let verification: VerifiedAuthenticationResponse;
  verification = await verifyAuthenticationResponse({
    response: responseJSON,
    expectedChallenge: record.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: passkey.id,
      publicKey: isoBase64URL.toBuffer(passkey.publicKey),
      counter: passkey.counter,
    },
    requireUserVerification: true,
  });

  await prisma.webAuthnChallenge.delete({ where: { id: record.id } });

  const { verified, authenticationInfo } = verification;
  if (!verified || !authenticationInfo) throw new Error('Auth failed');

  await prisma.passkey.update({
    where: { id: passkey.id },
    data: { counter: authenticationInfo.newCounter, lastUsedAt: new Date() },
  });

  return { credentialId: passkey.id };
}
