/**
 * 骨架屏加载组件 - shimmer 动画
 */
const Loading = () => {
  return (
    <div className="w-full p-6 md:p-12 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="skeleton-shimmer h-4 w-24 rounded" />
        <div className="skeleton-shimmer h-4 w-16 rounded" />
      </div>

      {/* Title skeleton */}
      <div className="skeleton-shimmer h-10 w-3/4 md:w-1/2 rounded" />

      {/* Content grid skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-3">
          <div className="skeleton-shimmer h-32 w-full rounded" />
          <div className="skeleton-shimmer h-4 w-3/4 rounded" />
          <div className="skeleton-shimmer h-4 w-1/2 rounded" />
        </div>
        <div className="space-y-3">
          <div className="skeleton-shimmer h-32 w-full rounded" />
          <div className="skeleton-shimmer h-4 w-3/4 rounded" />
          <div className="skeleton-shimmer h-4 w-1/2 rounded" />
        </div>
        <div className="space-y-3">
          <div className="skeleton-shimmer h-32 w-full rounded" />
          <div className="skeleton-shimmer h-4 w-3/4 rounded" />
          <div className="skeleton-shimmer h-4 w-1/2 rounded" />
        </div>
      </div>

      {/* Description skeleton */}
      <div className="space-y-2">
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-5/6 rounded" />
        <div className="skeleton-shimmer h-4 w-2/3 rounded" />
      </div>
    </div>
  )
}

export default Loading
