/**
 * Extracts the JWT from the WebSocket URL query string.
 * Example: wss://moshunion.rocks/messaging-ws?token=abc123
 */
export declare function extractTokenFromUrl(url: string): string | undefined;
/**
 * Verifies the JWT and returns the authenticated user/device IDs.
 * Throws if the token is missing, invalid, or wrong type/version.
 */
export declare function authenticateFromUrl(url: string): {
    userId: string;
    deviceId: string;
};
//# sourceMappingURL=wsAuth.d.ts.map