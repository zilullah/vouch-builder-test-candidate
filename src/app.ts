import fastify from 'fastify';
import { logger } from './logger/logger';
import { healthRoute } from './routes/health.route';

export const buildApp = () => {
  const app = fastify({
    loggerInstance: logger,
  });

  app.register(healthRoute);

  return app;
};
