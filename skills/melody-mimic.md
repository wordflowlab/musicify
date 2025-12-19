---
name: melody-mimic
description: 旋律风格学习助手 - 多模式确认优化，专业 MIDI 分析与 AI 旋律生成
category: composition
version: "2.1"
resources:
  - midi-parser-rules.json
  - python-deps.txt
allowed-tools:
  - AskUserQuestion       # NEW: 模式选择界面
  - Bash                  # 执行 Python 分析脚本
  - Read                  # 读取 MIDI 和歌词文件
  - Write                 # 写入分析结果和生成的旋律
  - Grep                  # 搜索和验证文件内容
---

# 🎼 旋律风格学习助手 (Claude Code Enhanced)

> **基于参考歌曲的 MIDI 和歌词，学习旋律风格并创作原创旋律**
>
> 通过分析参考乐谱的抽象特征，引导用户创作风格相似的原创作品

---

## ⚠️ 版权风险提醒

**重要声明**：

1. **旋律受版权保护**: 参考歌曲的旋律属于原作者的知识产权
2. **仅供学习参考**: 本工具生成的内容仅供个人学习和创作参考使用
3. **商用风险评估**: 如需商业使用，请自行评估版权风险并获取必要授权
4. **原创性要求**: 建议在生成内容基础上进行充分的二次创作

> 使用本 Skill 即表示您已了解并接受上述风险提示

---

## 🚀 快速开始 (Python 增强版)

### 环境准备

**第一次使用需要安装 Python 依赖**:

```bash
# 1. 检查 Python 环境
python3 --version

# 2. 安装必需依赖
pip install mido music21 numpy

# 3. 配置 music21（重要！）
python3 -c "from music21 import configure; configure.run()"
```

### 工作流程

#### 步骤 1: 准备参考文件
将 MIDI 和歌词文件放在规定目录：
```
workspace/references/{歌曲名}/
├── {歌曲名}.mid     # MIDI 文件
└── {歌曲名}.txt     # 歌词文件
```

#### 步骤 2: 启动分析
Claude 将自动：
1. 🔍 **检测分析能力** - 自动检测可用的 Python 环境
2. 🎵 **智能音轨识别** - 多维度评分匹配人声音轨
3. 📊 **深度特征提取** - 节奏、音程、调式专业分析
4. 🤖 **AI 风格学习** - 为原创旋律生成做准备

#### 步骤 3: 获得分析结果
系统将生成详细的分析报告，包括：
- 人声音轨识别结果（置信度评分）
- 旋律特征分析（节奏型分布、音程分析、调式识别）
- 风格学习数据（可用于生成相似风格旋律）

### 分析能力等级

| 等级 | 功能描述 | 技术依赖 |
|------|----------|----------|
| **专业级** 🎼 | 完整 AI 音乐分析 + 风格学习 | Python + music21 + mido |
| **标准级** 🎵 | 基础 MIDI 解析 + 统计分析 | 文件系统基础功能 |

*系统会自动检测并选择最佳分析等级*

### 步骤 4: 创作模式选择 🎯 (NEW)

**基于分析结果，选择合适的创作模式**：

Claude 将基于旋律复杂度智能推荐最适合的模式，用户可以选择：

| 模式 | 时间投入 | 确认次数 | 适用场景 |
|------|----------|----------|----------|
| ⚡ **快速模式** | 3-8分钟 | 1-2次 | 快速demo、灵感原型 |
| 🎯 **专业模式** | 10-18分钟 | 3-5次 | 专业创作、主题歌曲 |
| 🎓 **教练模式** | 20-35分钟 | 6-10次 | 学习创作、技能提升 |
| 🔧 **专家模式** | 30-60分钟 | 15-25次 | 精品制作、特殊需求 |

**智能推荐逻辑**：
- 简单旋律（复杂度 ≤ 25%） → 快速模式
- 复杂旋律（复杂度 ≥ 60%） → 专家模式
- 多段落结构（≥ 4段） → 教练模式
- 其他情况 → 专业模式

用户将看到推荐结果和详细说明，可自由选择最适合的模式。

---

## 📁 输入要求

### 文件目录结构

请将参考歌曲的文件放在指定目录：

```
workspace/
└── references/
    └── {song-name}/
        ├── {song-name}.mid      # MIDI 文件（必需）
        └── {song-name}.txt      # 歌词文件（必需）
```

**示例**:
```
workspace/
└── references/
    └── tan-gu-zhi/
        ├── tan-gu-zhi.mid       # 《探故知》MIDI 文件
        └── tan-gu-zhi.txt       # 《探故知》歌词文件
```

### MIDI 文件要求

- **格式**: Standard MIDI File (SMF) Format 0 或 Format 1
- **建议**: 人声旋律放在独立音轨，音轨名包含 "vocal"、"melody" 或 "voice"
- **备注**: 如无明确命名，AI 将通过歌词字数匹配最接近的音轨

### 歌词文件格式

歌词文件使用纯文本格式，需包含段落标记：

```
[info]
title: 探故知
artist: 浅影阿
key: C
bpm: 80

[verse1]
三两笔着墨迟迟
不为记事
随手便成诗

[verse2]
窗外雨落无声
灯火阑珊处
谁在等故人

[chorus]
多少往事随风去
化作云烟散
只留一曲探故知
```

**段落标记说明**:
- `[info]`: 歌曲元信息（可选，用于辅助分析）
- `[verse1]`, `[verse2]`: 主歌段落
- `[chorus]`: 副歌段落
- `[bridge]`: 桥段（可选）
- `[outro]`: 尾声（可选）
- 每行一句歌词，空行分隔段落内的句子组

---

## 📝 歌词结构解析规则

### 段落标记识别规则

歌词文件使用方括号标记段落类型，支持以下标记：

