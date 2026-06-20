import { GroundedIssueThread } from '../../domain/entities/grounded-thread';
import { Handover, HandoverThread } from '../../domain/models/handover';

// Issue types that are classified as high priority (operational blockers)
const HIGH_PRIORITY_TYPES = new Set([
  'compliance',
  'deposit_issue',
  'damage_report',
  'finance_note',
  'maintenance',
  'facilities',
  'incident',
  'check_in_issue',
]);

export class HandoverService {
  generate(hotelId: string, threads: GroundedIssueThread[]): Handover {
    const highPriority: HandoverThread[] = [];
    const stillOpen: HandoverThread[] = [];
    const newlyResolved: HandoverThread[] = [];
    const newTonight: HandoverThread[] = [];
    const warnings: string[] = [];

    for (const thread of threads) {
      // Aggregate warnings from all statements
      for (const statement of thread.statements) {
        if (statement.warning) {
          // Surface contradiction warning at root level
          if (statement.warning.includes('Contradiction detected') && !warnings.some(w => w.includes(thread.room ?? thread.title))) {
            warnings.push(`Room ${thread.room ?? thread.title}: occupancy or state mismatch detected.`);
          }
          // Surface prompt injection at root level
          if (statement.warning.includes('Prompt injection attempt') && !warnings.some(w => w.includes('Prompt injection'))) {
            warnings.push(`Prompt injection attempt detected in Room ${thread.room ?? 'unknown'}. Input filed as evidence only.`);
          }
          // Surface missing info at root level
          if (statement.warning.includes('Missing information') && !warnings.some(w => w.includes(`Missing: ${thread.id}`))) {
            warnings.push(`Missing: ${thread.id} — ${statement.warning}`);
          }
        }
      }

      // Skip prompt-injection-only threads from the operational categories
      if (thread.isPromptInjectionRisk && thread.statements.every(s => s.confidence === 'low')) {
        continue;
      }

      const handoverThread = this.toHandoverThread(thread);
      const isHighPriority = thread.events?.some(e => HIGH_PRIORITY_TYPES.has(e.type)) ?? false;

      if (isHighPriority && thread.status !== 'newly_resolved') {
        highPriority.push(handoverThread);
      } else if (thread.status === 'still_open') {
        stillOpen.push(handoverThread);
      } else if (thread.status === 'newly_resolved') {
        newlyResolved.push(handoverThread);
      } else {
        newTonight.push(handoverThread);
      }
    }

    return {
      hotelId,
      generatedAt: new Date().toISOString(),
      highPriority,
      stillOpen,
      newlyResolved,
      newTonight,
      warnings,
    };
  }

  private toHandoverThread(thread: GroundedIssueThread): HandoverThread {
    // Determine the overall confidence of the thread from its statements
    const hasLow = thread.statements.some(s => s.confidence === 'low');
    const hasMedium = thread.statements.some(s => s.confidence === 'medium');
    const confidence = hasLow ? 'low' : hasMedium ? 'medium' : 'high';

    // Summary is only the text content - no evidence objects, no technical IDs
    const summary = thread.statements.map(s => s.text);

    return {
      id: thread.id,
      title: thread.title,
      room: thread.room,
      status: thread.status,
      summary,
      confidence,
    };
  }
}
