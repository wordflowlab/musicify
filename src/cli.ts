#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import fs from 'fs-extra';
import ora from 'ora';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import {
  displayProjectBanner,
  displaySuccess,
  displayError,
  displayInfo,
  displayStep,
  isInteractive,
  isClaudeCode,
  selectAIAssistant,
  selectSongType,
  selectBashScriptType
} from './utils/interactive.js';
import { executeBashScript } from './utils/bash-runner.js';
import { loadSkill, skillExists, createSkillContext } from './utils/skill-loader.js';

// 读取 package.json 版本号
const require = createRequire(import.meta.url);
const { version } = require('../package.json');
import { parseCommandTemplate } from './utils/yaml-parser.js';
import { AIConfig } from './types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AI 平台配置 - 所有支持的平台
const AI_CONFIGS: AIConfig[] = [
  { name: 'claude', dir: '.claude', commandsDir: 'commands', displayName: 'Claude Code' },
  { name: 'cursor', dir: '.cursor', commandsDir: 'commands', displayName: 'Cursor' },
  { name: 'gemini', dir: '.gemini', commandsDir: 'commands', displayName: 'Gemini CLI' },
  { name: 'windsurf', dir: '.windsurf', commandsDir: 'workflows', displayName: 'Windsurf' },
  { name: 'roocode', dir: '.roo', commandsDir: 'commands', displayName: 'Roo Code' },
  { name: 'copilot', dir: '.github', commandsDir: 'prompts', displayName: 'GitHub Copilot' },
  { name: 'qwen', dir: '.qwen', commandsDir: 'commands', displayName: 'Qwen Code' },
  { name: 'opencode', dir: '.opencode', commandsDir: 'command', displayName: 'OpenCode' },
  { name: 'codex', dir: '.codex', commandsDir: 'prompts', displayName: 'Codex CLI' },
  { name: 'kilocode', dir: '.kilocode', commandsDir: 'workflows', displayName: 'Kilo Code' },
  { name: 'auggie', dir: '.augment', commandsDir: 'commands', displayName: 'Auggie CLI' },
  { name: 'codebuddy', dir: '.codebuddy', commandsDir: 'commands', displayName: 'CodeBuddy' },
  { name: 'q', dir: '.amazonq', commandsDir: 'prompts', displayName: 'Amazon Q Developer' }
];

const program = new Command();

// Display banner
displayProjectBanner();

program
  .name('musicify')
  .description(chalk.cyan('Musicify - AI 驱动的歌词创作工具'))
  .version(version);

