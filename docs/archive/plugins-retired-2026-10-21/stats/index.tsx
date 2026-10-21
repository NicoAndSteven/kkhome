import { PluginRuntimeConfig, StatsConfig } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

/**
 * 统计数据插件 - TECH_PRO 深色技术风格
 */
const StatsPlugin = ({ config }: Props) => {
  const stats = config as unknown as StatsConfig | undefined

  if (!stats) {
    return (
      <div className="glass rounded-xl p-lg">
        <p className="text-text-muted font-body-md">未配置统计信息</p>
      </div>
    )
  }

  return (
    <section id="stats" className="space-y-lg scroll-mt-24">
      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">数据统计</h2>
        <p className="font-body-md text-body-md text-text-muted">我的开源贡献</p>
      </div>

      {/* GitHub 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div className="glass rounded-xl p-lg text-center">
          <span className="material-symbols-outlined text-4xl text-primary mb-sm">folder</span>
          <div className="font-display-lg text-3xl text-on-surface mb-xs">
            {stats.githubRepos}
          </div>
          <div className="font-body-md text-text-muted">GitHub 仓库</div>
        </div>

        <div className="glass rounded-xl p-lg text-center">
          <span className="material-symbols-outlined text-4xl text-primary mb-sm">commit</span>
          <div className="font-display-lg text-3xl text-on-surface mb-xs">
            {stats.githubContributions}
          </div>
          <div className="font-body-md text-text-muted">代码贡献</div>
        </div>
      </div>

      {/* 编程语言统计 */}
      {stats.languages && stats.languages.length > 0 && (
        <div className="glass rounded-xl p-lg">
          <h3 className="font-body-lg font-bold text-on-surface mb-md">编程语言</h3>
          <div className="space-y-md">
            {stats.languages.map((lang, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-xs">
                  <span className="font-body-md text-on-surface">{lang.name}</span>
                  <span className="font-label-mono text-xs text-text-muted">
                    {lang.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-400"
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: lang.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default StatsPlugin
