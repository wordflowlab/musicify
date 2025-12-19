# Changelog

All notable changes to this project will be documented in this file.

## [0.7.1] - 2025-12-19

### 🐛 Bug Fixes

#### Fixed
- **简谱生成清理**: 移除简谱输出中的版权提醒和免责声明文字
  - 生成的简谱现在只包含纯净的音乐内容
  - 不再将说明性文字误当作歌词内容
  - 提升简谱的专业性和可读性

#### Enhanced
- **文档改进**: 在多个位置添加明确的简谱生成规则
  - `skills/melody-mimic.md`: 添加详细的生成注意事项和示例对比
  - `templates/commands/melody-mimic.md`: 更新简谱示例，移除提醒文字

#### Files Changed
- `skills/melody-mimic.md` - 添加简谱生成规则和注意事项
- `templates/commands/melody-mimic.md` - 清理简谱示例
- `package.json` - 版本更新至 0.7.1

---

## [0.7.0] - 2025-12-19

### 🎯 Feature: Melody-Mimic 多模式确认优化系统

#### Added
- **🚀 四种交互模式**: 解决"一个个确认太繁琐"的问题
  - ⚡ **快速模式**: 3-8分钟，1-2次确认，适合快速demo和灵感原型
  - 🎯 **专业模式**: 10-18分钟，3-5次确认，适合专业创作和主题歌曲
  - 🎓 **教练模式**: 20-35分钟，6-10次确认（减少60%），适合学习创作
  - 🔧 **专家模式**: 30-60分钟，15-25次确认，适合精品制作

- **🤖 智能推荐系统**: 基于旋律特征自动推荐最适合的模式
  - 新增 `calculate_complexity()` - 计算旋律复杂度（0-100分）
  - 新增 `recommend_creation_mode()` - 智能模式推荐
  - 推荐逻辑：简单旋律→快速模式，复杂旋律→专家模式，多段落→教练模式

- **📊 详细的模式执行流程**: 每种模式都有明确的工作流程和确认策略
  - 快速模式：自动化策略，最少确认
  - 专业模式：批量参数收集，段落级确认
  - 教练模式：段落级确认（原逐句确认减少67%）
  - 专家模式：完全手动控制，高级参数调整

#### Enhanced
- **Skills 配置升级**: 版本 2.0 → 2.1
  - 新增 `AskUserQuestion` 工具支持
  - 新增创作模式选择步骤（步骤4）
  - 智能推荐逻辑集成

- **Python 分析器增强**: `midi_analyzer.py`
  - 输出结果新增 `mode_recommendation` 字段
  - 包含推荐模式、复杂度分数、推荐理由、备选方案

#### Performance
- **确认次数大幅减少**:
  - 快速模式: 减少90% (1-2次 vs 原15-20次)
  - 专业模式: 减少70% (3-5次 vs 原15-20次)
  - 教练模式: 减少60% (6-10次 vs 原15-20次)
  - 专家模式: 保持精确控制 (15-25次)

#### Technical
- **零额外依赖**: 充分利用现有 Skills 框架
- **向后兼容**: 保持所有现有功能不变
- **智能推荐**: 基于节奏复杂度、音程分布、调式明确度等多维度分析

#### Files Changed
- `skills/melody-mimic.md` - 添加模式选择和执行流程
- `skills/scripts/midi_analyzer.py` - 添加智能推荐逻辑
- `package.json` - 版本更新至 0.7.0

#### Migration Guide
无需迁移，完全向后兼容。现有用户升级后将自动获得模式选择功能。

---

## [0.6.2] - 2025-12-19

### 🎵 Feature: Claude Code 斜杠命令集成

#### Added
- **💫 完整的斜杠命令架构实现**: `/melody-mimic` 现已集成到 templates/commands/ 目录
  - 新增 `templates/commands/melody-mimic.md` - 斜杠命令模板文件
  - 新增 `scripts/bash/melody-mimic.sh` - Bash 脚本支持
  - 新增 `scripts/powershell/melody-mimic.ps1` - PowerShell 脚本支持
  - 安装 Musicify 时自动集成到用户的 Claude Code 项目

