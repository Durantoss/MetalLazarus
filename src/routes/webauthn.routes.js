// src/routes/webauthn.routes.ts
import express, {} from 'express';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse, } from '@simplewebauthn/server';
import base64url from 'base64url';
import { prisma } from '../lib/prisma.js';
const router = express.Router();
const rpName = 'Metal Lazarus';
const rpID = 'localhost'; // change to your domain in prod
const origin = 'http://localhost:3000'; // change to your frontend origin
const challengeStore = new Map();
// --- Registration Init ---
router.post('/register-init', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: Buffer.from(user.id),
            userName: email,
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
            },
        });
        if (!options.challenge) {
            return res.status(500).json({ error: 'Failed to generate challenge' });
        }
        challengeStore.set(user.id, options.challenge);
        res.json(options);
    }
    catch (error) {
        console.error('Registration init error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// --- Registration Complete ---
router.post('/register-complete', async (req, res) => {
    try {
        const { email, attestationResponse } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const expectedChallenge = challengeStore.get(user.id);
        if (!expectedChallenge) {
            return res.status(400).json({ error: 'No challenge found for user' });
        }
        const verification = await verifyRegistrationResponse({
            response: attestationResponse,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });
        if (!verification.verified || !verification.registrationInfo) {
            return res.status(400).json({ error: 'Verification failed' });
        }
        // Store the credential
        await prisma.webAuthnCredential.create({
            data: {
                userId: user.id,
                credId: Buffer.from(verification.registrationInfo.credential.id).toString('base64url'),
                publicKey: Buffer.from(verification.registrationInfo.credential.publicKey),
                counter: verification.registrationInfo.credential.counter,
            },
        });
        // Clean up challenge
        challengeStore.delete(user.id);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Registration complete error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// --- Login Init ---
router.post('/login-init', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
            include: { credentials: true },
        });
        if (!user || user.credentials.length === 0) {
            return res.status(404).json({ error: 'No credentials found' });
        }
        const options = await generateAuthenticationOptions({
            rpID,
            userVerification: 'preferred',
            allowCredentials: user.credentials.map((cred) => ({
                id: cred.credId,
                type: 'public-key',
            })),
        });
        if (!options.challenge) {
            return res.status(500).json({ error: 'Failed to generate challenge' });
        }
        challengeStore.set(user.id, options.challenge);
        res.json(options);
    }
    catch (error) {
        console.error('Login init error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// --- Login Complete ---
router.post('/login-complete', async (req, res) => {
    try {
        const { email, assertionResponse } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
            include: { credentials: true },
        });
        if (!user || user.credentials.length === 0) {
            return res.status(404).json({ error: 'No credentials found' });
        }
        const expectedChallenge = challengeStore.get(user.id);
        if (!expectedChallenge) {
            return res.status(400).json({ error: 'No challenge found for user' });
        }
        // Find the credential that matches the assertion
        const credentialId = assertionResponse.id;
        const credential = user.credentials.find((cred) => cred.credId === credentialId);
        if (!credential) {
            return res.status(400).json({ error: 'Credential not found' });
        }
        const verification = await verifyAuthenticationResponse({
            response: assertionResponse,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            credential: {
                id: credential.credId,
                publicKey: credential.publicKey,
                counter: credential.counter,
            },
            requireUserVerification: false,
        });
        if (!verification.verified || !verification.authenticationInfo) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        // Update counter
        await prisma.webAuthnCredential.update({
            where: { id: credential.id },
            data: { counter: verification.authenticationInfo.newCounter },
        });
        // Create session
        await prisma.session.create({
            data: {
                userId: user.id,
                deviceId: req.headers['user-agent'] || 'unknown',
            },
        });
        // Clean up challenge
        challengeStore.delete(user.id);
        res.json({
            accessToken: 'TODO: sign JWT here',
            refreshToken: 'TODO: sign refresh token here',
        });
    }
    catch (error) {
        console.error('Login complete error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
export default router;
//# sourceMappingURL=webauthn.routes.js.map