# kkhome 产品评估与整改方案

> 盘点时间：2026-10-21
> 方式：只读盘点（未修改任何产品文件）
> 证据来源：`public/config/plugins.config.json`、`src/plugins/index.ts`、`src/core/routeBridge.ts`、`src/App.tsx`、`src/plugins/ai-navigator/*`、`functions/`、`migrations/`、`spec.md`、`checklist.md`、`tasks.md`
> 复现脚本：`test-results/audit-nav.mjs`、`test-results/nav-dump.txt`

---

## 一、一句话结论

**这个项目的代码质量在变好，但产品定义已经烂了。**

具体表现是三件事同时发生：

1. **产品定位漂移**：`spec.md` 说"个人 AI 工具导航与需求反馈 Hub，默认四路由"，代码里是 12 条路由、7 条可用、27 个插件目录。
2. **配置在说谎**：3 个模块配置写着 `enabled: true` 却永远没有路由（cloudflare-lab / gallery / ambient-music），5 个模块留着路由却插件禁用（访问时静默跳到别的页，不给"不可用"提示）。
3. **核心资产（313 条工具数据）是错的**：分类按关键词机械命中、描述由分类模板批量生成、42% 的标题是域名派生、首屏 48 条里就有"小红书主页"被当成 Markdown 编辑器。

第 3 条最要命：**它是你唯一的护城河，也是唯一在公开对访客说假话的地方。**

---

## 二、项目组成盘点（实际是什么）

仓库里其实是 **3 个独立应用 + 1 套后端**，不是一个网站：

| 组成 | 位置 | 规模 | 在门禁里 | 判断 |
|---|---|---|---|---|
| 主站 | `src/` | 108 文件 / ~14k 行 | 是（lint+build+e2e） | 主线 |
| 工具顾问 Agent | `hub-agent/` | 42 个跟踪文件 + 独立 node_modules | **否**（eslint ignore、CI 不构建） | 未跑通 |
| 视频生成 | `remotion/` | 10 个跟踪文件 + 独立 node_modules | **否** | 一次性产物 |
| Pages Functions | `functions/` | 1228 行（+ `_shared` 1054 行） | 仅单测覆盖 party/food | 5 个功能域真实在用 |

后端不是壳，是真东西：

- `wishes`（D1 表 2 张，含频控）
- `food`（2 张表，午/晚两套菜单）
- `party`（4 张表 + Durable Object worker `kkhome-party-rooms`）
- `stock`（Yahoo Finance 代理 + 自选股表）
- `music`（D1 + 流媒体）

**这直接决定了取舍：看盘/吃啥/游戏/音乐合计约 3800 行前端 + 930 行后端 + 6 张表，不是能随手删的模块。**

---

## 三、结构性矛盾（配置 / 路由 / 文档三方不一致）

### 3.1 插件目录 27 个，注册 16 个，配置 11 个，有路由 12 个

| 状态 | 数量 | 清单 | 后果 |
|---|---|---|---|
| 有路由且可用 | 7 | profile / ai-navigator / wish-wall / stock-watch / food / party-games / local-music | 正常 |
| 注册 + 配置启用 + **无路由** | 2 | `cloudflare-lab`、`gallery` | **死配置**：界面永远看不到，但配置说它开着 |
| 注册 + 配置禁用 + 无路由 | 1 | `news` | 配置一致，但 `checklist.md` 写着"新闻聚合可见" |
| 注册 + **无路由**（基础设施） | 1 | `ambient-music` | 被 `App.tsx` 直接 import 做首页雨声 + dock 播放器，不需要路由。当前用法正确，但"注册成插件"这件事是误导 |
| 有路由 + 配置禁用 | 5 | universal-inbox / quick-launch / workbench / collections / scratchpad | **静默失败**：访问 `#/workbench` 会落到第一个可用路由，用户不知道发生了什么 |
| **未注册**（纯死文件） | 11 | analytics blog comments downloads navigation projects social stats timeline tools workflow-deck | 约 1400 行死代码，不进 bundle，但每次改核心类型都要连带维护 |

### 3.2 文档与代码已经分叉

