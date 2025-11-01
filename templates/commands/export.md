---
description: 导出歌词和音乐素材到不同平台
scripts:
  sh: ../../scripts/bash/export.sh
  ps1: ../../scripts/powershell/export.ps1
---

# /export - 智能导出系统 📦

> **核心理念**: 将创作内容导出为不同平台所需的格式
> **支持**: Suno AI, Tunee AI, 通用格式, 纯歌词

---

## 运行脚本 ⚠️ 必须执行

```bash
bash scripts/bash/export.sh
```

脚本会读取项目文件并返回信息给你。

---

## 🎯 询问用户选择导出目标

请用友好的方式询问用户想要导出到哪个平台:

> 你想将歌曲导出到哪个平台?
>
> 1. **Suno AI** - AI音乐生成平台,生成结构化提示词
> 2. **Tunee AI** - 对话式音乐创作平台,生成对话素材包
> 3. **通用格式** - 导出五线谱和和弦(给乐手使用)
> 4. **纯歌词** - 只导出歌词文本(TXT/MD/PDF)
> 5. **全部导出** - 一次性导出所有格式
>
> 请输入选项编号 (1-5):

等待用户回复后,根据选择执行对应的导出逻辑。

---

## 📝 根据选择生成内容

### 选项 1: Suno AI 导出

生成文件 `exports/suno/suno-prompt.txt`:

**文件内容格式**:

```
{风格标签}

[Intro]
{前奏描述,如有}

[Verse 1]
{第一段歌词}

[Pre-Chorus]
{副歌前段,如有}

[Chorus]
{副歌歌词}

[Verse 2]
{第二段歌词}

[Bridge]
{桥段歌词,如有}

[Chorus]
{副歌重复}

[Outro]
{尾奏描述,如有}

---
## 和弦参考
Verse: {从 composition.yaml 读取和弦}
Chorus: {从 composition.yaml 读取和弦}
Bridge: {从 composition.yaml 读取和弦}

## 旋律提示
- 主歌: {旋律走向描述}
- 副歌: {旋律走向描述}
- 桥段: {旋律走向描述}
```

**风格标签生成规则**:

根据 `spec.json` 中的信息生成风格标签:
- **类型 (genre)**: pop, rock, rap, folk, electronic, ancient-chinese, r&b, jazz, country, metal
- **风格 (style)**: ballad, upbeat, melancholic, powerful, gentle, energetic
- **速度 (tempo)**: 从 composition.yaml 读取 BPM,如 "90bpm", "120bpm"
- **人声 (vocal)**: male vocal, female vocal, duet
- **乐器 (instruments)**: 从 composition.yaml 的 instrumentation 读取,如 "acoustic guitar", "piano", "strings"

示例: `pop, ballad, emotional, 90bpm, male vocal, acoustic guitar, strings`

**提示用户**:
> ✅ **已导出到 Suno AI 格式**
>
> 📄 **保存位置**: `exports/suno/suno-prompt.txt`
>
> 📋 **使用方法**:
> 1. 打开 https://suno.ai
> 2. 点击 "Create" 创建新歌曲
> 3. 复制 `suno-prompt.txt` 的内容
> 4. 粘贴到 Suno 的提示词框
> 5. 点击 "Generate" 生成音乐!
>
> 💡 **提示**: 生成后可以在 Suno 中继续调整参数和重新生成

---

### 选项 2: Tunee AI 导出

生成文件夹 `exports/tunee/` 包含多个文件:

**1. conversation-guide.md** (对话指南):

```markdown
# Tunee AI 创作指南

## 📌 项目信息
- **歌曲名称**: {歌曲标题}
- **类型**: {歌曲类型}
- **风格**: {歌曲风格}
- **创作日期**: {当前日期}

---

## 💬 建议对话流程

### 第一步:描述整体风格

**你可以对 Tunee 说**:
> "我想创作一首{类型}歌曲,风格{风格},节奏{速度 BPM},
> 适合{使用场景},参考{参考歌曲}"

**Tunee 可能会问**:
- 您希望的乐器配置?
- 歌手性别偏好?
- 具体的情绪是什么?

**建议回答**:
- 乐器: {从 composition.yaml 的 instrumentation 读取}
- 歌手: {从 spec.json 读取}
- 情绪: {从 mood.json 读取}

---

### 第二步:提供歌词和结构

**你可以对 Tunee 说**:
> "我已经有完整的歌词,歌曲结构是: {从 structure.json 读取}
> 歌词见附件 lyrics.txt"

然后上传 `lyrics.txt` 文件。

---

### 第三步:提供音乐参考

**你可以对 Tunee 说**:
> "我希望主歌部分用{音域},旋律走向是{走向},
> 副歌要{音域},更加{情绪},
> 和弦进行可以参考 chords.txt"

然后上传以下文件:
- `chords.txt` (和弦进行)
- `notation.abc` (五线谱参考)

---

### 第四步:上传参考素材

**你可以上传**:
- ✅ 和弦参考 (chords.txt)
- ✅ 五线谱 (notation.abc)
- ✅ 参考歌曲列表 (references.md)
- ✅ 情绪参考图片 (如有)

**然后对 Tunee 说**:
> "请根据这些素材生成音乐,保持歌词不变"

---

### 第五步:迭代优化

Tunee 生成初版后,你可以说:
- "主歌部分可以再柔和一些"
- "副歌的爆发力可以更强"
- "加入更多{乐器名}的元素"
- "节奏可以再快一点"

---

## 📎 附件清单

请按顺序上传以下文件:
1. ✅ lyrics.txt - 完整歌词
2. ✅ chords.txt - 和弦进行
3. ✅ notation.abc - 五线谱参考
4. ✅ references.md - 参考歌曲列表

---

## 🎵 推荐参数

根据你的歌曲信息,建议在 Tunee 中使用以下参数:
- **调性 (Key)**: {从 composition.yaml 读取}
- **速度 (Tempo)**: {从 composition.yaml 读取} BPM
- **拍号 (Time)**: {从 composition.yaml 读取}

---

**祝创作愉快!** 🎉
```