// /init - 初始化项目(支持13个AI助手)
program
  .command('init')
  .argument('[name]', '项目名称')
  .option('--here', '在当前目录初始化')
  .option('--ai <type>', '选择 AI 助手')
  .description('初始化Musicify项目(生成AI配置)')
  .action(async (name, options) => {
    // 交互式选择
    const shouldShowInteractive = isInteractive() && !options.ai;

    let selectedAI = 'claude';
    let selectedScriptType = 'sh';
    let selectedType = '流行';

    if (shouldShowInteractive) {
      // 显示欢迎横幅
      displayProjectBanner();

      // [1/3] 选择 AI 助手
      displayStep(1, 3, '选择 AI 助手');
      selectedAI = await selectAIAssistant(AI_CONFIGS);
      console.log('');

      // [2/3] 选择歌曲类型
      displayStep(2, 3, '选择歌曲类型');
      selectedType = await selectSongType();
      console.log('');

      // [3/3] 选择脚本类型
      displayStep(3, 3, '选择脚本类型');
      selectedScriptType = await selectBashScriptType();
      console.log('');
    } else if (options.ai) {
      selectedAI = options.ai;
    }

    const spinner = ora('正在初始化Musicify项目...').start();

    try {
      // 确定项目路径
      let projectPath: string;
      if (options.here) {
        projectPath = process.cwd();
        name = path.basename(projectPath);
      } else {
        if (!name) {
          spinner.fail('请提供项目名称或使用 --here 参数');
          process.exit(1);
        }
        projectPath = path.join(process.cwd(), name);
        if (await fs.pathExists(projectPath)) {
          spinner.fail(`项目目录 "${name}" 已存在`);
          process.exit(1);
        }
        await fs.ensureDir(projectPath);
      }

      // 获取选中的AI配置
      const aiConfig = AI_CONFIGS.find(c => c.name === selectedAI);
      if (!aiConfig) {
        spinner.fail(`不支持的AI助手: ${selectedAI}`);
        process.exit(1);
      }

      // 创建基础项目结构
      const dirs = [
        '.musicify',
        `${aiConfig.dir}/${aiConfig.commandsDir}`
      ];

      for (const dir of dirs) {
        await fs.ensureDir(path.join(projectPath, dir));
      }

      // 创建项目配置文件
      const config = {
        name: name,
        type: 'musicify-project',
        ai: selectedAI,
        scriptType: selectedScriptType,
        defaultType: selectedType,
        created: new Date().toISOString(),
        version: '0.1.0'
      };
      await fs.writeJson(path.join(projectPath, '.musicify', 'config.json'), config, { spaces: 2 });

      // 从npm包复制模板和脚本到项目
      const packageRoot = path.resolve(__dirname, '..');

      // 根据选择的脚本类型复制对应脚本
      const scriptsSubDir = selectedScriptType === 'ps1' ? 'powershell' : 'bash';
      const scriptsSource = path.join(packageRoot, 'scripts', scriptsSubDir);
      const scriptsTarget = path.join(projectPath, 'scripts', scriptsSubDir);

      if (await fs.pathExists(scriptsSource)) {
        await fs.copy(scriptsSource, scriptsTarget);

        // 设置bash脚本执行权限
        if (selectedScriptType === 'sh') {
          const bashFiles = await fs.readdir(scriptsTarget);
          for (const file of bashFiles) {
            if (file.endsWith('.sh')) {
              const filePath = path.join(scriptsTarget, file);
              await fs.chmod(filePath, 0o755);
            }
          }
        }
      }

      // 复制templates到项目
      const templatesSource = path.join(packageRoot, 'templates');
      const templatesTarget = path.join(projectPath, 'templates');
      if (await fs.pathExists(templatesSource)) {
        await fs.copy(templatesSource, templatesTarget);
      }

      // 生成AI配置文件（直接复制模板文件）
      const commandFiles = await fs.readdir(path.join(packageRoot, 'templates', 'commands'));

      for (const file of commandFiles) {
        if (file.endsWith('.md')) {
          const sourcePath = path.join(packageRoot, 'templates', 'commands', file);
          const targetPath = path.join(projectPath, aiConfig.dir, aiConfig.commandsDir, file);
          await fs.copy(sourcePath, targetPath);
        }
      }

      // 创建README
      const readme = `# ${name}

使用 Musicify 创作的${selectedType}歌词项目

## 配置

- **AI 助手**: ${aiConfig.displayName}
- **歌曲类型**: ${selectedType}
- **脚本类型**: ${selectedScriptType === 'sh' ? 'POSIX Shell (macOS/Linux)' : 'PowerShell (Windows)'}

## 创作流程

使用 Slash Commands 完成歌词创作：

\`\`\`bash
/spec         # 1. 定义歌曲规格（类型、时长、风格、受众）
/theme        # 2. 构思核心主题（想表达什么）
/mood         # 3. 定位情绪氛围（温暖/激昂/治愈等）
/structure    # 4. 设计歌曲结构（Verse/Chorus/Bridge）
/lyrics       # 5. 创作完整歌词（三种模式）
/rhyme        # 6. 押韵检查和优化
/polish       # 7. 润色优化歌词
/melody-hint  # 8. 生成旋律提示
\`\`\`

## 三种创作模式

### 教练模式 (Coach)
\`\`\`bash
/lyrics --mode coach
\`\`\`
AI 引导你思考，逐段创作，100% 原创

### 快速模式 (Express)
\`\`\`bash
/lyrics --mode express
\`\`\`
AI 直接生成完整歌词，快速迭代

### 混合模式 (Hybrid)
\`\`\`bash
/lyrics --mode hybrid
\`\`\`
AI 生成框架，你填充细节，平衡效率与原创

## 项目结构

- \`spec.json\` - 歌曲规格配置
- \`theme.md\` - 主题构思
- \`mood.json\` - 情绪定位
- \`structure.json\` - 歌曲结构
- \`lyrics.md\` - 完整歌词
- \`scripts/${scriptsSubDir}/\` - ${selectedScriptType === 'sh' ? 'Bash' : 'PowerShell'}脚本
- \`templates/\` - AI提示词模板
- \`${aiConfig.dir}/\` - ${aiConfig.displayName}配置

## 更多命令

\`\`\`bash
/analyze     # 歌词质量分析
/rhyme       # 押韵检查
/polish      # 润色优化
/export      # 导出不同格式
\`\`\`

## 文档

查看 [Musicify文档](https://github.com/wordflowlab/musicify)
`;

      await fs.writeFile(path.join(projectPath, 'README.md'), readme);

      spinner.succeed(`项目 "${name}" 初始化成功!`);

      console.log('');
      displayInfo('下一步:');
      if (!options.here) {
        console.log(`  • cd ${name}`);
      }
      console.log(`  • 运行 /spec 定义歌曲规格`);
      console.log(`  • 运行 /theme 开始构思主题`);

    } catch (error) {
      spinner.fail('初始化项目失败');
      console.error(error);
      process.exit(1);
    }
  });

