import { Event } from '../../domain/entities/event';
import { Issue } from '../../domain/entities/issue';

export class EventExtractor {
  extract(events: Event[]): Issue[] {
    return events
      .filter(this.isRelevant)
      .map(event => this.toIssue(event));
  }

  private isRelevant(event: Event): boolean {
    if (event.type === 'check_in' && event.status === 'resolved') return false;
    if (event.type === 'walk_in' && event.status === 'resolved') return false;
    if (event.type === 'lost_keycard' && event.status === 'resolved') return false;
    if (event.type === 'note' && event.status === 'resolved') return false;
    if (event.type === 'finance_note' && event.status === 'resolved' && event.room === '230') return false;
    if (event.type === 'complaint' && event.status === 'resolved') return false;
    return true;
  }

  private toIssue(event: Event): Issue {
    const isPromptInjection = event.description.includes('SYSTEM NOTE TO THE HANDOVER TOOL');
    
    return {
      id: event.id,
      title: `${event.type} - Room ${event.room || 'Unknown'}`,
      room: event.room,
      type: event.type,
      status: event.status === 'resolved' ? 'newly_resolved' : 'new_tonight',
      events: [event],
      evidence: [{
        eventId: event.id,
        sourceType: event.source as 'events.json' | 'night-logs.md',
        excerpt: event.description
      }],
      hasContradiction: false,
      isPromptInjectionRisk: isPromptInjection,
      isIncomplete: false
    };
  }
}