| 标记模式 | 中文别名 | 说明 |
|----------|----------|------|
| `[info]` | `[信息]` | 歌曲元信息段落 |
| `[verse]`, `[verse1]`, `[verse2]` | `[主歌]`, `[主歌1]`, `[主歌2]` | 主歌段落 |
| `[chorus]` | `[副歌]` | 副歌段落 |
| `[bridge]` | `[桥段]` | 桥段 |
| `[pre-chorus]` | `[预副歌]` | 预副歌段落 |
| `[outro]` | `[尾声]` | 尾声段落 |
| `[intro]` | `[前奏]` | 前奏段落（通常无歌词） |

**识别规则**:
- 段落标记必须独占一行
- 标记格式: `[标记名]` 或 `[标记名数字]`
- 标记不区分大小写: `[Verse1]` 等同于 `[verse1]`
- 支持中英文标记混用

**正则表达式**:
```
段落标记: /^\[(info|verse\d*|chorus|bridge|pre-chorus|outro|intro|信息|主歌\d*|副歌|桥段|预副歌|尾声|前奏)\]$/i
```

### 句子分割规则

歌词中的句子按以下规则分割：

**主要分割符**:
- 换行符 (`\n`): 每行视为一个独立句子
- 空行: 用于分隔段落内的句子组，不计入句子

**辅助分割符**（可选，用于单行多句情况）:
- 句号: `。`
- 逗号（长句分割）: `，` （仅当单行超过 15 字时考虑）
- 分号: `；`
- 感叹号: `！`
- 问号: `？`

**分割规则优先级**:
1. 首先按换行符分割
2. 过滤空行和纯空白行
3. 过滤段落标记行
4. 剩余每行作为一个句子

**示例**:
```
输入:
[verse1]
三两笔着墨迟迟
不为记事
随手便成诗

解析结果:
- 段落: verse1
- 句子1: "三两笔着墨迟迟" (7字)
- 句子2: "不为记事" (4字)
- 句子3: "随手便成诗" (5字)
```

### 字数统计规则

统计歌词字数时，需排除非演唱内容：

**排除字符**:
- 标点符号: `，。！？、；：""''（）【】《》…—`
- 空格和制表符: ` `, `\t`
- 换行符: `\n`, `\r`
- 段落标记: `[verse1]`, `[chorus]` 等
- 元信息行: `title:`, `artist:` 等

**计入字符**:
- 中文汉字
- 英文字母（每个字母计为 1 字，用于英文歌词）
- 数字（每个数字计为 1 字）

**统计公式**:
```
有效字数 = 总字符数 - 标点符号数 - 空白字符数
```

**正则表达式**:
```
排除字符: /[\s，。！？、；：""''（）【】《》…—\[\]]/g
有效字符: /[\u4e00-\u9fa5a-zA-Z0-9]/g
```

**示例**:
```
输入: "三两笔着墨迟迟，不为记事。"
排除: "，" "。"
有效字数: 11 字
```

### 结构解析输出格式

解析完成后，输出结构化信息：

```typescript
interface LyricsStructure {
  sections: {
    type: string;          // 段落类型: "verse" | "chorus" | "bridge" 等
    index?: number;        // 段落序号（如 verse1 的 1）
    lines: {
      text: string;        // 原始文本
      charCount: number;   // 有效字数
    }[];
    totalChars: number;    // 段落总字数
  }[];
  totalChars: number;      // 全曲总字数
  totalLines: number;      // 全曲总句数
}
```

**输出示例**:
```
歌词结构分析:
├── [verse1] 主歌1 (16字, 3句)
│   ├── 第1句: "三两笔着墨迟迟" (7字)
│   ├── 第2句: "不为记事" (4字)
│   └── 第3句: "随手便成诗" (5字)
├── [verse2] 主歌2 (16字, 3句)
│   ├── 第1句: "窗外雨落无声" (6字)
│   ├── 第2句: "灯火阑珊处" (5字)
│   └── 第3句: "谁在等故人" (5字)
└── [chorus] 副歌 (19字, 3句)
    ├── 第1句: "多少往事随风去" (7字)
    ├── 第2句: "化作云烟散" (5字)
    └── 第3句: "只留一曲探故知" (7字)

总计: 51字, 9句, 3段
```

---

## 🎯 人声音轨匹配逻辑

### 匹配规则优先级

1. **关键词匹配**（最高优先级）
   - 音轨名称包含: `vocal`, `melody`, `voice`, `lead`, `主旋律`, `人声`
   - 自动选择匹配的音轨

2. **字数匹配**
   - 计算歌词总字数（排除标点和空格）
   - 选择音符数量与字数最接近的音轨
   - 容差范围: ±15%

3. **音域过滤**
   - 人声音域范围: C3 (MIDI 48) 到 C6 (MIDI 84)
   - 过滤音域超出范围的音轨

### 音符数量与歌词字数匹配算法

**匹配算法步骤**:

1. **计算歌词有效字数**
   ```
   有效字数 = 总字符数 - 标点符号数 - 空白字符数
   排除字符: /[\s，。！？、；：""''（）【】《》…—\[\]]/g
   ```

2. **统计各音轨音符数量**
   - 遍历 MIDI 文件中的所有音轨
   - 统计每个音轨的 Note On 事件数量
   - 记录音轨名称、音符数量、音域范围

3. **计算匹配度分数**
   ```typescript
   function calculateMatchScore(noteCount: number, charCount: number): number {
     const diff = Math.abs(noteCount - charCount);
     const tolerance = charCount * 0.15; // 15% 容差
     
     if (diff === 0) return 1.0;           // 完全匹配
     if (diff <= tolerance) {
       return 1.0 - (diff / tolerance) * 0.3; // 容差内：0.7-1.0
     }
     return Math.max(0, 0.7 - (diff - tolerance) / charCount); // 容差外递减
   }
   ```

4. **选择最佳匹配音轨**
   - 优先选择关键词匹配的音轨
   - 其次选择匹配度分数最高的音轨
   - 过滤掉音域不在人声范围内的音轨

**匹配结果数据结构**:
```typescript
interface TrackMatchResult {
  trackIndex: number;      // 音轨索引
  trackName: string;       // 音轨名称
  noteCount: number;       // 音符数量
  charCount: number;       // 歌词字数
  matchScore: number;      // 匹配度分数 (0-1)
  matchReason: string;     // 匹配原因
  confidence: 'high' | 'medium' | 'low'; // 置信度
}
```

