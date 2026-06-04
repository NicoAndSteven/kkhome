import { useState } from 'react'
import { PluginRuntimeConfig, ProjectItem } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

const ProjectsPlugin = ({ config }: Props) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const projects = (Array.isArray(config?.items) ? config.items : []) as ProjectItem[]

  if (projects.length === 0) {
    return (
      <div className="glass rounded-lg p-lg">
        <p className="text-text-muted font-body-md">未配置项目信息</p>
      </div>
    )
  }

  if (projects.length === 1) {
    const project = projects[0]
    const expanded = expandedId === project.id

    return (
      <section id="projects" className="space-y-lg scroll-mt-24">
        <div className="grid gap-md md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <span className="font-label-mono text-xs uppercase text-secondary">Featured project</span>
            <h2 className="mt-xs font-headline-md text-headline-md text-on-surface">项目作品</h2>
            <p className="mt-xs max-w-2xl font-body-md text-body-md text-text-muted">
              先展示一个最完整的工程案例，而不是把单个项目塞进稀疏网格。
            </p>
          </div>
          <div className="md:col-span-5 md:text-right">
            <span className="font-label-mono text-xs text-text-muted">
              React / TypeScript / Tailwind CSS / Vite
            </span>
          </div>
        </div>

        <article className="grid gap-lg overflow-hidden rounded-lg border border-white/10 bg-surface-card/82 p-md md:grid-cols-12 md:p-lg">
          <div className="md:col-span-12">
            <h3 className="font-display-lg text-3xl leading-tight text-on-surface md:text-5xl">
              {project.name}
            </h3>
            <p className="mt-md max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
              {project.description}
            </p>

            <div className="mt-lg grid gap-md md:grid-cols-3">
              <div className="border-t border-white/12 pt-sm">
                <span className="font-label-mono text-xs text-secondary">目标</span>
                <p className="mt-xs font-body-md text-sm text-text-muted">
                  配置驱动个人信息、工具栈和作品展示。
                </p>
              </div>
              <div className="border-t border-white/12 pt-sm">
                <span className="font-label-mono text-xs text-secondary">部署</span>
                <p className="mt-xs font-body-md text-sm text-text-muted">
                  纯静态资源，适配 Cloudflare Pages。
                </p>
              </div>
              <div className="border-t border-white/12 pt-sm">
                <span className="font-label-mono text-xs text-secondary">质量</span>
                <p className="mt-xs font-body-md text-sm text-text-muted">
                  覆盖 lint、资源检查、构建和首页烟测。
                </p>
              </div>
            </div>

            {expanded && (
              <div className="mt-lg rounded-lg border border-white/10 bg-background/45 p-md">
                <span className="font-label-mono text-xs uppercase text-primary">Case notes</span>
                <p className="mt-sm font-body-md text-body-md text-text-muted">
                  用配置和插件体系把个人信息、工具栈和作品展示收敛成一个可维护的静态站点。产物为纯静态资源，适配 Cloudflare Pages。覆盖 lint、资源检查、生产构建和 Playwright 烟测。
                </p>
              </div>
            )}

            <div className="mt-lg flex flex-wrap gap-sm">
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : project.id)}
                className="inline-flex items-center gap-xs rounded-lg border border-primary/30 px-sm py-2 font-body-md text-primary transition-premium hover:bg-primary/10"
              >
                <span className="material-symbols-outlined text-lg">{expanded ? 'unfold_less' : 'unfold_more'}</span>
                {expanded ? '收起' : '展开详情'}
              </button>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-xs rounded-lg border border-white/10 px-sm py-2 font-body-md text-text-muted transition-premium hover:text-primary"
                >
                  <span className="material-symbols-outlined text-lg">public</span>
                  GitHub
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-xs rounded-lg border border-white/10 px-sm py-2 font-body-md text-text-muted transition-premium hover:text-primary"
                >
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                  演示
                </a>
              )}
            </div>
          </div>
        </article>
      </section>
    )
  }

  return (
    <section id="projects" className="space-y-lg scroll-mt-24">
      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">项目作品</h2>
        <p className="font-body-md text-body-md text-text-muted">展示我的开源项目和技术实践</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {projects.map((project) => {
          const expanded = expandedId === project.id

          return (
            <article
              key={project.id}
              className={`glass rounded-lg p-lg group relative overflow-hidden hover:border-primary/50 transition-all duration-400 ${
                expanded ? 'md:col-span-2 lg:col-span-3 border-primary/40' : ''
              }`}
            >
              {/* 项目图标/图片 */}
              {project.imageUrl && (
                <div className="mb-md overflow-hidden rounded-lg">
                  <img
                    src={project.imageUrl}
                    alt={project.name}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-400"
                  />
                </div>
              )}

              {/* 项目名称 */}
              <h3 className="font-body-lg font-bold text-on-surface mb-xs flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary">folder</span>
                {project.name}
              </h3>

              {/* 项目描述 */}
              <p className={`font-body-md text-body-md text-text-muted mb-md ${expanded ? '' : 'line-clamp-2'}`}>
                {project.description}
              </p>

              {/* 技术栈标签 */}
              <div className="flex flex-wrap gap-xs mb-md">
                {project.techStack.map((tech, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-label-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {expanded && (
                <div className="border-t border-border-subtle pt-md mb-md grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div>
                    <span className="font-label-mono text-xs text-primary">目标</span>
                    <p className="font-body-md text-body-md text-text-muted mt-xs">
                      用配置和插件体系把个人信息、工具栈和作品展示收敛成一个可维护的静态站点。
                    </p>
                  </div>
                  <div>
                    <span className="font-label-mono text-xs text-primary">部署</span>
                    <p className="font-body-md text-body-md text-text-muted mt-xs">
                      产物为纯静态资源，适配 Cloudflare Pages。
                    </p>
                  </div>
                  <div>
                    <span className="font-label-mono text-xs text-primary">质量门禁</span>
                    <p className="font-body-md text-body-md text-text-muted mt-xs">
                      覆盖 lint、资源检查、生产构建和 Playwright 烟测。
                    </p>
                  </div>
                </div>
              )}

              {/* 链接按钮 */}
              <div className="flex flex-wrap gap-sm">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : project.id)}
                  className="flex items-center gap-xs text-primary hover:text-primary/80 transition-colors font-body-md"
                >
                  <span className="material-symbols-outlined text-lg">{expanded ? 'unfold_less' : 'unfold_more'}</span>
                  {expanded ? '收起' : '展开详情'}
                </button>
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-xs text-text-muted hover:text-primary transition-colors font-body-md"
                  >
                    <span className="material-symbols-outlined text-lg">public</span>
                    GitHub
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-xs text-text-muted hover:text-primary transition-colors font-body-md"
                  >
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                    演示
                  </a>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default ProjectsPlugin
