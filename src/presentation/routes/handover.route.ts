import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { HandoverPipeline } from '../../application/services/pipeline.service';
import { HandoverFormatter } from '../formatter/handover.formatter';

const pipeline = new HandoverPipeline();
const formatter = new HandoverFormatter();

interface HandoverBody {
  hotelId?: string;
}

export const handoverRoute: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post<{ Body: HandoverBody }>('/handover', async (request, reply) => {
    const { hotelId } = request.body ?? {};

    if (!hotelId || typeof hotelId !== 'string') {
      server.log.warn({ operation: 'handover', status: 'invalid-request' }, 'Missing or invalid hotelId in request body');
      return reply.status(400).send({ error: 'Missing required field: hotelId' });
    }

    server.log.info({ hotelId, operation: 'handover', status: 'started' }, 'Handover request received');

    try {
      const handover = await pipeline.run(hotelId);
      const output = formatter.toJSON(handover);

      server.log.info({ hotelId, operation: 'handover', status: 'success' }, 'Handover generated successfully');
      return reply.status(200).send(output);
    } catch (err: any) {
      server.log.error({ hotelId, operation: 'handover', status: 'failure', error: err.message }, 'Handover generation failed');
      return reply.status(500).send({ error: 'Failed to generate handover', detail: err.message });
    }
  });
};
