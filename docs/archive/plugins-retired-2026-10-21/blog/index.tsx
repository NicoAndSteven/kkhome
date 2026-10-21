import { BlogPost, PluginRuntimeConfig } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

/**
 * 博客文章插件 - TECH_PRO 深色技术风格
 */
const BlogPlugin = ({ config }: Props) => {
  const posts = (Array.isArray(config?.items) ? config.items : []) as BlogPost[]

  if (posts.length === 0) {
    return (
      <div className="glass rounded-xl p-lg">
        <p className="text-text-muted font-body-md">暂无文章</p>
      </div>
    )
  }

  return (
    <section id="blog" className="space-y-lg scroll-mt-24">
      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">最新文章</h2>
        <p className="font-body-md text-body-md text-text-muted">技术分享与思考</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass rounded-xl p-lg group relative overflow-hidden hover:border-primary/50 transition-all duration-400"
          >
            {/* 箭头图标 */}
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-all duration-400">
              <span className="material-symbols-outlined text-primary transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-400">
                arrow_outward
              </span>
            </div>

            {/* 日期 */}
            <span className="font-label-mono text-xs text-primary mb-xs block">{post.date}</span>

            {/* 标题 */}
            <h3 className="font-body-lg font-bold text-on-surface mb-xs group-hover:text-primary transition-colors">
              {post.title}
            </h3>

            {/* 摘要 */}
            <p className="font-body-md text-body-md text-text-muted mb-md line-clamp-2">
              {post.summary}
            </p>

            {/* 标签 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-xs">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-label-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  )
}

export default BlogPlugin
