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

// Max excerpt length in a warning string to keep output scannable
const WARNING_EXCERPT_MAX = 120;

export class HandoverService {
  generate(hotelId: string, threads: GroundedIssueThread[]): Handover {
    const highPriority: HandoverThread[] = [];
    const stillOpen: HandoverThread[] = [];
    const newlyResolved: HandoverThread[] = [];
    const newTonight: HandoverThread[] = [];
    const informational: HandoverThread[] = [];
    const warnings: string[] = [];

    for (const thread of threads) {
      // Aggregate warnings from all statements — text must quote source evidence directly
      for (const statement of thread.statements) {
        if (!statement.warning) continue;

        const excerpt = statement.evidence.excerpt.substring(0, WARNING_EXCERPT_MAX);
        const roomLabel = thread.room ? `Room ${thread.room}` : thread.title;

        if (statement.warning.includes('Contradiction detected') &&
            !warnings.some(w => w.startsWith(`[CONTRADICTION] ${roomLabel}`))) {
          warnings.push(`[CONTRADICTION] ${roomLabel}: Source log states — "${excerpt}"`);
        }

        if (statement.warning.includes('Prompt injection attempt') &&
            !warnings.some(w => w.startsWith('[SECURITY]'))) {
          warnings.push(`[SECURITY] ${roomLabel}: Untrusted instruction content received — "${excerpt.substring(0, 80)}" — treated as evidence only, not executed.`);
        }

        if (statement.warning.includes('Missing information') &&
            !warnings.some(w => w.startsWith(`[INCOMPLETE] ${thread.id}`))) {
          warnings.push(`[INCOMPLETE] ${thread.id}: ${statement.warning} — Source: "${excerpt}"`);
        }
      }

      // Informational threads: seen and logged, no morning action required
      if (thread.informational) {
        informational.push(this.toHandoverThread(thread));
        continue;
      }

      // Skip prompt-injection-only threads from operational categories
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
      informational,
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