- `spec.md`：默认路由 `home / ai-tools / wish-wall / cloudflare-lab`。
- `checklist.md`：勾了 `cloudflare-lab 可见`、`news 可见`。
- `tasks.md`：写着"默认路由固定为 home / ai-tools / wish-wall / cloudflare-lab"。
- **代码**：`ROUTE_ITEMS` 里根本没有 `cloudflare-lab` 和 `news` 的条目。

三份文档都在描述一个不存在的站点。这是你最不能忍的那类问题：**文档在骗人**。

### 3.3 `applyConfigs` 的覆盖规则让"未配置"等于"按注册表走"

`PluginSystem.applyConfigs()` 只覆盖配置里列出的插件。所以：

- 注册表写 `enabled: true`、配置里没有 → **仍然是启用的**（stock-watch / food / local-music / gallery / ambient-music 都属于这种）。
- 这和"配置是权威"的直觉相反。任何以为"没写进配置就是关的"的判断都是错的。

---

## 四、313 条工具数据的六类病灶

以下全部是脚本量出来的，不是印象。

### 病灶 1：描述是分类模板生成的，与工具本身无关

**313 条工具，只有 26 种描述，且没有任何一种描述跨分类共用。**

| 分类 | 条数 | 不同描述数 |
|---|---|---|
| download | 25 | **1** |
| productivity | 16 | **1** |
| knowledge | 29 | **1** |
| ai | 27 | **1** |
| convert | 16 | 3 |
| image | 42 | 5 |
| design-assets | 59 | 4 |

最刺眼的后果：

- `7-Zip` / `WinRAR` / `Bandizip` / `360 Zip` 的描述都是"用于图片压缩、GIF 处理或图片体积优化"——它们是解压软件。
- `Doubao`（豆包 AI 生图）/ `Ps`（稿定设计）/ `Cuijianzhuang` 的描述都是"用于添加、去除或整理图片水印"。
- `Lab` / `Beautify Screenshots` / `Shots` 的描述都是"用于查找免费字体"——它们是文字海报/截图美化工具。

**这不是分类错位，这是每一张卡片都在说假话。**

### 病灶 2：分类是按关键词命中的，不是按用途

| 关键词 | 被吸进来的东西 | 落到的分类 |
|---|---|---|
| "压缩" | 7-Zip、WinRAR、Bandizip、360 Zip | `image` 图片处理 |
| "GIF 录制" | Snipaste、PixPin（截图软件） | `image` 图片处理 |
| "格式转换" | AdGuard 广告拦截、沉浸式翻译、KMS 激活 | `convert` 转换工具 |
| "AI" | ChatGPT、Claude、Kimi、豆包 | `ai`，而 `ai` 的标题叫**"其他"** |
| "电脑课"（爬虫兜底桶） | 36 条杂项，撒进 8 个分类 | 无 |

`ai` 这个分类 id 与它的显示名"其他"语义完全相反，而里面装的恰恰是最不该进"其他"的 27 条 AI 条目。

### 病灶 3：一个站点被拆成 N 个"工具"

22 个域名占了 98 条（31%）：

| 站点 | 条数 | 实际是什么 |
|---|---|---|
| github.com | 18 | 各软件的开源仓库页，多数与另一条主条目重复（OBS + OBS GitHub） |
| microsoftedge.microsoft.com | 17 | 浏览器扩展商店详情页 |
| **markdown.com.cn** | **17** | **同一个 Markdown 语法文档的 17 个锚点**：标题、粗体、斜体、引用块、有序列表、无序列表、代码、分隔线、链接、表格、代码块、脚注、标题编号、定义列表、删除线、任务列表 |
| crxsoso.com | 5 | 扩展下载站 |
| yikm.net | 4 | 小游戏站的不同游戏 |
| poki.com / js13kgames.com | 3 + 3 | 小游戏 |

markdown.com.cn 那 17 条不是 17 个工具，是**同一篇文章的目录**。

### 病灶 4：42% 的标题是域名派生，不是工具名

132 / 313 条标题由域名首段生成：

