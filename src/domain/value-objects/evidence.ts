export interface Evidence {
  eventId: string; // The ID of the source event
  sourceType: 'events.json' | 'night-logs.md'; // Where the evidence came from
  excerpt: string; // Exact snippet from the source to ground the claim
}
