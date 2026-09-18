import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { handleApiRequest } from './worker';

/**
 * Vite Dev Server plugin that runs the Cloudflare Worker API router
 * seamlessly during local development (npm run dev) on port 3000.
 */
function cloudflareWorkerDevPlugin(): Plugin {
  return {
    name: 'cloudflare-worker-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) {
          return next();
        }

        try {
          const url = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value !== undefined) {
              if (Array.isArray(value)) {
                value.forEach((v) => headers.append(key, v));
              } else {
                headers.set(key, value);
              }
            }
          }

          let body: Uint8Array | undefined = undefined;
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            body = Buffer.concat(chunks);
          }

          const webReq = new Request(url.toString(), {
            method: req.method,
            headers,
            body: body && body.length > 0 ? (body as unknown as BodyInit) : undefined,
          });

          const env = {
            GEMINI_API_KEY: process.env.GEMINI_API_KEY,
            Nekochat_Api_Key: process.env.Nekochat_Api_Key,
            NEKOCHAT_API_KEY: process.env.NEKOCHAT_API_KEY,
            AI_MODEL: process.env.AI_MODEL,
          };

          const webRes = await handleApiRequest(webReq, env, {});

          res.statusCode = webRes.status;
          webRes.headers.forEach((val, key) => {
            res.setHeader(key, val);
          });

          const resBody = await webRes.arrayBuffer();
          res.end(Buffer.from(resBody));
        } catch (err: any) {
          console.error('[Worker Dev Middleware] Error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Internal Server Error' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), cloudflareWorkerDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
