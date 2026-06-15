import { useState, useCallback } from 'react'
import { PluginRuntimeConfig } from '@core/types'
import { GalleryItem } from './types'
import Lightbox from './Lightbox'

// 示例数据 — 后续可迁移到 public/config/gallery.config.json
const DEMO_ITEMS: GalleryItem[] = [
  { id: 'g1', src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20architecture%20concrete%20building%20blue%20sky&image_size=landscape_16_9', alt: '极简建筑', category: '摄影', width: 1600, height: 900, caption: '混凝土与天空的对话' },
  { id: 'g2', src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dark%20moody%20forest%20path%20fog&image_size=portrait_4_3', alt: '森林小径', category: '摄影', width: 1200, height: 1600, caption: '雾中林道' },
  { id: 'g3', src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20geometric%20pattern%20warm%20tones&image_size=square', alt: '几何图案', category: '设计', width: 1200, height: 1200 },
  { id: 'g4', src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=calm%20ocean%20sunset%20golden%20hour&image_size=landscape_16_9', alt: '海上日落', category: '摄影', width: 1600, height: 900, caption: '黄金时刻' },
  { id: 'g5', src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=typography%20poster%20design%20black%20white&image_size=portrait_4_3', alt: '字体海报', category: '设计', width: 1200, height: 1600 },
  { id: 'g6', src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=night%20city%20neon%20lights%20rain%20reflection&image_size=landscape_16_9', alt: '霓虹雨夜', category: '摄影', width: 1600, height: 900 },
]

interface Props { config?: PluginRuntimeConfig }

export default function GalleryPlugin(_props: Props) {
  const items = DEMO_ITEMS
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const categories = ['all', ...new Set(items.map((i) => i.category))]
  const filtered = activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory)

  const handleOpen = useCallback((idx: number) => setLightboxIndex(idx), [])
  const handleClose = useCallback(() => setLightboxIndex(null), [])

  return (
    <section id="gallery" className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 mb-md">
        <span className="font-label-mono text-xs uppercase text-secondary">GALLERY</span>
        <h2 className="mt-xs font-headline-md text-headline-md text-on-surface">视觉画廊</h2>
      </div>

      {/* Category filter */}
      <div className="shrink-0 flex gap-xs mb-md overflow-x-auto scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full border px-3 py-1 font-label-mono text-[10px] uppercase transition-premium ${
              activeCategory === cat
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border-subtle text-text-muted hover:border-primary/30 hover:text-on-surface'
            }`}
          >
            {cat === 'all' ? '全部' : cat}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-sm">
          {filtered.map((item, idx) => {
            const aspectRatio = item.width / item.height
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleOpen(idx)}
                className="mb-sm w-full break-inside-avoid group relative overflow-hidden rounded-[2px] border border-border-subtle transition-premium hover:border-primary/30 hover:shadow-sm"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  className="w-full object-cover transition-premium group-hover:scale-[1.02]"
                  style={{ aspectRatio: `${aspectRatio}` }}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-premium flex items-end">
                  <div className="p-sm opacity-0 group-hover:opacity-100 transition-premium">
                    <p className="font-body-md text-xs text-white font-semibold">{item.alt}</p>
                    {item.caption && (
                      <p className="font-body-md text-[10px] text-white/70">{item.caption}</p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-48">
            <span className="font-body-md text-sm text-text-muted">暂无图片</span>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox items={filtered} initialIndex={lightboxIndex} onClose={handleClose} />
      )}
    </section>
  )
}
