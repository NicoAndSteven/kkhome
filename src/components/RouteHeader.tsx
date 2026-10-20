import { RouteItem } from '@core/routeBridge'
import { scrambleText, useCountUp, useMotionScope } from '@core/motion'
import AccentSwitcher from './AccentSwitcher'

const EN_LABEL: Record<string, string> = {
  profile: 'HOME',
  'ai-navigator': 'TOOLS',
  'wish-wall': 'WISH',
  'stock-watch': 'STOCK',
  food: 'FOOD',
  'party-games': 'GAME',
  'local-music': 'MUSIC',
  'universal-inbox': 'INBOX',
  'quick-launch': 'LAUNCH',
  workbench: 'BENCH',
  collections: 'SAVE',
  scratchpad: 'DRAFT',
}

const pad = (n: number) => String(n).padStart(2, '0')

export interface RouteHeaderProps {
  route: RouteItem
  /** 1-based 序号 */
  index: number
  total: number
  /** 前进 / 后退，决定页头元素的位移方向（与切镜幕布的行进方向一致） */
  direction: 'ac-fwd' | 'ac-back'
  /** 移动端在页头挂强调色切换器（桌面由导航轨承担，避免两处重复） */
  accentSwitcher?: boolean
}

/**
 * 路由页头。
 *
 * 取代 Action-Cut 的「镜头页页头」：去掉了摄影棚母题（斜切大字、取景框角标、
 * REC HUD、胶片水印），换成编辑部版式 —— 等宽 kicker + 大字号标题 + 描边序号 + 发丝线。
 *
 * **标题改成遮罩揭示，而旧版被迫用整块淡入。** 旧版标题是渐变裁切字
 * （`background-clip: text`），任何加在字符 span 上的层叠上下文属性都会让
 * 父元素的裁切背景盖不到字形，标题整块不可见（实测：字符带 `translate: 0px`
 * 时标题空白）。这一版把强调色让给 kicker 和序号，标题是纯色 ——
 * 于是「把标题放在 overflow:hidden 的遮罩里、用 `--m-rise` 从下方推进来」
 * 这种真正的版式级揭示才成立。
 *
 * 页头揭示由这里负责，不由 RouteCut 代劳：元素归属决定职责边界，
 * 隔着组件边界 `querySelector` 别人的 DOM，改一次页头结构就会静默失效。
 */
const RouteHeader = ({ route, index, total, direction, accentSwitcher = false }: RouteHeaderProps) => {
  const kicker = EN_LABEL[route.pluginId] ?? 'MODULE'
  const dir = direction === 'ac-fwd' ? 1 : -1

  // 描边序号滚到本次路由号。延迟对齐幕布擦过页头的时间点。
  const idxRef = useCountUp<HTMLDivElement>(index, { pad: 2, duration: 780, delay: 300 })

  const { ref } = useMotionScope<HTMLElement>(`route-head:${route.id}`, ({ q, timeline, prime }) => {
    prime('.kk-head-kicker', { rise: 10 * dir })
    prime('.kk-head-title', { rise: 34 * dir })
    prime('.kk-head-idx', { rise: 16 * dir })
    prime('.kk-head-meta', { rise: 8 * dir })

    // 横线的初始态必须在这里落下：anime.js 的 from 值要等引擎首次 tick 才写入，
    // 在那之前会先画出一条满宽的线，再缩回去重长 —— 肉眼就是"闪一下"。
    const rule = q('.kk-head-rule')
    for (const el of rule) el.style.transform = 'scaleX(0)'

    timeline
      // kicker：透明度/位移与乱码落定同一节拍。
      // scrambleText 是**属性值生成器**，属性名必须是 textContent（写 text 会静默无效）。
      .add(
        q('.kk-head-kicker'),
        {
          opacity: [0, 1],
          '--m-rise': [10 * dir, 0],
          textContent: scrambleText({ chars: 'A-Z0-9/#_', cursor: '_' }),
          duration: 460,
          ease: 'outExpo',
        },
        140,
      )
      // 标题：遮罩内推进来
      .add(q('.kk-head-title'), { opacity: [0, 1], '--m-rise': [34 * dir, 0], duration: 680, ease: 'outExpo' }, 190)
      .add(q('.kk-head-idx'), { opacity: [0, 1], '--m-rise': [16 * dir, 0], duration: 560, ease: 'outExpo' }, 250)
      // 发丝线从左（前进）/ 右（后退）长出来，方向和幕布一致
      .add(rule, { scaleX: [0, 1], duration: 820, ease: 'outExpo' }, 300)
      .add(q('.kk-head-meta'), { opacity: [0, 1], '--m-rise': [8 * dir, 0], duration: 440, ease: 'outQuad' }, 430)
  })

  return (
    <header ref={ref} className="kk-head">
      <div className="kk-head-lead">
        <span className="kk-head-kicker m-rise">MODULE / {kicker}</span>
        <div className="kk-head-mask">
          <h1 className="kk-head-title m-rise">{route.label}</h1>
        </div>
      </div>

      <div ref={idxRef} className="kk-head-idx m-rise" aria-hidden="true">00</div>

      <span
        className="kk-head-rule"
        aria-hidden="true"
        style={{ transformOrigin: dir > 0 ? 'left center' : 'right center' }}
      />

      <div className="kk-head-meta m-rise">
        <span><b>CUT</b> {pad(index)} / {pad(total)}</span>
        <span><b>ID</b> {route.id}</span>
        <span><b>PLUGIN</b> {route.pluginId}</span>
      </div>

      {accentSwitcher && <AccentSwitcher variant="inline" />}
    </header>
  )
}

export default RouteHeader