```
Web          ← web.baimiaoapp.com
Lab          ← lab.magiconch.com（出现 2 次）
Tools        ← tools.rotato.app
Font         ← font.sucai999.com
Ask          ← ask.xiaoyuzhoufm.com
Remove       ← remove.bg
Ps           ← ps.gaoding.com
Shots        ← shots.so
store.steampowered.com/   ← 直接是域名
```

现有 `check:data` 的 `genericTitles` 是**手写清单**（`官网下载`/`Github`/`Zh`/`Apps`…），一个都没抓到上面这些。

### 病灶 5：内容性质混装——"工具"里塞了 35 个在线小游戏

35 条带"在线小游戏"标签，**33 条在 `design-assets`（素材设计）**：神庙逃亡、魂斗罗、超级玛丽、坦克大战、水果忍者、吃鸡、台球、羽毛球、音游……

同分类里还有：听播客（小宇宙）、报纸杂志、电影下载站、驱动下载页、GitHub 仓库。

### 病灶 6：8 条标题含非法 UTF-16（孤立代理项）

```
kyuncuts-com        U+DF38  "\udf38kyuncuts-可爱少女风"
glitchart-io        U+DCA5
durves-com          U+DDEC
frame-illust-com    U+DE91
products-ls-...     U+DFA8
tartanify-...       U+DFC1
shigurene-com       U+DC30
sozai-good-com      U+DFD5
```

原本应该是 emoji，被截断成单个低代理项，**原字符已丢失，只能重写标题**。浏览器渲染成替换块。

（说明：我第一次用 `codePointAt` 查这个，漏掉了 D800–DFFF 代理区，误报"0 条"。用 `charCodeAt` 重查才抓到。已修正。）

### 首屏实际看到什么

`index.tsx` 默认 `activeCategory = 'all'`，只渲染前 48 条（`filteredTools.slice(0, 48)`）。前 48 条里：

- 第 4–8 条：5 个 Markdown 编辑器，其中 **"Xiaohongshu" 是小红的用户主页链接**
- 第 13–15 条：豆包 / 稿定设计 / 水印工具，描述全是"添加、去除或整理图片水印"
- 第 25 条：标题就是 `Web`
- 第 26–28 条：三个截图/海报工具，描述全是"查找免费字体"
- 第 30–31 条：`Obsproject` 和 `OBS Studio` 是同一个软件的两条

---

## 五、为什么门禁没拦住

`npm run check:data` 目前只查 5 件事：

1. 必填字段非空
2. `category` 在 `categories` 列表里
3. `id` 重复
4. 同一 `title` 出现超过 3 次
5. 同 host + 同 title 重复

**它不查**：描述是否与标题相符、分类是否与内容相符、标题是否是域名垃圾、是否含非法字符、是否一页拆多条。

所以门禁一直是绿的，数据一直是错的。按你自己的标准：**这不是护栏，是装饰。**

---

## 六、取舍建议

我把 27 个插件分成四档。判断依据是"有没有真实后端 / 有没有真实用户闭环 / 是否在 spec 主线内"。

### 第一档：保留为主线（3 个）

| 插件 | 理由 |
|---|---|
| `profile` | 门面，成本低 |
| `ai-navigator` | **唯一护城河**。313 条数据 + 搜索评分 + hub-agent 的 grounding 都挂在它上面 |
| `wish-wall` | 唯一"访客参与"闭环：D1 + 频控 + 蜜罐 + 降级草稿。真实可用 |

### 第二档：保留，但要承认它是另一条主线（3 个）

`stock-watch`（1348 行 + 397 行后端 + 自选股表）、`food`（1310 + 300 + 2 表）、`party-games`（1100 + 235 + 4 表 + DO worker）。

**这三个不该砍**——投入最重，后端最完整。但它们跟"AI 工具导航"没关系。

结论：**产品其实是"个人 Hub"，有两条主线**：
- 信息主线：导航 + 许愿
- 生活主线：看盘 + 吃啥 + 游戏 + 音乐

**该改的是 `spec.md`，不是代码。** 继续假装这是"AI 工具导航 Hub"，只会让每次加功能都像在违背规格。

### 第三档：降级为基础设施，撤销"插件"身份（1 个）

