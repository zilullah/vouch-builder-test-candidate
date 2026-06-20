import { z } from 'zod';

export const HotelSchema = z.object({
  id: z.string(),
  name: z.string(),
  rooms: z.number(),
  timezone: z.string(),
});

export const EventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  type: z.string(),
  room: z.string().nullable(),
  guest: z.string().nullable(),
  description: z.string(),
  status: z.enum(['resolved', 'unresolved', 'pending']),
});

export const EventsJsonSchema = z.object({
  hotel: HotelSchema,
  note: z.string().optional(),
  events: z.array(EventSchema),
});
