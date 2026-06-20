import { ThreadStatus } from '../entities/issue-thread';

export interface HandoverThread {
  id: string;
  title: string;
  room: string | null;
  status: ThreadStatus;
  summary: string[];       // operational statements only, no metadata
  confidence: 'high' | 'medium' | 'low';
}

export interface Handover {
  hotelId: string;
  generatedAt: string;
  highPriority: HandoverThread[];
  stillOpen: HandoverThread[];
  newlyResolved: HandoverThread[];
  newTonight: HandoverThread[];
  warnings: string[];
}