- **🔍 增强的环境检测**: 改进 Claude Code 环境识别精度
  - 新增对 `CLAUDECODE=1` 环境变量的检测
  - 新增对 `CLAUDE_CODE_ENTRYPOINT` 环境变量的检测
  - 提升在实际 Claude Code 环境中的识别准确性

#### Technical
- **正确的使用流程**: 用户先输入 `/melody-mimic` → 根据提示准备参考文件 → 再次运行开始分析
- **自动文件检测**: 智能扫描 `workspace/references/` 目录，自动识别可用的参考歌曲
- **跨平台脚本**: 支持 macOS/Linux (Bash) 和 Windows (PowerShell) 环境
- **结构化输出**: JSON 格式的状态信息，便于 Claude 解析和处理

#### Files Changed
- `templates/commands/melody-mimic.md` (new)
- `scripts/bash/melody-mimic.sh` (new)
- `scripts/powershell/melody-mimic.ps1` (new)
- `src/utils/interactive.ts` (enhanced)

## [0.6.1] - 2025-12-19

### 🛠️ Bug Fix

#### Fixed
- **CLI 命令注册缺失修复**: 修复 `melody-mimic` 命令在 CLI 补全中不显示的问题
  - 添加了 `melody-mimic` 命令的正确注册和描述
  - 更新了帮助信息，包含新的旋律风格学习助手功能
  - 现在 `/melody-mimic` 命令可以在命令补全中正常显示

#### Technical
- 完善了双轨执行逻辑，确保 melody-mimic 仅在 Claude Code 环境下可用
- 优化了错误提示，为非 Claude Code 环境提供清晰的说明

## [0.6.0] - 2025-12-19

### 🎵 Major Feature: 旋律风格学习助手系统

#### Added
- **🎼 旋律风格学习助手 Skill** (`/melody-mimic` 命令)
  - 基于参考歌曲的 MIDI 和歌词，学习旋律风格并创作原创旋律
  - 智能人声音轨匹配算法 (关键词匹配 + 字数匹配 + 音域过滤)
  - 深度特征分析：节奏型统计、音程分布、调式推断、旋律轮廓
  - 歌词结构解析和创作引导流程
  - 三种借鉴程度选项：高度相似、风格借鉴、轻度参考
  - 完善的版权风险提醒和免责声明

- **📊 专业 MIDI 解析规则库**
  - `midi-parser-rules.json`: 完整的 MIDI 音乐分析规则
    - MIDI 音符到音名映射 (C2-B6 完整覆盖)
    - 时值映射和节奏型分类 (基本型、附点型、切分型、三连音)
    - 五声音阶调式检测规则 (宫商角徵羽)
    - 人声音轨匹配配置和置信度算法
    - 音程分类和旋律轮廓分析规则

- **🎯 智能人声音轨匹配系统**
  - 多重验证算法：关键词匹配、音符数量匹配、音域过滤
  - 人声音域范围检测 (C3-C6，48-84 MIDI)
  - 匹配置信度评估 (高/中/低/无匹配)
  - 支持中英文音轨名称识别

- **📈 深度音乐特征分析**
  - 节奏型统计：四分、八分、附点、切分、三连音、十六分音符
  - 音程分布：同度、级进、小跳、大跳的比例分析
  - 调式推断：基于五声音阶特征音的智能识别
  - 旋律轮廓：上行、下行、平稳的趋势分析

- **✍️ 智能歌词创作引导**
  - 段落标记识别 (支持中英文标记)
  - 有效字符统计 (排除标点符号和空格)
  - 结构化歌词解析和验证
  - 逐段引导的创作流程

#### Enhanced
- **关键词扩展**: 新增 `midi-analysis`, `melody-mimic`, `music-theory`, `rhythm-analysis`, `interval-analysis`, `vocal-track`, `旋律学习`, `音乐分析`
- **Skill 系统**: 现已支持 4 个专业 Skills (lyrics, compose, melody-gen, melody-mimic)
- **音乐理论深度**: 完整的 MIDI 音乐分析和旋律学习系统

