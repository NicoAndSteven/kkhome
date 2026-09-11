import { RouteItem } from '@core/routeBridge'

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

export interface ShotHeaderProps {
  route: RouteItem
  index: number  // 1-based 序号（第几个可用路由）
  total: number
}

/** Action-Cut 镜头页页头：kicker + 斜切大字标题 + 胶片序号水印 + 取景框角标 + REC HUD */
const ShotHeader = ({ route, index, total }: ShotHeaderProps) => {
  const kicker = EN_LABEL[route.pluginId] ?? `MODULE`
  return (
    <header className="ac-shot">
      <span className="ac-corner ac-tl" aria-hidden="true" />
      <span className="ac-corner ac-tr" aria-hidden="true" />
      <span className="ac-corner ac-bl" aria-hidden="true" />
      <span className="ac-corner ac-br" aria-hidden="true" />
      <span className="ac-hud" aria-hidden="true"><i />REC&nbsp;<b>CUT {pad(index)}</b>&nbsp;/ {pad(total)}</span>
      <span className="ac-shot-kicker">MODULE / {kicker}</span>
      <h1 className="ac-shottitle">{route.label}</h1>
      <span className="ac-shotno" aria-hidden="true">{pad(index)}</span>
    </header>
  )
}

export default ShotHeader