`ambient-music`：无路由、被 `App.tsx` 直接 import 做首页雨声和 dock 播放器。这个用法是对的，但把它注册成"插件"且 `enabled: true` 是**配置在说谎**。

改法：从 `plugins` 注册表和配置里移除，保留 `src/plugins/ambient-music/` 目录作为引擎模块（或移到 `src/core/audio/`）。这样"插件数 = 可见路由数"，不再需要解释。

### 第四档：清掉（13 个）

| 类别 | 清单 | 处置 |
|---|---|---|
| 纯死文件（未 import，不进 bundle，~1400 行） | analytics / blog / comments / downloads / navigation / projects / social / stats / timeline / tools / workflow-deck | **删除目录**（git 有历史，随时找回） |
| 死模块（进 bundle，无路由，永不渲染） | cloudflare-lab / news / gallery | cloudflare-lab 与 news：**先决定**——要么补路由补验收，要么删。gallery：无配置无路由，直接删 |
| 半启用（有路由，插件禁用，访问静默跳走） | universal-inbox / quick-launch / workbench / collections / scratchpad | **二选一**：删路由（保留插件备用），或删插件（保留路由骨架）。现在这种"路由在、插件关"的状态是最差的 |

关于 `cloudflare-lab` 和 `news` 要单独说：

- `cloudflare-lab` 有 283 行前端 + `/api/health` + feature flags 面板，是**唯一展示"这个站跑在 Cloudflare 上"的东西**。它符合"个人 Hub"的技术叙事，但不符合"工具导航"的产品叙事。**建议保留并补路由**，因为它证明后端是真的。
- `news` 只有 284 行前端 + 45 行后端代理，且 `checklist` 说它"可见"而实际没有路由。**建议删**——新闻聚合跟两条主线都不搭，且后端是薄代理。

### 仓库层面的取舍

| 对象 | 建议 |
|---|---|
| `hub-agent/` | **要么让它进 CI，要么标记为 `experiments/` 并写清楚"未跑通"**。现在它在仓库里、有独立 node_modules、eslint 忽略、CI 不管、tasks.md 说"待配置 API key"——这是第四种状态，最费解。而且它的 `sync:catalog` 会把 313 条错位数据同步成 Agent 的 grounding，**错位数据会被 Agent 放大成"推荐错的工具"** |
| `remotion/` | 只有 10 个跟踪文件，一次性产物（聚会邀请函/回顾图）。移到 `tools/` 或直接删除，别占根目录 |
| `functions/` + `migrations/` + `workers/` | 保留，这是真资产 |
| 根目录 7 个 md（`spec/tasks/checklist/AGENTS/agent/README/site-state`） | `checklist.md` 与 `tasks.md` 已经与代码不符，**必须重写或删**。手写清单每加一个模块就要回头改一处，这是你最烦的模式 |

---

## 七、工具分类重构方案

### 7.1 现在的问题：三个维度混在一个层级

`convert / image / video-audio / document / design-assets` 是**文件类型**维度；
`download / software-system / productivity / knowledge` 是**用途**维度；
`ai` 是**技术**维度，而它的显示名是"其他"。

三个维度平铺成 10 个 tab，必然出现"这个该放哪"的争议，于是靠关键词命中来凑——这就是错位的根因。

### 7.2 建议的分类法（按"用户来干什么"分，单一维度）

| id | 名称 | 装什么 | 明确不装 |
|---|---|---|---|
| `convert` | 转换与压缩 | 格式转换、PDF 处理、图片/文件压缩 | 解压软件（→ software） |
| `image` | 图片处理 | 抠图、去水印、修图、放大、GIF 制作 | 压缩软件、截图软件（→ software）、小游戏（→ fun） |
| `video-audio` | 视频音频 | 剪辑、录屏、字幕、转写、音效/配乐素材 | 下载器（→ download）、在线小游戏 |
| `document` | 文档演示 | Markdown、笔记、PPT、简历、海报卡片 | 背景图/插画/字体素材（→ design） |
| `design` | 设计素材 | 字体、图标、样机、背景、插画、配色 | 小游戏（→ fun）、播客（→ learn） |
| `download` | 下载采集 | 下载器、网页媒体抓取、资源站、驱动下载 | 解压、在线工具 |
| `software` | 电脑软件 | 装机必备、卸载、驱动、系统维护、浏览器扩展 | 一切在线工具 |
| `ai` | AI 工具 | 对话模型、提示词、AI 搜索、排行榜 | 一切非 AI（现在 27 条里有 7 条是"电脑课"扩展） |
| `learn` | 学习阅读 | 博客、RSS、英语、指南手册、播客、审美 | 素材站 |
| `fun` | 休闲 | 在线小游戏、表情包 | 其他一切 |

