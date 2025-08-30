import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET;
const ISS = process.env.JWT_ISSUER || 'metal-lazarus-auth';
const AUD = process.env.JWT_AUDIENCE || 'metal-lazarus';
const TTL = Number(process.env.JWT_TTL_SECONDS || 900); // 15m
export function signAccessToken(userId, deviceId) {
    const claims = { sub: userId, did: deviceId, typ: 'ws', ver: 1 };
    return jwt.sign(claims, SECRET, { issuer: ISS, audience: AUD, expiresIn: TTL });
}
export function verifyAccessToken(token) {
    return jwt.verify(token, SECRET, { issuer: ISS, audience: AUD });
}
//# sourceMappingURL=jwt.js.map