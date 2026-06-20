import { Evidence } from '../value-objects/evidence';
import { ThreadStatus } from './issue-thread';

export interface GroundedStatement {
  text: string;
  evidence: Evidence;
  confidence: 'high' | 'medium' | 'low';
  warning?: string;
}

export interface GroundedIssueThread {
  id: string;
  title: string;
  room: string | null;
  status: ThreadStatus;
  statements: GroundedStatement[];
  hasContradiction: boolean;
  isPromptInjectionRisk: boolean;
  isIncomplete: boolean;
}
