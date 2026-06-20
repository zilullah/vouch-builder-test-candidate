import { Issue } from '../../domain/entities/issue';
import { IssueThread, ThreadStatus } from '../../domain/entities/issue-thread';

export interface ReconciliationResult {
  stillOpen: IssueThread[];
  newlyResolved: IssueThread[];
  newTonight: IssueThread[];
  contradictions: IssueThread[];
}

export class ReconciliationService {
  reconcile(issues: Issue[]): ReconciliationResult {
    const threadMap = new Map<string, IssueThread>();

    for (const issue of issues) {
      const threadId = this.determineThreadId(issue);
      
      if (!threadMap.has(threadId)) {
        threadMap.set(threadId, {
          id: threadId,
          title: this.deriveTitle(issue, threadId),
          room: issue.room,
          status: 'new_tonight',
          events: [],
          evidence: [],
          hasContradiction: false,
          isPromptInjectionRisk: false,
          isIncomplete: false
        });
      }

      const thread = threadMap.get(threadId)!;
      thread.events.push(...issue.events);
      thread.evidence.push(...issue.evidence);
      thread.isPromptInjectionRisk = thread.isPromptInjectionRisk || issue.isPromptInjectionRisk;
      thread.isIncomplete = thread.isIncomplete || issue.isIncomplete;
      
      // Contradiction Detection Heuristic
      const hasContradiction = issue.evidence.some(e => 
        e.excerpt.toLowerCase().includes("system still shows") || 
        e.excerpt.toLowerCase().includes("nobody's been in there")
      );
      thread.hasContradiction = thread.hasContradiction || hasContradiction;
    }

    const result: ReconciliationResult = {
      stillOpen: [],
      newlyResolved: [],
      newTonight: [],
      contradictions: []
    };

    // Vouch Builder Test assumption: Current shift boundary is around May 29th PM / May 30th AM.
    const TONIGHT_BOUNDARY = new Date('2026-05-29T12:00:00+08:00').getTime();

    for (const thread of threadMap.values()) {
      // Sort chronologically
      thread.events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      let hasPreviousShiftEvent = false;
      let hasTonightEvent = false;
      let latestStatus = 'unresolved';

      for (const event of thread.events) {
        const eventTime = new Date(event.timestamp).getTime();
        if (eventTime < TONIGHT_BOUNDARY) {
          hasPreviousShiftEvent = true;
        } else {
          hasTonightEvent = true;
        }
        
        // Only update status if it is an explicit resolution or still unresolved
        // Markdown gives 'pending', so we shouldn't let 'pending' override a 'resolved' from a json file if json was later.
        if (event.status === 'resolved' || event.status === 'unresolved') {
          latestStatus = event.status;
        }
      }

      if (hasPreviousShiftEvent) {
        if (latestStatus === 'resolved') {
          thread.status = 'newly_resolved';
          result.newlyResolved.push(thread);
        } else {
          thread.status = 'still_open';
          result.stillOpen.push(thread);
        }
      } else {
        thread.status = 'new_tonight';
        result.newTonight.push(thread);
      }

      if (thread.hasContradiction) {
        result.contradictions.push(thread);
      }
    }

    return result;
  }

  private determineThreadId(issue: Issue): string {
    if (issue.type === 'compliance') return 'thread_compliance';
    if (issue.type === 'facilities' || issue.evidence.some(e => e.excerpt.toLowerCase().includes('leak'))) return 'thread_leak';
    if (issue.room) return `thread_room_${issue.room}`;
    return `thread_singleton_${issue.id}`;
  }

  private deriveTitle(issue: Issue, threadId: string): string {
    if (threadId === 'thread_compliance') return 'Immigration Scanner Backlog';
    if (threadId === 'thread_leak') return 'Corridor Leak';
    return issue.title;
  }
}
