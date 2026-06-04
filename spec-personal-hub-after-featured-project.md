# Featured Project 后续个人集成工作台规格说明

## 背景

当前首页的 Hero 和头像身份区已经形成较好的第一印象，Featured Project 也可以继续作为当前站点工程案例展示。真正需要重构的是 Featured Project 之后的内容：后续区域不再承担技术栈、项目经历、作品集补充说明等展示职责，而应转向个人万能跳转、持续可集成工具收纳和有趣集成容器。

该规格用于把 Featured Project 之后的页面改造成长期可扩展的 Personal Hub。

## 目标

- 保留 Hero 和 Featured Project 的叙事完整性。
- Featured Project 之后全部改为操作型内容，而不是履历型内容。
- 提供万能跳转、资源收藏、工具收纳、信息订阅和外部集成入口。
- 保持配置驱动和插件化结构，便于持续添加新模块。
- 用统一搜索、分类、收藏、最近使用和命令面板控制复杂度，避免退化成杂乱书签页。
- 第一阶段保持纯静态部署兼容，不强制引入服务端、数据库或私钥。
- 后续允许通过 Cloudflare Pages Functions、Workers 或外部服务扩展需要密钥、缓存或持久化的集成。

## 非目标

- 不继续增加技术栈展示、项目经历、履历时间线。
- 不把 Tools 做成技能熟练度展示。
- 不把 Navigation 做成普通链接卡片堆叠。
- 不展示假统计、假评论、假下载量、假集成状态。
- 不一次性堆叠过多模块；MVP 默认控制在 4 个核心模块以内。
- 不在第一阶段引入必须登录、必须存储密钥或必须服务端代理的功能。
- 不为了集成数量牺牲首屏后的扫描效率。

## 产品定位

Featured Project 之后的页面应被视为个人控制台：

```text
不是作品集尾页
不是技术栈陈列
不是社交链接集合
而是个人常用入口、工具、信息和集成的统一收纳台
```

推荐信息架构：

```text
Hero
Featured Project
Quick Launch
Workbench
Collections
Scratchpad
Integrations
Feeds
Archive
Minimal Contact
```

其中 Hero 和 Featured Project 保持现有方向，后续模块按本规格重构。

## 模块设计

### 1. Quick Launch

Quick Launch 是 Featured Project 之后的第一操作区，替代传统 Navigation 的主位置。

核心能力：

- 全局搜索。
- 命令面板。
- 多目标跳转。
- 常用入口。
- 最近使用。
- 收藏入口。
- 快捷动作。

推荐交互：

- 输入关键词后同时匹配链接、工具、Prompt、代码片段和集成。
- 支持搜索模板，例如 GitHub、npm、MDN、Bilibili、Google。
- 支持键盘打开命令面板，例如 `Ctrl+K` 或 `/`。
- 支持本页锚点、本地服务地址、外部链接和 mailto。
- 支持别名，例如 `gh`、`npm`、`cf`、`ai`。

验收标准：

- Featured Project 后第一个模块不是普通卡片网格，而是可输入、可跳转、可搜索的操作区。
- 至少支持链接、工具和 Prompt / snippet 三类资源搜索。
- 外部链接与站内锚点打开行为正确。

### 2. Workbench

Workbench 替代原 Tools 的技术栈表达，转为真实可使用的小工具收纳。

第一批工具建议：

- JSON 格式化。
- Base64 编解码。
- URL encode/decode。
- 时间戳转换。
- UUID 生成。
- 二维码生成。
- 颜色转换。
- Markdown 预览。
- JWT 解析。
- Hash 生成。

约束：

- 工具卡片不展示熟练度标签。
- 工具必须有明确输入、输出或跳转行为。
- 暂未实现的工具不得伪装成已可用。

验收标准：

- Workbench 中至少包含 5 个真正可交互工具。
- 工具空状态、错误输入和复制结果有明确反馈。
- 移动端输入输出区域不溢出。

### 3. Collections

Collections 用于长期收纳个人入口，可以吸收原 Navigation 的链接数据。

推荐分类：

- AI
- 开发
- 设计
- 学习
- 娱乐
- 资料
- 云服务
- 本地服务
- 生活

条目能力：

