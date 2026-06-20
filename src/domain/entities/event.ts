export type EventStatus = 'resolved' | 'unresolved' | 'pending';

export interface Event {
  id: string; // Unique ID (generated for night-logs if missing)
  timestamp: string; // ISO 8601 string
  type: string;
  room: string | null;
  guest: string | null;
  description: string; // The raw description, supporting multilingual input
  status: EventStatus;
  source: 'events.json' | 'night-logs.md';
}
