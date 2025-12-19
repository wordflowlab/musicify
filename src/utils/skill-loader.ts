/**
 * Skill 加载和管理工具
 */

import fs from 'fs-extra';
import path from 'path';
import { parse as parseYaml } from 'yaml';
import { Skill, SkillMetadata, SkillResource, SkillContext } from '../types/index.js';

/**
 * 检查 skill 文件是否存在
 */
export async function skillExists(skillName: string): Promise<boolean> {
  const skillPath = path.join(process.cwd(), 'skills', `${skillName}.md`);
  return await fs.pathExists(skillPath);
}

/**
 * 解析 skill 文件
 */
export async function parseSkillFile(skillPath: string): Promise<{ metadata: SkillMetadata; content: string }> {
  const fileContent = await fs.readFile(skillPath, 'utf-8');

  // 分离 YAML frontmatter 和内容
  const frontmatterMatch = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    throw new Error(`Invalid skill file format: ${skillPath}`);
  }

  const [, yamlContent, markdownContent] = frontmatterMatch;
  const metadata = parseYaml(yamlContent) as SkillMetadata;

  if (!metadata.name || !metadata.description) {
    throw new Error(`Invalid skill metadata in: ${skillPath}`);
  }

  return {
    metadata,
    content: markdownContent
  };
}

/**
 * 加载 skill 资源文件
 */
export async function loadSkillResources(resourceNames: string[] = []): Promise<Map<string, SkillResource>> {
  const resourceMap = new Map<string, SkillResource>();

  for (const resourceName of resourceNames) {
    const resourcePath = path.join(process.cwd(), 'skills', 'resources', resourceName);

    if (await fs.pathExists(resourcePath)) {
      try {
        const content = await fs.readJSON(resourcePath);
        resourceMap.set(resourceName, {
          name: resourceName,
          type: 'json',
          data: content
        });
      } catch (error) {
        console.warn(`Failed to load skill resource: ${resourceName}`);
      }
    }
  }

  return resourceMap;
}

/**
 * 加载完整的 skill
 */
export async function loadSkill(skillName: string): Promise<Skill> {
  const skillPath = path.join(process.cwd(), 'skills', `${skillName}.md`);

  if (!await skillExists(skillName)) {
    throw new Error(`Skill not found: ${skillName}`);
  }

  const { metadata, content } = await parseSkillFile(skillPath);
  const resources = await loadSkillResources(metadata.resources);

  return {
    metadata,
    content,
    resources
  };
}

/**
 * 创建 skill 执行上下文
 */
export function createSkillContext(
  commandName: string,
  args: string[],
  skill: Skill
): SkillContext {
  return {
    commandName,
    args,
    metadata: skill.metadata,
    resources: skill.resources
  };
}

/**
 * 获取资源数据
 */
export function getResourceData<T = any>(
  context: SkillContext,
  resourceName: string
): T | undefined {
  const resource = context.resources.get(resourceName);
  return resource?.data as T;
}

/**
 * 列出所有可用的 skills
 */
export async function listAvailableSkills(): Promise<string[]> {
  const skillsDir = path.join(process.cwd(), 'skills');

  if (!await fs.pathExists(skillsDir)) {
    return [];
  }

  const files = await fs.readdir(skillsDir);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => path.basename(file, '.md'));
}

/**
 * 验证 skill 完整性
 */
export async function validateSkill(skillName: string): Promise<boolean> {
  try {
    const skill = await loadSkill(skillName);

    // 基本验证
    if (!skill.metadata.name || !skill.metadata.description) {
      return false;
    }

    // 验证资源文件是否存在
    if (skill.metadata.resources) {
      for (const resourceName of skill.metadata.resources) {
        const resourcePath = path.join(process.cwd(), 'skills', 'resources', resourceName);
        if (!await fs.pathExists(resourcePath)) {
          console.warn(`Missing skill resource: ${resourceName}`);
        }
      }
    }

    return true;
  } catch (error) {
    console.error(`Skill validation failed for ${skillName}:`, error);
    return false;
  }
}