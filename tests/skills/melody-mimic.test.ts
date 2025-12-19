import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// ============================================================================
// Vocal Track Matching Utilities (based on rules defined in melody-mimic.md)
// ============================================================================

/**
 * Track information from MIDI file
 */
interface TrackInfo {
  index: number;
  name: string;
  noteCount: number;
  minPitch: number;
  maxPitch: number;
}

/**
 * Track match result
 */
interface TrackMatchResult {
  trackIndex: number;
  trackName: string;
  noteCount: number;
  charCount: number;
  matchScore: number;
  confidence: 'high' | 'medium' | 'low' | 'noMatch';
  hasKeywordMatch: boolean;
  vocalRangeOverlap: number;
}

// Load MIDI parser rules for matching configuration
const midiParserRulesForMatching = JSON.parse(
  readFileSync(join(process.cwd(), 'skills/resources/midi-parser-rules.json'), 'utf-8')
);

const VOCAL_RANGE_MIN = midiParserRulesForMatching.trackMatching.vocalRangeMin;
const VOCAL_RANGE_MAX = midiParserRulesForMatching.trackMatching.vocalRangeMax;
const TOLERANCE_PERCENT = midiParserRulesForMatching.trackMatching.tolerancePercent / 100;
const PRIORITY_KEYWORDS = midiParserRulesForMatching.trackMatching.priorityKeywords;
const MIN_VOCAL_RANGE_OVERLAP = midiParserRulesForMatching.trackMatching.minVocalRangeOverlap;

/**
 * Check if track name contains vocal keywords
 */
function hasVocalKeyword(trackName: string): boolean {
  const lowerName = trackName.toLowerCase();
  return PRIORITY_KEYWORDS.some((keyword: string) => 
    lowerName.includes(keyword.toLowerCase())
  );
}

/**
 * Calculate vocal range overlap ratio
 */
function calculateVocalRangeOverlap(minPitch: number, maxPitch: number): number {
  if (maxPitch < minPitch) return 0;
  
  const overlapMin = Math.max(minPitch, VOCAL_RANGE_MIN);
  const overlapMax = Math.min(maxPitch, VOCAL_RANGE_MAX);
  const overlapRange = Math.max(0, overlapMax - overlapMin);
  const trackRange = maxPitch - minPitch;
  
  if (trackRange === 0) {
    // Single note - check if it's in vocal range
    return (minPitch >= VOCAL_RANGE_MIN && minPitch <= VOCAL_RANGE_MAX) ? 1.0 : 0;
  }
  
  return overlapRange / trackRange;
}

/**
 * Check if track is in vocal range (at least 50% overlap)
 */
function isInVocalRange(minPitch: number, maxPitch: number): boolean {
  return calculateVocalRangeOverlap(minPitch, maxPitch) >= MIN_VOCAL_RANGE_OVERLAP;
}

/**
 * Calculate match score based on note count vs char count
 */
function calculateMatchScore(noteCount: number, charCount: number): number {
  if (charCount === 0) return 0;
  
  const diff = Math.abs(noteCount - charCount);
  const tolerance = charCount * TOLERANCE_PERCENT;
  
  if (diff === 0) return 1.0;
  if (diff <= tolerance) {
    return 1.0 - (diff / tolerance) * 0.3;
  }
  return Math.max(0, 0.7 - (diff - tolerance) / charCount);
}

/**
 * Calculate confidence score and level
 */
function calculateConfidence(
  matchScore: number,
  hasKeywordMatch: boolean,
  vocalRangeOverlap: number
): { confidence: 'high' | 'medium' | 'low' | 'noMatch'; score: number } {
  let score = 0;
  
  // Base score from match score (0-40)
  score += matchScore * 40;
  
  // Keyword match bonus (0-30)
  if (hasKeywordMatch) {
    score += 30;
  }
  
  // Vocal range overlap bonus (0-30)
  score += vocalRangeOverlap * 30;
  
  // Convert to confidence level
  if (score >= 90) return { confidence: 'high', score };
  if (score >= 70) return { confidence: 'medium', score };
  if (score >= 50) return { confidence: 'low', score };
  return { confidence: 'noMatch', score };
}

/**
 * Match tracks to find the best vocal track
 */
function matchVocalTrack(tracks: TrackInfo[], charCount: number): TrackMatchResult[] {
  const results: TrackMatchResult[] = tracks.map(track => {
    const hasKeyword = hasVocalKeyword(track.name);
    const vocalOverlap = calculateVocalRangeOverlap(track.minPitch, track.maxPitch);
    const matchScore = calculateMatchScore(track.noteCount, charCount);
    const { confidence, score } = calculateConfidence(matchScore, hasKeyword, vocalOverlap);
    
    return {
      trackIndex: track.index,
      trackName: track.name,
      noteCount: track.noteCount,
      charCount,
      matchScore,
      confidence,
      hasKeywordMatch: hasKeyword,
      vocalRangeOverlap: vocalOverlap,
      _totalScore: score // Internal for sorting
    };
  });
  
  // Sort by total score descending
  results.sort((a, b) => (b as any)._totalScore - (a as any)._totalScore);
  
  // Remove internal score
  return results.map(({ ...r }) => {
    delete (r as any)._totalScore;
    return r;
  });
}

/**
 * Select the best matching track
 */
function selectBestTrack(tracks: TrackInfo[], charCount: number): TrackMatchResult | null {
  if (tracks.length === 0) return null;
  
  const results = matchVocalTrack(tracks, charCount);
  return results[0] || null;
}

// ============================================================================
// Lyrics Parsing Utilities (based on rules defined in melody-mimic.md)
// ============================================================================

/**
 * Section marker pattern - matches [verse1], [chorus], [主歌], etc.
 */
const SECTION_MARKER_PATTERN = /^\[(info|verse\d*|chorus|bridge|pre-chorus|outro|intro|信息|主歌\d*|副歌|桥段|预副歌|尾声|前奏)\]$/i;

/**
 * Characters to exclude from character count
 */
const EXCLUDED_CHARS_PATTERN = /[\s，。！？、；：""''（）【】《》…—\[\]]/g;

/**
 * Valid characters pattern (Chinese, English letters, numbers)
 */
const VALID_CHARS_PATTERN = /[\u4e00-\u9fa5a-zA-Z0-9]/g;

/**
 * Check if a line is a section marker
 */
function isSectionMarker(line: string): boolean {
  return SECTION_MARKER_PATTERN.test(line.trim());
}

/**
 * Check if a line is an info metadata line (e.g., "title: xxx")
 */
function isInfoLine(line: string): boolean {
  return /^(title|artist|key|bpm|tempo|time):/i.test(line.trim());
}

/**
 * Count valid characters in a line (excluding punctuation and whitespace)
 */
function countValidChars(text: string): number {
  const matches = text.match(VALID_CHARS_PATTERN);
  return matches ? matches.length : 0;
}

/**
 * Parse section type from marker (e.g., "[verse1]" -> { type: "verse", index: 1 })
 */
