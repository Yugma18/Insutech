import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Routes
import insurerRoutes from './routes/insurer.routes.js';
import planRoutes from './routes/plan.routes.js';
import leadRoutes from './routes/lead.routes.js';
import { quickCapture, pingVisit } from './controllers/lead.controller.js';
import recommendRoutes from './routes/recommend.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// API routes
app.use('/api/insurers', insurerRoutes);
app.use('/api/plans', planRoutes);
app.post('/api/leads/quick-capture', quickCapture);
app.post('/api/leads/ping', pingVisit);
app.use('/api/leads', leadRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Serve React frontend in production
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

export default app;
