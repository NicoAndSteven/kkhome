import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const CATALOG_JSON = path.join(PROJECT_ROOT, 'data', 'tool-catalog.json');
const CATALOG_MD = path.join(PROJECT_ROOT, 'data', 'tool-catalog.md');

export interface CatalogCategory {
  id: string;
  title: string;
  count: number;
}

export interface CatalogSummary {
  total: number;
  categories: CatalogCategory[];
  generatedAt: string | null;
  available: boolean;
}

let cache: { mtimeMs: number; summary: CatalogSummary } | null = null;

/**
 * 读取工具目录摘要（带 mtime 缓存）。
 * 目录由 `npm run sync:catalog` 从主站 plugins.config.json 生成，
 * 不存在时返回 available=false，服务端据此降级而不是伪造目录。
 */
export function getCatalogSummary(): CatalogSummary {
  if (!fs.existsSync(CATALOG_JSON)) {
    return { total: 0, categories: [], generatedAt: null, available: false };
  }

  const mtimeMs = fs.statSync(CATALOG_JSON).mtimeMs;
  if (cache && cache.mtimeMs === mtimeMs) {
    return cache.summary;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(CATALOG_JSON, 'utf-8'));
    const summary: CatalogSummary = {
      total: Number(raw.total) || 0,
      categories: Array.isArray(raw.categories) ? raw.categories : [],
      generatedAt: raw.generatedAt ?? null,
      available: true,
    };
    cache = { mtimeMs, summary };
    return summary;
  } catch (error) {
    console.error('[Catalog] 读取工具目录失败:', error);
    return { total: 0, categories: [], generatedAt: null, available: false };
  }
}

/**
 * 把「真实数据在哪、怎么用、不能做什么」追加到系统提示词后面。
 * 无论前端传来的 Agent 提示词怎么变，这块 grounding 都一定生效。
 */
export function buildSystemPrompt(basePrompt?: string): string {
  const catalog = getCatalogSummary();
  const base = (basePrompt || '').trim();

  if (!catalog.available) {
    const warning = [
      '',
      '## 重要：工具目录当前不可用',
      'data/tool-catalog.json 不存在或无法解析。请先在项目根目录运行 `npm run sync:catalog` 生成目录。',
      '在目录可用之前，不要推荐任何具体工具，请如实告知用户目录尚未同步，并说明如何生成。',
    ].join('\n');
    return `${base}${warning}`;
  }

  const categoryIndex = catalog.categories
    .map((c) => `- ${c.id}（${c.title}）：${c.count} 个`)
    .join('\n');

  const context = `

## 你可以访问的真实数据（工作目录 = 项目根目录）

- \`data/tool-catalog.md\`：全部 ${catalog.total} 个工具的纯文本清单，按分类分组，每行格式为「标题｜描述｜标签｜别名｜URL」。
- \`data/tool-catalog.json\`：同一份目录的结构化版本（含 id、分类、标签）。
- 目录生成时间：${catalog.generatedAt}

分类索引（共 ${catalog.categories.length} 个）：
${categoryIndex}

## 检索与回答规则

1. 先用 Grep 在 \`data/tool-catalog.md\` 里按关键词检索，再 Read 相关片段确认细节，禁止凭印象编造工具名、网址或功能。
2. 每条推荐必须给出：工具名、一句话用途、适合的场景、以及从目录里原样取出的官网链接。
3. 目录中没有匹配项时，直接说明「目录里暂无此类工具」，不要推荐目录外的工具充数。
4. 目录数据存在个别重复标题或泛化分类（如「其他」），发现时以实际描述和 URL 为准，必要时提醒用户目录待清洗。
5. 只读取 \`data/\` 下的目录文件，不要修改项目代码或配置。`;

  return `${base}${context}`;
}

/** 目录文件的绝对路径，供 canUseTool 做只读收敛 */
export function getCatalogPaths(): string[] {
  return [CATALOG_MD, CATALOG_JSON];
}

export { PROJECT_ROOT };
