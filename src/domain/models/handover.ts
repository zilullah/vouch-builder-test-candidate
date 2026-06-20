import { Evidence } from '../value-objects/evidence';

export interface HandoverItem {
  issueId: string;
  room: string | null;
  actionRequired: string; // What the morning manager needs to do (Action-first)
  summary: string; // A concise explanation grounded in evidence
  evidence: Evidence[]; // Traceability: must have at least one piece of evidence
}

export interface Handover {
  hotelId: string;
  shiftDate: string; // The date of the morning handover
  highPriority: HandoverItem[]; // Needs immediate action
  stillOpen: HandoverItem[]; // Carried over from previous shifts
  newlyResolved: HandoverItem[]; // Fixed during the night
  newTonight: HandoverItem[]; // Emerged during this shift
  warnings: HandoverItem[]; // Contradictions, prompt injections, or incomplete data
}
