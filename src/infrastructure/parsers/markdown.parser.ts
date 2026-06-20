import fs from 'fs/promises';

export class MarkdownParser {
  async parse(filePath: string): Promise<string> {
    const rawData = await fs.readFile(filePath, 'utf-8');
    return rawData;
  }
}