### 音域范围过滤规则

**人声音域定义**:
- 最低音: C3 (MIDI 48) - 男低音下限
- 最高音: C6 (MIDI 84) - 女高音上限
- 常见范围: E3 (52) 到 G5 (79)

**过滤算法**:
```typescript
interface VocalRangeFilter {
  vocalRangeMin: 48;       // C3
  vocalRangeMax: 84;       // C6
  
  // 判断音轨是否在人声音域内
  isInVocalRange(track: { minPitch: number; maxPitch: number }): boolean {
    // 音轨的音域应与人声音域有显著重叠
    const overlapMin = Math.max(track.minPitch, this.vocalRangeMin);
    const overlapMax = Math.min(track.maxPitch, this.vocalRangeMax);
    const overlapRange = overlapMax - overlapMin;
    const trackRange = track.maxPitch - track.minPitch;
    
    // 至少 50% 的音符在人声音域内
    return overlapRange > 0 && (overlapRange / trackRange) >= 0.5;
  }
}
```

**音域过滤步骤**:
1. 计算每个音轨的音域范围（最低音到最高音）
2. 计算音轨音域与人声音域的重叠比例
3. 过滤掉重叠比例低于 50% 的音轨
4. 对于边界情况，降低匹配置信度

**音域分类**:
| 音域类型 | MIDI 范围 | 说明 |
|----------|-----------|------|
| 低音区 | 36-47 | 低于人声范围，可能是贝斯 |
| 人声低区 | 48-59 | C3-B3，男声常用区 |
| 人声中区 | 60-71 | C4-B4，男女声共用区 |
| 人声高区 | 72-84 | C5-C6，女声常用区 |
| 超高音区 | 85+ | 高于人声范围，可能是装饰音 |

### 匹配置信度计算规则

**置信度计算公式**:
```typescript
function calculateConfidence(
  matchScore: number,
  hasKeywordMatch: boolean,
  isInVocalRange: boolean,
  vocalRangeOverlap: number
): { confidence: 'high' | 'medium' | 'low'; score: number } {
  let score = 0;
  
  // 基础分数：匹配度分数 (0-40分)
  score += matchScore * 40;
  
  // 关键词匹配加分 (0-30分)
  if (hasKeywordMatch) {
    score += 30;
  }
  
  // 音域匹配加分 (0-30分)
  if (isInVocalRange) {
    score += vocalRangeOverlap * 30;
  }
  
  // 转换为置信度等级
  if (score >= 90) return { confidence: 'high', score };
  if (score >= 70) return { confidence: 'medium', score };
  return { confidence: 'low', score };
}
```

**置信度等级说明**:

| 置信度 | 分数范围 | 条件 | 说明 |
|--------|----------|------|------|
| 高 | ≥90 | 关键词匹配 + 字数接近 + 音域合理 | 自动选择，无需确认 |
| 中 | 70-89 | 字数接近 + 音域合理 | 建议选择，请求确认 |
| 低 | 50-69 | 仅部分条件满足 | 需要用户手动确认 |
| 不匹配 | <50 | 条件不满足 | 不推荐，列出供参考 |

**置信度影响因素**:
- ✅ 音轨名称包含人声关键词: +30 分
- ✅ 音符数量与字数完全一致: +40 分
- ✅ 音符数量在 ±5% 容差内: +35 分
- ✅ 音符数量在 ±15% 容差内: +28 分
- ✅ 音域 100% 在人声范围内: +30 分
- ✅ 音域 75% 在人声范围内: +22 分
- ✅ 音域 50% 在人声范围内: +15 分
- ❌ 音域低于 50% 在人声范围内: +0 分

### 确认流程

匹配完成后，AI 将输出：
- 匹配的音轨索引和名称
- 音符数量与歌词字数对比
- 匹配置信度和原因
- 请求用户确认或手动选择

**输出示例**:
```
🎵 人声音轨匹配结果

检测到 4 个音轨:

| 序号 | 音轨名称 | 音符数 | 音域 | 匹配度 | 置信度 |
|------|----------|--------|------|--------|--------|
| 1 | Piano | 156 | C2-C6 | 32% | 低 |
| 2 | Vocal | 51 | E3-G5 | 98% | 高 ✓ |
| 3 | Bass | 48 | E1-E3 | 45% | 不匹配 |
| 4 | Strings | 89 | G3-D6 | 56% | 低 |

歌词字数: 51 字

推荐选择: 音轨 2 "Vocal"
- 匹配原因: 音轨名称包含 "Vocal"，音符数量 (51) 与歌词字数 (51) 完全一致
- 置信度: 高 (98分)

请确认是否使用此音轨？(Y/n)
```

### 多音轨冲突处理

当多个音轨匹配度相近时：

1. **优先级排序**:
   - 关键词匹配 > 字数匹配 > 音域匹配

2. **冲突解决**:
   - 如果两个音轨分数差距 < 5 分，列出两者供用户选择
   - 如果关键词匹配和字数匹配指向不同音轨，优先关键词匹配

3. **用户选择**:
   ```
   ⚠️ 检测到多个可能的人声音轨:
   
   选项 A: 音轨 2 "Melody" (52 音符, 置信度 85)
   选项 B: 音轨 3 "Voice" (51 音符, 置信度 82)
   
   请选择 (A/B):
   ```

---

## 🎵 特征分析规则

### 节奏型统计规则

节奏型统计用于分析旋律中各类节奏模式的使用比例，帮助理解参考歌曲的节奏特征。

#### 节奏型分类定义

