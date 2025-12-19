import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { sequelize } from './models/index.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js'
import leadRoutes from './routes/leadRoutes.js'
import emailRoutes from './routes/emailRoutes.js'

// import leadRoutes from './routes/leadRoutes.js'; // enable when ready

dotenv.config();

const app = express();

// ================================
// Server Config
// ================================
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ================================
// Global Middlewares
// ================================
app.use(helmet());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev')); // Logs all API requests

// ================================
// API Routes (NO VERSION PREFIX)
// ================================
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/roles', roleRoutes)
app.use('/leads', leadRoutes);
app.use('/emails', emailRoutes)

// ================================
// Health Check Route
// ================================
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    service: 'CRM Backend API',
    timestamp: new Date().toISOString()
  });
});

// ================================
// 404 Handler
// ================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// ================================
// Global Error Handler
// ================================
app.use((err, req, res, next) => {
  console.error('🔥 Global Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ================================
// Start Server & Connect DB
// ================================
app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

  try {
    await sequelize.authenticate();
    console.log('✅ Database Connected');
  } catch (err) {
    console.error('❌ DB Connection Failed:', err.message);
  }
});

export default app;