import { DownloadItem, PluginRuntimeConfig } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

/**
 * 下载资源插件 - TECH_PRO 深色技术风格
 */
const DownloadsPlugin = ({ config }: Props) => {
  const downloads = (Array.isArray(config?.items) ? config.items : []) as DownloadItem[]

  const getTypeIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      document: 'description',
      code: 'code',
      archive: 'folder_zip',
      image: 'image',
      video: 'videocam',
      audio: 'audio_file',
      other: 'insert_drive_file',
    }
    return iconMap[type] || 'download'
  }

  const formatDownloads = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  if (downloads.length === 0) {
    return (
      <div className="glass rounded-xl p-lg">
        <p className="text-text-muted font-body-md">暂无下载资源</p>
      </div>
    )
  }

  return (
    <section id="downloads" className="space-y-lg scroll-mt-24">
      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">资源下载</h2>
        <p className="font-body-md text-body-md text-text-muted">实用的工具和资源</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {downloads.map((item) => (
          <div
            key={item.id}
            className="glass rounded-xl p-lg group relative overflow-hidden hover:border-primary/50 transition-all duration-400"
          >
            {/* 类型图标 */}
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-md">
              <span className="material-symbols-outlined text-2xl text-primary">
                {item.icon || getTypeIcon(item.type)}
              </span>
            </div>

            {/* 名称 */}
            <h3 className="font-body-lg font-bold text-on-surface mb-xs">{item.name}</h3>

            {/* 描述 */}
            <p className="font-body-md text-body-md text-text-muted mb-md line-clamp-2">
              {item.description}
            </p>

            {/* 底部信息 */}
            <div className="flex items-center justify-between">
              <span className="font-label-mono text-xs text-text-muted flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">download</span>
                {formatDownloads(item.downloads)} 次下载
              </span>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-xs text-primary hover:text-primary/80 transition-colors font-body-md"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                下载
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default DownloadsPlugin
