/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './src/routes/api.js';

const PORT = 3000;

export async function createServer() {
  const app = express();

  // Parse JSON bodies
  app.use(express.json());

  // Mount central API router
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Serve Frontend assets
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    console.log('Loading Vite middleware in development mode...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving compiled assets in production mode...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Express v4 handles SPA fallback via '*' wildcard matching
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

// Auto-start the server if this file is run directly (not loaded by test suite)
const isMainModule = typeof process !== 'undefined' && (
  process.argv[1]?.endsWith('server.ts') || 
  process.argv[1]?.endsWith('server.cjs')
);

if (isMainModule) {
  createServer().then((app) => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(` Karate Institution Management Server running at:`);
      console.log(` http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`====================================================`);
    });
  }).catch((err) => {
    console.error('Failed to start Karate Server:', err);
  });
}