#### Technical
- **测试系统增强**: 新增基于属性的测试 (Property-based Testing)
  - 使用 fast-check 库进行模糊测试
  - 17 个详细测试场景，覆盖核心算法
  - MIDI 解析、人声匹配、特征分析全面验证
  - 边界测试和异常情况处理

- **算法复杂度优化**
  - 高效的音轨匹配算法 (O(n) 复杂度)
  - 智能的节奏型分类 (基于容差的时值识别)
  - 精确的音程统计 (保证 100% 总和)

#### Package Updates
- 版本更新至 `v0.6.0`
- 新增关键词: `midi-analysis`, `melody-mimic`, `music-theory`, `rhythm-analysis`, `interval-analysis`, `vocal-track`, `旋律学习`, `音乐分析`
- 完善的测试覆盖和质量保证

## [0.5.0] - 2025-12-19

### 🎼 Major Feature: 国风旋律生成系统

#### Added
- **🎵 国风旋律生成助手 Skill** (`/melody-gen` 命令)
  - 将歌词转换为符合五声音阶的简谱旋律
  - 支持宫、商、角、徵、羽五种传统调式
  - 智能情绪旋律映射 (忧伤、欢快、平静、激昂、思念、空灵)
  - 结构差异处理 (主歌、副歌、桥段的旋律特征)
  - 传统装饰音支持 (滑音、颤音、倚音、波音)

- **📚 专业国风资源库**
  - `pentatonic-rules.json`: 五声音阶规则库
    - 宫商角徵羽五种调式的详细定义
    - 音程规则和避免音指导
    - 典型终止式和装饰音模式
  - `guofeng-patterns.json`: 国风旋律模式库
    - 6种情绪的旋律特征映射
    - 常用国风旋律型 (如"梅花三弄"、"高山流水")
    - 节拍和速度指导

#### Enhanced
- **关键词扩展**: 新增 `guofeng`, `chinese-music`, `pentatonic`, `melody-generation`, `国风`, `五声音阶`
- **Skill 系统**: 现已支持 3 个专业 Skills (lyrics, compose, melody-gen)
- **传统音乐理论**: 完整的中国传统音乐理论支持

#### Technical
- **测试系统**: 新增完整的测试框架 (`vitest`)
  - 单元测试覆盖核心功能
  - 性能测试和边界测试
  - 自动化测试流程

- **开发工具**: 增强的开发体验
  - 测试命令: `npm run test`, `npm run test:watch`
  - 代码覆盖率报告
  - 快速属性测试支持

#### Package Updates
- 版本更新至 `v0.5.0`
- 新增开发依赖: `vitest`, `@vitest/coverage-v8`, `fast-check`
- 完善的测试配置和 CI/CD 支持

## [0.4.0] - 2025-12-19

### 🚀 Major Feature: Claude Code Skill 系统集成

#### Added
- **双轨架构系统** - Claude Code 专属增强体验
  - 智能环境检测：自动识别 Claude Code 环境
  - Skill 系统：专为 Claude Code 设计的增强功能
  - 传统兼容：其他 12 个 AI 平台保持原有功能不变

- **🎵 歌词创作引导助手 Skill** (`/lyrics` 命令增强)
  - 智能押韵实时建议和评分系统
  - 5000+ 中文押韵词汇库 (AABB/ABAB/ABCB 模式)
  - 情感词汇库分类推荐 (欢快、忧伤、温暖、励志、浪漫)
  - 渐进式披露的创作引导体验
  - 中文韵律分析工具
  - 歌词结构可视化展示

- **🎼 音乐理论与作曲助手 Skill** (`/compose` 命令增强)
  - 智能和弦进行生成与分析 (流行、摇滚、爵士、中国风)
  - 调式自动识别和转换 (大小调、Dorian、Mixolydian、五声音阶)
  - 专业编配建议系统 (乐器搭配、声部安排、节奏型设计)
  - 风格化节奏模式指导
  - 音色搭配专业建议
  - 高级作曲技巧指导 (和弦替代、旋律写作、歌曲结构)

