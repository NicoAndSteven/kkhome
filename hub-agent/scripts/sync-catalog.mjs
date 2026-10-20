/**
 * 从 kkhome 主站的 plugins.config.json 同步 AI 工具目录到本 Agent 的数据目录。
 *
 * 产出：
 *   data/tool-catalog.json  - 结构化目录，供 /api/catalog 使用
 *   data/tool-catalog.md    - 纯文本目录，供 Agent 用 Grep / Read 检索
 *
 * 用法：npm run sync:catalog
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SOURCE = path.resolve(__dirname, '..', '..', 'public', 'config', 'plugins.config.json');
const OUT_DIR = path.resolve(__dirname, '..', 'data');

function fail(message) {
  console.error(`[sync-catalog] ${message}`);
  process.exit(1);
}

if (!fs.existsSync(SOURCE)) {
  fail(`找不到主站配置：${SOURCE}\n请先确认 kkhome 仓库结构未变动。`);
}

const raw = JSON.parse(fs.readFileSync(SOURCE, 'utf-8'));
const nav = (raw.plugins || []).find((p) => p.id === 'ai-navigator');

if (!nav) {
  fail('plugins.config.json 中不存在 ai-navigator 插件配置。');
}

const categories = nav.config?.categories ?? [];
const tools = nav.config?.tools ?? [];
const categoryTitle = new Map(categories.map((c) => [c.id, c.title]));

// 只保留推荐需要的字段，避免把采集源信息塞进上下文。
const clean = tools
  .filter((t) => t && t.id && t.title && t.url)
  .map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category ?? 'uncategorized',
    categoryTitle: categoryTitle.get(t.category) ?? t.category ?? '未分类',
    url: t.url,
    description: (t.description ?? '').trim(),
    tags: Array.isArray(t.tags) ? t.tags : [],
    aliases: Array.isArray(t.aliases) ? t.aliases : [],
    featured: Boolean(t.featured),
  }))
  .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));

if (clean.length === 0) {
  fail('工具目录为空，拒绝覆盖已有产物。');
}

const counts = new Map();
for (const t of clean) counts.set(t.category, (counts.get(t.category) ?? 0) + 1);

const payload = {
  generatedAt: new Date().toISOString(),
  source: 'public/config/plugins.config.json#ai-navigator',
  total: clean.length,
  categories: categories
    .filter((c) => c.id !== 'all')
    .map((c) => ({ id: c.id, title: c.title, count: counts.get(c.id) ?? 0 }))
    .filter((c) => c.count > 0),
  tools: clean,
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'tool-catalog.json'), JSON.stringify(payload, null, 2), 'utf-8');

// 生成给 Agent 读取的纯文本目录
const lines = [
  '# kkhome AI 工具目录',
  '',
  `> 由 scripts/sync-catalog.mjs 于 ${payload.generatedAt} 从主站配置生成，请勿手工编辑。`,
  `> 共 ${payload.total} 个工具，分为 ${payload.categories.length} 个分类。`,
  '',
  '## 分类',
  '',
  ...payload.categories.map((c) => `- ${c.id}（${c.title}）：${c.count} 个`),
  '',
];

for (const category of payload.categories) {
  lines.push(`## ${category.title}（${category.id}）`, '');
  for (const t of clean.filter((x) => x.category === category.id)) {
    const tags = t.tags.length ? `｜标签：${t.tags.join('、')}` : '';
    const alias = t.aliases.length ? `｜别名：${t.aliases.join('、')}` : '';
    lines.push(`- ${t.title}｜${t.description}${tags}${alias}｜${t.url}`);
  }
  lines.push('');
}

fs.writeFileSync(path.join(OUT_DIR, 'tool-catalog.md'), lines.join('\n'), 'utf-8');

console.log(`[sync-catalog] 已同步 ${payload.total} 个工具 / ${payload.categories.length} 个分类`);
console.log(`[sync-catalog] 输出：${path.join(OUT_DIR, 'tool-catalog.json')}`);
console.log(`[sync-catalog] 输出：${path.join(OUT_DIR, 'tool-catalog.md')}`);
