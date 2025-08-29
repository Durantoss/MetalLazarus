// --- Core imports ---
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
// --- Route imports ---
import authRoutes from './routes/auth.routes.js';
import webauthnRoutes from './routes/webauthn.routes.js';
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
// --- Boot server ---
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Metal Lazarus backend running at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map