- **专业资源库系统**
  - `rhyme-patterns.json`: 中文押韵数据库，包含音调分析
  - `chord-progressions.json`: 和弦进行库，覆盖多种音乐风格
  - 情感词汇分类系统
  - 创作技巧指南库

#### Enhanced
- **环境检测功能** (`src/utils/interactive.ts`)
  - `isClaudeCode()`: 多重验证的 Claude Code 环境检测
  - `supportsSkills()`: Skills 功能支持判断

- **类型系统扩展** (`src/types/index.ts`)
  - `SkillMetadata`: Skill 元数据接口
  - `SkillResource`: 资源文件接口
  - `SkillContext`: 执行上下文接口

- **CLI 核心逻辑** (`src/cli.ts`)
  - 双轨执行机制：自动选择 Skill 或传统模式
  - 增强的输出格式：彩色界面、图标、结构化展示
  - 资源状态显示：实时显示加载的资源文件

#### Technical
- **Skill 加载引擎** (`src/utils/skill-loader.ts`)
  - YAML frontmatter 解析
  - 动态资源加载和管理
  - Skill 完整性验证
  - 错误处理和降级机制

- **文件结构优化**
  - `skills/` 目录：独立的 Skill 文件存储
  - `skills/resources/` 子目录：资源文件管理
  - 模块化设计：清晰的职责分离

#### Package Updates
- 版本更新至 `v0.4.0`
- 新增关键词：`claude-code`, `skills`, `rhyme`, `chord-progressions`
- 更新包描述：强调 Claude Code 专属体验
- 打包文件增加：`skills/` 目录

## [0.3.0] - 2025-11-01

### 🎵 Major Feature: 作曲辅助与音乐平台集成

#### Added
- **`/lyrics` 交互式模式选择** - 不再需要 `--mode` 参数
  - 首次运行时 AI 询问选择模式 (Coach/Express/Hybrid)
  - 自动保存选择,下次直接使用
  - 保留 `--mode` 参数作为快捷方式(向后兼容)
- **`/compose` 命令** - 生成完整的作曲辅助内容
  - 和弦进行生成 (基于音乐理论,使用 tonal 库)
  - 旋律音高提示 (具体音高序列,如 C4-D4-E4-G4)
  - ABC Notation 五线谱导出
  - 乐器配置建议
  - 参考歌曲推荐

- **增强 `/export` 命令** - 智能导出到多个平台
  - **Suno AI 导出**: 生成结构化提示词,可直接粘贴到 Suno
  - **Tunee AI 导出**: 生成对话素材包,引导在 Tunee 中创作
  - **通用格式导出**: 导出五线谱+和弦+歌词(给乐手使用)
  - **纯歌词导出**: 保留原有的 TXT/MD 导出功能
  - **全部导出**: 一键导出所有格式

- **音乐理论库集成**: 安装 `tonal` 库用于和弦计算和验证

#### Changed
- `/export` 从纯歌词导出变为交互式平台选择
- 产品定位从"歌词工具"扩展为"歌词创作+音乐辅助",与 Suno/Tunee 互补

#### Technical
- 新增文件: `templates/commands/compose.md`
- 新增脚本: `scripts/bash/compose.sh`, `scripts/powershell/compose.ps1`
- 更新脚本: `scripts/bash/export.sh`, `scripts/powershell/export.ps1`
- 新增依赖: `tonal@^5.0.0`

---

## [0.2.0] - 2025-10-31

### 🎉 Major UX Improvements

#### Changed
- **Revolutionized interaction model**: Replaced difficult open-ended questions with easy multiple-choice (A/B/C/D/E)
- **Two-level selection system**: Choose main category first, then specific direction
- **Smart defaults**: Preset common options while keeping E for custom input
- **30-second setup**: Users can now complete theme selection in under 30 seconds

#### Improved Commands
- `/theme`: Now uses A/B/C/D/E selection for theme categories (Love/Growth/Healing/Social/Custom)
  - Each category has 5-7 specific sub-options
  - Emotion intensity selection (Subtle/Warm/Intense/Painful/Complex)
  - Narrative style options (Story/Emotion/Scenes/Dialogue/Imagery)
  - Perspective selection (First/Second/Third/Mixed/Creative)
