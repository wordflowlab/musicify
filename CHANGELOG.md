# Changelog

All notable changes to this project will be documented in this file.

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

