// ─── Core imports ─────────────────────────────────────
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

// ─── Load environment variables ───────────────────────
dotenv.config();

// ─── Route + Controller imports ───────────────────────
import authRoutes from './routes/auth.routes.js';
import webauthnRoutes from './routes/webauthn.routes.js';
import protectedRoutes from './src/routes/protectedRoutes.ts';
import { login } from './src/controllers/authController.ts';

// ─── Helper imports ───────────────────────────────────
import { authenticateFromUrl } from './lib/wsAuth.js';

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
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`🚀 Metal Lazarus backend running at http://localhost:${port}`);
  console.log(`📡 WS endpoint ready at ws://localhost:${port}/messaging-ws`);
});