变化说明：

- 新增 `fun`，把 35 条小游戏从 `design-assets` 里摘出来。**它们不该消失，也不该冒充设计素材。**
- `productivity`（效率工具）**取消**。它现在 16 条内容是：文件传输、手写体、右键菜单、微信防撤回、游戏进程冻结、RSS、热榜、学术搜索、截图、扩展商店——没有共同点。按内容拆到 `software` / `learn` / `download`。
- `ai` 的标题从"其他"改成"AI 工具"，并把 7 条 `电脑课` 扩展移出去。

### 7.3 内容性质要分开（比分类更重要）

313 条里混了三种东西，用户预期完全不同：

1. **在线工具**：点开就能用（Convertio、TinyPNG、Remove.bg）
2. **桌面软件**：要下载安装（7-Zip、Snipaste、OBS、驱动）
3. **资源站/内容**：是"去看"不是"去用"（小游戏、播客、报纸杂志、电影站、博客）

建议加一个 `kind` 字段（`online` / `desktop` / `resource`），卡片上给一个小标记。这样即使分类还有争议，用户也知道点进去会发生什么。

### 7.4 逐条处置策略

| 处置 | 数量 | 说明 |
|---|---|---|
| 合并（同站拆条） | 约 40 条 → 合并后约 15 条 | markdown.com.cn 17→1；github.com 18→约 8（与主条目合并）；pixpin/magiconch/tartanify/mixkit/pdfgear/getquicker/bestblogs/failory/newrank/arena 各 2→1 |
| 移分类 | 约 90 条 | 小游戏 35、解压 4、截图 5、驱动 8、字体/背景/插画约 30、扩展 17（→ software） |
| 重写标题 | 132 条 | 域名派生 → 真实工具名 |
| 重写描述 | **313 条（全部）** | 模板句 → 一句话真实用途 |
| 删除 | 约 20 条 | 小红书主页、B 站视频页、`store.steampowered.com/`、`crxsoso` 扩展页中的重复项 |
| 修非法字符 | 8 条 | 重写标题 |

清洗后预计 **210–240 条**。数量会降，但每条都能用。

### 7.5 需要补的护栏（每条都能变异验证）

| # | 规则 | 变异验证方式 |
|---|---|---|
| 1 | `description` 不得等于任何分类模板句（维护一个禁用句集合） | 把任一条描述改回模板句 → 门禁变红 |
| 2 | `description` 不得以"用于"开头且包含"或"（模板特征），且长度 ≥ 12 字 | 同上 |
| 3 | `title` 不得等于域名首段、不得含 `.com/.cn/.io` 等 TLD | 把 `Web` 改回去 → 变红 |
| 4 | 同 host 条目 > 2 时必须有 `variantOf` 字段说明归属，否则报错 | 加一条同 host 无 `variantOf` → 变红 |
| 5 | 标签含"小游戏"的条目不得出现在 `design`/`image` | 改分类 → 变红 |
| 6 | 所有字符串字段不得含 D800–DFFF 孤立代理项 | 塞一个 `\udf38` → 变红 |
| 7 | `tools.length` 与分类计数之和一致（防止漏字段） | 改一条 category 为空 → 变红 |

第 1、2 条是关键：**只要描述还能由分类模板批量生成，错位就会重新长回来。**

---

## 八、建议的执行顺序

不要一次改完 313 条。按你的习惯，分四步，每步都能独立验收：

