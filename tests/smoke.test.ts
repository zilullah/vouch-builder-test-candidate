import test from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/app';

test('Smoke Tests - Production Deployment', async (t) => {
  const app = buildApp();
  
  await t.test('GET /health returns 200 OK', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });
    
    assert.strictEqual(response.statusCode, 200, 'Health endpoint must return 200');
    assert.deepStrictEqual(JSON.parse(response.payload), { status: 'ok' }, 'Health endpoint payload must be correct');
  });

  await t.test('POST /handover returns valid payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/handover',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        hotelId: 'lumen-sg'
      }
    });

    assert.strictEqual(response.statusCode, 200, 'Handover endpoint must return 200');
    
    const body = JSON.parse(response.payload);
    
    // Validate output structure
    assert.strictEqual(body.hotelId, 'lumen-sg');
    assert.ok(typeof body.generatedAt === 'string');
    assert.ok(Array.isArray(body.highPriority));
    assert.ok(Array.isArray(body.stillOpen));
    assert.ok(Array.isArray(body.newlyResolved));
    assert.ok(Array.isArray(body.newTonight));
    assert.ok(Array.isArray(body.informational));
    assert.ok(Array.isArray(body.warnings));
  });

  await t.test('POST /handover fails gracefully on unknown hotel', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/handover',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        hotelId: 'invalid-hotel-id'
      }
    });

    assert.strictEqual(response.statusCode, 500, 'Handover endpoint must return 500 for missing data');
    const body = JSON.parse(response.payload);
    console.log('500 ERROR BODY:', body);
    assert.ok(JSON.stringify(body).includes('No data found'), 'Error message must reflect missing data');
  });
});