**2. lyrics.txt** (纯歌词):

复制 `lyrics.md` 的内容,去除 markdown 标记

**3. chords.txt** (和弦进行):

```
歌曲和弦进行

前奏 (Intro):
{和弦列表}

主歌 (Verse):
{和弦列表}

副歌前 (Pre-Chorus):
{和弦列表}

副歌 (Chorus):
{和弦列表}

桥段 (Bridge):
{和弦列表}

尾奏 (Outro):
{和弦列表}
```

**4. notation.abc** (五线谱):

复制 `notation.abc` 的内容(如果存在)

**5. references.md** (参考歌曲):

```markdown
# 参考歌曲列表

{从 composition.yaml 的 reference_songs 读取}

## 推荐收听顺序
1. {歌曲1} - {相似点}
2. {歌曲2} - {相似点}
3. {歌曲3} - {相似点}
```

**提示用户**:
> ✅ **已导出到 Tunee AI 格式**
>
> 📂 **保存位置**: `exports/tunee/`
>
> 📋 **使用方法**:
> 1. 打开 https://tunee.ai
> 2. 开始新的对话
> 3. 按照 `conversation-guide.md` 中的步骤与 Tunee 对话
> 4. 逐步上传相关素材文件
> 5. 根据 Tunee 的生成结果进行迭代优化
>
> 💡 **提示**: Tunee 是对话式创作,可以随时调整和优化

---

### 选项 3: 通用格式导出

导出到 `exports/universal/`:

**文件列表**:
- `composition.yaml` (和弦和旋律提示)
- `notation.abc` (ABC 格式五线谱)
- `notation.pdf` (五线谱 PDF,需提示用户)
- `lyrics.txt` (纯文本歌词)
- `project-info.md` (项目信息汇总)

**project-info.md 内容**:

```markdown
# 歌曲项目信息

## 基本信息
- **歌曲名称**: {从 spec.json 读取}
- **类型**: {从 spec.json 读取}
- **风格**: {从 spec.json 读取}
- **时长**: {从 spec.json 读取}
- **语言**: {从 spec.json 读取}

## 音乐元素
- **调性**: {从 composition.yaml 读取}
- **速度**: {从 composition.yaml 读取} BPM
- **拍号**: {从 composition.yaml 读取}

## 和弦进行
{从 composition.yaml 读取所有和弦}

## 乐器配置
{从 composition.yaml 读取 instrumentation}

## 旋律提示
{从 composition.yaml 读取 melody_hints}

## 参考歌曲
{从 composition.yaml 读取 reference_songs}

---
**创建日期**: {当前日期}
**工具**: Musicify v0.3.0
```

**提示用户**:
> ✅ **已导出到通用格式**
>
> 📂 **保存位置**: `exports/universal/`
>
> 📋 **文件说明**:
> - `composition.yaml` - 和弦和旋律提示,可供编曲使用
> - `notation.abc` - ABC 格式五线谱,可在线转 PDF
> - `lyrics.txt` - 纯文本歌词
> - `project-info.md` - 完整项目信息汇总
>
> 💡 **五线谱转换**:
> - 访问 https://abcjs.net/abcjs-editor.html
> - 粘贴 `notation.abc` 的内容
> - 点击下载 PDF 或 SVG
>
> 🎵 **给乐手**: 提供 composition.yaml 和五线谱即可开始编曲

---

### 选项 4: 纯歌词导出

询问用户需要的格式:
> 你想导出歌词为什么格式?
> 1. TXT (纯文本)
> 2. MD (Markdown)
> 3. PDF (需在线转换)

根据选择导出到 `exports/lyrics.{格式}`

**提示用户**:
> ✅ **已导出歌词**
>
> 📄 **保存位置**: `exports/lyrics.{格式}`
>
> 💡 **提示**: 可以直接分享或打印

---

### 选项 5: 全部导出

执行上述所有导出(选项1-3),生成完整的 `exports/` 文件夹:

```
exports/
├── suno/
│   └── suno-prompt.txt
├── tunee/
│   ├── conversation-guide.md
│   ├── lyrics.txt
│   ├── chords.txt
│   ├── notation.abc
│   └── references.md
└── universal/
    ├── composition.yaml
    ├── notation.abc
    ├── lyrics.txt
    └── project-info.md
```

**提示用户**:
> ✅ **已导出所有格式**
>
> 📂 **保存位置**: `exports/`
>
> 📋 **导出内容**:
> - `suno/` - Suno AI 提示词包
> - `tunee/` - Tunee AI 对话素材包
> - `universal/` - 通用格式(给乐手)
>
> 💡 **下一步**: 选择你喜欢的平台开始生成音乐!

---

## ⚠️ 注意事项

1. **composition.yaml 优先**: 如果项目中没有 `composition.yaml`,先提示用户运行 `/compose`
2. **文件缺失处理**: 如果某些可选文件不存在(如 mood.json),使用默认值或从其他文件推断
3. **格式清理**: 导出时确保文本格式正确,去除不必要的 markdown 标记

---

**开始执行** ⬇️