**第 0 步（半天）**：先修"配置说谎"，不改数据
- 删 11 个未注册插件目录
- `ambient-music` 退出插件注册表
- 5 个半启用路由：删路由（保留插件目录）
- `cloudflare-lab` 补路由，或删
- `news` / `gallery` 删
- 重写 `spec.md` 路由章节 + 删掉 `checklist.md` 里对不上的勾
- 同步改 e2e（`homepage.spec.ts` 断言了 7 条路由和 label `导向`）

**第 1 步（半天）**：加 7 条数据护栏，此时**门禁应该变红**
- 这是验收：护栏写对了，现有数据必然大面积报错。红是预期结果。

**第 2 步（1–2 天）**：按新分类法批量迁移
- 先跑脚本生成"建议分类 + 建议标题"，人工过一遍 313 条
- 合并同站条目、删除垃圾条目

**第 3 步（1 天）**：逐条重写 313 条描述
- 这是唯一没法自动化的部分。可以按分类分批，每批做完跑一次门禁。

**第 4 步**：`sync:catalog` 重新同步给 hub-agent，并决定 hub-agent 的归属

---

## 九、决策与执行结果

### 你的决策

1. **定位**：个人 Hub，附带好用的工具和天马行空的东西，不设限，但确实要收敛。
2. **数据**：313 条全量重写。
3. **分类法**：新 10 类。

「不设限」和「收敛」并不冲突：**收敛的不是功能数量，是运行状态**。
以前的问题不是模块多，而是同一个仓库里并存五种状态（正常 / 死配置 / 死模块 / 半启用 / 死文件），
没人说得清哪些是活的。现在只留三种：上线、冷藏、归档。

### 已完成

**项目组成**

| 项 | 之前 | 现在 |
|---|---|---|
| `src/plugins/` 目录 | 27 | 14 |
| 注册插件 | 16 | 13 |
| 配置条目 | 11 | 13（与注册表一一对应） |
| 可用路由 | 7 | 8（补回 cloudflare-lab） |
| 归档 | — | 13 个目录移到 `docs/archive/plugins-retired-2026-10-21/` |

- `ambient-music` 退出插件注册表，回归它本来的身份：音频引擎。
- 配置 `order` 重排，不再有重复的 3/4/5/8。
- 访问冷藏路由（`#/workbench` 等）现在显示「模块不可用」面板，不再静默跳到别的页。

**工具数据**

| 指标 | 之前 | 现在 |
|---|---|---|
| 工具数 | 313 | 267 |
| 分类 | 10（混三个维度） | 10（单一维度，含新增 `fun`） |
| 描述种类 | 26 种（模板句） | 267 种（一条一句） |
| 域名派生标题 | 132 | 0 |
| 非法 UTF-16 标题 | 8 | 0 |
| 小游戏错分类 | 35 | 0 |
| 同站拆条未声明 | 98 条涉及 22 站 | 全部合并或标 `variantOf` |
| 数据门禁基线 | 311 条豁免 | **0** |

新增字段：`kind`（在线 / 软件 / 资源）、`variantOf`（同站归属）。
卡片上现在会显示「在线 / 软件 / 资源」，点开前就知道会发生什么。

**护栏**

`scripts/lib/ai-tools-rules.mjs`（单一实现）+ `scripts/check-ai-tools.mjs`（门禁）+ `scripts/refresh-baseline.mjs`（重算基线）。

变异验证（做了两次）：

- 注入一条「模板描述 + 域名标题 + 小游戏错分类」→ 命中 3 条规则，退出码 1。
- 基线归零后再注入 → 仍然拦下，没有豁免通道。

**顺手修掉的两个既有缺陷**

1. `food-menu.spec.ts` 依赖运行时刻：全程在「中午」tab 增删，但 13:00 后轮盘显示晚餐菜单，下午跑必挂。已用 `page.clock.setFixedTime()` 固定到北京时间 10:00。这是**假绿测试**，不是我的改动引起的。
2. 数据顺序导致首屏跨分类跳（转换 → 文档 → 视频）。现在无搜索词时按分类顺序排。

**文档**

- `spec.md` 重写：8 条路由、路由三态契约、新分类法、门禁规则表。
- `checklist.md` 重写：删掉「news 可见」这类对不上代码的勾。
- `tasks.md` 补整改记录。

