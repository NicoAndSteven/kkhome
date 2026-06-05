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
  { id: 'convert', title: '转换工具', icon: 'swap_horiz' },
  { id: 'image', title: '图片处理', icon: 'auto_awesome' },
  { id: 'video-audio', title: '视频音频', icon: 'smart_display' },
  { id: 'document', title: '文档办公', icon: 'article' },
  { id: 'design-assets', title: '素材设计', icon: 'bookmark' },
  { id: 'software-system', title: '软件系统', icon: 'terminal' },
  { id: 'knowledge', title: '知识学习', icon: 'rate_review' },
  { id: 'ai', title: 'AI 相关', icon: 'auto_awesome' },
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
    sourceTitle: '文件格式转换#Pdf#Word#Excel',
    sourceUrl: 'https://www.30aitool.com/924.html',
    sourceCategory: '工具',
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
    sourceTitle: '格式转换本地软件大合集',
    sourceUrl: 'https://www.30aitool.com/999.html',
    sourceCategory: '软件',
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
    sourceTitle: '图片压缩#png压缩#批量压缩#GIF压缩',
    sourceUrl: 'https://www.30aitool.com/376.html',
    sourceCategory: '工具',
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
    sourceTitle: '视频转音频#转mp3#mp4转mp3',
    sourceUrl: 'https://www.30aitool.com/3817.html',
    sourceCategory: '工具',
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
    sourceTitle: '电脑录屏#屏幕录制',
    sourceUrl: 'https://www.30aitool.com/832.html',
    sourceCategory: '工具',
  },
]

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

  const filteredTools = tools
    .filter((tool) => activeCategory === 'all' || tool.category === activeCategory)
    .filter((tool) => {
      const normalizedQuery = query.trim().toLowerCase()
      if (!normalizedQuery) return true

      return [
        tool.title,
        tool.id,
        tool.url,
        tool.description,
        tool.category,
        tool.sourceTitle ?? '',
        tool.sourceCategory ?? '',
        ...(tool.tags ?? []),
        ...(tool.aliases ?? []),
      ].join(' ').toLowerCase().includes(normalizedQuery)
    })
    .sort((a, b) => Number(b.featured) - Number(a.featured))
  const visibleTools = query.trim() || activeCategory !== 'all' ? filteredTools : filteredTools.slice(0, 48)

  const openTool = (tool: AiTool) => {
    window.open(tool.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="ai-tools" className="space-y-md scroll-mt-24">
      <div className="surface-panel rounded-[2px] p-md md:p-lg">
        <div className="grid gap-md md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <span className="font-label-mono text-xs uppercase text-secondary">AI navigator</span>
            <h2 className="mt-xs font-headline-md text-headline-md text-on-surface">AI 工具导航</h2>
            <p className="mt-xs font-body-md text-body-md text-text-muted">
              按目标意图检索 30aitool 收录的网站：转换、图片、视频音频、文档办公、素材、软件和知识资源。
            </p>
          </div>
          <div className="relative md:col-span-7">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索工具、标签或使用场景..."
              aria-label="搜索目标工具"
              className="surface-control w-full rounded-[2px] py-3 pl-10 pr-4 font-body-md text-body-md text-on-surface outline-none transition-premium focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="mt-sm flex items-center gap-xs overflow-x-auto whitespace-nowrap pb-1">
          <span className="shrink-0 font-label-mono text-[10px] uppercase text-text-muted">Intent</span>
          {intentPrompts.slice(0, 8).map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setQuery(prompt)
                setActiveCategory('all')
              }}
              className="shrink-0 rounded border border-border-subtle px-2 py-1 font-body-md text-xs text-text-muted transition-premium hover:border-primary/35 hover:text-on-surface"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="mt-md flex gap-xs overflow-x-auto whitespace-nowrap pb-1">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`inline-flex shrink-0 items-center gap-xs rounded-[2px] px-sm py-2 font-body-md text-sm transition-premium ${
                activeCategory === category.id
                  ? 'bg-primary/12 text-primary'
                  : 'text-text-muted hover:bg-surface-card/70 hover:text-on-surface'
              }`}
            >
              <Icon name={category.icon ?? 'bookmark'} className="text-base" />
              {category.title}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-sm">
        <span className="font-label-mono text-xs uppercase text-text-muted">
          {filteredTools.length} matched / {tools.length} indexed
        </span>
        {visibleTools.length < filteredTools.length && (
          <span className="font-body-md text-sm text-text-muted">输入目标词可继续收窄结果</span>
        )}
      </div>

      <div className="ai-results-scroll grid gap-sm md:grid-cols-2 xl:grid-cols-3">
        {visibleTools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => openTool(tool)}
            className="surface-item group grid gap-sm rounded-[2px] p-md text-left transition-premium hover:border-primary/35 hover:bg-surface-container/80"
          >
            <div className="flex items-start justify-between gap-md">
              <div className="flex min-w-0 items-start gap-sm">
                <span className="rounded-[2px] border border-border-subtle bg-background/55 p-2 text-primary" aria-hidden="true">
                  <Icon name={tool.icon ?? 'link'} className="text-2xl" />
                </span>
                <span className="min-w-0">
                  <span className="block font-body-lg font-bold text-on-surface">{tool.title}</span>
                  <span className="mt-xs block font-body-md text-body-md text-text-muted">
                    {tool.description}
                  </span>
                </span>
              </div>
              {tool.featured && (
                <span className="rounded border border-secondary/20 bg-secondary/10 px-2 py-1 font-label-mono text-[10px] uppercase text-secondary">
                  Pick
                </span>
              )}
            </div>
            {tool.tags && tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-xs">
                {tool.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded border border-border-subtle px-2 py-1 font-label-mono text-[10px] uppercase text-text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  )
}

export default AiNavigatorPlugin