// Helper function to execute command with template
async function executeCommandWithTemplate(
  scriptName: string,
  templateName: string,
  args: string[] = []
) {
  try {
    const result = await executeBashScript(scriptName, args);

    if (result.status === 'success' || result.status === 'info') {
      displaySuccess(`项目: ${result.project_name || ''}`);

      // Read and display command template
      const templatePath = `templates/commands/${templateName}.md`;
      if (await fs.pathExists(templatePath)) {
        const { metadata, content } = await parseCommandTemplate(templatePath);
        console.log('\n' + chalk.dim('─'.repeat(50)));
        console.log(content);
        console.log(chalk.dim('─'.repeat(50)) + '\n');

        // Display script output context for AI
        console.log(chalk.dim('## 脚本输出信息\n'));
        console.log('```json');
        console.log(JSON.stringify(result, null, 2));
        console.log('```');
      }
    } else {
      displayError(result.message || '发生未知错误');
      process.exit(1);
    }
  } catch (error) {
    displayError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Helper function to execute skill (Claude Code only)
async function executeSkill(
  commandName: string,
  args: string[] = []
) {
  try {
    // 加载 skill
    const skill = await loadSkill(commandName);
    const context = createSkillContext(commandName, args, skill);

    // 执行相关脚本（如果存在）
    let result: any = { status: 'info', message: `Skill ${commandName} loaded` };

    try {
      result = await executeBashScript(commandName, args);
    } catch (scriptError) {
      // Skill 可以不依赖脚本运行
      console.log(chalk.yellow('⚠️ No script found, using skill-only mode'));
    }

    if (result.status === 'success' || result.status === 'info') {
      displaySuccess(`项目: ${result.project_name || 'Skill Mode'}`);

      // 显示 skill 内容（增强版体验）
      console.log('\n' + chalk.bold.cyan('🚀 Claude Code Skill Mode'));
      console.log(chalk.dim('─'.repeat(50)));
      console.log(skill.content);
      console.log(chalk.dim('─'.repeat(50)) + '\n');

      // 显示资源信息（如果有）
      if (skill.resources.size > 0) {
        console.log(chalk.bold.yellow('📚 Available Resources:'));
        for (const [name, resource] of skill.resources) {
          console.log(chalk.dim(`  • ${name} (${resource.type})`));
        }
        console.log('');
      }

      // 显示脚本输出信息
      if (result.project_name) {
        console.log(chalk.dim('## 脚本输出信息\n'));
        console.log('```json');
        console.log(JSON.stringify(result, null, 2));
        console.log('```');
      }

      // 显示 skill 元数据
      console.log(chalk.dim('\n## Skill 信息\n'));
      console.log('```json');
      console.log(JSON.stringify({
        name: skill.metadata.name,
        description: skill.metadata.description,
        category: skill.metadata.category,
        version: skill.metadata.version,
        resources: skill.metadata.resources || []
      }, null, 2));
      console.log('```');

    } else {
      displayError(result.message || '发生未知错误');
      process.exit(1);
    }
  } catch (error) {
    displayError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// /spec - 定义歌曲规格
program
  .command('spec')
  .description('定义/更新歌曲规格')
  .argument('[project]', '项目名称(可选)')
  .action(async (project?: string) => {
    const args = project ? [project] : [];

    // 双轨执行逻辑
    if (isClaudeCode() && await skillExists('spec')) {
      await executeSkill('spec', args);
    } else {
      await executeCommandWithTemplate('spec', 'spec', args);
    }
  });

// /theme - 主题构思
program
  .command('theme')
  .description('主题构思(教练模式)')
  .argument('[project]', '项目名称(可选)')
  .action(async (project?: string) => {
    const args = project ? [project] : [];

    // 双轨执行逻辑
    if (isClaudeCode() && await skillExists('theme')) {
      await executeSkill('theme', args);
    } else {
      await executeCommandWithTemplate('theme', 'theme', args);
    }
  });

// /mood - 情绪定位
program
  .command('mood')
  .description('情绪氛围定位')
  .argument('[project]', '项目名称(可选)')
  .action(async (project?: string) => {
    const args = project ? [project] : [];
    await executeCommandWithTemplate('mood', 'mood', args);
  });

// /structure - 歌曲结构设计
program
  .command('structure')
  .description('设计歌曲结构')
  .argument('[project]', '项目名称(可选)')
  .action(async (project?: string) => {
    const args = project ? [project] : [];
    await executeCommandWithTemplate('structure', 'structure', args);
  });

// /lyrics - 歌词创作
program
  .command('lyrics')
  .description('创作歌词(支持三种模式)')
  .option('--mode <mode>', '模式(coach/express/hybrid)', 'coach')
  .option('--project <name>', '项目名称')
  .action(async (options) => {
    try {
      const args = [];
      if (options.project) {
        args.push('--project', options.project);
      }
      if (options.mode) {
        args.push('--mode', options.mode);
      }

      // 双轨执行逻辑
      if (isClaudeCode() && await skillExists('lyrics')) {
        await executeSkill('lyrics', args);
      } else {
        // 原有模板系统逻辑
        const result = await executeBashScript('lyrics', args);

        if (result.status === 'success') {
          displaySuccess(`项目: ${result.project_name}`);

          // 根据模式选择模板
          let templateName = 'lyrics-coach';
          if (options.mode === 'express') {
            templateName = 'lyrics-express';
          } else if (options.mode === 'hybrid') {
            templateName = 'lyrics-hybrid';
          }

          const templatePath = `templates/commands/${templateName}.md`;
          if (await fs.pathExists(templatePath)) {
            const { metadata, content } = await parseCommandTemplate(templatePath);
            console.log('\n' + chalk.dim('─'.repeat(50)));
            console.log(content);
            console.log(chalk.dim('─'.repeat(50)) + '\n');

            console.log(chalk.dim('## 脚本输出信息\n'));
            console.log('```json');
            console.log(JSON.stringify(result, null, 2));
            console.log('```');
          }
        } else {
          displayError(result.message || '发生未知错误');
          process.exit(1);
        }
      }
    } catch (error) {
      displayError(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// /fill - 填充混合模式框架
program
  .command('fill')
  .description('填充混合模式歌词框架')
  .option('--project <name>', '项目名称')
  .action(async (options) => {
    const args = options.project ? ['--project', options.project] : [];
    await executeCommandWithTemplate('fill', 'fill', args);
  });

// /rhyme - 押韵检查
program
  .command('rhyme')
  .description('押韵检查和优化')
  .option('--project <name>', '项目名称')
  .action(async (options) => {
    const args = options.project ? ['--project', options.project] : [];
    await executeCommandWithTemplate('rhyme', 'rhyme', args);
  });

// /polish - 歌词润色
program
  .command('polish')
  .description('歌词润色优化')
  .option('--focus <type>', '润色重点(wording/imagery/emotion/all)', 'all')
  .option('--project <name>', '项目名称')
  .action(async (options) => {
    const args = [];
    if (options.project) {
      args.push('--project', options.project);
    }
    if (options.focus) {
      args.push('--focus', options.focus);
    }
    await executeCommandWithTemplate('polish', 'polish', args);
  });

// /melody-hint - 旋律提示
program
  .command('melody-hint')
  .description('生成旋律提示')
  .option('--project <name>', '项目名称')
  .action(async (options) => {
    const args = options.project ? ['--project', options.project] : [];
    await executeCommandWithTemplate('melody-hint', 'melody-hint', args);
  });

// /export - 导出
program
  .command('export')
  .description('导出歌词')
  .option('--format <type>', '导出格式(txt/pdf/md)', 'txt')
  .option('--project <name>', '项目名称')
  .action(async (options) => {
    const args = [];
    if (options.project) {
      args.push('--project', options.project);
    }
    if (options.format) {
      args.push('--format', options.format);
    }

    // 双轨执行逻辑
    if (isClaudeCode() && await skillExists('export')) {
      await executeSkill('export', args);
    } else {
      await executeCommandWithTemplate('export', 'export', args);
    }
  });

// Help command
program
  .command('help')
  .description('显示帮助信息')
  .action(() => {
    console.log(chalk.bold('\nMusicify - AI 驱动的歌词创作工具\n'));
    console.log(chalk.cyan('📋 项目管理:'));
    console.log('  musicify init <项目名>           创建新项目');
    console.log('');
    console.log(chalk.cyan('✍️ 歌词创作流程:'));
    console.log('  musicify spec                   定义歌曲规格');
    console.log('  musicify theme                  主题构思');
    console.log('  musicify mood                   情绪定位');
    console.log('  musicify structure              歌曲结构设计');
    console.log('  musicify lyrics --mode coach    歌词创作(教练模式)');
    console.log('  musicify lyrics --mode express  歌词创作(快速模式)');
    console.log('  musicify lyrics --mode hybrid   歌词创作(混合模式)');
    console.log('  musicify fill                   填充混合模式');
    console.log('  musicify rhyme                  押韵检查');
    console.log('  musicify polish                 润色优化');
    console.log('  musicify melody-hint            旋律提示');
    console.log('');
    console.log(chalk.cyan('📤 导出:'));
    console.log('  musicify export --format txt    导出歌词');
    console.log('');
  });

// Parse arguments
program.parse();