### 当日推进（收纳 / 清残留 / 布局 / 文档）

**子项目归位**：`hub-agent/` 与 `remotion/` 移到 `experiments/`，同步修了 `sync-catalog.mjs` 里
指向旧路径的 `__dirname/../..`、`.gitignore`、eslint ignore，并写了 `experiments/README.md`
说明各自的状态与跑法。两个子项目与主站零引用（grep 确认无 import / CI 引用）。

**清残留**：

- `functions/api/news/`（3 个文件）归档 —— news 插件已归档，前端零引用。
- `src/core/types.ts` 里 11 个死类型（BlogPost / CommentItem / DownloadItem / NavigationItem /
  ProjectItem / SocialLink / StatsConfig / TimelineItem / ToolItem / WorkflowAction / WorkflowItem）
  移到归档区随插件走，全零引用。
- `plugins.config.json` 的 `sourceTitle` / `sourceUrl` / `sourceCategory` 三个采集溯源字段
  （占配置体积 17.5%）从运行时配置中移除，留档到 `docs/evidence/ai-tools-sources-2026-10-21.json`；
  schema、`AiTool` 类型、卡片 fallback 同步改。

**dock 播放器遮挡（布局修复）**：之前的方案只垫底部留白，实测那只能保证「滚到底」干净 ——
默认视图和滚动过程中卡片仍会整块从播放器下面经过。最终按「管理员按钮让位」的同一思路，
把内容区（含标题头）右侧让出播放器的通道：`.route-mode:has(.ac-dock-player) .route-view { padding-right: 300px }`。
移动端不渲染 dock，`:has()` 不成立，留白不受影响。
护栏：`tests/dock-clearance.spec.ts`，逐条桌面路由在初始视图和滚到底两个位置断言
「可见叶子节点 ∩ 播放器矩形 = ∅」。变异验证通过：摘掉这条 CSS 规则，测试变红并指名报出
被压的卡片内容。证据截图在 `shots/`。

**文档收敛**：`agent.md` 与 `AGENTS.md` 合并成后者（前者改成指针，不物理删除）；
`AGENTS.md` 补上 `check:data` / `test:unit` 命令和产品方向与工作规矩；
`README.md` 修正路由清单（补 4 条生活线）、启用插件列表、数据质量规则（旧文还写着
「输出 warning」）、删掉 9 个不存在的 `spec-cloudflare-*.md` 引用、更新 hub-agent 路径。
全库 md 交叉引用已校验无死链。

### 验证

```
lint            0 warning
check:assets    pass
check:data      267 tools / 11 categories / 基线 0
test:unit       82 tests, 81 pass, 1 skip
build           pass（622 kB / gzip 188 kB）
test:e2e        14 passed
```

### 还没做的

- `hub-agent` 已归位到 `experiments/`（路径、`sync:catalog`、eslint ignore、README 都跟上了）。
  经确认它属于「鸡肋的炫技」，已归档到 `docs/archive/experiments-retired-2026-10-21/`
  （`git mv`，未物理删除，历史里随时可取回）。
- `remotion/` 同样归位到 `experiments/`，是一次性产物，留不留随你。
- **后端绑定核对结论（当天口头纠正过）**：D1（`WISHES_DB`）和 R2（`MUSIC_BUCKET`）
  都已真实绑定且在用（音乐 API 读 R2、MP3 已移出 git；D1 迁移 001–009 已 apply）。
  行情后端 `/api/stock/*` 是真实上游代理（Yahoo Finance + 天天基金），不需要存储绑定。
  唯一没绑的是 KV `HUB_KV`（feature flags 按设计降级读 `features.config.json`），
  Vectorize / Queues / AI 是规划中的实验能力。checklist 已按核对结果改正。
- 新发现（本次修复 dock 遮挡时暴露的）：音频引擎没有已注册曲目时（例如直接深链到某个路由、
  自动播放又被浏览器拦掉），dock 播放器会显示「选择歌曲开始播放」却**不渲染任何控件** ——
  界面给了承诺却没有任何可点的东西。这属于「界面说假话」，待修。
