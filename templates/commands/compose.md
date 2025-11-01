---
description: 生成和弦进行、旋律提示和五线谱
scripts:
  sh: ../../scripts/bash/compose.sh
  ps1: ../../scripts/powershell/compose.ps1
---

# /compose - 作曲辅助系统 🎼

> **核心理念**: 基于歌词生成和弦、旋律提示和五线谱
> **目标**: 为 Suno/Tunee 等平台提供专业音乐参考

---

## 运行脚本 ⚠️ 必须执行

```bash
bash scripts/bash/compose.sh
```

脚本会读取项目文件并返回歌曲信息给你。

---

## 🎵 生成内容

请基于脚本返回的信息生成完整的作曲辅助内容:

### 1. 和弦进行分析

根据歌曲类型、情绪和结构,为每个段落生成合适的和弦进行:

**和弦选择原则**:
- **流行 (Pop)**: 使用经典四和弦,如 C-G-Am-F, 或 F-G-C-Am
- **摇滚 (Rock)**: 使用强力和弦,如 E-A-D, G-C-D
- **民谣 (Folk)**: 使用简单三和弦,如 C-F-G, D-G-A
- **说唱 (Rap)**: 使用循环和弦,如 Dm-Am-Dm-Am
- **电子 (Electronic)**: 使用小调和弦,如 Am-F-C-G
- **古风 (Ancient Style)**: 使用五声音阶,如 Em-Am-D-G
- **R&B**: 使用复杂和弦,如 Cmaj7-Dm7-Em7-Fmaj7
- **爵士 (Jazz)**: 使用七和弦,如 Dmaj7-G7-Cmaj7-Am7
- **乡村 (Country)**: 使用简单和弦,如 G-C-D-Em
- **金属 (Metal)**: 使用降音和弦,如 E5-G5-A5-C5

**情绪调性选择**:
- **快乐/积极**: 大调 (C, G, D, F等)
- **忧伤/深沉**: 小调 (Am, Em, Dm等)
- **激昂/力量**: 强力和弦 (E5, A5, D5等)
- **温柔/浪漫**: 七和弦 (Cmaj7, Fmaj7等)

请为以下段落生成和弦:
- **前奏 (Intro)**: 2-4个和弦
- **主歌 (Verse)**: 4-8个和弦
- **副歌前 (Pre-Chorus)**: 2-4个和弦 (如有)
- **副歌 (Chorus)**: 4-8个和弦
- **桥段 (Bridge)**: 4-6个和弦 (如有)
- **尾奏 (Outro)**: 2-4个和弦

### 2. 旋律提示

为每个段落提供详细的旋律建议:

**音域范围**:
- 男声流行: C3-C5
- 女声流行: G3-G5
- 说唱: 通常较窄,如 A3-E4
- 高音挑战: 可到 E5 或更高

**旋律走向**:
- **上行**: 营造期待感、积极情绪
- **下行**: 营造释放感、忧伤情绪
- **波浪形**: 营造流动感、叙事性
- **跳跃式**: 营造活力、戏剧性

**音高序列示例**:
为每个段落提供具体的音高走向,例如:
- 主歌第一句: "C4-D4-E4-G4" (上行,积极)
- 主歌第二句: "G4-F4-E4-D4" (下行,舒缓)
- 副歌高潮: "G4-A4-C5-B4" (跳跃,爆发)

**节奏重音**:
标注歌词中哪些字/词应该唱重音,通常是:
- 情感关键词
- 段落结尾押韵词
- 副歌 hook 词

### 3. 五线谱生成 (ABC Notation)

生成 ABC Notation 格式的简易旋律线,包含和弦标注:

**ABC Notation 基本语法**:
```
X:1                    # 曲目编号
T:歌曲标题             # 标题
C:作词/作曲            # 创作者
M:4/4                  # 拍号
L:1/8                  # 默认音符长度
Q:1/4=90               # 速度 (BPM)
K:C                    # 调性

% 主歌
"C"E2 G2 G2 E2 | "G"D2 F2 F2 D2 |
"Am"C2 E2 E2 C2 | "F"A2 G2 F2 E2 |
```