- 分类。
- 标签。
- 收藏。
- 别名。
- 描述。
- 图标。
- 打开方式。

验收标准：

- 支持分类过滤和关键词搜索。
- 少量链接时不出现稀疏大网格。
- 站内入口、外部入口和本地服务入口有可识别差异。

### 4. Snippets

Snippets 用于收纳高频可复用文本，不等同于技术栈展示。MVP 阶段 Snippets 可以先作为 Collections 和 Quick Launch 可搜索的资源类型，不必单独占一个大 section。

可收纳内容：

- Prompt 模板。
- 常用命令。
- 代码片段。
- 查询模板。
- API 请求模板。
- 终端脚本片段。

约束：

- Snippets 必须可搜索、可复制。
- 片段内容不得包含私钥、token 或不可公开凭证。
- 片段应按用途分类，而不是按个人经历分类。

验收标准：

- 至少支持复制片段。
- 搜索可以匹配标题、标签、别名和正文。
- 空配置时不展示假示例。

### 5. Integrations

Integrations 是后续持续扩展区，用于接入各种有趣数据源和服务。

集成分层：

```text
Level 0: 静态配置集成
Level 1: 浏览器端公开 API
Level 2: Cloudflare Pages Functions / Workers 代理
Level 3: 私有服务、本地 Agent、个人数据库
```

第一阶段建议只做 Level 0 和少量 Level 1：

- GitHub public profile / repository links。
- npm package 查询入口。
- Cloudflare Pages 管理入口。
- RSS 源配置入口。
- 本地 localhost 服务入口。

需要推迟的集成：

- 需要私钥的 GitHub API。
- Notion、Todoist 等 OAuth 集成。
- 需要持久化的评论、笔记同步和用户状态。

验收标准：

- 每个集成都必须标明数据来源和集成级别。
- 没有真实数据源时展示禁用、待配置或空状态，而不是假数据。
- 任何需要密钥的集成不得把密钥放进前端配置。

### 6. Feeds

Feeds 用于信息流聚合，不是个人博客展示。

可收纳内容：

- RSS。
- GitHub Releases。
- npm 更新。
- 技术资讯。
- AI 产品更新。
- 关注项目动态。

第一阶段方案：

- 使用静态配置维护 feed 源。
- 可以先展示 feed 源入口，不强制运行时拉取。
- 后续再用构建脚本或 Worker 做缓存。

验收标准：

- Feeds 不展示假文章。
- 数据过期时有明确更新时间或来源说明。
- CORS 不稳定的数据源不直接阻塞页面渲染。

### 7. Scratchpad

Scratchpad 用于临时收纳。

第一阶段能力：

- 临时文本。
- 临时链接。
- 临时 Prompt。
- 待读资源。
- 粘贴内容自动识别 URL、JSON 或 Markdown。

存储策略：

- 第一阶段使用 `localStorage`。
- 用户必须能清空本地数据。
- 不承诺跨设备同步。

验收标准：

- 刷新页面后本地临时内容保留。
- 清空操作需要二次确认或明确不可逆提示。
- 本地数据异常时页面不崩溃。

### 8. Archive

Archive 用于收纳低频内容。

可放内容：

- 旧链接。
- 旧工具。
- 旧 Prompt。
- 废弃服务入口。
- 历史配置。

验收标准：

- Archive 默认不抢主视觉。
- 归档内容可以搜索。
- 归档内容不影响高频入口效率。

## 数据模型建议

### HubItem

所有可被 Quick Launch 搜索的对象应尽量继承统一基础模型，避免每个模块各写一套临时字段。

```ts
interface HubItem {
  id: string
  title: string
  type: 'link' | 'tool' | 'prompt' | 'snippet' | 'feed' | 'integration'
  category: string
  enabled: boolean
  description?: string
  tags?: string[]
  aliases?: string[]
  icon?: string
  favorite?: boolean
}
```

### ResourceItem

```ts
interface ResourceItem extends HubItem {
  type: 'link'
  url: string
  openIn?: 'same-tab' | 'new-tab'
  local?: boolean
}
```

### UtilityItem

```ts
interface UtilityItem extends HubItem {
  type: 'tool'
  mode: 'inline' | 'external'
  component?: string
  url?: string
}
```

