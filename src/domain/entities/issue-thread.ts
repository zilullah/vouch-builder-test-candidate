import { Event } from './event';
import { Evidence } from '../value-objects/evidence';

export type ThreadStatus = 'still_open' | 'newly_resolved' | 'new_tonight';

export interface IssueThread {
  id: string;
  title: string;
  room: string | null;
  status: ThreadStatus;
  events: Event[];
  evidence: Evidence[];
  hasContradiction: boolean;
  isPromptInjectionRisk: boolean;
  isIncomplete: boolean;
}
