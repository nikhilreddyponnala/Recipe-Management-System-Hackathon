import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDatabase } from './server/config/db.ts';
import authRoutes from './server/routes/authRoutes.ts';
import recipeRoutes from './server/routes/recipeRoutes.ts';
import favoriteRoutes from './server/routes/favoriteRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';
import dashboardRoutes from './server/routes/dashboardRoutes.ts';
import { authController } from './server/controllers/authController.ts';
import { authenticate } from './server/middleware/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize persistent database / Mongoose connection
await initDatabase();

// REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.get('/api/users/me', authenticate, authController.getMe);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'RecipeNest MERN API',
  });
});

// Full-stack Vite dev middleware integration
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: {
      middlewareMode: true,
      port: PORT,
      host: '0.0.0.0',
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[RecipeNest] Full-stack MERN server running at http://0.0.0.0:${PORT}`);
});
