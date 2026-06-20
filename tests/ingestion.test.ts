import test from 'node:test';
import assert from 'node:assert';
import path from 'path';
import { JsonParser } from '../src/infrastructure/parsers/json.parser';
import { MarkdownParser } from '../src/infrastructure/parsers/markdown.parser';
import { IngestService } from '../src/application/services/ingest.service';

test('Ingestion Service', async (t) => {
  const jsonParser = new JsonParser();
  const mdParser = new MarkdownParser();
  const service = new IngestService(jsonParser, mdParser);

  const jsonPath = path.join(process.cwd(), 'data', 'events.json');
  const mdPath = path.join(process.cwd(), 'data', 'night-logs.md');

  const result = await service.load(jsonPath, mdPath);

  // Verify JSON is loaded and typed
  assert.ok(result.hotel, 'Hotel metadata should exist');
  assert.strictEqual(result.hotel.id, 'lumen-sg');

  assert.ok(result.events.length > 0, 'Should load multiple events');
  assert.strictEqual(result.events[0].source, 'events.json');

  // Verify Markdown is loaded
  assert.ok(result.nightLog.length > 0, 'Markdown should not be empty');
  assert.ok(result.nightLog.includes('# Night logs'), 'Markdown should contain expected headers');
});