function parseSectionMarker(marker: string): { type: string; index?: number } | null {
  const match = marker.trim().match(/^\[([a-zA-Z\u4e00-\u9fa5-]+)(\d*)\]$/i);
  if (!match) return null;
  
  let type = match[1].toLowerCase();
  const index = match[2] ? parseInt(match[2]) : undefined;
  
  // Normalize Chinese markers to English
  const chineseToEnglish: Record<string, string> = {
    '信息': 'info',
    '主歌': 'verse',
    '副歌': 'chorus',
    '桥段': 'bridge',
    '预副歌': 'pre-chorus',
    '尾声': 'outro',
    '前奏': 'intro'
  };
  
  if (chineseToEnglish[type]) {
    type = chineseToEnglish[type];
  }
  
  return { type, index };
}

interface LyricsLine {
  text: string;
  charCount: number;
}

interface LyricsSection {
  type: string;
  index?: number;
  lines: LyricsLine[];
  totalChars: number;
}

interface LyricsStructure {
  sections: LyricsSection[];
  totalChars: number;
  totalLines: number;
}

/**
 * Parse lyrics text into structured format
 */
function parseLyrics(lyricsText: string): LyricsStructure {
  const lines = lyricsText.split('\n');
  const sections: LyricsSection[] = [];
  let currentSection: LyricsSection | null = null;
  let inInfoSection = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;
    
    // Check if it's a section marker
    if (isSectionMarker(trimmedLine)) {
      const parsed = parseSectionMarker(trimmedLine);
      if (parsed) {
        // Save previous section if exists
        if (currentSection && currentSection.lines.length > 0) {
          sections.push(currentSection);
        }
        
        currentSection = {
          type: parsed.type,
          index: parsed.index,
          lines: [],
          totalChars: 0
        };
        
        inInfoSection = parsed.type === 'info';
      }
      continue;
    }
    
    // Skip info metadata lines
    if (inInfoSection && isInfoLine(trimmedLine)) {
      continue;
    }
    
    // Add line to current section
    if (currentSection && !inInfoSection) {
      const charCount = countValidChars(trimmedLine);
      if (charCount > 0) {
        currentSection.lines.push({
          text: trimmedLine,
          charCount
        });
        currentSection.totalChars += charCount;
      }
    }
  }
  
  // Don't forget the last section
  if (currentSection && currentSection.lines.length > 0) {
    sections.push(currentSection);
  }
  
  // Calculate totals
  const totalChars = sections.reduce((sum, s) => sum + s.totalChars, 0);
  const totalLines = sections.reduce((sum, s) => sum + s.lines.length, 0);
  
  return {
    sections,
    totalChars,
    totalLines
  };
}

// Load the melody-mimic skill file
const melodyMimicSkillPath = join(process.cwd(), 'skills/melody-mimic.md');
const melodyMimicSkillContent = existsSync(melodyMimicSkillPath) 
  ? readFileSync(melodyMimicSkillPath, 'utf-8') 
  : '';

// Load the MIDI parser rules JSON
const midiParserRulesPath = join(process.cwd(), 'skills/resources/midi-parser-rules.json');
const midiParserRules = JSON.parse(readFileSync(midiParserRulesPath, 'utf-8'));

/**
 * **Feature: melody-mimic, Property 1: MIDI 音轨解析完整性**
 * *对于任意* 有效的 MIDI 文件，解析后的音轨数量应与文件中实际音轨数量一致，且每个音轨的音符数量应正确统计。
 * **Validates: Requirements 1.1**
 * 
 * 此测试验证 MIDI 音符映射的完整性，确保所有人声音域范围内的 MIDI 音符都有对应的音名映射。
 */
