import { Handover, HandoverThread } from '../../domain/models/handover';

interface FormattedHandoverThread {
  id: string;
  title: string;
  room: string | null;
  status: string;
  summary: string[];
  confidence: string;
}

interface FormattedHandover {
  hotelId: string;
  generatedAt: string;
  highPriority: FormattedHandoverThread[];
  stillOpen: FormattedHandoverThread[];
  newlyResolved: FormattedHandoverThread[];
  newTonight: FormattedHandoverThread[];
  warnings: string[];
}

export class HandoverFormatter {
  /**
   * Produces a clean JSON representation of the Handover.
   * Strips all evidence objects, raw event logs, and technical metadata.
   * Only operational summaries are returned.
   */
  toJSON(handover: Handover): FormattedHandover {
    return {
      hotelId: handover.hotelId,
      generatedAt: handover.generatedAt,
      highPriority: handover.highPriority.map(this.formatThread),
      stillOpen: handover.stillOpen.map(this.formatThread),
      newlyResolved: handover.newlyResolved.map(this.formatThread),
      newTonight: handover.newTonight.map(this.formatThread),
      warnings: handover.warnings,
    };
  }

  private formatThread(thread: HandoverThread): FormattedHandoverThread {
    return {
      id: thread.id,
      title: thread.title,
      room: thread.room,
      status: thread.status,
      summary: thread.summary,
      confidence: thread.confidence,
    };
  }

  /**
   * Produces a human-readable plain-text handover for printing or quick scan.
   * Readable in under 60 seconds by a morning manager.
   */
  toPlainText(handover: Handover): string {
    const lines: string[] = [];

    lines.push(`=== NIGHT SHIFT HANDOVER — ${handover.hotelId.toUpperCase()} ===`);
    lines.push(`Generated: ${handover.generatedAt}`);
    lines.push('');

    if (handover.warnings.length > 0) {
      lines.push('⚠️  WARNINGS — Review before acting:');
      for (const w of handover.warnings) {
        lines.push(`  • ${w}`);
      }
      lines.push('');
    }

    const renderSection = (label: string, threads: HandoverThread[]) => {
      if (threads.length === 0) return;
      lines.push(`── ${label.toUpperCase()} ──`);
      for (const t of threads) {
        lines.push(`  [${t.room ?? 'No Room'}] ${t.title}`);
        for (const s of t.summary) {
          lines.push(`    → ${s}`);
        }
      }
      lines.push('');
    };

    renderSection('🔴 HIGH PRIORITY — Act immediately', handover.highPriority);
    renderSection('🟡 Still Open — Carry forward', handover.stillOpen);
    renderSection('🟢 Newly Resolved — No action needed', handover.newlyResolved);
    renderSection('🔵 New Tonight — Emerged this shift', handover.newTonight);

    return lines.join('\n');
  }
}
