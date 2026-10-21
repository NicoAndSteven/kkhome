# Hub 工具顾问

基于 CodeBuddy Agent SDK 的 Agent Web 应用，挂在 kkhome（个人 AI Hub）仓库下。

它的定位很具体：**用户带着一个任务来问「该用哪个工具」，Agent 只从 kkhome 真实的 AI / 效率工具目录里挑，并给出官网链接。** 目录里没有就说没有，不编造工具名和网址，并主动帮用户写一条许愿墙需求。

## 它解决什么问题

kkhome 主站的 `ai-navigator` 有 313 个工具、10 个分类，但只能关键词搜索 + 分类筛选。访客真正的问题是「我要把扫描件 PDF 转成 Word，用哪个？」，这不是关键词检索能回答的。这个 Agent 补上这一层。

## 内置 Agent

| Agent | 作用 | 权限 |
|-------|------|------|
| 工具顾问（默认） | 从真实目录检索并推荐工具，说明取舍 | 只读：Read / Grep / Glob |
| 许愿墙助手 | 把口语化想法整理成可执行的需求条目 | 只读 |

服务端会在任意 Agent 提示词后面**强制追加目录 grounding 上下文**（`server/agent-context.ts`）：目录文件路径、分类索引、以及「先 Grep 再回答、禁止编造、只推荐目录内工具」的规则。所以即使前端改了提示词， grounding 也不会丢。

同时服务端对 `Write / Edit / Bash` 等写操作一律拒绝，只读工具自动放行，不会每次检索都弹权限框。

## 快速开始

```bash
cd hub-agent

# 1. 安装依赖
npm install

# 2. 同步主站工具目录（必须做，否则 Agent 没有数据可查）
npm run sync:catalog

# 3. 配置密钥
cp .env.example .env
# 填入 CODEBUDDY_API_KEY，或者用 codebuddy login 走 CLI 登录态

# 4. 启动（前端 5173 + 后端 3000）
npm run dev
```

打开 http://localhost:5173 。

## 目录同步

```bash
npm run sync:catalog
```

从 `../public/config/plugins.config.json` 的 `ai-navigator` 配置生成：

- `data/tool-catalog.json` — 结构化目录，供 `/api/catalog` 和前端展示
- `data/tool-catalog.md` — 纯文本目录（按分类分组），供 Agent 用 Grep / Read 检索

主站新增或删除工具后重新跑一次即可。目录缺失时，新对话页会显示黄色提示，Agent 会如实告知用户目录未同步，**不会假装可用**。

## 环境要求

- Node.js 18+
- CodeBuddy 登录态：`CODEBUDDY_API_KEY` 环境变量，或已执行 `codebuddy login`
- Windows 上 `better-sqlite3` 若无预编译包，需要 Visual Studio 生成工具；装不上时可用 `npm install --ignore-scripts` 跳过，会话持久化会不可用

## 常用命令

```bash
npm run dev          # 前后端一起起
npm run dev:server   # 只起后端（3000）
npm run dev:client   # 只起前端（5173）
npm run sync:catalog # 同步工具目录
npm run build        # 类型检查 + 生产构建
```

## API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/catalog` | GET | 工具目录摘要（总数、分类、生成时间、是否可用） |
| `/api/check-login` | GET | 检查 CodeBuddy 登录状态 |
| `/api/models` | GET | 可用模型列表 |
| `/api/sessions` | GET / POST | 会话列表 / 新建会话 |
| `/api/sessions/:id` | GET / PATCH / DELETE | 单个会话读写删 |
| `/api/chat` | POST | 发送消息，SSE 流式返回 |
| `/api/permission-response` | POST | 响应权限请求 |

## 项目结构

```
hub-agent/
├── server/
│   ├── index.ts          # Express + SSE，权限收敛在这里
│   ├── agent-context.ts  # 目录 grounding 上下文（本项目的核心定制）
│   └── db.ts             # SQLite 持久化
├── scripts/
│   └── sync-catalog.mjs  # 从主站配置生成工具目录
├── data/
│   ├── tool-catalog.json # 生成物
│   ├── tool-catalog.md   # 生成物
│   └── chat.db           # 运行时生成
├── src/
│   ├── config.ts         # 应用名、内置 Agent 提示词、引导问题
│   ├── hooks/            # useAgents / useChat / useCatalog ...
│   └── components/       # TDesign 界面
└── package.json
```

## 想改成别的 Agent

1. 改 `src/config.ts` 里的 `BUILTIN_PROMPTS` 和 `SUGGESTED_PROMPTS`。
2. 改 `server/agent-context.ts` 的 `buildSystemPrompt()`，把 grounding 换成你自己的数据源（换成别的目录文件、换成 API 说明都行）。
3. 如果新 Agent 需要写文件，从 `server/index.ts` 的拒绝名单里把对应工具去掉。

## License

MIT