### IntegrationItem

```ts
interface IntegrationItem extends HubItem {
  type: 'integration'
  provider: string
  level: 0 | 1 | 2 | 3
  sourceUrl?: string
  config?: Record<string, unknown>
}
```

### SnippetItem

```ts
interface SnippetItem extends HubItem {
  type: 'prompt' | 'snippet'
  content: string
  language?: string
  copyLabel?: string
}
```

### ScratchpadItem

```ts
interface ScratchpadItem {
  id: string
  type: 'text' | 'link' | 'prompt' | 'code' | 'json' | 'markdown'
  content: string
  title?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}
```

## 插件迁移关系

```text
Navigation -> Quick Launch + Collections
Tools -> Workbench
Blog -> Feeds
Stats / Analytics -> Integrations
Downloads -> Archive / Resources
Comments -> 暂缓或移除
Timeline -> 移除
Social -> Minimal Contact / Footer
```

## 实施阶段

### Phase 1: 结构重排

- 保留 Hero 和 Featured Project。
- Featured Project 之后改为 Quick Launch、Workbench、Collections、Scratchpad。
- 移除技术栈和项目经历表达。
- Social 收缩到 Footer 或 Contact Drawer。
- MVP 阶段不超过 4 个核心模块，避免一次性铺开 Integrations、Feeds、Archive。

### Phase 2: 可用工具

- Workbench 实现 5 个纯前端工具。
- Quick Launch 支持统一搜索。
- Collections 支持分类、收藏、别名。
- Snippets 支持 Prompt、命令或代码片段复制；是否独立成 section 由配置决定。
- 增加 Playwright 覆盖核心交互。

### Phase 3: 本地收纳

- 新增 Scratchpad。
- 使用 `localStorage` 保存临时内容。
- 支持清空、复制、搜索。
- `localStorage` 只用于临时数据，不作为唯一重要数据源。

### Phase 4: 外部集成

- 新增 Integrations。
- 先支持静态入口和公开 API。
- 需要密钥的能力必须走后端代理或保持禁用。

### Phase 5: 信息流

- 新增 Feeds。
- 先配置源入口。
- 后续增加构建时抓取或 Worker 缓存。

## 双 Agent 交替工作流

本项目后续迭代采用两个角色交替推进。

### 实现功能 Agent

职责：

- 根据当前 spec 选择一个小阶段实现。
- 保持改动范围清晰。
- 优先复用现有插件系统、配置加载器、Zod schema 和测试结构。
- 不引入不必要依赖。
- 不把技术栈和项目经历内容重新引入 Featured Project 后续模块。
- 每轮输出改动文件、行为变化和验证结果。

### 审查改进 Agent

职责：

- 审查实现是否符合本 spec。
- 检查方向是否偏回作品集、技术栈陈列或普通导航页。
- 检查配置契约、空状态、错误状态、可访问性和移动端布局。
- 检查是否存在假数据、密钥泄漏、前端暴露私有 API 等问题。
- 只要发现不合理方向或漏洞，就必须提出改进项。

### 交替规则

```text
实现功能 Agent 完成一小步
审查改进 Agent 审查
如果有方向问题或漏洞，返回实现功能 Agent 修改
如果审查通过，进入下一小步
```

### 每轮最小闭环

每轮必须包含：

- 明确目标。
- 变更范围。
- 配置变化。
- 用户可见行为。
- 自动化验证。
- 审查结论。

### 退出标准

只有当审查改进 Agent 明确认为不存在方向偏差和明显漏洞，并且当前阶段验收标准通过时，才能进入下一阶段。

## 总体验收标准

- Hero 和 Featured Project 保持可见且不被重构成工具区。
- Featured Project 之后不再展示技术栈、履历、项目经历。
- 后续模块具备跳转、搜索、工具、收藏或集成能力。
- 页面仍保持配置驱动。
- 禁用任意新插件后页面不崩溃。
- 没有假统计、假评论、假下载、假集成状态。
- 不把任何私钥、token 或个人敏感数据放入前端配置。
- `npm run lint` 通过。
- `npm run check:assets` 通过。
- `npm run build` 通过。
- Playwright 覆盖 Quick Launch、Workbench 和 Collections 的核心交互。
