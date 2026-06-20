import path from 'path';
import { IngestService } from './ingest.service';
import { NormalizationService } from './normalization.service';
import { ReconciliationService } from './reconciliation.service';
import { GroundingService } from './grounding.service';
import { HandoverService } from './handover.service';
import { JsonParser } from '../../infrastructure/parsers/json.parser';
import { MarkdownParser } from '../../infrastructure/parsers/markdown.parser';
import { EventExtractor } from '../../infrastructure/extractors/event.extractor';
import { MarkdownExtractor } from '../../infrastructure/extractors/markdown.extractor';
import { Handover } from '../../domain/models/handover';
import { logger } from '../../logger/logger';

const DATA_DIR = path.join(process.cwd(), 'data');
const EVENTS_PATH = path.join(DATA_DIR, 'events.json');
const LOGS_PATH = path.join(DATA_DIR, 'night-logs.md');

export class HandoverPipeline {
  private ingest = new IngestService(new JsonParser(), new MarkdownParser());
  private normalize = new NormalizationService(new EventExtractor(), new MarkdownExtractor());
  private reconcile = new ReconciliationService();
  private ground = new GroundingService();
  private handover = new HandoverService();

  async run(hotelId: string): Promise<Handover> {
    logger.info({ hotelId, operation: 'handover-pipeline', status: 'started' }, 'Starting handover pipeline');

    const ingestResult = await this.ingest.load(EVENTS_PATH, LOGS_PATH);

    if (ingestResult.hotel.id !== hotelId) {
      throw new Error(`No data found for hotelId: ${hotelId}`);
    }

    const issues = this.normalize.normalize(ingestResult.events, ingestResult.nightLog);

    const reconciled = this.reconcile.reconcile(issues);
    const allThreads = [
      ...reconciled.stillOpen,
      ...reconciled.newlyResolved,
      ...reconciled.newTonight,
      ...reconciled.contradictions,
    ];

    // Remove duplicate threads that appear in both normal buckets and contradictions
    const uniqueThreads = Array.from(new Map(allThreads.map(t => [t.id, t])).values());

    const groundedThreads = this.ground.ground(uniqueThreads);

    const result = this.handover.generate(hotelId, groundedThreads);

    logger.info({ hotelId, operation: 'handover-pipeline', status: 'success' }, 'Handover pipeline completed');

    return result;
  }
}
