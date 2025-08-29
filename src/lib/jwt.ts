import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;
const ISS = process.env.JWT_ISSUER || 'metal-lazarus-auth';
const AUD = process.env.JWT_AUDIENCE || 'metal-lazarus';
const TTL = Number(process.env.JWT_TTL_SECONDS || 900); // 15m

export type AccessClaims = {
  sub: string;       // userId
  did: string;       // deviceId = passkey credentialId
  typ: 'ws';         // token type
  ver: 1;            // schema/version
};

export function signAccessToken(userId: string, deviceId: string) {
  const claims: AccessClaims = { sub: userId, did: deviceId, typ: 'ws', ver: 1 };
  return jwt.sign(claims, SECRET, { issuer: ISS, audience: AUD, expiresIn: TTL });
}

export function verifyAccessToken(token: string): AccessClaims {
  return jwt.verify(token, SECRET, { issuer: ISS, audience: AUD }) as AccessClaims;
}