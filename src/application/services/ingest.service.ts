import { JsonParser } from '../../infrastructure/parsers/json.parser';
import { MarkdownParser } from '../../infrastructure/parsers/markdown.parser';
import { logger } from '../../logger/logger';
import { Hotel } from '../../domain/entities/hotel';
import { Event } from '../../domain/entities/event';

export interface IngestResult {
  hotel: Hotel;
  events: Event[];
  nightLog: string;
}

export class IngestService {
  constructor(
    private jsonParser: JsonParser,
    private markdownParser: MarkdownParser
  ) {}

  async load(jsonPath: string, mdPath: string): Promise<IngestResult> {
    logger.info({ operation: 'load-events', status: 'started' }, 'Starting ingestion');
    
    try {
      const { hotel, events } = await this.jsonParser.parse(jsonPath);
      logger.info({ operation: 'load-events', hotelId: hotel.id, status: 'success' }, 'Successfully loaded and validated JSON');

      const nightLog = await this.markdownParser.parse(mdPath);
      logger.info({ operation: 'load-night-logs', status: 'success' }, 'Successfully loaded Markdown');

      return {
        hotel,
        events,
        nightLog
      };
    } catch (error) {
      logger.error({ operation: 'load-events', status: 'failure', error }, 'Validation or loading failed');
      throw error;
    }
  }
}
