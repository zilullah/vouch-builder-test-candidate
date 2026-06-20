import test from 'node:test';
import assert from 'node:assert';
import { ReconciliationService } from '../src/application/services/reconciliation.service';
import { EventExtractor } from '../src/infrastructure/extractors/event.extractor';
import { MarkdownExtractor } from '../src/infrastructure/extractors/markdown.extractor';
import { Event } from '../src/domain/entities/event';

test('Reconciliation Service', (t) => {
  const service = new ReconciliationService();
  const eventExtractor = new EventExtractor();
  const mdExtractor = new MarkdownExtractor();

  const mockEvents: Event[] = [
    // Room 112
    { id: 'evt_0002', timestamp: '2026-05-26T00:20:00+08:00', type: 'maintenance', room: '112', guest: null, description: 'Aircon not cooling.', status: 'unresolved', source: 'events.json' },
    { id: 'evt_0018', timestamp: '2026-05-29T23:40:00+08:00', type: 'maintenance', room: '112', guest: null, description: 'Part arrived.', status: 'unresolved', source: 'events.json' },
    
    // Room 309
    { id: 'evt_0007', timestamp: '2026-05-27T00:15:00+08:00', type: 'deposit_issue', room: '309', guest: null, description: 'Card declined.', status: 'unresolved', source: 'events.json' },
    { id: 'evt_0014', timestamp: '2026-05-30T00:45:00+08:00', type: 'deposit_issue', room: '309', guest: null, description: 'Still not collected.', status: 'unresolved', source: 'events.json' },
    
    // Immigration Backlog
    { id: 'evt_0003', timestamp: '2026-05-26T00:35:00+08:00', type: 'compliance', room: '204', guest: null, description: 'Scanner offline.', status: 'unresolved', source: 'events.json' },
    { id: 'evt_0009', timestamp: '2026-05-27T02:05:00+08:00', type: 'compliance', room: null, guest: null, description: 'Offline again.', status: 'unresolved', source: 'events.json' },
    { id: 'evt_0019', timestamp: '2026-05-30T00:25:00+08:00', type: 'compliance', room: null, guest: null, description: 'Back online but backlog.', status: 'unresolved', source: 'events.json' },
    
    // Corridor Leak
    { id: 'evt_0008', timestamp: '2026-05-27T01:40:00+08:00', type: 'facilities', room: null, guest: null, description: 'Water leak.', status: 'unresolved', source: 'events.json' },
    { id: 'evt_0013', timestamp: '2026-05-29T00:10:00+08:00', type: 'facilities', room: null, guest: null, description: 'Resolved leak.', status: 'resolved', source: 'events.json' },
    
    // Room 208 - New Tonight
    { id: 'evt_0027', timestamp: '2026-05-30T01:00:00+08:00', type: 'incident', room: '208', guest: null, description: 'Safe stuck.', status: 'unresolved', source: 'events.json' }
  ];

  const mockMarkdown = `
- Room 112 aircon — maintenance came tonight.
- 309 — the guy with the deposit issue is still not settled.
- The leak in the 2nd floor corridor got worse tonight.
- Room 205 — Did my rounds and noticed door ajar. The system still shows Mr Chen in 205 as in-house, but it looks like nobody's been in there for a day or two.
  `;

  const mdIssues = mdExtractor.extract(mockMarkdown);
  // Fix markdown timestamps since the log happened in the past (May 28)
  for (const issue of mdIssues) {
    issue.events[0].timestamp = '2026-05-28T00:00:00+08:00';
  }

  const issues = [...eventExtractor.extract(mockEvents), ...mdIssues];
  const result = service.reconcile(issues);

  // 1. Room 112 becomes one thread in stillOpen
  const room112 = result.stillOpen.find(t => t.room === '112');
  assert.ok(room112, 'Room 112 should be in stillOpen');
  assert.strictEqual(room112.events.length, 3, 'Should combine 2 JSON events and 1 Markdown event');

  // 2. Room 309 becomes one thread in stillOpen
  const room309 = result.stillOpen.find(t => t.room === '309');
  assert.ok(room309, 'Room 309 should be in stillOpen');
  assert.strictEqual(room309.events.length, 3, 'Should combine 2 JSON events and 1 Markdown event');

  // 3. Immigration backlog becomes one thread in stillOpen
  const compliance = result.stillOpen.find(t => t.id === 'thread_compliance');
  assert.ok(compliance, 'Immigration Backlog should be in stillOpen');
  assert.strictEqual(compliance.events.length, 3, 'Should combine 3 JSON events');

  // 4. Corridor leak becomes resolved 
  const leak = result.newlyResolved.find(t => t.id === 'thread_leak');
  assert.ok(leak, 'Corridor leak should be newlyResolved');

  // 5. Room 205 contradiction is surfaced
  const room205 = result.contradictions.find(t => t.room === '205');
  assert.ok(room205, 'Room 205 contradiction should be surfaced');

  // 6. New issues appear in newTonight
  const room208 = result.newTonight.find(t => t.room === '208');
  assert.ok(room208, 'Room 208 should be in newTonight');
});
