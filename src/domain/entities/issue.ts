import { Event } from './event';
import { Evidence } from '../value-objects/evidence';

export type IssueStatus = 'still_open' | 'newly_resolved' | 'new_tonight';

export interface Issue {
  id: string; // Unique identifier for the issue thread
  title: string;
  room: string | null;
  type: string; // e.g., 'maintenance', 'deposit_issue'
  status: IssueStatus;
  events: Event[]; // Historical events reconciled into this single thread
  evidence: Evidence[];

  // Contradiction & Risk Detection
  hasContradiction: boolean;
  contradictionDetails?: string; // Explanation of conflicting events
  isPromptInjectionRisk: boolean; // True if instructions disguised as data are detected
  isIncomplete: boolean; // True if critical context is missing (e.g., missing room numbers)

  // Informational flag: event was seen but requires no action. Must NOT be silently dropped.
  // Manager sees it in the informational bucket for full audit trail.
  informational?: boolean;
}
