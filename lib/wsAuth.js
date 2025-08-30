import { verifyAccessToken } from './jwt.js';
import { signAccessToken } from './jwt.js';
/**
 * Extracts the JWT from the WebSocket URL query string.
 * Example: wss://moshunion.rocks/messaging-ws?token=abc123
 */
export function extractTokenFromUrl(url) {
    try {
        const u = new URL(url, 'http://localhost'); // base needed for relative URLs
        return u.searchParams.get('token') || undefined;
    }
    catch {
        return undefined;
    }
}
/**
 * Verifies the JWT and returns the authenticated user/device IDs.
 * Throws if the token is missing, invalid, or wrong type/version.
 */
export function authenticateFromUrl(url) {
    const token = extractTokenFromUrl(url);
    if (!token)
        throw new Error('Missing token');
    const claims = verifyAccessToken(token);
    if (claims.typ !== 'ws' || claims.ver !== 1) {
        throw new Error('Invalid token type or version');
    }
    return {
        userId: claims.sub,
        deviceId: claims.did,
    };
}
//# sourceMappingURL=wsAuth.js.map