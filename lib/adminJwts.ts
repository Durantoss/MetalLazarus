import jwt from 'jsonwebtoken';

const SECRET = process.env.ADMIN_JWT_SECRET!;
const TTL = Number(process.env.ADMIN_JWT_TTL_SECONDS || 1800); // default 30m

export type AdminClaims = {
  sub: string;       // admin username
  role: 'admin';
  ver: 1;
};

export function signAdminToken(username: string) {
  const claims: AdminClaims = { sub: username, role: 'admin', ver: 1 };
  return jwt.sign(claims, SECRET, { expiresIn: TTL });
}

export function verifyAdminToken(token: string): AdminClaims {
  return jwt.verify(token, SECRET) as AdminClaims;
}