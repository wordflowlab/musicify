/**
 * Interactive UI utilities for CLI
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { AIConfig } from '../types/index.js';

/**
 * Display project banner
 */
export function displayProjectBanner(): void {
  console.log('');
  console.log(chalk.bold.cyan('╔══════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║') + '                    ' + chalk.bold.yellow('MUSICIFY') + '                         ' + chalk.bold.cyan('║'));
  console.log(chalk.bold.cyan('║') + '            ' + chalk.gray('AI 驱动的歌词创作工具') + '                ' + chalk.bold.cyan('║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════════════════════════════════╝'));
  console.log('');
}

/**
 * Display success message
 */
export function displaySuccess(message: string): void {
  console.log(chalk.green('✅ ' + message));
}

/**
 * Display error message
 */
export function displayError(message: string): void {
  console.log(chalk.red('❌ ' + message));
}

/**
 * Display info message
 */
export function displayInfo(message: string): void {
  console.log(chalk.blue('ℹ️  ' + message));
}

/**
 * Display step indicator
 */
export function displayStep(current: number, total: number, title: string): void {
  console.log(chalk.bold.cyan(`[${current}/${total}] ${title}`));
  console.log('');
}

/**
 * Check if running in interactive mode
 */
export function isInteractive(): boolean {
  return process.stdin.isTTY === true && process.stdout.isTTY === true;
}

/**
 * Check if running in Claude Code environment
 */
export function isClaudeCode(): boolean {
  // 1. 环境变量检测
  if (process.env.CLAUDE_CODE === 'true') return true;

  // 2. 命令行参数检测
  if (process.argv.some(arg => arg.includes('claude-code'))) return true;

  // 3. 全局对象检测
  if (typeof (global as any).claudeCode !== 'undefined') return true;

  return false;
}

/**
 * Check if environment supports Skills functionality
 */
export function supportsSkills(): boolean {
  return isClaudeCode() && isInteractive();
}

/**
 * Select AI assistant interactively
 */
export async function selectAIAssistant(configs: AIConfig[]): Promise<string> {
  const choices = configs.map((config, index) => ({
    name: `${index + 1}. ${config.displayName}`,
    value: config.name,
    short: config.displayName
  }));

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'ai',
      message: '选择 AI 助手:',
      choices: choices,
      default: 'claude'
    }
  ]);

  return answer.ai;
}

/**
 * Select song type interactively
 */
export async function selectSongType(): Promise<string> {
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: '选择歌曲类型:',
      choices: [
        { name: '1. 流行 - 主流流行音乐', value: '流行' },
        { name: '2. 摇滚 - 摇滚/朋克风格', value: '摇滚' },
        { name: '3. 说唱 - Hip-Hop/Rap', value: '说唱' },
        { name: '4. 民谣 - 民谣/独立音乐', value: '民谣' },
        { name: '5. 电子 - EDM/电子音乐', value: '电子' },
        { name: '6. 古风 - 中国风/古风', value: '古风' },
        { name: '7. R&B - 节奏布鲁斯', value: 'R&B' },
        { name: '8. 爵士 - 爵士乐', value: '爵士' },
        { name: '9. 乡村 - 乡村音乐', value: '乡村' },
        { name: '10. 金属 - 重金属/金属核', value: '金属' }
      ],
      default: '流行'
    }
  ]);

  return answer.type;
}

/**
 * Select bash script type (sh or ps1)
 */
export async function selectBashScriptType(): Promise<string> {
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'scriptType',
      message: '选择脚本类型:',
      choices: [
        { name: '1. Bash (macOS/Linux) - 推荐', value: 'sh' },
        { name: '2. PowerShell (Windows)', value: 'ps1' }
      ],
      default: 'sh'
    }
  ]);

  return answer.scriptType;
}

