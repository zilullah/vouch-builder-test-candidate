import fastify from 'fastify';
import { logger } from './logger/logger';
import { healthRoute } from './routes/health.route';
import { handoverRoute } from './presentation/routes/handover.route';

export const buildApp = () => {
  const app = fastify({
    loggerInstance: logger,
  });

  // Allow requests sent without Content-Type or with text/plain (common with curl on Windows)
  app.addContentTypeParser('text/plain', { parseAs: 'string' }, (req, body, done) => {
    try {
      done(null, JSON.parse(body as string));
    } catch {
      done(null, {});
    }
  });

  app.addContentTypeParser('*', { parseAs: 'string' }, (req, body, done) => {
    try {
      done(null, JSON.parse(body as string));
    } catch {
      done(null, {});
    }
  });

  app.register(healthRoute);
  app.register(handoverRoute);

  return app;
};
