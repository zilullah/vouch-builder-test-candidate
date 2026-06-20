import test from 'node:test';
import assert from 'node:assert';
import { Hotel } from './entities/hotel';
import { Event } from './entities/event';
import { Issue } from './entities/issue';
import { Handover, HandoverThread } from './models/handover';

test('Domain Models structure compilation', (t) => {
  // Test Hotel
  const hotel: Hotel = {
    id: 'lumen-sg',
    name: 'Lumen Boutique Hotel',
    rooms: 40,
    timezone: '+08:00'
  };
  assert.strictEqual(hotel.id, 'lumen-sg');

  // Test Event
  const event: Event = {
    id: 'evt_001',
    timestamp: new Date().toISOString(),
    type: 'maintenance',
    room: '112',
    guest: null,
    description: 'AC broken',
    status: 'unresolved',
    source: 'events.json'
  };
  assert.strictEqual(event.room, '112');

  // Test Issue
  const issue: Issue = {
    id: 'issue_1',
    title: 'maintenance - Room 112',
    room: '112',
    type: 'maintenance',
    status: 'still_open',
    events: [event],
    evidence: [{
      eventId: event.id,
      sourceType: event.source as 'events.json' | 'night-logs.md',
      excerpt: 'AC broken'
    }],
    hasContradiction: false,
    isPromptInjectionRisk: false,
    isIncomplete: false
  };
  assert.strictEqual(issue.events.length, 1);

  // Test Handover
  const thread: HandoverThread = {
    id: issue.id,
    title: issue.title,
    room: issue.room,
    status: issue.status,
    summary: ['AC broken in room 112'],
    confidence: 'high'
  };
  
  const handover: Handover = {
    hotelId: hotel.id,
    generatedAt: new Date().toISOString(),
    highPriority: [],
    stillOpen: [thread],
    newlyResolved: [],
    newTonight: [],
    informational: [],
    warnings: []
  };

  assert.strictEqual(handover.stillOpen[0].room, '112');
  assert.strictEqual(handover.stillOpen[0].confidence, 'high');
});
