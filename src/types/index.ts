/**
 * Type definitions for Musicify
 */

/**
 * AI 平台配置
 */
export interface AIConfig {
  name: string;
  dir: string;
  commandsDir: string;
  displayName: string;
}

/**
 * 歌曲规格配置
 */
export interface LyricSpec {
  project_name: string;
  song_type: string; // 流行/摇滚/说唱/民谣等
  duration: string; // "3分30秒"
  style: string; // 抒情/激昂/轻快等
  language: string; // 中文/英文/方言等
  audience: {
    age: string; // "18-25岁"
    gender: '男性向' | '女性向' | '中性' | string;
  };
  target_platform: string[]; // ["QQ音乐", "网易云"]
  tone?: string; // 温暖/冷峻等
  created_at: string;
  updated_at: string;
}

/**
 * 创作模式
 */
export type CreationMode = 'coach' | 'express' | 'hybrid';

/**
 * 命令模板前置元数据 (YAML frontmatter)
 */
export interface CommandMetadata {
  description: string;
  'argument-hint'?: string;
  'allowed-tools'?: string[];
  scripts?: {
    sh?: string;
    ps1?: string;
  };
  mode?: CreationMode;
}

/**
 * Bash 脚本执行结果
 */
export interface BashResult {
  status: 'success' | 'error' | 'info';
  message?: string;
  [key: string]: any; // 允许其他自定义字段
}

/**
 * 项目信息
 */
export interface ProjectInfo {
  name: string;
  path: string;
  type?: string;
  stage?: string;
  modified?: string;
}

/**
 * 歌曲主题
 */
export interface SongTheme {
  core_theme: string; // 核心主题
  emotion: string; // 想传达的情感
  story: string; // 故事性描述
  unique_angle: string; // 独特视角
  hook: string; // 一句话概括
}

/**
 * 情绪氛围
 */
export interface Mood {
  emotion_color: string; // 温暖/冷峻/明亮/灰暗
  energy_level: '高能' | '中等' | '低能';
  tempo: '快节奏' | '中速' | '慢板';
  atmosphere_tags: string[]; // 浪漫/孤独/自由等
}

/**
 * 歌曲段落类型
 */
export type SectionType = 
  | 'intro'
  | 'verse'
  | 'pre-chorus'
  | 'chorus'
  | 'bridge'
  | 'outro'
  | 'hook'
  | 'interlude';

/**
 * 歌曲段落
 */
export interface Section {
  type: SectionType;
  order: number;
  duration: string; // "30秒"
  purpose: string; // 这段的功能
  rhyme_scheme?: string; // 押韵模式 AABB等
  key_emotion?: string; // 核心情感
}

/**
 * 歌曲结构
 */
export interface SongStructure {
  total_duration: string;
  sections: Section[];
}

/**
 * 歌词内容
 */
export interface LyricContent {
  section_type: SectionType;
  lines: string[];
  notes?: string;
  rhyme_words?: string[]; // 押韵的词
}

/**
 * 完整歌词
 */
export interface Lyrics {
  title: string;
  structure: SongStructure;
  sections: {
    [key: string]: LyricContent;
  };
  mode: CreationMode;
  created_at: string;
  updated_at: string;
}

/**
 * 押韵分析结果
 */
export interface RhymeAnalysis {
  section: string;
  rhyme_scheme: string; // AABB, ABAB等
  rhyme_quality: number; // 0-100分
  rhyme_pairs: Array<{
    line1: number;
    line2: number;
    word1: string;
    word2: string;
    match_score: number;
  }>;
  suggestions: string[];
}

/**
 * 可唱性分析
 */
export interface SingabilityAnalysis {
  overall_score: number; // 0-100
  syllable_consistency: number; // 音节一致性
  breath_points: string[]; // 换气点建议
  difficult_phrases: Array<{
    line: string;
    issue: string;
    suggestion: string;
  }>;
}

/**
 * 歌词质量评分
 */
export interface LyricQualityScore {
  rhyme: number; // 押韵质量 0-100
  imagery: number; // 意象丰富度 0-100
  emotion: number; // 情感表达 0-100
  originality: number; // 原创性 0-100
  singability: number; // 可唱性 0-100
  total: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

/**
 * 旋律提示
 */
export interface MelodyHint {
  vocal_range: string; // "C3-G4"
  suggested_tempo: string; // "90-100 BPM"
  rhythm_pattern: string; // 节奏型描述
  melody_direction: {
    section: string;
    direction: '上扬' | '下沉' | '平稳' | '起伏';
    note: string;
  }[];
  emphasis_points: string[]; // 重音位置
  reference_songs: string[]; // 参考歌曲
}

// ================================
// Skill 系统相关类型定义
// ================================

/**
 * Skill 元数据 (YAML frontmatter)
 */
export interface SkillMetadata {
  name: string;
  description: string;
  category: string;
  version: string;
  resources?: string[];
  fallback_command?: string;
  'allowed-tools'?: string[];
}

/**
 * Skill 资源文件
 */
export interface SkillResource {
  name: string;
  type: 'json' | 'template' | 'data';
  data: any;
}

/**
 * Skill 完整定义
 */
export interface Skill {
  metadata: SkillMetadata;
  content: string;
  resources: Map<string, SkillResource>;
}

/**
 * Skill 执行上下文
 */
export interface SkillContext {
  commandName: string;
  args: string[];
  metadata: SkillMetadata;
  resources: Map<string, SkillResource>;
}

