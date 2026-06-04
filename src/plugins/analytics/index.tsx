import { AnalyticsConfig, PluginRuntimeConfig } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

/**
 * 访客统计插件 - TECH_PRO 深色技术风格
 */
const AnalyticsPlugin = ({ config }: Props) => {
  const analytics = config as unknown as AnalyticsConfig | undefined

  if (!analytics) {
    return (
      <div className="glass rounded-xl p-lg">
        <p className="text-text-muted font-body-md">未配置访客统计</p>
      </div>
    )
  }

  return (
    <section id="analytics" className="space-y-lg scroll-mt-24">
      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">访客统计</h2>
        <p className="font-body-md text-body-md text-text-muted">网站访问数据</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {/* 总访客 */}
        <div className="glass rounded-xl p-lg text-center group hover:border-primary/50 transition-all duration-400">
          <span className="material-symbols-outlined text-4xl text-primary mb-sm group-hover:scale-110 transition-transform">
            groups
          </span>
          <div className="font-display-lg text-3xl text-on-surface mb-xs">
            {analytics.totalVisitors.toLocaleString()}
          </div>
          <div className="font-body-md text-text-muted">总访客</div>
        </div>

        {/* 今日访客 */}
        <div className="glass rounded-xl p-lg text-center group hover:border-primary/50 transition-all duration-400">
          <span className="material-symbols-outlined text-4xl text-primary mb-sm group-hover:scale-110 transition-transform">
            today
          </span>
          <div className="font-display-lg text-3xl text-on-surface mb-xs">
            {analytics.todayVisitors.toLocaleString()}
          </div>
          <div className="font-body-md text-text-muted">今日访客</div>
        </div>

        {/* 本周访客 */}
        <div className="glass rounded-xl p-lg text-center group hover:border-primary/50 transition-all duration-400">
          <span className="material-symbols-outlined text-4xl text-primary mb-sm group-hover:scale-110 transition-transform">
            date_range
          </span>
          <div className="font-display-lg text-3xl text-on-surface mb-xs">
            {analytics.weeklyVisitors.toLocaleString()}
          </div>
          <div className="font-body-md text-text-muted">本周访客</div>
        </div>
      </div>
    </section>
  )
}

export default AnalyticsPlugin
