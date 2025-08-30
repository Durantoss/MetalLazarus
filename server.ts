// --- Core imports ---
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { setMaxListeners } from 'events';
setMaxListeners(20); // or even higher if needed

// --- Helper imports ---
import { authenticateFromUrl } from './lib/wsAuth.js';

// --- Route imports ---
import authRoutes from './routes/auth.routes.js';
import webauthnRoutes from './routes/webauthn.routes.js';
import adminRoutes from './routes/admin.routes.js';

// --- Load environment variables ---
dotenv.config();

// --- Create Express app ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Mount routes ---
app.use('/auth', authRoutes);
app.use('/auth', webauthnRoutes);
app.use('/auth', adminRoutes);

// --- Create HTTP server ---
const server = createServer(app);

// --- Create WebSocket server ---
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  const path = new URL(req.url!, 'http://localhost').pathname;
  if (path !== '/messaging-ws') return;

  try {
    authenticateFromUrl(req.url!);
    wss.handleUpgrade(req, socket, head, ws => {
      wss.emit('connection', ws, req);
    });
  } catch {
    socket.destroy();
  }
});

wss.on('connection', (ws, req) => {
  const auth = authenticateFromUrl(req.url || '');
  (ws as any).userId = auth.userId;
  (ws as any).deviceId = auth.deviceId;

  console.log(`✅ WS connected: user=${auth.userId} device=${auth.deviceId}`);

  ws.on('message', msg => {
    console.log(`💬 ${auth.userId}:`, msg.toString());
    // TODO: handle message routing here
  });
});

// --- Boot server ---
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`🚀 Metal Lazarus backend running at http://localhost:${port}`);
  console.log(`📡 WS endpoint ready at ws://localhost:${port}/messaging-ws`);
});