- `/lyrics` (coach mode): Added preset options for rhyme patterns (AABB/ABAB/ABCB/Free) and writing styles (Colloquial/Literary/Dramatic/Concise)

#### Benefits
- ✅ Much lower barrier to entry
- ✅ Faster workflow (30 seconds vs 5+ minutes)
- ✅ Less intimidating for new users
- ✅ Still maintains depth for advanced users (E option)
- ✅ Reduces user abandonment rate

---

## [0.1.2] - 2025-10-31

### Added
- Complete PowerShell scripts for Windows support
- All 11 PowerShell versions (common, spec, theme, mood, structure, lyrics, fill, rhyme, polish, melody-hint, export)

---

## [0.1.1] - 2025-10-31

### Fixed
- Include templates/ and scripts/ directories in npm package
- Users can now properly initialize projects

---

## [0.1.0] - 2025-10-31

### Added

#### Core Infrastructure
- 🏗️ Complete three-layer architecture (Markdown/TypeScript/Bash)
- 📦 Project initialization with 13 AI assistant support
- 🎨 Interactive CLI with beautiful UI
- 🔧 Bash script execution system
- 📝 YAML template parser

#### Commands Implemented
- `/init` - Initialize musicify project with AI assistant selection
- `/spec` - Define song specifications (type, duration, style, audience, platform, language)
- `/theme` - Theme ideation with coach mode guidance
- `/mood` - Mood and atmosphere positioning
- `/structure` - Song structure design (Verse/Chorus/Bridge)
- `/lyrics` - Lyrics creation with three modes:
  - **Coach Mode**: Guided creation, 100% original
  - **Express Mode**: AI-generated complete lyrics
  - **Hybrid Mode**: AI framework + user content
- `/fill` - Fill in hybrid mode placeholders
- `/rhyme` - Rhyme checking and optimization
- `/polish` - Lyrics polishing (wording/imagery/emotion/singability)
- `/melody-hint` - Melody hints generation
- `/export` - Export lyrics in multiple formats

#### Song Type Support
- 🎵 Pop
- 🎸 Rock
- 🎤 Rap/Hip-Hop
- 🎻 Folk
- 🎹 Electronic/EDM
- 🏮 Chinese Traditional
- 🎺 R&B
- 🎷 Jazz
- 🤠 Country
- 🔥 Metal

#### Templates
- Complete AI prompt templates for all commands
- Coach mode guidance system
- Express mode generation system
- Hybrid mode framework system
- Quality checking system

#### Documentation
- 📖 Comprehensive README
- 🚀 QUICKSTART guide
- 📋 Command templates
- 🏗️ Architecture documentation

### Features

#### Three Creation Modes
1. **Coach Mode**: AI guides thinking, never writes for you
2. **Express Mode**: AI generates complete lyrics quickly
3. **Hybrid Mode**: AI provides framework, user fills content

#### Quality Assurance
- Theme pressure testing
- Rhyme pattern analysis
- Imagery richness check
- Emotion progression validation
- Singability optimization

#### Multi-language Support
- Chinese (Mandarin)
- English
- Cantonese
- Japanese
- Korean
- Mixed languages

#### Export Formats
- Plain text (.txt)
- Markdown (.md)
- PDF (.pdf)

### Technical Details
- TypeScript with strict mode
- Commander.js for CLI
- Inquirer.js for interactive prompts
- Chalk for colored output
- Ora for spinners
- fs-extra for file operations
- js-yaml for YAML parsing

---

## [Planned] - Future Releases

### [0.2.0] - Enhanced Features
- [ ] Advanced rhyme suggestions
- [ ] Dialect support (Cantonese, Sichuan dialect)
- [ ] Syllable counting and rhythm alignment
- [ ] Deep singability analysis
- [ ] Reference song database

### [0.3.0] - Ecosystem Integration
- [ ] Integration with music composition software
- [ ] Melody reference library
- [ ] Style example database
- [ ] Collaboration features

---

## Version History

- **v0.1.0** (2025-10-31) - Initial release with core features

