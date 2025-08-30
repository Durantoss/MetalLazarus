export type AccessClaims = {
    sub: string;
    did: string;
    typ: 'ws';
    ver: 1;
};
export declare function signAccessToken(userId: string, deviceId: string): string;
export declare function verifyAccessToken(token: string): AccessClaims;
//# sourceMappingURL=jwt.d.ts.map