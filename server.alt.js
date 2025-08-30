import { WebSocketServer } from 'ws';
import { authenticateFromUrl } from '@/lib/wsAuth';
const wss = new WebSocketServer({ noServer: true });
server.on('upgrade', (req, socket, head) => {
    if (new URL(req.url, 'http://localhost').pathname !== '/messaging-ws') {
        return;
    }
    try {
        authenticateFromUrl(req.url); // throws if invalid
        wss.handleUpgrade(req, socket, head, ws => {
            wss.emit('connection', ws, req);
        });
    }
    catch {
        socket.destroy(); // reject connection
    }
});
wss.on('connection', (ws, req) => {
    let auth;
    try {
        auth = authenticateFromUrl(req.url || '');
    }
    catch {
        ws.close(1008, 'Unauthorized');
        return;
    }
    // Attach identity to the socket instance
    ws.userId = auth.userId;
    ws.deviceId = auth.deviceId;
    ws.on('message', raw => {
        // Here you can check conversation membership, etc.
        console.log(`User ${auth.userId} sent:`, raw.toString());
    });
});
//# sourceMappingURL=server.alt.js.map