**注意事项**:
- 音符: C D E F G A B (可加数字表示八度,如 C4)
- 音符长度: 2=二分音符, 4=全音符, 无数字=八分音符
- 休止符: z
- 小节线: |
- 和弦标注: "C" "G" "Am"

请生成至少包含主歌和副歌的简易五线谱。

### 4. 乐器配置建议

根据歌曲类型推荐乐器组合:

**主要乐器** (1-2种):
- 流行: 钢琴、吉他
- 摇滚: 电吉他、贝斯、鼓
- 民谣: 木吉他、口琴
- 电子: 合成器、电子鼓
- 古风: 古筝、笛子、琵琶

**辅助乐器** (2-3种):
- 弦乐 (Strings): 增加情感深度
- 打击乐 (Percussion): 增加节奏感
- 管乐 (Brass): 增加力量感

**应避免的乐器**:
- 与风格不符的乐器
- 会干扰人声的高频乐器

### 5. 参考歌曲

推荐 2-3 首风格相似的歌曲,说明相似点:
- 歌曲名 - 歌手: 和弦进行相似
- 歌曲名 - 歌手: 旋律走向相似
- 歌曲名 - 歌手: 情感表达相似

---

## 💾 保存文件

生成完成后,请将内容保存为以下文件:

### 1. composition.yaml

```yaml
# 作曲辅助信息
song_info:
  title: "歌曲标题"
  genre: "歌曲类型"
  key: "C Major"  # 调性
  tempo: "90-100 BPM"
  time_signature: "4/4"

chord_progression:
  intro:
    chords: ["C", "G"]
    description: "简单铺垫"

  verse:
    chords: ["C", "G", "Am", "F"]
    description: "经典流行四和弦"

  pre_chorus:
    chords: ["Dm", "G"]
    description: "过渡递进"

  chorus:
    chords: ["F", "C", "G", "Am"]
    description: "和弦倒置增加张力"

  bridge:
    chords: ["Dm", "G", "C", "Am"]
    description: "情感转折"

  outro:
    chords: ["F", "C"]
    description: "温柔收尾"

melody_hints:
  verse:
    range: "C4 - G4"
    direction: "平稳叙述"
    pattern: "C4-D4-E4-G4, G4-F4-E4-D4"
    emphasis: ["第1句结尾", "第3句关键词"]

  chorus:
    range: "G4 - C5"
    direction: "上扬爆发"
    pattern: "G4-A4-C5-B4, C5-B4-A4-G4"
    emphasis: ["每句开头", "Hook词"]

  bridge:
    range: "E4 - A4"
    direction: "下行转折"
    pattern: "A4-G4-F4-E4"
    emphasis: ["情感转折词"]

instrumentation:
  primary: ["乐器1", "乐器2"]
  secondary: ["辅助乐器1", "辅助乐器2"]
  avoid: ["不适合的乐器"]

reference_songs:
  - title: "歌曲名"
    artist: "歌手"
    similarity: "相似点描述"

notes: |
  补充说明和建议
```

### 2. notation.abc

```abc
X:1
T:歌曲标题
C:Musicify AI
M:4/4
L:1/8
Q:1/4=90
K:C

% 主歌 (Verse)
"C"E2 G2 G2 E2 | "G"D2 F2 F2 D2 |
"Am"C2 E2 E2 C2 | "F"A2 G2 F2 E2 |

% 副歌 (Chorus)
"F"A2 c2 c2 A2 | "C"G2 e2 e2 G2 |
"G"B2 d2 d2 B2 | "Am"c4 A4 |
```

---

## 📌 用户提示

保存完成后,请告诉用户:

> ✅ **已生成作曲辅助文件**
>
> 📄 **保存文件**:
> - `composition.yaml` - 和弦进行和旋律提示
> - `notation.abc` - ABC 格式五线谱
>
> 💡 **下一步**:
> 1. 查看 `composition.yaml` 了解和弦和旋律建议
> 2. 使用在线工具将 `notation.abc` 转换为 PDF:
>    - https://abcjs.net/abcjs-editor.html
>    - 或使用 MuseScore 软件导入
> 3. 运行 `/export` 命令导出到 Suno 或 Tunee 平台
>
> 🎵 **参考歌曲**: [列出推荐的参考歌曲]

---

**开始执行** ⬇️
