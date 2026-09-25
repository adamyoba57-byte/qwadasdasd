export interface RequirementItem {
  key: string;
  value: string;
}

export interface ParsedRequirements {
  hasRequirements: boolean;
  leadDescription: string;
  minHeadingNote?: string;
  recHeadingNote?: string;
  minimum: RequirementItem[];
  recommended: RequirementItem[];
  footnotes: string[];
  rawText: string;
}

interface SectionParseResult {
  headingNote?: string;
  items: RequirementItem[];
}

/**
 * Parses key-value pairs from a text block (e.g. MINIMUM section or RECOMMENDED section).
 * Handles both multiline text and continuous single-line text where keys are preceded by space.
 */
function parseSectionBlock(text: string): SectionParseResult {
  if (!text || !text.trim()) {
    return { items: [] };
  }

  const cleanText = text.trim();
  const items: RequirementItem[] = [];

  // Pattern to find all key occurrences and their positions
  const keyMatchRegex = /(?:^|[\n\r]|\s{2,}|\s)(OS\s*\*?|PROCESSOR|MEMORY|GRAPHICS|VIDEO CARD|DIRECTX|NETWORK|STORAGE|HARD DRIVE|SOUND CARD|VR SUPPORT|ADDITIONAL NOTES|OTHER)\s*:\s*/gi;

  const matches: Array<{ key: string; index: number; fullLength: number }> = [];
  let m: RegExpExecArray | null;

  while ((m = keyMatchRegex.exec(cleanText)) !== null) {
    const rawMatch = m[0];
    const key = m[1].trim();
    const keyOffset = rawMatch.indexOf(m[1]);
    const startIndex = m.index + keyOffset;
    matches.push({
      key,
      index: startIndex,
      fullLength: rawMatch.length - keyOffset
    });
  }

  let headingNote: string | undefined;

  if (matches.length === 0) {
    // Fallback: check if lines are formatted like "Key: Value"
    const lines = cleanText.split(/[\r\n]+/);
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0 && colonIdx < 30) {
        const k = line.substring(0, colonIdx).trim();
        const v = line.substring(colonIdx + 1).trim();
        if (k && v) {
          items.push({ key: k.toUpperCase(), value: v });
        }
      } else if (line.trim()) {
        if (!headingNote) {
          headingNote = line.trim();
        } else {
          items.push({ key: 'NOTE', value: line.trim() });
        }
      }
    }
    return { headingNote, items };
  }

  // Text before first key is headingNote (e.g. "Requires a 64-bit processor and operating system")
  const preText = cleanText.substring(0, matches[0].index).trim();
  if (preText) {
    headingNote = preText;
  }

  // Extract values between matches
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];

    const valueStart = current.index + current.fullLength;
    const valueEnd = next ? next.index : cleanText.length;

    let value = cleanText.substring(valueStart, valueEnd).trim();
    // Normalize spaces but preserve readable formatting
    value = value.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ');

    let normalizedKey = current.key.toUpperCase();
    if (normalizedKey.startsWith('OS')) {
      normalizedKey = current.key.includes('*') ? 'OS *' : 'OS';
    }

    items.push({
      key: normalizedKey,
      value
    });
  }

  return { headingNote, items };
}

/**
 * Checks if a string contains Steam-like system requirements
 */
export function isSteamRequirements(text?: string | null): boolean {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();

  const hasReqWord =
    lower.includes('system requirements') ||
    lower.includes('minimum:') ||
    lower.includes('recommended:') ||
    lower.includes('processor:') ||
    lower.includes('graphics:') ||
    lower.includes('directx:') ||
    lower.includes('storage:');

  const keyCount = (lower.match(/processor:|graphics:|directx:|memory:|os\s*\*?:|storage:/gi) || []).length;

  return hasReqWord || keyCount >= 2;
}

/**
 * Main parser: takes any raw text copied from Steam and parses it into
 * leadDescription, minimum requirements, recommended requirements, and footnotes.
 */
export function parseSteamRequirements(input?: string | null): ParsedRequirements {
  const result: ParsedRequirements = {
    hasRequirements: false,
    leadDescription: '',
    minimum: [],
    recommended: [],
    footnotes: [],
    rawText: input || ''
  };

  if (!input || typeof input !== 'string') return result;

  const raw = input.trim();
  if (!raw) return result;

  if (!isSteamRequirements(raw)) {
    result.leadDescription = raw;
    return result;
  }

  result.hasRequirements = true;

  // Step 1: Detect lead description (text before "System Requirements" or "MINIMUM:")
  let content = raw;
  const sysReqIndex = content.search(/system requirements/i);
  const minIndex = content.search(/minimum\s*:/i);

  let splitPoint = -1;
  if (sysReqIndex !== -1) {
    splitPoint = sysReqIndex;
  } else if (minIndex !== -1) {
    splitPoint = minIndex;
  }

  if (splitPoint > 0) {
    result.leadDescription = content.substring(0, splitPoint).trim();
    content = content.substring(splitPoint);
  }

  // Strip initial "System Requirements" heading if present
  content = content.replace(/^system requirements[:\s-]*/i, '').trim();

  // Step 2: Extract explicit Steam client support footnotes at the very bottom
  // e.g. "* Starting January 1st, 2024, the Steam Client will only support Windows 10 and later versions."
  const steamFootnoteRegex = /(?:\r?\n|\s{2,})(\*\s*Starting\s+[A-Za-z0-9].*)$/is;
  const footnoteMatch = content.match(steamFootnoteRegex);
  if (footnoteMatch) {
    const rawFootnote = footnoteMatch[1].trim();
    const lines = rawFootnote.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
    result.footnotes = lines;
    content = content.substring(0, content.length - footnoteMatch[0].length).trim();
  }

  // Step 3: Split into MINIMUM and RECOMMENDED sections
  const recMatch = content.match(/(?:^|[\r\n]|\s{2,}|\s)(RECOMMENDED\s*:|RECOMMENDED SYSTEM REQUIREMENTS\s*:)/i);

  let minSection = '';
  let recSection = '';

  if (recMatch && recMatch.index !== undefined) {
    const recIndex = recMatch.index;
    minSection = content.substring(0, recIndex).trim();
    recSection = content.substring(recIndex + recMatch[0].length).trim();
  } else {
    minSection = content;
  }

  // Clean "MINIMUM:" prefix from minSection
  minSection = minSection.replace(/^minimum\s*:\s*/i, '').replace(/^minimum system requirements\s*:\s*/i, '').trim();

  // Step 4: Parse section blocks
  const parsedMin = parseSectionBlock(minSection);
  const parsedRec = parseSectionBlock(recSection);

  result.minHeadingNote = parsedMin.headingNote;
  result.minimum = parsedMin.items;

  result.recHeadingNote = parsedRec.headingNote;
  result.recommended = parsedRec.items;

  return result;
}