| 类别 | 节奏型名称 | 时值（ticks） | 拍数 | 特点 |
|------|------------|---------------|------|------|
| 基本型 | 四分音符型 | 480 | 1.0 | 稳定、叙述性 |
| 基本型 | 八分音符型 | 240 | 0.5 | 流动、活泼 |
| 基本型 | 二分音符型 | 960 | 2.0 | 舒缓、延展 |
| 附点型 | 附点四分+八分 | 720+240 | 1.5+0.5 | 推动力强 |
| 附点型 | 八分+附点四分 | 240+720 | 0.5+1.5 | 切分感附点 |
| 切分型 | 基本切分 | 240+480+240 | 0.5+1+0.5 | 强拍弱化 |
| 切分型 | 后半拍切分 | 240+240+480 | 0.5+0.5+1 | 后半拍强调 |
| 三连音 | 四分三连音 | 160×3 | 0.33×3 | 流畅、圆润 |
| 快速型 | 十六分音符组 | 120×4 | 0.25×4 | 紧张、快速 |

#### 节奏型识别算法

```typescript
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
 * 节奏型分类规则
 * 基于音符时值（ticks）进行分类，标准 ticksPerBeat = 480
 */
function classifyRhythm(durationTicks: number, ticksPerBeat: number = 480): string {
  const tolerance = ticksPerBeat * 0.1; // 10% 容差
  
  // 四分音符: 480 ticks (1 beat)
  if (Math.abs(durationTicks - ticksPerBeat) <= tolerance) {
    return 'quarterNote';
  }
  
  // 八分音符: 240 ticks (0.5 beat)
  if (Math.abs(durationTicks - ticksPerBeat / 2) <= tolerance) {
    return 'eighthNote';
  }
  
  // 附点四分音符: 720 ticks (1.5 beats)
  if (Math.abs(durationTicks - ticksPerBeat * 1.5) <= tolerance) {
    return 'dottedNote';
  }
  
  // 附点八分音符: 360 ticks (0.75 beats)
  if (Math.abs(durationTicks - ticksPerBeat * 0.75) <= tolerance) {
    return 'dottedNote';
  }
  
  // 二分音符: 960 ticks (2 beats)
  if (Math.abs(durationTicks - ticksPerBeat * 2) <= tolerance) {
    return 'quarterNote'; // 归类为基本型
  }
  
  // 三连音（四分）: 160 ticks (1/3 beat)
  if (Math.abs(durationTicks - ticksPerBeat / 3) <= tolerance) {
    return 'triplet';
  }
  
  // 十六分音符: 120 ticks (0.25 beat)
  if (Math.abs(durationTicks - ticksPerBeat / 4) <= tolerance) {
    return 'sixteenth';
  }
  
  return 'other';
}
```

#### 切分节奏检测

切分节奏需要分析连续音符的时值模式：

```typescript
/**
 * 检测切分节奏模式
 * 切分节奏特征：弱拍音符延续到强拍
 */
function detectSyncopation(durations: number[], ticksPerBeat: number = 480): number {
  let syncopationCount = 0;
  const halfBeat = ticksPerBeat / 2;
  
  for (let i = 0; i < durations.length - 2; i++) {
    // 基本切分: 短-长-短 (240-480-240)
    if (Math.abs(durations[i] - halfBeat) < 50 &&
        Math.abs(durations[i + 1] - ticksPerBeat) < 50 &&
        Math.abs(durations[i + 2] - halfBeat) < 50) {
      syncopationCount++;
    }
    
    // 后半拍切分: 短-短-长 (240-240-480)
    if (Math.abs(durations[i] - halfBeat) < 50 &&
        Math.abs(durations[i + 1] - halfBeat) < 50 &&
        Math.abs(durations[i + 2] - ticksPerBeat) < 50) {
      syncopationCount++;
    }
  }
  
  return syncopationCount;
}
```

#### 统计计算规则

```typescript
/**
 * 计算节奏型统计
 * 所有占比之和必须等于 100%
 */
function calculateRhythmStats(durations: number[]): RhythmStats {
  const counts = {
    quarterNote: 0,
    eighthNote: 0,
    dottedNote: 0,
    syncopation: 0,
    triplet: 0,
    sixteenth: 0,
    other: 0
  };
  
  // 统计各类型数量
  for (const duration of durations) {
    const type = classifyRhythm(duration);
    counts[type]++;
  }
  
  // 检测切分节奏（会覆盖部分已分类的音符）
  const syncopationCount = detectSyncopation(durations);
  counts.syncopation = syncopationCount;
  
  // 计算总数
  const total = durations.length;
  if (total === 0) {
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
  
  // 转换为百分比（确保总和为 100%）
  const stats: RhythmStats = {
    quarterNote: Math.round(counts.quarterNote / total * 100),
    eighthNote: Math.round(counts.eighthNote / total * 100),
    dottedNote: Math.round(counts.dottedNote / total * 100),
    syncopation: Math.round(counts.syncopation / total * 100),
    triplet: Math.round(counts.triplet / total * 100),
    sixteenth: Math.round(counts.sixteenth / total * 100),
    other: 0 // 将在最后计算
  };
  
  // 确保总和为 100%
  const sum = stats.quarterNote + stats.eighthNote + stats.dottedNote + 
              stats.syncopation + stats.triplet + stats.sixteenth;
  stats.other = 100 - sum;
  
  return stats;
}
```

#### 统计输出格式

```
节奏型分布:
├── 四分音符: 35%  ████████████████████
├── 八分音符: 40%  ████████████████████████
├── 附点节奏: 15%  ████████
├── 切分节奏: 8%   ████
├── 三连音: 0%     
├── 十六分: 0%     
└── 其他: 2%       █

总计: 100%
```

---

### 音程分布统计规则

音程分布统计用于分析旋律中相邻音符之间的音高距离，帮助理解旋律的起伏特征。

#### 音程分类定义

| 类型 | 名称 | 半音数范围 | 音乐特点 | 情感表达 |
|------|------|------------|----------|----------|
| 同音 | 同度 | 0 | 重复强调 | 坚定、强调 |
| 级进 | 二度 | 1-2 | 旋律流畅 | 平稳、叙述 |
| 小跳 | 三度/四度 | 3-4 | 增加起伏 | 活泼、变化 |
| 大跳 | 五度及以上 | ≥5 | 戏剧性强 | 激动、转折 |

