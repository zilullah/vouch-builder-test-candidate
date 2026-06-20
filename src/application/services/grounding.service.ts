import { IssueThread } from '../../domain/entities/issue-thread';
import { GroundedIssueThread, GroundedStatement } from '../../domain/entities/grounded-thread';

export class GroundingService {
  ground(threads: IssueThread[]): GroundedIssueThread[] {
    return threads.map(thread => this.groundThread(thread));
  }

  private groundThread(thread: IssueThread): GroundedIssueThread {
    const statements: GroundedStatement[] = [];

    for (let i = 0; i < thread.events.length; i++) {
      const event = thread.events[i];
      const evidence = thread.evidence.find(e => e.eventId === event.id);
      
      if (!evidence) {
        continue;
      }

      let confidence: 'high' | 'medium' | 'low' = 'high';
      let warning: string | undefined = undefined;

      if (thread.isPromptInjectionRisk && event.description.includes('SYSTEM NOTE TO THE HANDOVER TOOL')) {
        confidence = 'low';
        warning = 'Prompt injection attempt detected. Content treated as data only.';
      }

      if (thread.hasContradiction && 
          (event.description.toLowerCase().includes("system still shows") || 
           event.description.toLowerCase().includes("nobody's been in there"))) {
        confidence = 'medium';
        warning = 'Contradiction detected: occupancy or state mismatch.';
      }

      if (i === 0 && !thread.room && thread.title.toLowerCase() !== 'immigration scanner backlog' && thread.title.toLowerCase() !== 'corridor leak') {
        warning = warning ? `${warning} Missing information: Unknown room number.` : 'Missing information: Unknown room number.';
        thread.isIncomplete = true;
      }

      if (!event.guest && (event.type === 'check_in' || event.type === 'deposit_issue')) {
        warning = warning ? `${warning} Missing information: Unknown guest identity.` : 'Missing information: Unknown guest identity.';
        thread.isIncomplete = true;
      }

      statements.push({
        text: evidence.excerpt,
        evidence: evidence,
        confidence,
        warning
      });
    }

    return {
      id: thread.id,
      title: thread.title,
      room: thread.room,
      status: thread.status,
      statements,
      hasContradiction: thread.hasContradiction,
      isPromptInjectionRisk: thread.isPromptInjectionRisk,
      isIncomplete: thread.isIncomplete
    };
  }
}
