import { useState, useEffect, useCallback } from 'react'
import Icon from './Icon'

interface Song {
  id: string
  title: string
  artist: string
  file?: string
  source?: string
  uploadedBy: string
  status: 'pending' | 'approved' | 'wish'
  createdAt: string
}

interface Props {
  token: string
  onClose: () => void
}

type TabId = 'pending' | 'approved' | 'wish'

const AdminPanel = ({ token, onClose }: Props) => {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<TabId>('pending')
  const [operating, setOperating] = useState<string | null>(null)

  const fetchSongs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/music/songs', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.ok) setSongs(json.data.songs)
      else setError(json.error?.message || '加载失败')
    } catch {
      setError('无法连接服务器')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchSongs() }, [fetchSongs])

  const handleApprove = async (id: string) => {
    setOperating(id)
    try {
      const res = await fetch('/api/music/songs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, action: 'approve' }),
      })
      const json = await res.json()
      if (json.ok) {
        fetchSongs()
      } else {
        alert(json.error?.message || '操作失败')
      }
    } catch {
      alert('网络错误，操作失败')
    } finally {
      setOperating(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？')) return
    setOperating(id)
    try {
      const res = await fetch('/api/music/songs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, action: 'delete' }),
      })
      const json = await res.json()
      if (json.ok) {
        fetchSongs()
      } else {
        alert(json.error?.message || '操作失败')
      }
    } catch {
      alert('网络错误，操作失败')
    } finally {
      setOperating(null)
    }
  }

  const filteredSongs = songs.filter(s => {
    if (tab === 'pending') return s.status === 'pending'
    if (tab === 'approved') return s.status === 'approved'
    return s.status === 'wish'
  })

  const counts = {
    pending: songs.filter(s => s.status === 'pending').length,
    approved: songs.filter(s => s.status === 'approved').length,
    wish: songs.filter(s => s.status === 'wish').length,
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* 顶部栏 — 玻璃态 */}
      <header className="shrink-0 border-b border-border-subtle bg-surface/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon name="fingerprint" className="text-xl text-primary" />
          </div>
          <div>
            <h1 className="font-headline-md text-lg text-on-surface">管理后台</h1>
            <p className="font-label-mono text-[10px] text-text-muted uppercase tracking-wider">
              共 {songs.length} 首 · 待审 {counts.pending} · 许愿 {counts.wish}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-9 px-4 rounded-xl border border-border-subtle text-sm text-text-muted hover:text-on-surface hover:bg-surface-container transition-premium flex items-center gap-2"
        >
          <Icon name="close" className="text-base" />
          退出管理
        </button>
      </header>

      {/* Tab 导航 */}
      <div className="shrink-0 flex border-b border-border-subtle px-6">
        {([
          { id: 'pending' as TabId, label: '待审核', count: counts.pending },
          { id: 'wish' as TabId, label: '许愿', count: counts.wish },
          { id: 'approved' as TabId, label: '已上架', count: counts.approved },
        ]).map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 font-label-mono text-xs uppercase tracking-wider border-b-2 transition-premium ${
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-on-surface'
            }`}
          >
            {t.label}
            <span className="ml-2">({t.count})</span>
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-2 font-body-md text-sm text-text-muted">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" fill="none" />
              </svg>
              加载中...
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto surface-panel rounded-2xl p-lg text-center">
            <p className="font-body-md text-sm text-error">{error}</p>
          </div>
        )}

        {!loading && !error && filteredSongs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted">
            <Icon name="check" className="text-5xl mb-4 opacity-20" />
            <p className="font-body-md text-sm">
              {tab === 'pending' ? '没有待审核的歌曲' : tab === 'wish' ? '没有许愿请求' : '还没有已上架的歌曲'}
            </p>
          </div>
        )}

        {!loading && !error && filteredSongs.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-3">
            {filteredSongs.map(song => (
              <div
                key={song.id}
                className="surface-item rounded-2xl border border-border-subtle p-4 flex items-center gap-4 hover:border-primary/20 transition-premium"
              >
                {/* 歌曲信息 */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-body-md text-sm font-semibold text-on-surface truncate">{song.title}</span>
                    <span className={`font-label-mono text-[10px] shrink-0 px-2 py-0.5 rounded-full ${
                      song.status === 'wish'
                        ? 'bg-secondary-fixed text-on-secondary-fixed'
                        : 'bg-primary-container text-primary'
                    }`}>
                      {song.status === 'wish' ? '许愿' : '上传'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-body-md text-xs text-text-muted">{song.artist}</span>
                    <span className="text-text-muted/40">·</span>
                    <span className="font-label-mono text-[10px] text-text-muted">{song.uploadedBy}</span>
                    <span className="text-text-muted/40">·</span>
                    <span className="font-label-mono text-[10px] text-text-muted">{song.createdAt ? new Date(song.createdAt).toLocaleDateString('zh-CN') : ''}</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2 shrink-0">
                  {(tab === 'pending' || tab === 'wish') && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(song.id)}
                        disabled={operating === song.id}
                        className="h-8 px-4 rounded-full bg-primary text-white font-label-mono text-[10px] uppercase tracking-wider hover:opacity-90 disabled:opacity-40 transition-premium flex items-center gap-1.5"
                      >
                        {operating === song.id ? (
                          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" fill="none" />
                          </svg>
                        ) : (
                          <Icon name="check" className="text-sm" />
                        )}
                        通过
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(song.id)}
                        disabled={operating === song.id}
                        className="h-8 px-4 rounded-full border border-border-subtle text-text-muted font-label-mono text-[10px] uppercase tracking-wider hover:text-error hover:border-error/30 disabled:opacity-40 transition-premium"
                      >
                        删除
                      </button>
                    </>
                  )}
                  {tab === 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleDelete(song.id)}
                      disabled={operating === song.id}
                      className="h-8 px-4 rounded-full border border-border-subtle text-text-muted font-label-mono text-[10px] uppercase tracking-wider hover:text-error hover:border-error/30 disabled:opacity-40 transition-premium"
                    >
                      下架
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
