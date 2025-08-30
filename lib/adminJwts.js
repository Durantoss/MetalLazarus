import jwt from 'jsonwebtoken';
const SECRET = process.env.ADMIN_JWT_SECRET;
const TTL = Number(process.env.ADMIN_JWT_TTL_SECONDS || 1800); // default 30m
export function signAdminToken(username) {
    const claims = { sub: username, role: 'admin', ver: 1 };
    return jwt.sign(claims, SECRET, { expiresIn: TTL });
}
export function verifyAdminToken(token) {
    return jwt.verify(token, SECRET);
}
//# sourceMappingURL=adminJwts.js.map