#### 音程计算算法

```typescript
interface IntervalStats {
  unison: number;    // 同度占比 (0-100)
  stepwise: number;  // 级进占比 (0-100)
  smallLeap: number; // 小跳占比 (0-100)
  largeLeap: number; // 大跳占比 (0-100)
}

/**
 * 计算两个 MIDI 音符之间的音程（半音数）
 */
function calculateInterval(pitch1: number, pitch2: number): number {
  return Math.abs(pitch2 - pitch1);
}

/**
 * 音程分类规则
 * 基于半音数进行分类
 */
function classifyInterval(semitones: number): string {
  if (semitones === 0) {
    return 'unison';     // 同度
  }
  if (semitones >= 1 && semitones <= 2) {
    return 'stepwise';   // 级进（小二度、大二度）
  }
  if (semitones >= 3 && semitones <= 4) {
    return 'smallLeap';  // 小跳（小三度、大三度、纯四度）
  }
  return 'largeLeap';    // 大跳（五度及以上）
}

/**
 * 计算音程分布统计
 * 所有占比之和必须等于 100%
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
  
  // 统计相邻音符之间的音程
  for (let i = 0; i < pitches.length - 1; i++) {
    const interval = calculateInterval(pitches[i], pitches[i + 1]);
    const type = classifyInterval(interval);
    counts[type]++;
  }
  
  // 计算总音程数（音符数 - 1）
  const total = pitches.length - 1;
  
  // 转换为百分比
  const stats: IntervalStats = {
    unison: Math.round(counts.unison / total * 100),
    stepwise: Math.round(counts.stepwise / total * 100),
    smallLeap: Math.round(counts.smallLeap / total * 100),
    largeLeap: Math.round(counts.largeLeap / total * 100)
  };
  
  // 确保总和为 100%（处理四舍五入误差）
  const sum = stats.unison + stats.stepwise + stats.smallLeap + stats.largeLeap;
  if (sum !== 100 && total > 0) {
    // 将差值加到最大的类别上
    const diff = 100 - sum;
    const maxKey = Object.keys(stats).reduce((a, b) => 
      stats[a] > stats[b] ? a : b
    ) as keyof IntervalStats;
    stats[maxKey] += diff;
  }
  
  return stats;
}
```

#### 音程方向分析

```typescript
interface ContourStats {
  ascending: number;   // 上行占比 (0-100)
  descending: number;  // 下行占比 (0-100)
  stable: number;      // 平稳占比 (0-100)
}

/**
 * 分析旋律轮廓（音程方向）
 */
function analyzeContour(pitches: number[]): ContourStats {
  if (pitches.length < 2) {
    return { ascending: 0, descending: 0, stable: 0 };
  }
  
  let ascending = 0;
  let descending = 0;
  let stable = 0;
  
  for (let i = 0; i < pitches.length - 1; i++) {
    const diff = pitches[i + 1] - pitches[i];
    
    if (diff > 2) {
      ascending++;    // 上行（超过大二度）
    } else if (diff < -2) {
      descending++;   // 下行（超过大二度）
    } else {
      stable++;       // 平稳（二度以内）
    }
  }
  
  const total = pitches.length - 1;
  
  return {
    ascending: Math.round(ascending / total * 100),
    descending: Math.round(descending / total * 100),
    stable: Math.round(stable / total * 100)
  };
}
```

#### 统计输出格式

```
音程分布:
├── 同度: 5%    ██
├── 级进: 60%   ████████████████████████████████████
├── 小跳: 25%   ███████████████
└── 大跳: 10%   ██████

旋律轮廓:
├── 上行: 35%   █████████████████████
├── 下行: 40%   ████████████████████████
└── 平稳: 25%   ███████████████

总计: 100%
```

---

### 调式推断规则

调式推断基于五声音阶特征音分析，用于识别参考歌曲的调式类型。

#### 五声音阶调式定义

| 调式 | 中文名 | 主音 | 特征音级 | 结束音 | 情感特征 |
|------|--------|------|----------|--------|----------|
| 宫调式 | Gong | 1 (Do) | 0, 2, 4, 7, 9 | 0, 7 | 明亮、庄重、喜庆 |
| 商调式 | Shang | 2 (Re) | 0, 2, 4, 7, 9 | 2, 0 | 深沉、内敛、怀旧 |
| 角调式 | Jue | 3 (Mi) | 0, 2, 4, 7, 9 | 4, 2 | 清新、空灵、禅意 |
| 徵调式 | Zhi | 5 (Sol) | 0, 2, 4, 7, 9 | 7, 9 | 热情、奔放、豪迈 |
| 羽调式 | Yu | 6 (La) | 0, 2, 4, 7, 9 | 9, 7 | 忧伤、婉转、抒情 |

**音级说明**（相对于调式主音的半音数）:
- 0 = 宫 (Do)
- 2 = 商 (Re)
- 4 = 角 (Mi)
- 7 = 徵 (Sol)
- 9 = 羽 (La)

#### 调式检测算法

