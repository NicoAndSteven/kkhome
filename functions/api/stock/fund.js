import { fail, ok, options } from '../../_shared/api.js'

export const onRequestOptions = (context) => options(context)

/**
 * 解析天天基金持仓 HTML 中的表格行
 * QDII 持仓表格结构示例：
 * <tr>
 *   <td>1</td>
 *   <td><a href="...">TSLA</a></td>
 *   <td><a href="...">特斯拉</a></td>
 *   <td class="num">9.87%</td>
 *   <td class="num">xx</td>
 *   <td class="num">-</td>
 * </tr>
 */
function parseHoldingsTable(html) {
  const holdings = []
  // 匹配 <tr> 内的单元格
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let rowMatch

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1]
    // 跳过表头行（不包含 <a> 链接或包含 th）
    if (!/<a[^>]*>/.test(rowHtml) || /<th[^>]*>/i.test(rowHtml)) continue

    // 提取所有 td
    const tds = []
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi
    let tdMatch
    while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
      tds.push(tdMatch[1].trim())
    }

    if (tds.length < 4) continue

    // 提取股票代码（从 <a> 文本或纯文本）
    const codeMatch = tds[1]?.match(/<a[^>]*>([^<]+)<\/a>/) || tds[1]?.match(/^([^<\s]+)/)
    const nameMatch = tds[2]?.match(/<a[^>]*>([^<]+)<\/a>/) || tds[2]?.match(/^([^<\s]+)/)
    const weightMatch = tds[3]?.match(/([\d.]+)/)

    const symbol = codeMatch ? codeMatch[1].trim() : ''
    const name = nameMatch ? nameMatch[1].trim() : ''
    const weight = weightMatch ? parseFloat(weightMatch[1]) : 0

    if (symbol && name) {
      // QDII 基金持有的美股符号直接是 ticker（如 AAPL），不需要转换
      // 但如果是 A 股（60xxxx/00xxxx/30xxxx），保留原样
      holdings.push({ symbol, name, weight })
    }
  }

  return holdings
}

/**
 * 从页面文本中提取基金名称和季度信息
 */
function parseFundMeta(html) {
  const result = { name: '', quarter: '', size: '', type: '' }

  // 尝试从标题提取：华夏全球科技先锋(QDII) 2025年第4季度报告
  const titleMatch = html.match(/<div[^>]*class="title[^"]*"[^>]*>([^<]+?)<\/div>/)
  if (titleMatch) {
    const title = titleMatch[1].trim()
    // 提取基金名称（去掉季度/年份后缀）
    result.name = title.replace(/\d{4}年第\d+季度.*$/, '').trim()
    // 提取季度信息
    const qMatch = title.match(/(\d{4})年第(\d+)季度/)
    if (qMatch) {
      result.quarter = `${qMatch[1]}Q${qMatch[2]}`
    }
  }

  return result
}

/**
 * POST /api/stock/fund
 * body: { code: "024239" }
 * 获取基金持仓信息（代理天天基金 API，处理 GBK 编码）
 */
export const onRequestPost = async ({ request }) => {
  let body
  try {
    body = await request.json()
  } catch {
    return fail('invalid_json', 'Invalid JSON body', 400)
  }

  const code = String(body.code ?? '').trim()
  if (!code) {
    return fail('missing_code', '基金代码不能为空', 400)
  }

  try {
    // 1. 拉取天天基金持仓数据
    const holdingsUrl = `https://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=${code}&topline=10`
    const resp = await fetch(holdingsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://fundf10.eastmoney.com/',
        'Accept': 'text/html, */*',
      },
    })

    if (!resp.ok) {
      return fail('fetch_failed', `天天基金 API 返回状态码 ${resp.status}`, 502)
    }

    // GBK 编码 → UTF-8
    const buffer = await resp.arrayBuffer()
    const decoder = new TextDecoder('gbk')
    const html = decoder.decode(buffer)

    if (!html || html.length < 50) {
      return fail('empty_response', '未获取到有效数据，请检查基金代码', 502)
    }

    // 2. 解析持仓表格
    const holdings = parseHoldingsTable(html)
    if (holdings.length === 0) {
      return fail('no_holdings', '未解析到持仓数据，该基金可能暂未披露或代码有误', 404)
    }

    // 3. 解析基金元信息
    const meta = parseFundMeta(html)

    // 4. 额外获取基金基本信息（名称、规模）
    // 如果 parseFundMeta 没拿到名称，尝试从基金页面获取
    let fundName = meta.name
    let fundSize = ''
    let fundType = ''

    if (!fundName) {
      try {
        const infoUrl = `https://fund.eastmoney.com/${code}.html`
        const infoResp = await fetch(infoUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        })
        if (infoResp.ok) {
          const infoBuffer = await infoResp.arrayBuffer()
          const infoHtml = new TextDecoder('gbk').decode(infoBuffer)

          // 基金名称：通常在 h1 或 title 中
          const nameMatch = infoHtml.match(/<h1[^>]*class="fundDetail-tit"[^>]*>([^<]+)</)
          if (nameMatch) fundName = nameMatch[1].trim()

          // 基金规模
          const sizeMatch = infoHtml.match(/基金规模[^：]*：\s*([\d.]+)\s*亿元/)
          if (sizeMatch) fundSize = sizeMatch[1] + '亿'
        }
      } catch {
        // 静默失败
      }
    }

    return ok({
      fund: {
        code,
        name: fundName || `${code}号基金`,
        quarter: meta.quarter || '',
        size: fundSize || '',
        type: fundType || 'QDII',
        holdings,
      },
    })
  } catch (error) {
    return fail('fetch_error', `获取基金数据失败: ${error.message}`, 502)
  }
}
