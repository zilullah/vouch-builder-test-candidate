import { FastifyInstance, FastifyPluginAsync } from 'fastify';

export const healthRoute: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.get('/health', async (request, reply) => {
    return { status: 'ok' };
  });
};
