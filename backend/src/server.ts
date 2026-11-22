import { env } from './config/env';
import { createApp } from './app';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(
    `[cnufree-backend] Express server listening on port ${env.PORT} (${env.NODE_ENV})`
  );
});

function shutdown(signal: string): void {
  console.log(`[cnufree-backend] Received ${signal}. Closing HTTP server...`);
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
