import { EventExtractor } from '../../infrastructure/extractors/event.extractor';
import { MarkdownExtractor } from '../../infrastructure/extractors/markdown.extractor';
import { Issue } from '../../domain/entities/issue';
import { Event } from '../../domain/entities/event';

export class NormalizationService {
  constructor(
    private eventExtractor: EventExtractor,
    private markdownExtractor: MarkdownExtractor
  ) {}

  normalize(events: Event[], nightLog: string): Issue[] {
    const jsonIssues = this.eventExtractor.extract(events);
    const mdIssues = this.markdownExtractor.extract(nightLog);

    return [...jsonIssues, ...mdIssues];
  }
}
