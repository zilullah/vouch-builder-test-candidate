import test from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/app';

test('API: GET /health returns 200 and { status: "ok" }', async () => {
  const app = buildApp();
  await app.ready();

  const res = await app.inject({ method: 'GET', url: '/health' });

  assert.strictEqual(res.statusCode, 200);
  assert.deepStrictEqual(res.json(), { status: 'ok' });

  await app.close();
});

test('API: POST /handover returns 400 on empty body', async () => {
  const app = buildApp();
  await app.ready();

  const res = await app.inject({
    method: 'POST',
    url: '/handover',
    payload: {},
  });

  assert.strictEqual(res.statusCode, 400);
  const body = res.json();
  assert.ok('error' in body, 'Response must have an error field');

  await app.close();
});

test('API: POST /handover with hotelId "lumen-sg" returns 200 with structured handover', async () => {
  const app = buildApp();
  await app.ready();

  const res = await app.inject({
    method: 'POST',
    url: '/handover',
    headers: { 'Content-Type': 'application/json' },
    payload: { hotelId: 'lumen-sg' },
  });

  assert.strictEqual(res.statusCode, 200);
  const body = res.json();

  // 3a. Response contains hotelId
  assert.strictEqual(body.hotelId, 'lumen-sg', 'Response must include hotelId');

  // 3b. Response contains highPriority
  assert.ok(Array.isArray(body.highPriority), 'highPriority must be an array');

  // 3c. Response contains stillOpen
  assert.ok(Array.isArray(body.stillOpen), 'stillOpen must be an array');

  // Structural validation
  assert.ok(Array.isArray(body.newlyResolved), 'newlyResolved must be an array');
  assert.ok(Array.isArray(body.newTonight), 'newTonight must be an array');
  assert.ok(Array.isArray(body.warnings), 'warnings must be an array');
  assert.ok(typeof body.generatedAt === 'string', 'generatedAt must be a string');

  // Route layer does NOT contain business logic: verify output is shaped by pipeline
  // If highPriority threads exist, each must have id, title, room, status, summary, confidence
  for (const thread of body.highPriority) {
    assert.ok('id' in thread, 'thread must have id');
    assert.ok('title' in thread, 'thread must have title');
    assert.ok('summary' in thread, 'thread must have summary');
    assert.ok('status' in thread, 'thread must have status');
    assert.ok(!('evidence' in thread), 'thread must NOT expose raw evidence');
    assert.ok(!('events' in thread), 'thread must NOT expose raw events');
  }

  // No raw event IDs or technical metadata should leak
  const fullBody = JSON.stringify(body);
  assert.ok(!fullBody.includes('"eventId"'), 'eventId must not leak to API response');
  assert.ok(!fullBody.includes('"sourceType"'), 'sourceType must not leak to API response');

  await app.close();
});

test('API: POST /handover with unknown hotelId returns 500 with error message', async () => {
  const app = buildApp();
  await app.ready();

  const res = await app.inject({
    method: 'POST',
    url: '/handover',
    headers: { 'Content-Type': 'application/json' },
    payload: { hotelId: 'unknown-hotel' },
  });

  assert.strictEqual(res.statusCode, 500);
  const body = res.json();
  assert.ok('error' in body, 'Error response must have error field');

  await app.close();
});
