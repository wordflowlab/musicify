import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load the pentatonic rules JSON
const pentatonicRulesPath = join(process.cwd(), 'skills/resources/pentatonic-rules.json');
const pentatonicRules = JSON.parse(readFileSync(pentatonicRulesPath, 'utf-8'));

// Load the guofeng patterns JSON
const guofengPatternsPath = join(process.cwd(), 'skills/resources/guofeng-patterns.json');
const guofengPatterns = JSON.parse(readFileSync(guofengPatternsPath, 'utf-8'));

/**
 * **Feature: melody-gen, Property 1: 五声音阶约束**
 * *对于任意* pentatonic-rules.json 中的调式定义，其 notes 数组只能包含 [1, 2, 3, 5, 6] 的子集，不能包含 4 或 7。
 * **Validates: Requirements 2.1, 2.2**
 */
describe('Property 1: 五声音阶约束', () => {
  const validPentatonicNotes = [1, 2, 3, 5, 6];
  const forbiddenNotes = [4, 7];
  const scaleNames = Object.keys(pentatonicRules.scales);

  it('所有调式的 notes 数组只包含五声音阶音符 [1, 2, 3, 5, 6]', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...scaleNames),
        (scaleName) => {
          const scale = pentatonicRules.scales[scaleName];
          const notes = scale.notes;
          
          // Every note must be in the valid pentatonic set
          return notes.every((note: number) => validPentatonicNotes.includes(note));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('所有调式的 notes 数组不包含禁止音符 4 和 7', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...scaleNames),
        (scaleName) => {
          const scale = pentatonicRules.scales[scaleName];
          const notes = scale.notes;
          
          // No note should be in the forbidden set
          return notes.every((note: number) => !forbiddenNotes.includes(note));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('所有调式的 avoidNotes 包含 4 和 7', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...scaleNames),
        (scaleName) => {
          const scale = pentatonicRules.scales[scaleName];
          const avoidNotes = scale.avoidNotes;
          
          // avoidNotes should contain both 4 and 7
          return avoidNotes.includes(4) && avoidNotes.includes(7);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: melody-gen, Property 2: 调式完整性**
 * *对于任意* pentatonic-rules.json 中的调式，必须包含 name、notes、root、characteristic、emotion 五个必要字段。
 * **Validates: Requirements 2.3, 4.3**
 */
describe('Property 2: 调式完整性', () => {
  const requiredFields = ['name', 'notes', 'root', 'characteristic', 'emotion'];
  const scaleNames = Object.keys(pentatonicRules.scales);

  it('所有调式包含必要字段: name, notes, root, characteristic, emotion', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...scaleNames),
        (scaleName) => {
          const scale = pentatonicRules.scales[scaleName];
          
          // Check all required fields exist and are non-empty
          return requiredFields.every((field) => {
            const value = scale[field];
            if (value === undefined || value === null) return false;
            if (typeof value === 'string' && value.trim() === '') return false;
            if (Array.isArray(value) && value.length === 0) return false;
            return true;
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('所有调式的 root 音必须在其 notes 数组中', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...scaleNames),
        (scaleName) => {
          const scale = pentatonicRules.scales[scaleName];
          return scale.notes.includes(scale.root);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('五种调式（宫/商/角/徵/羽）都存在', () => {
    const expectedModes = ['gong', 'shang', 'jue', 'zhi', 'yu'];
    expectedModes.forEach((mode) => {
      expect(pentatonicRules.scales[mode]).toBeDefined();
    });
  });
});


/**
 * **Feature: melody-gen, Property 3: 情绪映射完整性**
 * *对于任意* guofeng-patterns.json 中的情绪定义，必须包含 preferredMode、contour、intervalRange 三个必要字段。
 * **Validates: Requirements 3.1, 3.2, 3.3**
 */
describe('Property 3: 情绪映射完整性', () => {
  const requiredFields = ['preferredMode', 'contour', 'intervalRange'];
  const emotionNames = Object.keys(guofengPatterns.emotions);
  const validModes = ['gong', 'shang', 'jue', 'zhi', 'yu'];
  const validContours = ['ascending', 'descending', 'wave', 'stable'];

  it('所有情绪定义包含必要字段: preferredMode, contour, intervalRange', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...emotionNames),
        (emotionName) => {
          const emotion = guofengPatterns.emotions[emotionName];
          
          // Check all required fields exist and are non-empty
          return requiredFields.every((field) => {
            const value = emotion[field];
            if (value === undefined || value === null) return false;
            if (typeof value === 'string' && value.trim() === '') return false;
            return true;
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('所有情绪的 preferredMode 必须是有效的调式', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...emotionNames),
        (emotionName) => {
          const emotion = guofengPatterns.emotions[emotionName];
          return validModes.includes(emotion.preferredMode);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('所有情绪的 contour 必须是有效的旋律走向', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...emotionNames),
        (emotionName) => {
          const emotion = guofengPatterns.emotions[emotionName];
          return validContours.includes(emotion.contour);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('所有情绪的 intervalRange 必须是正整数', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...emotionNames),
        (emotionName) => {
          const emotion = guofengPatterns.emotions[emotionName];
          return typeof emotion.intervalRange === 'number' && 
                 emotion.intervalRange > 0 && 
                 Number.isInteger(emotion.intervalRange);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('忧伤情绪使用下行旋律和羽调式 (需求 3.1)', () => {
    const sorrowful = guofengPatterns.emotions['sorrowful'];
    expect(sorrowful.preferredMode).toBe('yu');
    expect(sorrowful.contour).toBe('descending');
  });

  it('欢快情绪使用上行旋律和宫调式 (需求 3.2)', () => {
    const joyful = guofengPatterns.emotions['joyful'];
    expect(joyful.preferredMode).toBe('gong');
    expect(joyful.contour).toBe('ascending');
  });

  it('平静情绪使用平稳走向 (需求 3.3)', () => {
    const peaceful = guofengPatterns.emotions['peaceful'];
    expect(peaceful.contour).toBe('stable');
  });
});


/**
 * **Feature: melody-gen, Property 4: 资源文件引用一致性**
 * *对于* melody-gen.md Skill 文件中 resources 列表引用的每个资源文件，该文件必须存在于 skills/resources/ 目录下。
 * **Validates: Requirements 4.1, 4.2**
 */
describe('Property 4: 资源文件引用一致性', () => {
  const skillFilePath = join(process.cwd(), 'skills/melody-gen.md');
  const resourcesDir = join(process.cwd(), 'skills/resources');
  
  // Parse YAML frontmatter to extract resources list
  function extractResourcesFromSkillFile(filePath: string): string[] {
    const content = readFileSync(filePath, 'utf-8');
    
    // Extract YAML frontmatter between --- markers
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return [];
    }
    
    const frontmatter = frontmatterMatch[1];
    
    // Extract resources list from YAML
    const resourcesMatch = frontmatter.match(/resources:\n((?:\s+-\s+.+\n?)+)/);
    if (!resourcesMatch) {
      return [];
    }
    
    const resourcesBlock = resourcesMatch[1];
    const resources: string[] = [];
    
    // Parse each resource line
    const lines = resourcesBlock.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s+-\s+(.+)$/);
      if (match) {
        resources.push(match[1].trim());
      }
    }
    
    return resources;
  }
  
  // Check if a file exists
  function fileExists(filePath: string): boolean {
    try {
      readFileSync(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  const referencedResources = extractResourcesFromSkillFile(skillFilePath);

  it('Skill 文件引用的所有资源文件都存在于 skills/resources/ 目录', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...referencedResources),
        (resourceName) => {
          const resourcePath = join(resourcesDir, resourceName);
          return fileExists(resourcePath);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Skill 文件引用了 pentatonic-rules.json (需求 4.1)', () => {
    expect(referencedResources).toContain('pentatonic-rules.json');
    const filePath = join(resourcesDir, 'pentatonic-rules.json');
    expect(fileExists(filePath)).toBe(true);
  });

  it('Skill 文件引用了 guofeng-patterns.json (需求 4.2)', () => {
    expect(referencedResources).toContain('guofeng-patterns.json');
    const filePath = join(resourcesDir, 'guofeng-patterns.json');
    expect(fileExists(filePath)).toBe(true);
  });

  it('所有引用的资源文件都是有效的 JSON 格式', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...referencedResources),
        (resourceName) => {
          const resourcePath = join(resourcesDir, resourceName);
          try {
            const content = readFileSync(resourcePath, 'utf-8');
            JSON.parse(content);
            return true;
          } catch {
            return false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
