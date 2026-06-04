import { PluginRuntimeConfig, TimelineItem } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

/**
 * 时间线插件 - TECH_PRO 深色技术风格
 */
const TimelinePlugin = ({ config }: Props) => {
  const items = (Array.isArray(config?.items) ? config.items : []) as TimelineItem[]

  const getTypeIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      education: 'school',
      work: 'work',
      achievement: 'emoji_events',
    }
    return iconMap[type] || 'schedule'
  }

  const getTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      education: 'text-blue-400',
      work: 'text-green-400',
      achievement: 'text-yellow-400',
    }
    return colorMap[type] || 'text-primary'
  }

  if (items.length === 0) {
    return (
      <div className="glass rounded-xl p-lg">
        <p className="text-text-muted font-body-md">未配置时间线信息</p>
      </div>
    )
  }

  return (
    <section id="timeline" className="space-y-lg scroll-mt-24">
      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">职业历程</h2>
        <p className="font-body-md text-body-md text-text-muted">我的成长与经历</p>
      </div>

      <div className="relative">
        {/* 时间线竖线 */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border-subtle transform md:-translate-x-1/2" />

        <div className="space-y-lg">
          {items.map((item, index) => {
            const isLeft = index % 2 === 0

            return (
              <div
                key={item.id}
                className={`relative flex items-start gap-md ${
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* 时间节点 */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full glass flex items-center justify-center ${getTypeColor(
                      item.type
                    )}`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {item.icon || getTypeIcon(item.type)}
                    </span>
                  </div>
                </div>

                {/* 内容卡片 */}
                <div
                  className={`flex-1 glass rounded-xl p-lg ${
                    isLeft ? 'md:text-left' : 'md:text-right'
                  }`}
                >
                  {/* 日期 */}
                  <span className="font-label-mono text-xs text-primary mb-xs block">
                    {item.date}
                  </span>

                  {/* 标题 */}
                  <h3 className="font-body-lg font-bold text-on-surface mb-xs">{item.title}</h3>

                  {/* 描述 */}
                  <p className="font-body-md text-body-md text-text-muted">{item.description}</p>
                </div>

                {/* 空白占位 */}
                <div className="hidden md:block flex-1" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default TimelinePlugin
