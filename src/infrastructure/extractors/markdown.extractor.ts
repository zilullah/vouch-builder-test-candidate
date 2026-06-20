import { Issue } from '../../domain/entities/issue';
import crypto from 'crypto';

export class MarkdownExtractor {
  extract(markdown: string): Issue[] {
    const issues: Issue[] = [];
    const lines = markdown.split('\n');
    let currentIssueLines: string[] = [];
    
    for (const line of lines) {
      if (line.trim().startsWith('- ')) {
        if (currentIssueLines.length > 0) {
          issues.push(this.parseBullet(currentIssueLines.join('\n')));
        }
        currentIssueLines = [line.trim().substring(2)];
      } else if (currentIssueLines.length > 0 && line.trim() !== '') {
        currentIssueLines.push(line.trim());
      }
    }
    
    if (currentIssueLines.length > 0) {
      issues.push(this.parseBullet(currentIssueLines.join('\n')));
    }

    return issues;
  }

  private parseBullet(text: string): Issue {
    const id = `md_${crypto.createHash('md5').update(text).digest('hex').substring(0, 8)}`;
    
    const roomMatch = text.match(/(?:room|房)\s*(\d{3})/i) || text.match(/(\d{3})\s*(?:那个|房|—|-)/);
    const room = roomMatch ? roomMatch[1] : null;

    return {
      id,
      title: `Night Log Entry${room ? ' - Room ' + room : ''}`,
      room,
      type: 'night_log',
      status: 'new_tonight',
      events: [{
        id,
        timestamp: new Date().toISOString(),
        type: 'night_log',
        room,
        guest: null,
        description: text,
        status: 'pending',
        source: 'night-logs.md'
      }],
      evidence: [{
        eventId: id,
        sourceType: 'night-logs.md',
        excerpt: text
      }],
      hasContradiction: false,
      isPromptInjectionRisk: false,
      isIncomplete: !room && text.toLowerCase().includes('room')
    };
  }
}