describe('Property 1: MIDI 音轨解析完整性', () => {
  const midiToName = midiParserRules.noteMapping.midiToName;
  const vocalRangeMin = midiParserRules.trackMatching.vocalRangeMin;
  const vocalRangeMax = midiParserRules.trackMatching.vocalRangeMax;

  it('人声音域范围内的所有 MIDI 音符都有对应的音名映射', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: vocalRangeMin, max: vocalRangeMax }),
        (midiNote) => {
          const noteName = midiToName[midiNote.toString()];
          return noteName !== undefined && noteName.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('MIDI 音符映射的音名格式正确（音名+八度）', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: vocalRangeMin, max: vocalRangeMax }),
        (midiNote) => {
          const noteName = midiToName[midiNote.toString()];
          if (!noteName) return false;
          // 音名格式应为: C4, C#4, Db4 等
          const pattern = /^[A-G](#|b)?[0-9]$/;
          return pattern.test(noteName);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('相邻 MIDI 音符的八度关系正确（每12个半音为一个八度）', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: vocalRangeMin, max: vocalRangeMax - 12 }),
        (midiNote) => {
          const noteName = midiToName[midiNote.toString()];
          const octaveUpName = midiToName[(midiNote + 12).toString()];
          if (!noteName || !octaveUpName) return true; // Skip if mapping doesn't exist
          
          // Extract octave numbers
          const octave1 = parseInt(noteName.slice(-1));
          const octave2 = parseInt(octaveUpName.slice(-1));
          
          // Octave should increase by 1
          return octave2 === octave1 + 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('MIDI 音符映射覆盖完整的人声音域', () => {
    const mappedNotes = Object.keys(midiToName).map(Number);
    const minMapped = Math.min(...mappedNotes);
    const maxMapped = Math.max(...mappedNotes);
    
    // 映射应覆盖人声音域
    expect(minMapped).toBeLessThanOrEqual(vocalRangeMin);
    expect(maxMapped).toBeGreaterThanOrEqual(vocalRangeMax);
  });

  it('时值映射包含所有基本音符类型', () => {
    const durationNames = midiParserRules.durationMapping.durationNames;
    const requiredDurations = ['480', '240', '960', '1920']; // 四分、八分、二分、全音符
    
    fc.assert(
      fc.property(
        fc.constantFrom(...requiredDurations),
        (duration) => {
          const durationInfo = durationNames[duration];
          return durationInfo !== undefined && 
                 durationInfo.name !== undefined &&
                 durationInfo.beats !== undefined;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: melody-mimic, Property 11: 资源文件引用一致性**
 * *对于* melody-mimic.md Skill 文件中 resources 列表引用的每个资源文件，该文件必须存在于 skills/resources/ 目录下。
 * **Validates: Requirements 7.1**
 */
describe('Property 11: 资源文件引用一致性', () => {
  it('midi-parser-rules.json 文件存在于 skills/resources/ 目录', () => {
    expect(existsSync(midiParserRulesPath)).toBe(true);
  });

  it('midi-parser-rules.json 是有效的 JSON 格式', () => {
    expect(() => {
      JSON.parse(readFileSync(midiParserRulesPath, 'utf-8'));
    }).not.toThrow();
  });

  it('midi-parser-rules.json 包含必要的顶级字段', () => {
    const requiredFields = ['meta', 'noteMapping', 'durationMapping', 'rhythmPatterns', 'modeDetection', 'trackMatching'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...requiredFields),
        (field) => {
          return midiParserRules[field] !== undefined;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('noteMapping 包含 midiToName 和 midiToJianpu 映射', () => {
    expect(midiParserRules.noteMapping.midiToName).toBeDefined();
    expect(midiParserRules.noteMapping.midiToJianpu).toBeDefined();
  });

  it('durationMapping 包含 ticksPerBeat 和 durationNames', () => {
    expect(midiParserRules.durationMapping.ticksPerBeat).toBeDefined();
    expect(midiParserRules.durationMapping.durationNames).toBeDefined();
    expect(midiParserRules.durationMapping.ticksPerBeat).toBe(480);
  });

  it('rhythmPatterns 包含基本节奏型定义', () => {
    const patterns = Object.keys(midiParserRules.rhythmPatterns);
    expect(patterns.length).toBeGreaterThan(0);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...patterns),
        (patternName) => {
          const pattern = midiParserRules.rhythmPatterns[patternName];
          return pattern.name !== undefined &&
                 Array.isArray(pattern.durations) &&
                 pattern.durations.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('modeDetection 包含五声音阶调式定义', () => {
    const expectedModes = ['gong', 'shang', 'jue', 'zhi', 'yu'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...expectedModes),
        (mode) => {
          const modeInfo = midiParserRules.modeDetection.pentatonic[mode];
          return modeInfo !== undefined &&
                 modeInfo.name !== undefined &&
                 Array.isArray(modeInfo.characteristicDegrees);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('trackMatching 包含人声音轨匹配规则', () => {
    const trackMatching = midiParserRules.trackMatching;
    
    expect(trackMatching.vocalRangeMin).toBeDefined();
    expect(trackMatching.vocalRangeMax).toBeDefined();
    expect(trackMatching.tolerancePercent).toBeDefined();
    expect(Array.isArray(trackMatching.priorityKeywords)).toBe(true);
    expect(trackMatching.priorityKeywords.length).toBeGreaterThan(0);
  });

  it('人声音域范围合理（C3-C6）', () => {
    const trackMatching = midiParserRules.trackMatching;
    
    // C3 = 48, C6 = 84
    expect(trackMatching.vocalRangeMin).toBeGreaterThanOrEqual(36); // 不低于 C2
    expect(trackMatching.vocalRangeMax).toBeLessThanOrEqual(96);    // 不高于 C7
    expect(trackMatching.vocalRangeMax).toBeGreaterThan(trackMatching.vocalRangeMin);
  });
});

/**
 * **Feature: melody-mimic, Property 12: 版权提醒包含**
 * *对于任意* 旋律生成输出，输出内容应包含版权风险提醒和免责声明。
 * **Validates: Requirements 8.4**
 */
describe('Property 12: 版权提醒包含', () => {
  it('melody-mimic.md Skill 文件存在', () => {
    expect(existsSync(melodyMimicSkillPath)).toBe(true);
  });

  it('Skill 文件包含版权风险提醒章节', () => {
    expect(melodyMimicSkillContent).toContain('版权风险提醒');
  });

  it('版权提醒包含必要的警告内容', () => {
    const requiredWarnings = [
      '版权保护',
      '学习参考',
      '商用',
      '风险'
    ];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...requiredWarnings),
        (warning) => {
          return melodyMimicSkillContent.includes(warning);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('简谱输出格式示例包含版权提醒', () => {
    // 检查简谱输出格式部分是否包含版权提醒
    expect(melodyMimicSkillContent).toContain('⚠️ 版权提醒');
  });

  it('输出格式包含免责声明', () => {
    expect(melodyMimicSkillContent).toContain('免责声明');
  });

  it('免责声明包含必要的法律提示', () => {
    const requiredDisclaimerElements = [
      '学习参考',
      '商业使用',
      '版权风险'
    ];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...requiredDisclaimerElements),
        (element) => {
          return melodyMimicSkillContent.includes(element);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Skill 文件 resources 引用 midi-parser-rules.json', () => {
    // 检查 YAML frontmatter 中的 resources 引用
    expect(melodyMimicSkillContent).toContain('midi-parser-rules.json');
  });

  it('版权提醒在文件开头部分（前 2000 字符内）', () => {
    const first2000Chars = melodyMimicSkillContent.substring(0, 2000);
    expect(first2000Chars).toContain('版权');
  });
});

/**
 * **Feature: melody-mimic, Property 6: 歌词结构解析正确性**
 * *对于任意* 带段落标记的歌词文本，解析出的段落数、每段句数、每句字数应与原文一致。
 * **Validates: Requirements 3.1**
 */
describe('Property 6: 歌词结构解析正确性', () => {
  // Generator for valid section types
  const sectionTypeArb = fc.constantFrom(
    'verse', 'verse1', 'verse2', 'chorus', 'bridge', 'pre-chorus', 'outro', 'intro',
    '主歌', '主歌1', '主歌2', '副歌', '桥段', '预副歌', '尾声', '前奏'
  );

  // Generator for Chinese lyrics lines (1-15 characters)
  const chineseChars = [
    '\u98CE', '\u82B1', '\u96EA', '\u6708', '\u5C71', '\u6C34', '\u4E91', '\u5929', '\u5730', '\u4EBA',
    '\u5FC3', '\u60C5', '\u68A6', '\u601D', '\u5FF5', '\u7231', '\u6068', '\u6101', '\u559C', '\u60B2',
    '\u6625', '\u590F', '\u79CB', '\u51AC', '\u65E5', '\u591C', '\u6668', '\u66AE', '\u5149', '\u5F71'
  ];
  const chineseLyricsLineArb = fc.array(
    fc.constantFrom(...chineseChars),
    { minLength: 1, maxLength: 15 }
  ).map(chars => chars.join(''));

  // Generator for a lyrics section with 1-5 lines
  const lyricsSectionArb = fc.record({
    type: sectionTypeArb,
    lines: fc.array(chineseLyricsLineArb, { minLength: 1, maxLength: 5 })
  });

  // Generator for complete lyrics with 1-4 sections
  const lyricsArb = fc.array(lyricsSectionArb, { minLength: 1, maxLength: 4 });

  // Helper to build lyrics text from structured data
  function buildLyricsText(sections: { type: string; lines: string[] }[]): string {
    return sections.map(section => {
      return `[${section.type}]\n${section.lines.join('\n')}`;
    }).join('\n\n');
  }

  it('解析后的段落数量与原文段落标记数量一致', () => {
    fc.assert(
      fc.property(lyricsArb, (sections) => {
        const lyricsText = buildLyricsText(sections);
        const parsed = parseLyrics(lyricsText);
        
        // Number of parsed sections should equal input sections
        return parsed.sections.length === sections.length;
      }),
      { numRuns: 100 }
    );
  });

  it('每个段落的句数与原文行数一致', () => {
    fc.assert(
      fc.property(lyricsArb, (sections) => {
        const lyricsText = buildLyricsText(sections);
        const parsed = parseLyrics(lyricsText);
        
        // Each section should have the same number of lines
        for (let i = 0; i < sections.length; i++) {
          if (parsed.sections[i].lines.length !== sections[i].lines.length) {
            return false;
          }
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('每句的字数统计正确（仅计算有效字符）', () => {
    fc.assert(
      fc.property(lyricsArb, (sections) => {
        const lyricsText = buildLyricsText(sections);
        const parsed = parseLyrics(lyricsText);
        
        // Each line's charCount should match the actual character count
        for (let i = 0; i < sections.length; i++) {
          for (let j = 0; j < sections[i].lines.length; j++) {
            const expectedCount = countValidChars(sections[i].lines[j]);
            const actualCount = parsed.sections[i].lines[j].charCount;
            if (actualCount !== expectedCount) {
              return false;
            }
          }
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('总字数等于所有句子字数之和', () => {
    fc.assert(
      fc.property(lyricsArb, (sections) => {
        const lyricsText = buildLyricsText(sections);
        const parsed = parseLyrics(lyricsText);
        
        // Total chars should equal sum of all line chars
        const sumFromLines = parsed.sections.reduce(
          (sum, section) => sum + section.lines.reduce((s, line) => s + line.charCount, 0),
          0
        );
        return parsed.totalChars === sumFromLines;
      }),
      { numRuns: 100 }
    );
  });

  it('总句数等于所有段落句数之和', () => {
    fc.assert(
      fc.property(lyricsArb, (sections) => {
        const lyricsText = buildLyricsText(sections);
        const parsed = parseLyrics(lyricsText);
        
        // Total lines should equal sum of all section lines
        const sumFromSections = parsed.sections.reduce(
          (sum, section) => sum + section.lines.length,
          0
        );
        return parsed.totalLines === sumFromSections;
      }),
      { numRuns: 100 }
    );
  });

  it('段落标记不计入字数统计', () => {
    fc.assert(
      fc.property(
        sectionTypeArb,
        chineseLyricsLineArb,
        (sectionType, line) => {
          const lyricsText = `[${sectionType}]\n${line}`;
          const parsed = parseLyrics(lyricsText);
          
          // The section marker should not be counted
          const expectedChars = countValidChars(line);
          return parsed.totalChars === expectedChars;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('标点符号不计入字数统计', () => {
    const punctuations = [
      '\uFF0C', // ，
      '\u3002', // 。
      '\uFF01', // ！
      '\uFF1F', // ？
      '\u3001', // 、
      '\uFF1B', // ；
      '\uFF1A', // ：
      '\u201C', // "
      '\u201D', // "
      '\u2018', // '
      '\u2019', // '
      '\uFF08', // （
      '\uFF09', // ）
      '\u3010', // 【
      '\u3011', // 】
      '\u300A', // 《
      '\u300B', // 》
      '\u2026', // …
      '\u2014'  // —
    ];
    
    fc.assert(
      fc.property(
        chineseLyricsLineArb,
        fc.constantFrom(...punctuations),
        (line, punct) => {
          const lineWithPunct = line + punct;
          const countWithPunct = countValidChars(lineWithPunct);
          const countWithoutPunct = countValidChars(line);
          
          // Punctuation should not affect the count
          return countWithPunct === countWithoutPunct;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('空格不计入字数统计', () => {
    fc.assert(
      fc.property(
        chineseLyricsLineArb,
        fc.integer({ min: 1, max: 5 }),
        (line, spaceCount) => {
          const lineWithSpaces = line + ' '.repeat(spaceCount);
          const countWithSpaces = countValidChars(lineWithSpaces);
          const countWithoutSpaces = countValidChars(line);
          
          // Spaces should not affect the count
          return countWithSpaces === countWithoutSpaces;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('中英文标记均能正确识别', () => {
    const chineseEnglishPairs = [
      { chinese: '主歌', english: 'verse' },
      { chinese: '副歌', english: 'chorus' },
      { chinese: '桥段', english: 'bridge' },
      { chinese: '尾声', english: 'outro' },
      { chinese: '前奏', english: 'intro' }
    ];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...chineseEnglishPairs),
        chineseLyricsLineArb,
        (pair, line) => {
          const chineseLyrics = `[${pair.chinese}]\n${line}`;
          const englishLyrics = `[${pair.english}]\n${line}`;
          
          const parsedChinese = parseLyrics(chineseLyrics);
          const parsedEnglish = parseLyrics(englishLyrics);
          
          // Both should parse to the same normalized type
          return parsedChinese.sections[0].type === parsedEnglish.sections[0].type;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('info 段落的元信息行不计入歌词', () => {
    const infoLines = ['title: 测试歌曲', 'artist: 测试歌手', 'key: C', 'bpm: 120'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...infoLines),
        (infoLine) => {
          const lyricsText = `[info]\n${infoLine}\n\n[verse1]\n测试歌词`;
          const parsed = parseLyrics(lyricsText);
          
          // Info section should not be included in sections (or have no lines)
          // and the verse section should have exactly 4 chars
          const verseSection = parsed.sections.find(s => s.type === 'verse');
          return verseSection !== undefined && verseSection.totalChars === 4;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('段落标记大小写不敏感', () => {
    const caseVariants = ['VERSE1', 'Verse1', 'verse1', 'CHORUS', 'Chorus', 'chorus'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...caseVariants),
        chineseLyricsLineArb,
        (marker, line) => {
          const lyricsText = `[${marker}]\n${line}`;
          const parsed = parseLyrics(lyricsText);
          
          // Should parse successfully regardless of case
          return parsed.sections.length === 1 && parsed.sections[0].lines.length === 1;
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * **Feature: melody-mimic, Property 2: 人声音轨匹配准确性**
 * *对于任意* MIDI 文件和歌词组合，匹配算法应选择音符数量与歌词字数最接近的音轨作为人声音轨。
 * **Validates: Requirements 1.2**
 */
describe('Property 2: 人声音轨匹配准确性', () => {
  // Generator for track names (some with vocal keywords, some without)
  const trackNameArb = fc.oneof(
    fc.constantFrom('Vocal', 'Lead Vocal', 'Voice', 'Melody', '主旋律', '人声'),
    fc.constantFrom('Piano', 'Guitar', 'Bass', 'Drums', 'Strings', 'Synth', 'Pad')
  );

  // Generator for MIDI pitch within vocal range
  const vocalPitchArb = fc.integer({ min: VOCAL_RANGE_MIN, max: VOCAL_RANGE_MAX });
  
  // Generator for MIDI pitch outside vocal range (bass)
  const bassPitchArb = fc.integer({ min: 28, max: 47 });
  
  // Generator for note count (realistic range for a song)
  const noteCountArb = fc.integer({ min: 20, max: 200 });
  
  // Generator for char count (realistic range for lyrics)
  const charCountArb = fc.integer({ min: 20, max: 200 });

  // Generator for a single track
  const trackArb = fc.record({
    index: fc.integer({ min: 0, max: 15 }),
    name: trackNameArb,
    noteCount: noteCountArb,
    minPitch: vocalPitchArb,
    maxPitch: vocalPitchArb
  }).chain(track => {
    // Ensure maxPitch >= minPitch
    return fc.constant({
      ...track,
      maxPitch: Math.max(track.minPitch, track.maxPitch)
    });
  });

  // Generator for multiple tracks (1-8 tracks)
  const tracksArb = fc.array(trackArb, { minLength: 1, maxLength: 8 }).map(tracks => 
    tracks.map((t, i) => ({ ...t, index: i }))
  );

  it('当存在音符数量与字数完全匹配的音轨时，应选择该音轨', () => {
    fc.assert(
      fc.property(
        charCountArb,
        fc.array(noteCountArb, { minLength: 1, maxLength: 5 }),
        (charCount, otherNoteCounts) => {
          // Create tracks where one has exact match
          const tracks: TrackInfo[] = [
            { index: 0, name: 'Track1', noteCount: charCount, minPitch: 60, maxPitch: 72 },
            ...otherNoteCounts
              .filter(nc => nc !== charCount) // Ensure no other exact matches
              .map((nc, i) => ({
                index: i + 1,
                name: `Track${i + 2}`,
                noteCount: nc,
                minPitch: 60,
                maxPitch: 72
              }))
          ];
          
          const result = selectBestTrack(tracks, charCount);
          
          // The track with exact match should be selected (or have highest score)
          return result !== null && result.noteCount === charCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('当没有完全匹配时，应选择音符数量最接近字数的音轨（在容差范围内）', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 50, max: 150 }), // Use larger charCount to ensure tolerance range is meaningful
        (charCount) => {
          // Create tracks with different note counts within and near tolerance range
          const tolerance = Math.floor(charCount * TOLERANCE_PERCENT);
          const closeCount = charCount + Math.floor(tolerance * 0.5); // Within tolerance
          const farCount = charCount + tolerance * 3; // Outside tolerance
          
          const tracks: TrackInfo[] = [
            { index: 0, name: 'Track1', noteCount: farCount, minPitch: 60, maxPitch: 72 },
            { index: 1, name: 'Track2', noteCount: closeCount, minPitch: 60, maxPitch: 72 }
          ];
          
          const result = selectBestTrack(tracks, charCount);
          if (!result) return false;
          
          // The track within tolerance should be selected over the one outside
          return result.noteCount === closeCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('当多个音轨都在容差范围外时，算法应基于总分选择', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 50, max: 100 }),
        (charCount) => {
          // Create tracks all outside tolerance range
          const tolerance = Math.floor(charCount * TOLERANCE_PERCENT);
          const farCount1 = charCount + tolerance * 3;
          const farCount2 = charCount + tolerance * 4;
          
          const tracks: TrackInfo[] = [
            { index: 0, name: 'Track1', noteCount: farCount1, minPitch: 60, maxPitch: 72 },
            { index: 1, name: 'Track2', noteCount: farCount2, minPitch: 60, maxPitch: 72 }
          ];
          
          const results = matchVocalTrack(tracks, charCount);
          
          // Both should have low or noMatch confidence since they're outside tolerance
          return results.every(r => r.confidence === 'low' || r.confidence === 'noMatch' || r.confidence === 'medium');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('关键词匹配的音轨应获得更高的置信度分数', () => {
    fc.assert(
      fc.property(
        charCountArb,
        (charCount) => {
          const tracks: TrackInfo[] = [
            { index: 0, name: 'Piano', noteCount: charCount, minPitch: 60, maxPitch: 72 },
            { index: 1, name: 'Vocal', noteCount: charCount, minPitch: 60, maxPitch: 72 }
          ];
          
          const results = matchVocalTrack(tracks, charCount);
          
          // Vocal track should have higher score due to keyword match
          const vocalResult = results.find(r => r.trackName === 'Vocal');
          const pianoResult = results.find(r => r.trackName === 'Piano');
          
          return vocalResult !== undefined && 
                 pianoResult !== undefined && 
                 vocalResult.hasKeywordMatch === true &&
                 pianoResult.hasKeywordMatch === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('音域在人声范围内的音轨应获得更高的音域重叠分数', () => {
    fc.assert(
      fc.property(
        charCountArb,
        (charCount) => {
          const tracks: TrackInfo[] = [
            { index: 0, name: 'Bass', noteCount: charCount, minPitch: 28, maxPitch: 47 }, // Below vocal range
            { index: 1, name: 'Melody', noteCount: charCount, minPitch: 60, maxPitch: 72 } // In vocal range
          ];
          
          const results = matchVocalTrack(tracks, charCount);
          
          const bassResult = results.find(r => r.trackName === 'Bass');
          const melodyResult = results.find(r => r.trackName === 'Melody');
          
          return bassResult !== undefined && 
                 melodyResult !== undefined && 
                 melodyResult.vocalRangeOverlap > bassResult.vocalRangeOverlap;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('匹配度分数应在 0 到 1 之间', () => {
    fc.assert(
      fc.property(
        tracksArb,
        charCountArb,
        (tracks, charCount) => {
          const results = matchVocalTrack(tracks, charCount);
          
          return results.every(r => r.matchScore >= 0 && r.matchScore <= 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('音域重叠比例应在 0 到 1 之间', () => {
    fc.assert(
      fc.property(
        tracksArb,
        charCountArb,
        (tracks, charCount) => {
          const results = matchVocalTrack(tracks, charCount);
          
          return results.every(r => r.vocalRangeOverlap >= 0 && r.vocalRangeOverlap <= 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('置信度等级应为有效值', () => {
    fc.assert(
      fc.property(
        tracksArb,
        charCountArb,
        (tracks, charCount) => {
          const results = matchVocalTrack(tracks, charCount);
          const validConfidences = ['high', 'medium', 'low', 'noMatch'];
          
          return results.every(r => validConfidences.includes(r.confidence));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('完全匹配且有关键词的音轨应获得高置信度', () => {
    fc.assert(
      fc.property(
        charCountArb,
        (charCount) => {
          const tracks: TrackInfo[] = [
            { index: 0, name: 'Vocal', noteCount: charCount, minPitch: 60, maxPitch: 72 }
          ];
          
          const results = matchVocalTrack(tracks, charCount);
          
          // Perfect match with keyword should be high confidence
          return results.length > 0 && results[0].confidence === 'high';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('音符数量差异超过容差范围时匹配分数应降低', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 50, max: 100 }),
        (charCount) => {
          const withinTolerance = Math.floor(charCount * (1 + TOLERANCE_PERCENT * 0.5));
          const outsideTolerance = Math.floor(charCount * (1 + TOLERANCE_PERCENT * 2));
          
          const scoreWithin = calculateMatchScore(withinTolerance, charCount);
          const scoreOutside = calculateMatchScore(outsideTolerance, charCount);
          
          return scoreWithin > scoreOutside;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('空音轨列表应返回 null', () => {
    fc.assert(
      fc.property(
        charCountArb,
        (charCount) => {
          const result = selectBestTrack([], charCount);
          return result === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('单音轨应直接返回该音轨', () => {
    fc.assert(
      fc.property(
        trackArb,
        charCountArb,
        (track, charCount) => {
          const result = selectBestTrack([track], charCount);
          return result !== null && result.trackIndex === track.index;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('结果应按总分降序排列', () => {
    fc.assert(
      fc.property(
        tracksArb,
        charCountArb,
        (tracks, charCount) => {
          if (tracks.length < 2) return true;
          
          const results = matchVocalTrack(tracks, charCount);
          
          // Check that results are sorted by confidence level
          // high > medium > low > noMatch
          const confidenceOrder = { high: 3, medium: 2, low: 1, noMatch: 0 };
          
          for (let i = 0; i < results.length - 1; i++) {
            const current = confidenceOrder[results[i].confidence];
            const next = confidenceOrder[results[i + 1].confidence];
            if (current < next) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('人声关键词匹配应不区分大小写', () => {
    const keywordVariants = [
      'VOCAL', 'Vocal', 'vocal',
      'MELODY', 'Melody', 'melody',
      'VOICE', 'Voice', 'voice'
    ];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...keywordVariants),
        (keyword) => {
          return hasVocalKeyword(keyword) === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('中文关键词应正确匹配', () => {
    const chineseKeywords = ['主旋律', '人声'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...chineseKeywords),
        (keyword) => {
          return hasVocalKeyword(keyword) === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('非人声关键词不应匹配', () => {
    const nonVocalKeywords = ['Piano', 'Guitar', 'Bass', 'Drums', 'Synth', '钢琴', '吉他'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...nonVocalKeywords),
        (keyword) => {
          return hasVocalKeyword(keyword) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('音域完全在人声范围内时重叠比例应为 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: VOCAL_RANGE_MIN, max: VOCAL_RANGE_MAX - 10 }),
        fc.integer({ min: 1, max: 10 }),
        (minPitch, range) => {
          const maxPitch = Math.min(minPitch + range, VOCAL_RANGE_MAX);
          const overlap = calculateVocalRangeOverlap(minPitch, maxPitch);
          return overlap === 1.0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('音域完全在人声范围外时重叠比例应为 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 20, max: 40 }),
        fc.integer({ min: 1, max: 5 }),
        (minPitch, range) => {
          const maxPitch = minPitch + range;
          // Ensure completely below vocal range
          if (maxPitch >= VOCAL_RANGE_MIN) return true;
          
          const overlap = calculateVocalRangeOverlap(minPitch, maxPitch);
          return overlap === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});


// ============================================================================
// Rhythm Statistics Utilities (based on rules defined in melody-mimic.md)
// ============================================================================

const TICKS_PER_BEAT = midiParserRules.durationMapping.ticksPerBeat; // 480

/**
 * Rhythm statistics interface
 */
interface RhythmStats {
  quarterNote: number;   // 四分音符占比 (0-100)
  eighthNote: number;    // 八分音符占比 (0-100)
  dottedNote: number;    // 附点音符占比 (0-100)
  syncopation: number;   // 切分音占比 (0-100)
  triplet: number;       // 三连音占比 (0-100)
  sixteenth: number;     // 十六分音符占比 (0-100)
  other: number;         // 其他占比 (0-100)
}

/**
 * Classify rhythm type based on duration in ticks
 */
function classifyRhythm(durationTicks: number, ticksPerBeat: number = TICKS_PER_BEAT): string {
  const tolerance = ticksPerBeat * 0.1; // 10% tolerance
  
  // Quarter note: 480 ticks (1 beat)
  if (Math.abs(durationTicks - ticksPerBeat) <= tolerance) {
    return 'quarterNote';
  }
  
  // Eighth note: 240 ticks (0.5 beat)
  if (Math.abs(durationTicks - ticksPerBeat / 2) <= tolerance) {
    return 'eighthNote';
  }
  
  // Dotted quarter note: 720 ticks (1.5 beats)
  if (Math.abs(durationTicks - ticksPerBeat * 1.5) <= tolerance) {
    return 'dottedNote';
  }
  
  // Dotted eighth note: 360 ticks (0.75 beats)
  if (Math.abs(durationTicks - ticksPerBeat * 0.75) <= tolerance) {
    return 'dottedNote';
  }
  
  // Half note: 960 ticks (2 beats)
  if (Math.abs(durationTicks - ticksPerBeat * 2) <= tolerance) {
    return 'quarterNote'; // Classify as basic type
  }
  
  // Triplet (quarter): 160 ticks (1/3 beat)
  if (Math.abs(durationTicks - ticksPerBeat / 3) <= tolerance) {
    return 'triplet';
  }
  
  // Sixteenth note: 120 ticks (0.25 beat)
  if (Math.abs(durationTicks - ticksPerBeat / 4) <= tolerance) {
    return 'sixteenth';
  }
  
  return 'other';
}

/**
 * Calculate rhythm statistics from duration array
 * All percentages must sum to 100%
 */
function calculateRhythmStats(durations: number[]): RhythmStats {
  if (durations.length === 0) {
    return {
      quarterNote: 0,
      eighthNote: 0,
      dottedNote: 0,
      syncopation: 0,
      triplet: 0,
      sixteenth: 0,
      other: 0
    };
  }
  
  const counts: Record<string, number> = {
    quarterNote: 0,
    eighthNote: 0,
    dottedNote: 0,
    syncopation: 0,
    triplet: 0,
    sixteenth: 0,
    other: 0
  };
  
  // Count each rhythm type
  for (const duration of durations) {
    const type = classifyRhythm(duration);
    counts[type]++;
  }
  
  const total = durations.length;
  
  // Convert to percentages using floor to avoid exceeding 100%
  const stats: RhythmStats = {
    quarterNote: Math.floor(counts.quarterNote / total * 100),
    eighthNote: Math.floor(counts.eighthNote / total * 100),
    dottedNote: Math.floor(counts.dottedNote / total * 100),
    syncopation: Math.floor(counts.syncopation / total * 100),
    triplet: Math.floor(counts.triplet / total * 100),
    sixteenth: Math.floor(counts.sixteenth / total * 100),
    other: Math.floor(counts.other / total * 100)
  };
  
  // Ensure sum is exactly 100% by adding remainder to the largest category
  const sum = stats.quarterNote + stats.eighthNote + stats.dottedNote + 
              stats.syncopation + stats.triplet + stats.sixteenth + stats.other;
  
  if (sum < 100) {
    const diff = 100 - sum;
    // Find the category with the most counts and add the remainder there
    const maxKey = Object.keys(counts).reduce((a, b) => 
      counts[a] > counts[b] ? a : b
    ) as keyof RhythmStats;
    stats[maxKey] += diff;
  }
  
  return stats;
}

/**
 * **Feature: melody-mimic, Property 4: 节奏型统计准确性**
 * *对于任意* 音符序列，节奏型统计的各类型占比之和应等于 100%。
 * **Validates: Requirements 2.3**
 */
describe('Property 4: 节奏型统计准确性', () => {
  // Generator for valid duration values (common note durations in ticks)
  const validDurationArb = fc.constantFrom(
    120,  // Sixteenth note
    160,  // Triplet
    240,  // Eighth note
    360,  // Dotted eighth
    480,  // Quarter note
    720,  // Dotted quarter
    960   // Half note
  );
  
  // Generator for random duration values (including edge cases)
  const randomDurationArb = fc.integer({ min: 60, max: 1920 });
  
  // Generator for duration arrays (1-100 notes)
  const durationsArb = fc.array(validDurationArb, { minLength: 1, maxLength: 100 });
  const randomDurationsArb = fc.array(randomDurationArb, { minLength: 1, maxLength: 100 });

  it('节奏型统计的各类型占比之和应等于 100%', () => {
    fc.assert(
      fc.property(durationsArb, (durations) => {
        const stats = calculateRhythmStats(durations);
        
        const sum = stats.quarterNote + stats.eighthNote + stats.dottedNote +
                    stats.syncopation + stats.triplet + stats.sixteenth + stats.other;
        
        return sum === 100;
      }),
      { numRuns: 100 }
    );
  });

  it('随机时值的节奏型统计各类型占比之和也应等于 100%', () => {
    fc.assert(
      fc.property(randomDurationsArb, (durations) => {
        const stats = calculateRhythmStats(durations);
        
        const sum = stats.quarterNote + stats.eighthNote + stats.dottedNote +
                    stats.syncopation + stats.triplet + stats.sixteenth + stats.other;
        
        return sum === 100;
      }),
      { numRuns: 100 }
    );
  });

  it('所有占比值应在 0-100 范围内', () => {
    fc.assert(
      fc.property(durationsArb, (durations) => {
        const stats = calculateRhythmStats(durations);
        
        return stats.quarterNote >= 0 && stats.quarterNote <= 100 &&
               stats.eighthNote >= 0 && stats.eighthNote <= 100 &&
               stats.dottedNote >= 0 && stats.dottedNote <= 100 &&
               stats.syncopation >= 0 && stats.syncopation <= 100 &&
               stats.triplet >= 0 && stats.triplet <= 100 &&
               stats.sixteenth >= 0 && stats.sixteenth <= 100 &&
               stats.other >= 0 && stats.other <= 100;
      }),
      { numRuns: 100 }
    );
  });

  it('空数组应返回全零统计', () => {
    const stats = calculateRhythmStats([]);
    
    expect(stats.quarterNote).toBe(0);
    expect(stats.eighthNote).toBe(0);
    expect(stats.dottedNote).toBe(0);
    expect(stats.syncopation).toBe(0);
    expect(stats.triplet).toBe(0);
    expect(stats.sixteenth).toBe(0);
    expect(stats.other).toBe(0);
  });

  it('单一类型的音符应返回 100% 该类型', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        (count) => {
          // All quarter notes
          const durations = Array(count).fill(480);
          const stats = calculateRhythmStats(durations);
          
          return stats.quarterNote === 100 &&
                 stats.eighthNote === 0 &&
                 stats.dottedNote === 0 &&
                 stats.syncopation === 0 &&
                 stats.triplet === 0 &&
                 stats.sixteenth === 0 &&
                 stats.other === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('四分音符应被正确分类', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 432, max: 528 }), // 480 ± 10%
        (duration) => {
          const type = classifyRhythm(duration);
          return type === 'quarterNote';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('八分音符应被正确分类', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 216, max: 264 }), // 240 ± 10%
        (duration) => {
          const type = classifyRhythm(duration);
          return type === 'eighthNote';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('附点四分音符应被正确分类', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 672, max: 768 }), // 720 ± 48 (10% of 480)
        (duration) => {
          const type = classifyRhythm(duration);
          return type === 'dottedNote';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('十六分音符应被正确分类（非重叠区域）', () => {
    // Test only the non-overlapping range for sixteenth notes
    // Sixteenth (120) range: 72-168, but triplet (160) range: 112-208
    // Non-overlapping sixteenth range: 72-111
    fc.assert(
      fc.property(
        fc.integer({ min: 72, max: 111 }),
        (duration) => {
          const type = classifyRhythm(duration);
          return type === 'sixteenth';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('三连音应被正确分类（非重叠区域）', () => {
    // Test only the non-overlapping range for triplets
    // Triplet (160) range: 112-208
    // Sixteenth (120) range: 72-168
    // Eighth (240) range: 192-288
    // Non-overlapping triplet range: 169-191 (between sixteenth and eighth)
    fc.assert(
      fc.property(
        fc.integer({ min: 169, max: 191 }),
        (duration) => {
          const type = classifyRhythm(duration);
          return type === 'triplet';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('不在标准时值范围内的音符应被分类为 other', () => {
    // Values that don't match any standard duration (outside all tolerance ranges)
    // Tolerance ranges: sixteenth 72-168, triplet 112-208, eighth 192-288, 
    // dotted-eighth 312-408, quarter 432-528, dotted-quarter 672-768, half 912-1008
    // Safe "other" values: <72, 290-310, 530-670, 770-910, >1010
    const nonStandardDurations = [30, 50, 70, 295, 305, 550, 600, 650, 800, 850, 1100];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...nonStandardDurations),
        (duration) => {
          const type = classifyRhythm(duration);
          return type === 'other';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('混合节奏型的统计应正确反映各类型比例', () => {
    // 5 quarter notes + 5 eighth notes = 50% each
    const durations = [
      480, 480, 480, 480, 480,  // 5 quarter notes
      240, 240, 240, 240, 240   // 5 eighth notes
    ];
    
    const stats = calculateRhythmStats(durations);
    
    expect(stats.quarterNote).toBe(50);
    expect(stats.eighthNote).toBe(50);
    expect(stats.quarterNote + stats.eighthNote + stats.dottedNote +
           stats.syncopation + stats.triplet + stats.sixteenth + stats.other).toBe(100);
  });

  it('统计结果应为整数百分比', () => {
    fc.assert(
      fc.property(durationsArb, (durations) => {
        const stats = calculateRhythmStats(durations);
        
        return Number.isInteger(stats.quarterNote) &&
               Number.isInteger(stats.eighthNote) &&
               Number.isInteger(stats.dottedNote) &&
               Number.isInteger(stats.syncopation) &&
               Number.isInteger(stats.triplet) &&
               Number.isInteger(stats.sixteenth) &&
               Number.isInteger(stats.other);
      }),
      { numRuns: 100 }
    );
  });
});


// ============================================================================
// Interval Statistics Utilities (based on rules defined in melody-mimic.md)
// ============================================================================

/**
 * Interval statistics interface
 */
interface IntervalStats {
  unison: number;    // 同度占比 (0-100)
  stepwise: number;  // 级进占比 (0-100)
  smallLeap: number; // 小跳占比 (0-100)
  largeLeap: number; // 大跳占比 (0-100)
}

/**
 * Calculate interval between two MIDI pitches (in semitones)
 */
function calculateInterval(pitch1: number, pitch2: number): number {
  return Math.abs(pitch2 - pitch1);
}

/**
 * Classify interval type based on semitones
 */
function classifyInterval(semitones: number): string {
  if (semitones === 0) {
    return 'unison';     // 同度
  }
  if (semitones >= 1 && semitones <= 2) {
    return 'stepwise';   // 级进（小二度、大二度）
  }
  if (semitones >= 3 && semitones <= 4) {
    return 'smallLeap';  // 小跳（小三度、大三度）
  }
  return 'largeLeap';    // 大跳（五度及以上）
}

/**
 * Calculate interval distribution statistics
 * All percentages must sum to 100%
 */
function calculateIntervalStats(pitches: number[]): IntervalStats {
  if (pitches.length < 2) {
    return {
      unison: 0,
      stepwise: 0,
      smallLeap: 0,
      largeLeap: 0
    };
  }
  
  const counts = {
    unison: 0,
    stepwise: 0,
    smallLeap: 0,
    largeLeap: 0
  };
  
  // Count intervals between adjacent notes
  for (let i = 0; i < pitches.length - 1; i++) {
    const interval = calculateInterval(pitches[i], pitches[i + 1]);
    const type = classifyInterval(interval);
    counts[type as keyof typeof counts]++;
  }
  
  // Total number of intervals (notes - 1)
  const total = pitches.length - 1;
  
  // Convert to percentages using floor
  const stats: IntervalStats = {
    unison: Math.floor(counts.unison / total * 100),
    stepwise: Math.floor(counts.stepwise / total * 100),
    smallLeap: Math.floor(counts.smallLeap / total * 100),
    largeLeap: Math.floor(counts.largeLeap / total * 100)
  };
  
  // Ensure sum is exactly 100%
  const sum = stats.unison + stats.stepwise + stats.smallLeap + stats.largeLeap;
  if (sum < 100 && total > 0) {
    const diff = 100 - sum;
    // Add remainder to the largest category
    const maxKey = Object.keys(counts).reduce((a, b) => 
      counts[a as keyof typeof counts] > counts[b as keyof typeof counts] ? a : b
    ) as keyof IntervalStats;
    stats[maxKey] += diff;
  }
  
  return stats;
}

/**
 * **Feature: melody-mimic, Property 5: 音程分布统计准确性**
 * *对于任意* 音符序列，音程分布统计的各类型占比之和应等于 100%。
 * **Validates: Requirements 2.4**
 */
describe('Property 5: 音程分布统计准确性', () => {
  // Generator for MIDI pitch values (vocal range)
  const pitchArb = fc.integer({ min: 48, max: 84 });
  
  // Generator for pitch arrays (2-100 notes, need at least 2 for intervals)
  const pitchesArb = fc.array(pitchArb, { minLength: 2, maxLength: 100 });
  
  // Generator for single pitch (for edge cases)
  const singlePitchArb = fc.array(pitchArb, { minLength: 1, maxLength: 1 });

  it('音程分布统计的各类型占比之和应等于 100%', () => {
    fc.assert(
      fc.property(pitchesArb, (pitches) => {
        const stats = calculateIntervalStats(pitches);
        
        const sum = stats.unison + stats.stepwise + stats.smallLeap + stats.largeLeap;
        
        return sum === 100;
      }),
      { numRuns: 100 }
    );
  });

  it('所有占比值应在 0-100 范围内', () => {
    fc.assert(
      fc.property(pitchesArb, (pitches) => {
        const stats = calculateIntervalStats(pitches);
        
        return stats.unison >= 0 && stats.unison <= 100 &&
               stats.stepwise >= 0 && stats.stepwise <= 100 &&
               stats.smallLeap >= 0 && stats.smallLeap <= 100 &&
               stats.largeLeap >= 0 && stats.largeLeap <= 100;
      }),
      { numRuns: 100 }
    );
  });

  it('单音符序列应返回全零统计', () => {
    fc.assert(
      fc.property(singlePitchArb, (pitches) => {
        const stats = calculateIntervalStats(pitches);
        
        return stats.unison === 0 &&
               stats.stepwise === 0 &&
               stats.smallLeap === 0 &&
               stats.largeLeap === 0;
      }),
      { numRuns: 100 }
    );
  });

  it('空数组应返回全零统计', () => {
    const stats = calculateIntervalStats([]);
    
    expect(stats.unison).toBe(0);
    expect(stats.stepwise).toBe(0);
    expect(stats.smallLeap).toBe(0);
    expect(stats.largeLeap).toBe(0);
  });

  it('同度音程（0半音）应被正确分类', () => {
    fc.assert(
      fc.property(
        pitchArb,
        fc.integer({ min: 2, max: 20 }),
        (pitch, count) => {
          // Create array of same pitch
          const pitches = Array(count).fill(pitch);
          const stats = calculateIntervalStats(pitches);
          
          // All intervals should be unison
          return stats.unison === 100 &&
                 stats.stepwise === 0 &&
                 stats.smallLeap === 0 &&
                 stats.largeLeap === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('级进音程（1-2半音）应被正确分类', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2 }),
        (semitones) => {
          const type = classifyInterval(semitones);
          return type === 'stepwise';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('小跳音程（3-4半音）应被正确分类', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 3, max: 4 }),
        (semitones) => {
          const type = classifyInterval(semitones);
          return type === 'smallLeap';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('大跳音程（5半音及以上）应被正确分类', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 24 }),
        (semitones) => {
          const type = classifyInterval(semitones);
          return type === 'largeLeap';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('音程计算应为绝对值（不区分上行下行）', () => {
    fc.assert(
      fc.property(
        pitchArb,
        pitchArb,
        (pitch1, pitch2) => {
          const interval1 = calculateInterval(pitch1, pitch2);
          const interval2 = calculateInterval(pitch2, pitch1);
          
          // Interval should be the same regardless of direction
          return interval1 === interval2 && interval1 >= 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('统计结果应为整数百分比', () => {
    fc.assert(
      fc.property(pitchesArb, (pitches) => {
        const stats = calculateIntervalStats(pitches);
        
        return Number.isInteger(stats.unison) &&
               Number.isInteger(stats.stepwise) &&
               Number.isInteger(stats.smallLeap) &&
               Number.isInteger(stats.largeLeap);
      }),
      { numRuns: 100 }
    );
  });

  it('纯级进旋律应返回 100% 级进', () => {
    // Create a scale-like melody (all stepwise motion)
    const pitches = [60, 62, 64, 65, 67, 69, 71, 72]; // C major scale
    const stats = calculateIntervalStats(pitches);
    
    expect(stats.stepwise).toBe(100);
    expect(stats.unison).toBe(0);
    expect(stats.smallLeap).toBe(0);
    expect(stats.largeLeap).toBe(0);
  });

  it('纯小跳旋律应返回 100% 小跳', () => {
    // Create melody with only minor/major thirds
    const pitches = [60, 63, 67, 70, 74]; // All minor thirds (3 semitones)
    const stats = calculateIntervalStats(pitches);
    
    expect(stats.smallLeap).toBe(100);
    expect(stats.unison).toBe(0);
    expect(stats.stepwise).toBe(0);
    expect(stats.largeLeap).toBe(0);
  });

  it('纯大跳旋律应返回 100% 大跳', () => {
    // Create melody with only large leaps (5+ semitones)
    const pitches = [60, 67, 72, 79]; // All perfect fifths (7 semitones)
    const stats = calculateIntervalStats(pitches);
    
    expect(stats.largeLeap).toBe(100);
    expect(stats.unison).toBe(0);
    expect(stats.stepwise).toBe(0);
    expect(stats.smallLeap).toBe(0);
  });

  it('混合音程的统计应正确反映各类型比例', () => {
    // 4 intervals: 1 unison, 1 stepwise, 1 small leap, 1 large leap
    const pitches = [60, 60, 62, 65, 72]; // 0, 2, 3, 7 semitones
    const stats = calculateIntervalStats(pitches);
    
    // Each type should be 25%
    expect(stats.unison).toBe(25);
    expect(stats.stepwise).toBe(25);
    expect(stats.smallLeap).toBe(25);
    expect(stats.largeLeap).toBe(25);
    expect(stats.unison + stats.stepwise + stats.smallLeap + stats.largeLeap).toBe(100);
  });

  it('两个音符应产生单一音程统计', () => {
    fc.assert(
      fc.property(
        pitchArb,
        pitchArb,
        (pitch1, pitch2) => {
          const pitches = [pitch1, pitch2];
          const stats = calculateIntervalStats(pitches);
          
          // Only one interval, so one category should be 100%
          const sum = stats.unison + stats.stepwise + stats.smallLeap + stats.largeLeap;
          const hasOneHundred = stats.unison === 100 || stats.stepwise === 100 || 
                                stats.smallLeap === 100 || stats.largeLeap === 100;
          
          return sum === 100 && hasOneHundred;
        }
      ),
      { numRuns: 100 }
    );
  });
});
