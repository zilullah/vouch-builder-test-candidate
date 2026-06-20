import { Event } from './event';

export type IssueStatus = 'still_open' | 'newly_resolved' | 'new_tonight';

export interface Issue {
  id: string; // Unique identifier for the issue thread
  room: string | null;
  type: string; // e.g., 'maintenance', 'deposit_issue'
  status: IssueStatus;
  events: Event[]; // Historical events reconciled into this single thread
  
  // Contradiction & Risk Detection
  hasContradiction: boolean;
  contradictionDetails?: string; // Explanation of conflicting events
  isPromptInjectionRisk: boolean; // True if instructions disguised as data are detected
  isIncomplete: boolean; // True if critical context is missing (e.g., missing room numbers)
}