```typescript
interface ModeDetectionResult {
  detected: string;      // 检测到的调式: 'gong' | 'shang' | 'jue' | 'zhi' | 'yu'
  confidence: number;    // 置信度 (0-1)
  keySignature: string;  // 调号: 'C' | 'D' | ... | 'B'
  scores: {              // 各调式得分
    gong: number;
    shang: number;
    jue: number;
    zhi: number;
    yu: number;
  };
}

/**
 * 调式检测规则
 * 基于音级出现频率、结束音和特征音权重
 */
function detectMode(pitches: number[], keySignature: string = 'C'): ModeDetectionResult {
  // 调号偏移量
  const keyOffsets: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };
  
  const offset = keyOffsets[keySignature] || 0;
  
  // 将 MIDI 音高转换为相对音级 (0-11)
  const degrees = pitches.map(p => (p - offset + 12) % 12);
  
  // 统计各音级出现频率
  const degreeCount: Record<number, number> = {};
  for (const d of degrees) {
    degreeCount[d] = (degreeCount[d] || 0) + 1;
  }
  
  // 五声音阶音级
  const pentatonicDegrees = [0, 2, 4, 7, 9];
  
  // 各调式的主音和结束音权重
  const modeConfig = {
    gong:  { root: 0, endings: [0, 7], weight: { root: 3, fifth: 2, others: 1 } },
    shang: { root: 2, endings: [2, 0], weight: { root: 3, fifth: 2, others: 1 } },
    jue:   { root: 4, endings: [4, 2], weight: { root: 3, fifth: 2, others: 1 } },
    zhi:   { root: 7, endings: [7, 9], weight: { root: 3, fifth: 2, others: 1 } },
    yu:    { root: 9, endings: [9, 7], weight: { root: 3, fifth: 2, others: 1 } }
  };
  
  // 获取结束音（最后一个音符的音级）
  const endingDegree = degrees.length > 0 ? degrees[degrees.length - 1] : -1;
  
  // 计算各调式得分
  const scores: Record<string, number> = {};
  
  for (const [mode, config] of Object.entries(modeConfig)) {
    let score = 0;
    
    // 主音出现频率得分
    const rootCount = degreeCount[config.root] || 0;
    score += rootCount * config.weight.root;
    
    // 五度音出现频率得分
    const fifthDegree = (config.root + 7) % 12;
    const fifthCount = degreeCount[fifthDegree] || 0;
    score += fifthCount * config.weight.fifth;
    
    // 结束音加分
    if (config.endings.includes(endingDegree)) {
      score += 10; // 结束音匹配加分
    }
    
    // 其他五声音阶音级得分
    for (const d of pentatonicDegrees) {
      if (d !== config.root && d !== fifthDegree) {
        score += (degreeCount[d] || 0) * config.weight.others;
      }
    }
    
    scores[mode] = score;
  }
  
  // 找出得分最高的调式
  const maxMode = Object.entries(scores).reduce((a, b) => 
    a[1] > b[1] ? a : b
  );
  
  // 计算置信度（最高分与次高分的差距）
  const sortedScores = Object.values(scores).sort((a, b) => b - a);
  const confidence = sortedScores[0] > 0 
    ? (sortedScores[0] - sortedScores[1]) / sortedScores[0]
    : 0;
  
  return {
    detected: maxMode[0],
    confidence: Math.min(1, Math.max(0, confidence)),
    keySignature,
    scores: scores as ModeDetectionResult['scores']
  };
}
```

#### 调式检测输出格式

```
调式分析:
├── 检测结果: 羽调式 (Yu)
├── 调号: A minor pentatonic
├── 置信度: 85%
└── 各调式得分:
    ├── 宫调式: 45
    ├── 商调式: 52
    ├── 角调式: 38
    ├── 徵调式: 61
    └── 羽调式: 78 ✓

情感特征: 忧伤、婉转、抒情
```

---

### 旋律轮廓分析

分析旋律的整体走向，帮助理解旋律的情感表达：

| 轮廓类型 | 判断条件 | 情感表达 |
|----------|----------|----------|
| 上行 | 后一音高于前一音（超过大二度） | 积极、上升、期待 |
| 下行 | 后一音低于前一音（超过大二度） | 忧伤、下沉、释放 |
| 平稳 | 音高变化在二度以内 | 平静、叙述、稳定 |

---

### 特征分析完整输出示例

```
═══════════════════════════════════════════════════════════════
                    🎵 旋律特征分析报告
═══════════════════════════════════════════════════════════════

📊 基本信息
├── 调号: C
├── 拍号: 4/4
├── BPM: 80
└── 总音符数: 51

🎼 调式分析
├── 检测结果: 羽调式 (Yu)
├── 置信度: 85%
└── 情感特征: 忧伤、婉转、抒情

🥁 节奏型分布
├── 四分音符: 35%  ████████████████████
├── 八分音符: 40%  ████████████████████████
├── 附点节奏: 15%  ████████
├── 切分节奏: 8%   ████
└── 其他: 2%       █
    总计: 100% ✓

🎵 音程分布
├── 同度: 5%    ██
├── 级进: 60%   ████████████████████████████████████
├── 小跳: 25%   ███████████████
└── 大跳: 10%   ██████
    总计: 100% ✓

📈 旋律轮廓
├── 上行: 35%   █████████████████████
├── 下行: 40%   ████████████████████████
└── 平稳: 25%   ███████████████

═══════════════════════════════════════════════════════════════
```

---

## 🎯 创作模式执行流程

基于用户选择的创作模式，Claude 将执行不同的创作策略：

### ⚡ 快速模式执行流程

**自动化策略**:
1. **音轨选择**: 置信度 ≥ 70% 直接选择，< 70% 显示推荐但无需确认
2. **歌词生成**: 基于旋律情感特征，AI 直接生成完整歌词
3. **借鉴程度**: 固定使用"风格借鉴"模式
4. **最终输出**: 显示完整结果，仅需一次整体确认

**生成提示词模板**:
```
根据《{歌曲名}》的旋律特征分析，创作风格相似的原创歌词：

旋律特征：
- 调式情感：{情感特征}
- 节奏特点：{节奏型分布}
- 段落结构：{歌词结构}

请生成完整歌词，严格保持字数和段落结构与原曲一致。
风格借鉴程度：中等（保持情感氛围，但内容完全原创）
```

### 🎯 专业模式执行流程

**批量参数收集**:
1. 一次性收集所有创作参数（主题、意象、情感基调、借鉴程度）
2. 基于参数生成歌词框架
3. 分段生成具体内容
4. 段落级批量确认（3-4次确认）

**参数收集界面**（使用 AskUserQuestion）:
```typescript
{
  questions: [{
    question: "请提供创作所需的核心信息",
    header: "创作参数",
    multiSelect: false,
    options: [
      { label: "主题", description: "歌曲想要表达的主要主题（如：离别、思念、青春）" },
      { label: "意象", description: "希望使用的具体意象或画面（如：月光、车站、江南）" },
      { label: "情感基调", description: "整体的情感倾向（忧伤/欢快/平静/激昂）" },
      { label: "借鉴程度", description: "对原曲风格的借鉴程度（轻度参考/风格借鉴/高度相似）" }
    ]
  }]
}
```

