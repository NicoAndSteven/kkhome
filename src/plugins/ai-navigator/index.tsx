import { useMemo, useState } from 'react'
import { Icon } from '@components'
import { PluginRuntimeConfig } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

interface AiCategory {
  id: string
  title: string
  description?: string
  icon?: string
}

interface AiTool {
  id: string
  title: string
  category: string
  url: string
  description: string
  tags?: string[]
  aliases?: string[]
  icon?: string
  featured?: boolean
  sourceTitle?: string
  sourceUrl?: string
  sourceCategory?: string
}

const fallbackIntentPrompts = ['文件转换器', 'PDF 转 Word', '图片压缩', '视频转音频', '电脑录屏', 'PPT 模板']

const fallbackCategories: AiCategory[] = [
  { id: 'all', title: '全部', icon: 'travel_explore' },
  { id: 'convert', title: '转换', icon: 'swap_horiz' },
  { id: 'image', title: '图片', icon: 'auto_awesome' },
  { id: 'video-audio', title: '视频', icon: 'smart_display' },
  { id: 'document', title: '文档', icon: 'article' },
  { id: 'design-assets', title: '素材', icon: 'bookmark' },
  { id: 'software-system', title: '软件', icon: 'terminal' },
  { id: 'knowledge', title: '学习', icon: 'rate_review' },
  { id: 'ai', title: '其他', icon: 'auto_awesome' },
]

const fallbackTools: AiTool[] = [
  {
    id: 'convertio',
    title: 'Convertio',
    category: 'convert',
    url: 'https://convertio.co/zh/',
    description: '用于在线转换文件、PDF、Word、Excel 等常见格式。',
    tags: ['工具', '文件转换', 'PDF'],
    aliases: ['文件转换器', '格式转换', 'PDF 转 Word'],
    icon: 'swap_horiz',
    featured: true,
  },
  {
    id: 'file-converter-local',
    title: 'File Converter',
    category: 'convert',
    url: 'https://file-converter.io/',
    description: '用于在本地批量转换文件格式，适合不想上传文件的场景。',
    tags: ['软件', '文件转换'],
    aliases: ['文件转换器', '本地转换', '格式转换'],
    icon: 'swap_horiz',
    featured: true,
  },
  {
    id: 'tinypng',
    title: 'TinyPNG',
    category: 'image',
    url: 'https://tinypng.com/',
    description: '用于压缩 PNG、JPG、GIF 等图片体积。',
    tags: ['图片压缩', 'PNG', 'GIF'],
    aliases: ['图片压缩', '批量压缩', 'png 压缩'],
    icon: 'auto_awesome',
    featured: true,
  },
  {
    id: 'freeconvert-video-mp3',
    title: 'FreeConvert Video to MP3',
    category: 'convert',
    url: 'https://www.freeconvert.com/zh/convert/video-to-mp3',
    description: '用于把视频转换或提取为 MP3 音频。',
    tags: ['视频转音频', 'MP3'],
    aliases: ['视频转音频', 'mp4转mp3', '音频提取'],
    icon: 'swap_horiz',
    featured: true,
  },
  {
    id: 'obs',
    title: 'OBS',
    category: 'video-audio',
    url: 'https://obsproject.com/',
    description: '用于电脑屏幕录制、直播和视频采集。',
    tags: ['录屏', '屏幕录制'],
    aliases: ['电脑录屏', '屏幕录制'],
    icon: 'smart_display',
    featured: true,
  },
]

