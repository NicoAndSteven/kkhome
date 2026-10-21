import { useState, useEffect, useCallback } from 'react'
import { GalleryItem } from './types'
import Icon from '../../components/Icon'

interface Props {
  items: GalleryItem[]
  initialIndex: number
  onClose: () => void
}

const Lightbox = ({ items, initialIndex, onClose }: Props) => {
  const [index, setIndex] = useState(initialIndex)

  const item = items[index]

  const goNext = useCallback(() => setIndex((i) => Math.min(i + 1, items.length - 1)), [items.length])
  const goPrev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), [])

  useEffect(() => {
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, goNext, goPrev])

  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-label="图片查看器"
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-premium"
        aria-label="关闭"
      >
        <Icon name="close" className="text-xl" />
      </button>

      {/* Counter */}
      <span className="absolute top-4 left-4 font-label-mono text-xs text-white/60">
        {index + 1} / {items.length}
      </span>

      {/* Image */}
      <div
        className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.src}
          alt={item.alt}
          className="max-w-full max-h-[85vh] object-contain rounded-sm"
        />
      </div>

      {/* Caption */}
      {item.caption && (
        <p className="absolute bottom-16 left-1/2 -translate-x-1/2 font-body-md text-sm text-white/70 text-center max-w-md">
          {item.caption}
        </p>
      )}

      {/* Navigation */}
      {index > 0 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goPrev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-premium"
          aria-label="上一张"
        >
          <Icon name="chevron_left" className="text-xl" />
        </button>
      )}
      {index < items.length - 1 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goNext() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-premium"
          aria-label="下一张"
        >
          <Icon name="chevron_right" className="text-xl" />
        </button>
      )}
    </div>
  )
}

export default Lightbox
