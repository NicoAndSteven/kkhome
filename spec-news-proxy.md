# 新闻板块跨域获取问题解决方案

## 问题诊断

**现象：** 新闻插件在本地开发环境正常工作，部署到 Cloudflare Pages 后无法获取数据，页面显示错误状态。

**根因：** 浏览器**同源策略（CORS）**阻止了跨域请求。新闻插件当前直接从前端浏览器向 `https://www.thehear.org/api/country-view/{country}` 发 `fetch` 请求，而该 API 的响应头中不含 `Access-Control-Allow-Origin`（或未包含 `*.pages.dev` 域名），浏览器拒绝读取返回数据。

**验证：** 服务端 `curl` / `web_fetch` 请求 API 正常返回 JSON（200 OK），确认 API 本身存活、数据源无问题。

---

## 方案选择结果

| 维度 | 选择 |
|---|---|
| 数据获取方式 | **Cloudflare Pages Functions 代理转发** |
| 数据新鲜度 | **实时：每次页面加载实时请求** |
| 组件改动范围 | **最小：仅替换 fetch URL** |

---

## 技术方案

### 架构示意

```
浏览器 (yourdomain.pages.dev)
  │
  ├─ fetch(/api/news/china)          ← 同源请求，无 CORS
  │
  ▼
Cloudflare Pages Functions (Edge Network)
  │
  ├─ fetch(https://www.thehear.org/api/country-view/china)   ← 服务端到服务端，无 CORS
  │
  ▼
thehear.org API → JSON → Function 透传 → 浏览器
```

### 改动涉及文件

| # | 文件 | 操作 | 说明 |
|---|------|------|------|
| 1 | `functions/api/news/[country].js` | **新建** | Pages Function 代理端点（CORS 绕过） |
| 2 | `functions/api/news/article.js` | **新建** | Pages Function 文章抓取+净化端点 |
| 3 | `functions/api/news/translate.js` | **新建** | Pages Function Cloudflare AI 翻译端点 |
| 4 | `src/plugins/news/index.tsx` | **重写** | 替换 fetch URL + 添加站内阅读模态框 + 添加翻译按钮 |
| 5 | `wrangler.toml` | **修改** | 启用 `[ai]` binding |

---

### 步骤 1：新建代理端点

**文件：** `functions/api/news/[country].js`

基于项目中已有的 `functions/_shared/api.js` 工具函数和 `functions/api/health.js` 模式编写。

职责：
- 接收 `GET /api/news/china` 等路径参数
- 从路径中提取 `country` 参数
- 向 `https://www.thehear.org/api/country-view/{country}` 发起服务端请求
- 透传 JSON 响应返回给浏览器（同源，无 CORS 拦截）
- 处理 OPTIONS 预检请求
- 异常时返回 502 及错误信息

```js
// functions/api/news/[country].js
import { json, options } from '../../_shared/api.js'

const API_ORIGIN = 'https://www.thehear.org'

export const onRequestOptions = (context) => options(context)

export const onRequestGet = async ({ request, env, params }) => {
  const { country } = params

  if (!country) {
    return json(
      { ok: false, error: { code: 'missing_country', message: 'Country parameter is required' } },
      { status: 400 },
      { request, env },
    )
  }

  const upstream = `${API_ORIGIN}/api/country-view/${encodeURIComponent(country)}`

  try {
    const upstreamRes = await fetch(upstream, {
      headers: { 'Accept': 'application/json' },
      // Cloudflare 边缘节点的出口 IP 发起请求，不受浏览器 CORS 限制
    })

    if (!upstreamRes.ok) {
      return json(
        { ok: false, error: { code: 'upstream_error', message: `Upstream returned ${upstreamRes.status}` } },
        { status: upstreamRes.status },
        { request, env },
      )
    }

    const body = await upstreamRes.json()

    return json({ ok: true, data: body }, { status: 200 }, { request, env })
  } catch (err) {
    return json(
      { ok: false, error: { code: 'proxy_failure', message: err instanceof Error ? err.message : 'Unknown error' } },
      { status: 502 },
      { request, env },
    )
  }
}
```

### 步骤 2：修改前端插件

**文件：** `src/plugins/news/index.tsx`

改动极小——只替换 `API_BASE` 常量的值，其余组件逻辑完全不动。

```diff
- const API_BASE = 'https://www.thehear.org/api/country-view'
+ const API_BASE = '/api/news'
```

现在 `fetch('/api/news/china')` 是**同源请求**，浏览器不会触发 CORS 检查。

---

## 本地开发验证

Cloudflare Pages Functions 不能在 `vite dev` 下直接运行，需要以下方式之一验证：

### 方式 A：wrangler pages dev（推荐）

```bash
npx wrangler pages dev -- dist
```

这会启动一个本地服务器，在 `localhost:8788` 同时提供静态资源和 Functions 端点。

### 方式 B：部署后验证

推送代码后，Cloudflare Pages 会自动部署 Functions。直接在浏览器打开 `https://{your-domain}.pages.dev` 的新闻板块验证。

---

## 风险 & 注意事项

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| thehear.org API 变更或下线 | 新闻板块不可用 | Functions 中已有错误兜底返回 502 |
| 请求延迟增加 | 增加一次边缘网络跳转（几毫秒到几十毫秒） | Cloudflare Workers/Functions 边缘节点与 API 服务器之间的延迟通常远低于客户端到 API 的延迟 |
| Functions 免费层调用量限制 | 每天 100,000 次请求（免费层） | 新闻板块按 900 秒/次/国家刷新，远低于限额 |

---

## 验收标准

1. 部署后新闻板块在浏览器中正常渲染头条列表
2. 切换国家按钮可以正常加载不同国家的新闻
3. 浏览器 DevTools Network 面板中请求路径为 `/api/news/china` 等，状态码 200
4. 不存在 CORS 相关错误日志
5. 本地 `npm run build` 通过

---

## 不做的事情

- ❌ 不改动新闻组件的 UI/UX
- ❌ 不添加 API 密钥（thehear.org 当前不需要）
- ❌ 不修改数据缓存策略
- ❌ 不引入额外的 npm 依赖