const getHostname = (url: string) => {
  try {
    return new globalThis.URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

const fieldIncludes = (field: string | undefined, query: string) =>
  field?.toLowerCase().includes(query) ?? false

const listIncludes = (items: string[] | undefined, query: string) =>
  items?.some((item) => item.toLowerCase().includes(query)) ?? false

const scoreTool = (tool: AiTool, query: string) => {
  if (!query) return Number(tool.featured)
  const title = tool.title.toLowerCase()
  let score = 0
  if (title === query) score += 100
  else if (title.startsWith(query)) score += 80
  else if (title.includes(query)) score += 55
  if (listIncludes(tool.aliases, query)) score += 45
  if (listIncludes(tool.tags, query)) score += 35
  if (fieldIncludes(tool.description, query)) score += 18
  if (fieldIncludes(tool.category, query)) score += 8
  if (fieldIncludes(getHostname(tool.url), query)) score += 5
  if (tool.featured && score > 0) score += 4
  return score
}

const AiNavigatorPlugin = ({ config }: Props) => {
  const categories = useMemo(
    () => (Array.isArray(config?.categories) ? config.categories : fallbackCategories) as AiCategory[],
    [config?.categories],
  )
  const tools = useMemo(
    () => (Array.isArray(config?.tools) ? config.tools : fallbackTools) as AiTool[],
    [config?.tools],
  )
  const intentPrompts = useMemo(
    () => (Array.isArray(config?.intentPrompts) ? config.intentPrompts : fallbackIntentPrompts) as string[],
    [config?.intentPrompts],
  )
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? 'all')
  const normalizedQuery = query.trim().toLowerCase()

  const rankedTools = tools
    .filter((tool) => activeCategory === 'all' || tool.category === activeCategory)
    .map((tool) => ({ tool, score: scoreTool(tool, normalizedQuery) }))
    .filter((entry) => !normalizedQuery || entry.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.tool.featured) - Number(a.tool.featured) || a.tool.title.localeCompare(b.tool.title))
  const filteredTools = rankedTools.map((entry) => entry.tool)
  const visibleTools = query.trim() || activeCategory !== 'all' ? filteredTools : filteredTools.slice(0, 48)

  return (
    <section id="ai-tools" className="flex flex-col gap-4 px-5 py-5 md:px-7 md:py-6">

      {/* ── Search Hero ── */}
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="font-label-mono text-[9px] uppercase tracking-[0.32em] text-primary">工具导向</span>
            <h2 className="mt-1 font-headline-md text-[clamp(1.6rem,3vw,2.6rem)] font-bold leading-[1] tracking-[-0.05em] text-on-surface">
              找工具
            </h2>
          </div>
          <span className="mb-0.5 font-label-mono text-[10px] text-text-muted">{tools.length} 已收录</span>
        </div>

        {/* Search input */}
        <div className="group relative">
          <Icon
            name="search"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-text-muted transition-colors duration-200 group-focus-within:text-primary"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索工具、标签或使用场景…"
            aria-label="搜索目标工具"
            className="w-full rounded-2xl border border-border-subtle bg-surface-card py-3 pl-11 pr-4 text-[15px] text-on-surface outline-none transition-all duration-200 placeholder:text-text-muted focus:border-primary/40 focus:bg-surface focus:shadow-[0_0_0_3px_rgba(8,145,178,0.1)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-muted transition-colors hover:text-on-surface"
              aria-label="清空搜索"
            >
              <Icon name="close" className="text-sm" />
            </button>
          )}
        </div>

        {/* Intent chips */}
        <div className="flex flex-wrap gap-1.5">
          {intentPrompts.slice(0, 8).map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => { setQuery(prompt); setActiveCategory('all') }}
              className={`rounded-full border px-2.5 py-1 font-label-mono text-[10px] uppercase tracking-[0.14em] transition-all duration-150 ${
                query === prompt
                  ? 'border-primary/30 bg-primary/8 text-primary'
                  : 'border-border-subtle text-text-muted hover:border-primary/20 hover:text-on-surface'
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category Segmented Control ── */}
      <div className="scrollbar-none overflow-x-auto">
        <div className="flex min-w-max gap-1 rounded-2xl border border-border-subtle bg-surface-card p-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 font-label-mono text-[10px] uppercase tracking-[0.16em] transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-primary text-white shadow-[0_4px_14px_-6px_rgba(8,145,178,0.45)]'
                  : 'text-text-muted hover:bg-surface hover:text-on-surface'
              }`}
            >
              <Icon name={cat.icon ?? 'bookmark'} className="text-sm" />
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="flex items-center gap-2">
        <span className="font-label-mono text-[10px] text-text-muted">
          {filteredTools.length} 个结果
        </span>
        {visibleTools.length < filteredTools.length && (
          <>
            <span className="h-3 w-px bg-border-subtle" />
            <span className="font-label-mono text-[10px] text-text-muted">输入关键词继续收窄</span>
          </>
        )}
      </div>

      {/* ── Tool Grid ── */}
      <div className="ai-results-scroll grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
        {visibleTools.map((tool, i) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => window.open(tool.url, '_blank', 'noopener,noreferrer')}
            className="group rounded-2xl border border-border-subtle bg-surface p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_8px_28px_-12px_rgba(8,145,178,0.15)]"
            style={{ animation: `content-rise 400ms cubic-bezier(0.16,1,0.3,1) ${i * 25}ms both` }}
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary transition-colors duration-200 group-hover:bg-primary/12"
                aria-hidden="true"
              >
                <Icon name={tool.icon ?? 'link'} className="text-base" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold leading-tight text-on-surface">{tool.title}</span>
                  {tool.featured && (
                    <span className="shrink-0 rounded-full bg-primary/8 px-1.5 py-0.5 font-label-mono text-[9px] uppercase tracking-[0.1em] text-primary">
                      精选
                    </span>
                  )}
                </div>
                <span className="mt-0.5 block font-label-mono text-[9px] uppercase tracking-[0.14em] text-primary/60">
                  {getHostname(tool.url) || tool.sourceCategory || 'external'}
                </span>
                <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-text-muted">
                  {tool.description}
                </p>
              </div>
            </div>
            {tool.tags && tool.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {tool.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border-subtle px-2 py-0.5 font-label-mono text-[9px] uppercase tracking-[0.1em] text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}

        {visibleTools.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center">
            <span className="rounded-2xl bg-surface-card p-4 text-text-muted">
              <Icon name="search_off" className="text-3xl" />
            </span>
            <p className="font-label-mono text-[11px] uppercase tracking-[0.2em] text-text-muted">
              没有匹配结果
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default AiNavigatorPlugin
