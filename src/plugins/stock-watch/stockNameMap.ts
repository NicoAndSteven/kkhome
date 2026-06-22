/**
 * 中文股票名称映射（仅美股）
 *
 * A 股和港股的中文名由东方财富/腾讯财经 API 原生返回。
 * 此处只补充 Yahoo Finance 返回的美股公司名 → 中文名。
 */

/** symbol → 中文名 */
const cnMap: Record<string, string> = {
  AAPL: '苹果',
  MSFT: '微软',
  GOOGL: '谷歌',
  GOOG: '谷歌',
  AMZN: '亚马逊',
  NVDA: '英伟达',
  META: 'Meta',
  TSLA: '特斯拉',
  AMD: '超威半导体',
  INTC: '英特尔',
  NFLX: '奈飞',
  DIS: '迪士尼',
  PYPL: 'PayPal',
  SQ: 'Block',
  SPOT: 'Spotify',
  SNAP: 'Snap',
  BABA: '阿里巴巴',
  JD: '京东',
  PDD: '拼多多',
  NIO: '蔚来',
  LI: '理想汽车',
  XPEV: '小鹏汽车',
  BIDU: '百度',
  TCEHY: '腾讯(ADR)',
  BILI: '哔哩哔哩',
  NTES: '网易',
  EDU: '新东方',
  TAL: '好未来',
  SPY: '标普500 ETF',
  QQQ: '纳斯达克100 ETF',
  DIA: '道琼斯ETF',
  IWM: '罗素2000 ETF',
  VOO: '先锋标普500 ETF',
  VTI: '全市场ETF',
  EEM: '新兴市场ETF',
}

/** 中文名 → symbol 反向索引（用于本地搜索匹配） */
const reverseCnIndex: Record<string, string[]> = {}
for (const [symbol, cnName] of Object.entries(cnMap)) {
  if (!reverseCnIndex[cnName]) reverseCnIndex[cnName] = []
  reverseCnIndex[cnName].push(symbol)
}

export function getChineseName(symbol: string, fallback?: string): string | undefined {
  return cnMap[symbol] ?? fallback
}

export function searchByChineseName(query: string): string[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const results: string[] = []
  for (const [cnName, symbols] of Object.entries(reverseCnIndex)) {
    if (cnName.toLowerCase().includes(q)) results.push(...symbols)
  }
  for (const symbol of Object.keys(cnMap)) {
    if (symbol.toLowerCase().includes(q) && !results.includes(symbol)) {
      results.push(symbol)
    }
  }
  return results
}
