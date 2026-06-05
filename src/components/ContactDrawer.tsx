import { useState } from 'react'
import { ProfileConfig } from '@core/types'
import Icon from './Icon'

interface Props {
  open: boolean
  profile?: ProfileConfig
  onClose: () => void
}

const ContactDrawer = ({ open, profile, onClose }: Props) => {
  const [copied, setCopied] = useState(false)
  const email = profile?.email ?? '1215240348@qq.com'

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch (error) {
      console.warn('Unable to copy email:', error)
    }
  }

  return (
    <div className={`drawer-layer ${open ? 'open' : ''}`} aria-hidden={!open}>
      <button className="drawer-backdrop" type="button" aria-label="关闭联系面板" onClick={onClose} />
      <section className="contact-drawer" role="dialog" aria-modal="true" aria-label="联系我">
        <div className="flex items-start justify-between gap-md mb-lg">
          <div>
            <span className="font-label-mono text-xs text-primary">CONTACT CHANNEL</span>
            <h2 className="font-headline-md text-headline-md text-on-surface mt-xs">联系我</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-on-surface transition-premium"
            aria-label="关闭"
          >
            <Icon name="close" className="text-2xl" />
          </button>
        </div>

        <p className="font-body-md text-body-md text-text-muted mb-lg">
          欢迎沟通产品、工程、自动化和 Web 体验相关合作。
        </p>

        <div className="glass rounded-xl p-md mb-md">
          <span className="font-label-mono text-xs text-text-muted">邮箱</span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm mt-xs">
            <a href={`mailto:${email}`} className="text-on-surface hover:text-primary transition-premium">
              {email}
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex items-center justify-center gap-xs rounded-lg border border-border-subtle px-sm py-2 font-body-md text-body-md hover:border-primary hover:text-primary transition-premium"
            >
              <Icon name={copied ? 'check' : 'content_copy'} className="text-lg" />
              {copied ? '已复制' : '复制'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-xs text-text-muted font-label-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          可接受项目合作
        </div>
      </section>
    </div>
  )
}

export default ContactDrawer
