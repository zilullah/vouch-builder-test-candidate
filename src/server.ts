import { buildApp } from './app';

const start = async () => {
  const app = buildApp();
  
  try {
    await app.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' });
    // Pino handles the server listening log by default in Fastify, but we can add one for clarity if needed.
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