### 🎓 教练模式执行流程（优化版）

**段落级确认策略**:
- **原流程**: 逐句确认 (9句 = 9次确认)
- **优化后**: 段落确认 (3段 = 3次确认)
- **减少确认次数**: 67%

**批量编辑支持**:
```
### [verse1] 主歌1 创作完成，请整体确认：
第1句: "月色洒满长街头" (7字)
第2句: "独自行走" (4字)
第3句: "思绪随风走" (5字)

选择操作：
[✅ 确认继续] [✏️ 修改第N句] [🔄 重新创作本段] [➡️ 继续下一段]
```

**引导提问策略**:
1. **情感挖掘**: "这段旋律让你想到什么场景？什么情绪？"
2. **意象启发**: "如果用三个关键词描述这种感觉，会是什么？"
3. **细节深化**: "这个场景中最打动你的画面是什么？"
4. **韵律检查**: "这句歌词的节拍是否与旋律匹配？"

### 🔧 专家模式执行流程

**高级参数控制**:
- 音轨置信度阈值调整（默认90%，可调整60-95%）
- 节拍对齐容差设置（严格/适中/宽松）
- 韵脚方案选择（ABAB/AABB/自由韵）
- 旋律借鉴程度微调（0-100%连续调节）

**逐项确认流程**:
1. 音轨选择确认（显示所有候选音轨）
2. 创作参数逐项确认
3. 每句歌词创作后确认
4. 韵律检查后确认
5. 整体结构确认

**批量编辑界面**:
```
当前创作进度: [verse1: ✅] [verse2: 🔄] [chorus: ⏳]

[verse2] 第2句创作:
输入: "独自走在街头"
节拍检查: ✅ 4字匹配
韵脚检查: ⚠️  "头"与上句"雨"不韵
建议: "独自漫步雨中" (与"雨"形成内韵)

[确认] [修改] [韵脚建议] [节拍调整] [重新创作]
```

---

## ✍️ 歌词创作引导流程

### 第一步：结构分析

AI 将输出原歌词的结构信息：

```
原歌词结构分析:
├── [verse1] 主歌1
│   ├── 第1句: 7字
│   ├── 第2句: 4字
│   └── 第3句: 5字
├── [verse2] 主歌2
│   ├── 第1句: 6字
│   ├── 第2句: 5字
│   └── 第3句: 5字
└── [chorus] 副歌
    ├── 第1句: 7字
    ├── 第2句: 5字
    └── 第3句: 7字

总字数: 51字
```

### 第二步：主题输入

AI 将逐段引导用户输入：

1. **整体主题**: 请描述新歌的主题（如：离别、思念、希望）
2. **关键意象**: 请提供想要使用的意象（如：月光、江南、落叶）
3. **情感基调**: 请选择情感基调（忧伤/欢快/平静/激昂）

### 第三步：歌词生成

根据用户输入，AI 将：

1. **生成建议**: 为每段生成 2-3 个歌词建议
2. **结构匹配**: 确保每句字数与原歌词一致
3. **用户选择**: 用户可选择、修改或重新生成

**示例输出**:
```
[verse1] 主歌1 建议:

选项 A:
月色洒满长街头 (7字)
独自行 (3字) ← 需调整为4字
思绪随风走 (5字)

选项 B:
灯火阑珊夜未央 (7字)
谁在等 (3字) ← 需调整为4字
故人归来时 (5字)

请选择或修改...
```

### 第四步：结构验证

完成后，AI 将验证：
- ✅ 段落数量匹配
- ✅ 每段句数匹配
- ✅ 每句字数匹配（允许 ±1 字误差）

---

## 🎶 旋律生成规则

### 基于特征的生成

生成的旋律将基于分析的特征：

1. **调式一致**: 使用相同的调式和主音
2. **节奏型比例**: 保持相似的节奏型分布
3. **音程分布**: 遵循相似的音程比例
4. **旋律轮廓**: 参考整体走向趋势

### 借鉴程度选项

用户可选择三种借鉴程度：

| 模式 | 说明 | 特点 |
|------|------|------|
| **高度相似** | 严格遵循参考特征 | 节奏型比例 ±5%，音程分布 ±5% |
| **风格借鉴** | 参考整体风格 | 节奏型比例 ±15%，音程分布 ±15% |
| **轻度参考** | 仅借鉴调式和情绪 | 自由发挥，保持调式一致 |

### 音符与歌词对位

生成规则：
- 每个汉字对应一个音符
- 长音使用延长符号（-）
- 装饰音不占用歌词字数
- 句尾可适当延长

---

## 📄 输出格式规范

### 简谱输出格式

```
1=C 4/4  BPM=80

⚠️ 版权提醒：本内容仅供学习参考，商用请自行评估版权风险

[主歌]
| 5  3  2  1 | 6  -  -  - | 5  6  1' 6 | 5  -  -  - |
  风 吹 过 江   南            烟 雨 朦  胧   中

[副歌]
| 1' 6  5  3 | 5  6  1' - | 6  5  3  2 | 1  -  -  - |
  多 少 往 事   随 风 去      化 作 云 烟   散

---
免责声明：本旋律由 AI 基于参考歌曲的抽象特征生成，仅供学习参考。
商业使用前请自行评估版权风险并获取必要授权。
```

**格式说明**:
- `1=C`: 调号，1音对应C调
- `4/4`: 拍号
- `BPM=80`: 速度
- `|`: 小节线
- `1 2 3 5 6`: 五声音阶音符
- `1'`: 高八度
- `1,`: 低八度
- `-`: 延长一拍
- `.`: 附点

### MIDI 输出格式

生成标准 MIDI 文件，包含：
- Header: format 0, 1 track, 480 ticks per beat
- Tempo: 根据分析结果设置 BPM
- Time Signature: 根据分析结果设置拍号
- Notes: 音符事件（note on/off, velocity）

