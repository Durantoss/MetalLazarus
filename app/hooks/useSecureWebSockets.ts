// --- Core imports ---
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// --- Helper imports ---
import { authenticateFromUrl } from '../../lib/wsAuth.js';

// --- Route imports ---
import authRoutes from '../../routes/auth.routes.js';
import webauthnRoutes from '../../routes/webauthn.routes.js';

// --- Load environment variables ---
dotenv.config();

// --- Create Express app ---
const app = express();

// --- Middleware ---
app.use(cors()); // Allow frontend requests
app.use(express.json()); // Parse JSON bodies

// --- Mount routes ---
app.use('/auth', authRoutes);
app.use('/webauthn', webauthnRoutes);

// --- Create HTTP server from Express app ---
const server = createServer(app);

// --- Create WebSocket server ---
const wss = new WebSocketServer({ noServer: true });

// --- Handle WS upgrade requests ---
server.on('upgrade', (req, socket, head) => {
  if (new URL(req.url!, 'http://localhost').pathname !== '/messaging-ws') {
    return;
  }

  try {
    // Throws if token is missing/invalid
    authenticateFromUrl(req.url!);

    wss.handleUpgrade(req, socket, head, ws => {
      wss.emit('connection', ws, req);
    });
  } catch {
    socket.destroy();
  }
});

// --- Handle WS connections ---
wss.on('connection', (ws, req) => {
  let auth;
  try {
    auth = authenticateFromUrl(req.url || '');
  } catch {
    ws.close(1008, 'Unauthorized');
    return;
  }

  // Attach identity to socket
  (ws as any).userId = auth.userId;
  (ws as any).deviceId = auth.deviceId;

  console.log(`✅ WS connected: user=${auth.userId} device=${auth.deviceId}`);

  ws.on('message', raw => {
    console.log(`💬 ${auth.userId}:`, raw.toString());
    // TODO: handle message routing here
  });
});

// --- Boot server ---
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`🚀 Metal Lazarus backend running at http://localhost:${port}`);
  console.log(`📡 WS endpoint ready at ws://localhost:${port}/messaging-ws`);
});
