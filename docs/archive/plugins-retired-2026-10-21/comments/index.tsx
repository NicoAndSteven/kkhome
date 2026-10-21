import { FormEvent, useState } from 'react'
import { CommentItem, PluginRuntimeConfig } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

/**
 * 留言板插件 - TECH_PRO 深色技术风格
 */
const CommentsPlugin = ({ config }: Props) => {
  const comments = (Array.isArray(config?.items) ? config.items : []) as CommentItem[]
  const [newComment, setNewComment] = useState('')
  const [commentList, setCommentList] = useState(comments)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const comment: CommentItem = {
      id: `comment-${Date.now()}`,
      author: '访客',
      content: newComment,
      date: new Date().toLocaleDateString('zh-CN'),
    }

    setCommentList([comment, ...commentList])
    setNewComment('')
  }

  return (
    <section id="comments" className="space-y-lg scroll-mt-24">
      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">留言板</h2>
        <p className="font-body-md text-body-md text-text-muted">欢迎留下你的想法</p>
      </div>

      {/* 输入区域 */}
      <form onSubmit={handleSubmit} className="glass rounded-xl p-lg">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写下你的留言..."
          className="w-full bg-surface-card border border-border-subtle rounded-lg p-md font-body-md text-body-md focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none transition-all duration-400"
          rows={3}
        />
        <div className="flex justify-end mt-md">
          <button
            type="submit"
            className="shimmer-btn bg-gradient-primary text-white px-lg py-2 rounded-full font-body-md font-semibold hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-400 btn-interact"
          >
            <span className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-lg">send</span>
              发送
            </span>
          </button>
        </div>
      </form>

      {/* 留言列表 */}
      {commentList.length === 0 ? (
        <div className="glass rounded-xl p-lg text-center">
          <span className="material-symbols-outlined text-4xl text-text-muted mb-sm">chat_bubble</span>
          <p className="font-body-md text-text-muted">暂无留言，快来抢沙发吧！</p>
        </div>
      ) : (
        <div className="space-y-md">
          {commentList.map((comment) => (
            <div key={comment.id} className="glass rounded-xl p-lg">
              <div className="flex items-start gap-md">
                {/* 头像 */}
                <div className="flex-shrink-0">
                  {comment.avatar ? (
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">person</span>
                    </div>
                  )}
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-sm mb-xs">
                    <span className="font-body-md font-bold text-on-surface">{comment.author}</span>
                    <span className="font-label-mono text-xs text-text-muted">{comment.date}</span>
                  </div>
                  <p className="font-body-md text-body-md text-text-muted">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default CommentsPlugin