### 输出目录

生成的文件将保存到：

```
workspace/
└── output/
    └── {new-song-name}/
        ├── {new-song-name}.txt      # 新歌词文件
        ├── {new-song-name}.jianpu   # 简谱文件
        └── {new-song-name}.mid      # MIDI 文件
```

---

## 🎛️ 借鉴程度详细说明

### 高度相似模式

**适用场景**: 需要与原曲风格高度一致的创作

**特征约束**:
- 节奏型比例: 严格遵循 ±5%
- 音程分布: 严格遵循 ±5%
- 旋律轮廓: 高度相似
- 调式: 完全一致

**注意**: 此模式生成的旋律与原曲相似度较高，请谨慎用于商业用途

### 风格借鉴模式

**适用场景**: 希望保持风格特点但有一定创作自由

**特征约束**:
- 节奏型比例: 参考 ±15%
- 音程分布: 参考 ±15%
- 旋律轮廓: 整体相似
- 调式: 一致或相近

**推荐**: 平衡了风格一致性和原创性

### 轻度参考模式

**适用场景**: 仅需要参考整体氛围和情绪

**特征约束**:
- 节奏型比例: 自由
- 音程分布: 自由
- 旋律轮廓: 自由
- 调式: 一致

**特点**: 最高的创作自由度，原创性最强

---

## 💡 使用示例

### 完整工作流程

1. **准备文件**
   ```
   将参考歌曲的 MIDI 和歌词放入 references/{song-name}/ 目录
   ```

2. **启动分析**
   ```
   AI 读取文件并解析 MIDI 音轨
   ```

3. **确认音轨**
   ```
   AI: 检测到 3 个音轨，音轨 2 "Vocal" 与歌词字数最匹配（52 音符 vs 51 字）
   用户: 确认
   ```

4. **查看分析报告**
   ```
   调式: 羽调式 (A minor pentatonic)
   BPM: 80
   拍号: 4/4
   节奏型: 四分 35%, 八分 40%, 附点 15%, 切分 10%
   音程: 级进 60%, 小跳 30%, 大跳 10%
   ```

5. **创作新歌词**
   ```
   AI: 请输入新歌的主题
   用户: 离别
   AI: 请提供关键意象
   用户: 车站、月台、背影
   AI: [生成歌词建议...]
   ```

6. **选择借鉴程度**
   ```
   AI: 请选择借鉴程度
   用户: 风格借鉴
   ```

7. **生成旋律**
   ```
   AI: [生成简谱和 MIDI 文件]
   输出保存至 output/{new-song-name}/
   ```

---

## ❓ 常见问题

### 无法匹配人声音轨

**解决方案**:
- 检查 MIDI 文件是否包含多个音轨
- 确认歌词字数是否正确
- 手动选择音轨

### 歌词字数不匹配

**解决方案**:
- 调整歌词使字数与原曲一致
- 使用延长音（-）补充
- 合并或拆分音符

### 生成的旋律不满意

**解决方案**:
- 尝试不同的借鉴程度
- 调整歌词的情感基调
- 重新生成并选择

---

## 🤖 Claude 执行逻辑

### 工作流程实现

#### 1. 用户请求检测
当用户提到分析 MIDI 文件或询问旋律风格时，执行以下步骤：

```bash
# 检测 workspace 目录结构
ls -la workspace/references/
```

#### 2. 文件验证和选择
```bash
# 扫描可用的歌曲文件
find workspace/references/ -name "*.mid" -type f
find workspace/references/ -name "*.txt" -type f
```

如果找到多个歌曲，询问用户选择；如果只有一个，自动使用。

#### 3. Python 分析执行
```bash
# 调用专业 MIDI 分析脚本
python3 skills/scripts/midi_analyzer.py workspace/references/{song-name}/{song-name}.mid --lyrics workspace/references/{song-name}/{song-name}.txt --pretty
```

#### 4. 结果处理
- 解析 JSON 输出
- 如果 `status: "success"`，展示详细分析结果
- 如果 `status: "error"`，显示错误信息和解决方案

#### 5. 错误处理策略
- **缺少依赖**: 显示安装指导
- **文件不存在**: 指导用户准备文件
- **MIDI 解析失败**: 检查文件格式
- **无人声音轨**: 提供手动选择选项

### 核心代码模板

```bash
# 环境检测
if ! python3 -c "import mido, music21, numpy" 2>/dev/null; then
    echo "❌ 缺少必需的 Python 依赖"
    echo "💡 请运行: pip install mido music21 numpy"
    echo "⚙️ 然后配置: python3 -c 'from music21 import configure; configure.run()'"
    exit 1
fi

# 执行分析
echo "🎼 正在进行专业级 MIDI 分析..."
RESULT=$(python3 skills/scripts/midi_analyzer.py "$MIDI_FILE" --lyrics "$LYRICS_FILE" --pretty 2>&1)

# 检查执行结果
if [ $? -eq 0 ]; then
    echo "✅ 分析完成"
    echo "$RESULT"
else
    echo "❌ 分析失败"
    echo "$RESULT"
fi
```

### 展示格式规范

**成功分析时展示**:
1. 🎵 **人声音轨识别结果** - 显示选中音轨和置信度
2. 📊 **旋律特征分析** - 节奏型分布、音程统计、调式信息
3. 🎼 **音乐理论分析** - 调号、音域、乐句结构
4. 🔮 **风格学习准备** - 为生成相似旋律做准备

**错误处理时显示**:
1. 🚨 **错误类型和原因**
2. 💡 **具体解决方案**
3. 🔧 **一键修复命令**（如适用）

---

**准备好开始你的旋律风格学习之旅了吗？**

请将参考歌曲的 MIDI 和歌词文件放入 `workspace/references/{歌曲名}/` 目录，然后告诉我歌曲名称！🎶

*Claude 将自动检测您的环境，选择最佳分析模式，并提供专业级的音乐分析结果。*
