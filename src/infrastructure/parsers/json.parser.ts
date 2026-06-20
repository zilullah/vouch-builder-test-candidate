import fs from 'fs/promises';
import { EventsJsonSchema } from '../validation/event.schema';
import { Hotel } from '../../domain/entities/hotel';
import { Event, EventStatus } from '../../domain/entities/event';

export class JsonParser {
  async parse(filePath: string): Promise<{ hotel: Hotel, events: Event[] }> {
    const rawData = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(rawData);
    const validated = EventsJsonSchema.parse(parsed);

    const events: Event[] = validated.events.map(e => ({
      ...e,
      status: e.status as EventStatus,
      source: 'events.json'
    }));

    return {
      hotel: validated.hotel,
      events
    };
  }
}
