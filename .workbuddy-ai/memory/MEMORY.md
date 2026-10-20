# kkhome 项目长期约定

## 门禁与环境（每次改动都要用到）

- 完整门禁：`npm run check`（lint + check:assets + check:data + test:unit + build + test:e2e）。
  CI 在 `.github/workflows/ci.yml` 的 `quality-gate` job 跑它，**它不绿，deploy job 不会启动**。
- **本机跑门禁必须带 `CODEBUDDY_SAFE_DELETE_ENABLED=0`**：
  ```bash
  CODEBUDDY_SAFE_DELETE_ENABLED=0 npm run check
  ```
  否则安全删除 shim 会拦批量删除（阈值 50 文件，且**按每轮对话累计计数**），
  Playwright 清 `test-results/` 或 vite 清 `dist/` 子目录时直接失败。
  **值必须是 `0`，传 `false` 无效**（shim 里判断的是 `!== '0'`）。
  清理临时文件时也要带上这个前缀，否则同轮累计删超阈值会被拦。
  看到 `safe-delete` 字样就先怀疑环境，别怀疑代码。
- **本机 `npx playwright test` 收尾可能挂死**（`worker-0 process did not exit within 300000ms`），
  但**用例本身全过**。这是环境问题，已用对照定性：加一个只 `goto('about:blank')`
  的临时 spec，它也挂。**别为这个去 `git stash` 二分。**
- **`TaskStop` 杀不掉 vite**（只杀 npm 包装进程，vite 变孤儿占着 5173）。
  用 `Get-NetTCPConnection -LocalPort 5173` 拿 `OwningProcess` 精确杀，
  别 `taskkill /IM node.exe`（会连 WorkBuddy 宿主一起杀）。
- `test-results/` 被 Playwright 启动时清空。要留存的截图/证据放 `shots/` 或 `docs/evidence/`。
- **探针脚本放 `test-results/`**（同时被 gitignore 和 eslint ignore）。
  放根目录会被 `eslint .` 扫到，让门禁挂。但残留探针会撑爆上面的 50 文件阈值。
- vite 会在根目录留 `vite.config.ts.timestamp-*.mjs`，已被 `.gitignore:49` 忽略。

## 验收方法（别用计算样式判可见性）

- **计算样式会骗人**：元素可以 `opacity: 1` / `translate: 0px` / `backgroundClip: text`
  全都"正常"，却一个像素都没画出来（我踩过：逐字动画破坏了渐变裁切字）。
- 判可见性用**像素差异法**：截同一区域两次（一次把目标 `visibility: hidden`），
  字节不同 = 真的画出了像素。
- **静态截图证明不了动效**。要逐帧采样量出时序（错峰时刻、首帧是否已隐藏）。

## 动效层

- **anime.js 只能从 `@core/motion` 进入**，有 eslint `no-restricted-imports` 护栏钉住。
  动效层在 `src/core/motion/`（目录，9 个模块）。
- 判据：输入是 CSS 状态（`:hover`/class）→ 用 CSS；输入是连续量或运行时数据
  （指针、滚动、字数、列表长度）→ 用 anime.js；输入是无（装饰循环）→ 用 CSS。
- 详见技能 `animejs-motion-layer`（含 v4 的用法坑与验收方法）。

## 插件体系

- 插件开关在 `public/config/plugins.config.json`（**不是** `src/` 里）。
  改它等于改产品形态，不要为了验证方便去动 —— 验证完要还原。
- `food` / `ambient-music` 已实现但**未注册进配置**，属编译但不可达的模块。

## 内容真实性

- 仓库硬规矩：**不许出现占位数据/假数据**。有 e2e 断言专门卡这条
  （`homepage renders configured content without placeholders`）。
- 降级要有明确提示，不静默失败（如 hero 视频不可用时显示 `.vh-note`）。
