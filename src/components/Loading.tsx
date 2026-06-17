const Loading = () => {
  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-8 px-6 py-16 md:px-10">
      <div className="flex items-center gap-4">
        <div className="skeleton-shimmer h-12 w-12 rounded-[18px]" />
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-24 rounded-full" />
          <div className="skeleton-shimmer h-3 w-32 rounded-full" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="skeleton-shimmer h-12 w-3/4 rounded-[20px] md:w-1/2" />
        <div className="skeleton-shimmer h-4 w-full max-w-[48ch] rounded-full" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-[28px] border border-border-subtle bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(239,246,240,0.78))] p-5 shadow-[0_24px_58px_-42px_var(--color-panel-shadow)]">
          <div className="skeleton-shimmer h-16 w-full rounded-[22px]" />
          <div className="skeleton-shimmer h-12 w-full rounded-[18px]" />
          <div className="skeleton-shimmer h-12 w-full rounded-[18px]" />
          <div className="skeleton-shimmer h-12 w-full rounded-[18px]" />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-3 rounded-[28px] border border-border-subtle bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(235,241,255,0.72))] p-5 shadow-[0_24px_58px_-42px_var(--color-panel-shadow)]">
            <div className="skeleton-shimmer h-24 w-full rounded-[22px]" />
            <div className="skeleton-shimmer h-5 w-3/4 rounded-full" />
            <div className="skeleton-shimmer h-4 w-1/2 rounded-full" />
          </div>
          <div className="space-y-3 rounded-[28px] border border-border-subtle bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(245,230,225,0.72))] p-5 shadow-[0_24px_58px_-42px_var(--color-panel-shadow)]">
            <div className="skeleton-shimmer h-24 w-full rounded-[22px]" />
            <div className="skeleton-shimmer h-5 w-3/4 rounded-full" />
            <div className="skeleton-shimmer h-4 w-1/2 rounded-full" />
          </div>
          <div className="space-y-3 rounded-[28px] border border-border-subtle bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(233,241,235,0.78))] p-5 shadow-[0_24px_58px_-42px_var(--color-panel-shadow)]">
            <div className="skeleton-shimmer h-24 w-full rounded-[22px]" />
            <div className="skeleton-shimmer h-5 w-3/4 rounded-full" />
            <div className="skeleton-shimmer h-4 w-1/2 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loading
