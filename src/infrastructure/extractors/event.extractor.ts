import { Event } from '../../domain/entities/event';
import { Issue } from '../../domain/entities/issue';

// Events that are purely informational and require no morning action.
// These are MARKED not dropped — they appear in the informational bucket for audit trail.
const INFORMATIONAL_RULES: Array<(e: Event) => boolean> = [
  e => e.type === 'check_in' && e.status === 'resolved',
  e => e.type === 'walk_in' && e.status === 'resolved',
  e => e.type === 'lost_keycard' && e.status === 'resolved',
  e => e.type === 'note' && e.status === 'resolved',
  e => e.type === 'finance_note' && e.status === 'resolved',
  e => e.type === 'complaint' && e.status === 'resolved',
];

// Keywords that indicate a potential prompt injection attempt.
// Broad by design — false positives are safe; false negatives are not.
const INJECTION_KEYWORDS = [
  'SYSTEM NOTE',
  'IGNORE ALL',
  'FORGET PREVIOUS',
  'ADD CREDIT',
  'MARK APPROVED',
  'OVERRIDE',
  'HANDOVER TOOL:',
];

export class EventExtractor {
  extract(events: Event[]): Issue[] {
    return events.map(event => this.toIssue(event));
  }

  private isInformational(event: Event): boolean {
    return INFORMATIONAL_RULES.some(rule => rule(event));
  }

  private isPromptInjection(description: string): boolean {
    const upper = description.toUpperCase();
    return INJECTION_KEYWORDS.some(kw => upper.includes(kw));
  }

  private toIssue(event: Event): Issue {
    const injectionRisk = this.isPromptInjection(event.description);
    const informational = this.isInformational(event);

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
      isPromptInjectionRisk: injectionRisk,
      isIncomplete: false,
      informational,
    };
  }
}
