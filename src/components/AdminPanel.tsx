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
    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0b0f17] flex flex-col">
      {/* 顶部栏 */}
      <header className="shrink-0 border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon name="fingerprint" className="text-lg text-primary" />
          </div>
          <div>
            <h1 className="font-headline-md text-lg text-gray-900 dark:text-white">管理后台</h1>
            <p className="font-label-mono text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              共 {songs.length} 首 · 待审 {counts.pending} · 许愿 {counts.wish}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-9 px-4 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all flex items-center gap-2"
        >
          <Icon name="close" className="text-base" />
          退出管理
        </button>
      </header>

      {/* Tab 导航 */}
      <div className="shrink-0 flex border-b border-gray-200 dark:border-white/5 px-6">
        {([
          { id: 'pending' as TabId, label: '待审核', count: counts.pending },
          { id: 'wish' as TabId, label: '许愿', count: counts.wish },
          { id: 'approved' as TabId, label: '已上架', count: counts.approved },
        ]).map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
            <span className="ml-2 text-xs opacity-60">({t.count})</span>
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" fill="none" />
              </svg>
              加载中...
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && filteredSongs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Icon name="check" className="text-4xl mb-3 opacity-30" />
            <p className="text-sm">
              {tab === 'pending' ? '没有待审核的歌曲' : tab === 'wish' ? '没有许愿请求' : '还没有已上架的歌曲'}
            </p>
          </div>
        )}

        {!loading && !error && filteredSongs.length > 0 && (
          <div className="space-y-2 max-w-3xl">
            {filteredSongs.map(song => (
              <div
                key={song.id}
                className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4 hover:border-gray-300 dark:hover:border-white/20 transition-all"
              >
                {/* 歌曲信息 */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900 dark:text-white truncate">{song.title}</span>
                    <span className="font-label-mono text-[10px] text-gray-400 dark:text-gray-500 shrink-0 px-2 py-0.5 rounded-full bg-gray-200 dark:bg-white/5">
                      {song.status === 'wish' ? '许愿' : '上传'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-500">{song.artist}</span>
                    <span className="text-[10px] text-gray-400">·</span>
                    <span className="text-[10px] text-gray-400">{song.uploadedBy}</span>
                    <span className="text-[10px] text-gray-400">·</span>
                    <span className="text-[10px] text-gray-400">{song.createdAt ? new Date(song.createdAt).toLocaleDateString('zh-CN') : ''}</span>
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
                        className="h-8 px-4 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 disabled:opacity-50 transition-all flex items-center gap-1.5"
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
                        className="h-8 px-4 rounded-lg border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-all"
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
                      className="h-8 px-4 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 text-xs font-medium hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 transition-all"
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
