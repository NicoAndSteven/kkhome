import { useState } from 'react'
import { PluginRuntimeConfig, ProjectItem } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

const ProjectsPlugin = ({ config }: Props) => {
  const [expanded, setExpanded] = useState(false)
  const projects = (Array.isArray(config?.items) ? config.items : []) as ProjectItem[]
  const project = projects[0]

  if (!project) {
    return (
      <div className="glass rounded-lg p-lg">
        <p className="text-text-muted font-body-md">未配置工程案例</p>
      </div>
    )
  }

  return (
    <section id="projects" className="space-y-lg scroll-mt-24">
      <div className="grid gap-md md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <span className="font-label-mono text-xs uppercase text-secondary">Featured case</span>
          <h2 className="mt-xs font-headline-md text-headline-md text-on-surface">项目作品</h2>
          <p className="mt-xs max-w-2xl font-body-md text-body-md text-text-muted">
            保留一个完整工程案例作为上下文，后续区域进入个人 Hub。
          </p>
        </div>
        <div className="md:col-span-5 md:text-right">
          <span className="font-label-mono text-xs text-text-muted">
            静态部署 / 配置驱动 / 插件架构 / 质量门禁
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

          <div className="mt-lg grid gap-md md:grid-cols-4">
            <div className="border-t border-white/12 pt-sm">
              <span className="font-label-mono text-xs text-secondary">目标</span>
              <p className="mt-xs font-body-md text-sm text-text-muted">
                把首页收敛成可维护、可扩展的个人入口系统。
              </p>
            </div>
            <div className="border-t border-white/12 pt-sm">
              <span className="font-label-mono text-xs text-secondary">约束</span>
              <p className="mt-xs font-body-md text-sm text-text-muted">
                第一阶段保持纯静态，不在前端暴露密钥。
              </p>
            </div>
            <div className="border-t border-white/12 pt-sm">
              <span className="font-label-mono text-xs text-secondary">架构</span>
              <p className="mt-xs font-body-md text-sm text-text-muted">
                通过配置和插件注册表持续接入新模块。
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
                这个案例的重点不是继续堆作品列表，而是用配置加载、插件注册、错误隔离和自动化检查，支撑后续的万能跳转、工具收纳和集成容器。产物为纯静态资源，适配 Cloudflare Pages。覆盖 lint、资源检查、生产构建和 Playwright 烟测。
              </p>
            </div>
          )}

          <div className="mt-lg flex flex-wrap gap-sm">
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
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

export default ProjectsPlugin
