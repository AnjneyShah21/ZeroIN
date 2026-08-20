import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { pasteRouter } from './routes/pasteRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security & Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Handled client-side / Next.js
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '12mb' }));

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SecureShare Zero-Knowledge API', timestamp: new Date() });
});

// Main router
app.use('/api/pastes', pasteRouter);

app.listen(PORT, () => {
  console.log(`[SecureShare API] Server running on http://localhost:${PORT}`);
});
