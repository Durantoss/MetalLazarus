export type AdminClaims = {
    sub: string;
    role: 'admin';
    ver: 1;
};
export declare function signAdminToken(username: string): string;
export declare function verifyAdminToken(token: string): AdminClaims;
//# sourceMappingURL=adminJwts.d.ts.map