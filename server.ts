import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// API Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'towin-controller', version: '1.6' });
});

const distPath = path.resolve(__dirname, 'dist');
const distExists = fs.existsSync(distPath);

if (process.env.NODE_ENV === 'production' || distExists) {
  app.use(
    express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('sw.js') || filePath.endsWith('manifest.webmanifest')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    })
  );

  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  // Vite dev mode
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

const targetPort = Number(process.env.PORT) || 3000;

const server = app.listen(targetPort, '0.0.0.0', () => {
  console.log(`Server listening on port ${targetPort}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE' && targetPort !== 3000) {
    console.warn(`Port ${targetPort} in use, falling back to port 3000...`);
    app.listen(3000, '0.0.0.0', () => {
      console.log('Server listening on port 3000');
    });
  } else {
    throw err;
  }
});
