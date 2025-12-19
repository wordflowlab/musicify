# Changelog

All notable changes to this project will be documented in this file.

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

