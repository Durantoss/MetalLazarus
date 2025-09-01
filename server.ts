// ─── Core imports ─────────────────────────────────────
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

// ─── Load environment variables ───────────────────────
dotenv.config();

// ─── Patch for CommonJS (Express) ─────────────────────
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const express = require('express') as typeof import('express');

// ─── Type-only imports ────────────────────────────────
import type { Request, Response } from 'express';

// ─── Route + Controller imports ───────────────────────
import authRoutes from './routes/auth.routes.ts';
import webauthnRoutes from './routes/webauthn.routes.ts';
import protectedRoutes from './src/routes/protectedRoutes.ts';
import { login } from './src/controllers/authController.ts';

// ─── Helper imports ───────────────────────────────────
import { authenticateFromUrl } from './lib/wsAuth.ts';

// ─── Extend WebSocket type for userId/deviceId ────────
declare module 'ws' {
  interface WebSocket {
    userId?: string;
    deviceId?: string;
  }
}

// ─── Create Express app ───────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ─── Mount routes ─────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/webauthn', webauthnRoutes);
app.post('/login', login);
app.use('/api', protectedRoutes);
app.use(express.static('public'));
app.get('/splash', (_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// ─── Create HTTP + WebSocket servers ──────────────────
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

// ─── Handle WebSocket upgrade ─────────────────────────
server.on('upgrade', (req, socket, head) => {
  const pathname = new URL(req.url || '', 'http://localhost').pathname;
  if (pathname !== '/messaging-ws') return;

  try {
    authenticateFromUrl(req.url || '');
    wss.handleUpgrade(req, socket, head, ws => {
      wss.emit('connection', ws, req);
    });
  } catch {
    socket.destroy();
  }
});

// ─── Handle WebSocket connections ─────────────────────
wss.on('connection', (ws: WebSocket, req: Request) => {
  let auth;
  try {
    auth = authenticateFromUrl(req.url || '');
  } catch {
    ws.close(1008, 'Unauthorized');
    return;
  }

  ws.userId = auth.userId;
  ws.deviceId = auth.deviceId;

  console.log(`✅ WS connected: user=${auth.userId} device=${auth.deviceId}`);

  ws.on('message', raw => {
    console.log(`💬 ${auth.userId}:`, raw.toString());
    // TODO: handle message routing here
  });
});

// ─── Boot server ──────────────────────────────────────
const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`🚀 Metal Lazarus backend running at http://localhost:${port}`);
  console.log(`📡 WS endpoint ready at ws://localhost:${port}/messaging-ws`);
});
