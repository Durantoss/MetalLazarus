export declare function startRegistration(userId: string, userName: string): Promise<import("@simplewebauthn/server").PublicKeyCredentialCreationOptionsJSON>;
export declare function finishRegistration(userId: string, responseJSON: any): Promise<{
    credentialId: any;
}>;
export declare function startAuthentication(userId: string): Promise<import("@simplewebauthn/server").PublicKeyCredentialRequestOptionsJSON>;
export declare function finishAuthentication(userId: string, responseJSON: any): Promise<{
    credentialId: string;
}>;
//# sourceMappingURL=webauthn.d.ts.map