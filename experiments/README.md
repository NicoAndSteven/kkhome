# experiments

与主站**零耦合**的子项目。主站构建、lint、e2e 都不读这里的代码，它们各有独立依赖与运行方式。

放这里的条件只有一条：**不参与 `npm run check`**。
如果要让某个子项目进质量门禁，它就应该从 `experiments/` 挪回根目录，并在 CI 里加独立 job。

---

## remotion — 聚会邀请函与回顾图

用 Remotion 生成聚会邀请函、惩罚抽签、回顾图。一次性产物，不是站点功能。

**当前状态**：可用，产物在 `out/`（已 gitignore）。

```bash
cd experiments/remotion
npm install
npm run studio           # 打开 Remotion Studio 预览
npm run render:still     # 渲染邀请函 PNG 到 out/
npm run render:recap     # 渲染回顾图 PNG 到 out/
```

产物通过 `party-games` 插件展示，但**运行时不依赖它** —— 图片是静态资产。

---

## 已归档：hub-agent

原「Hub 工具顾问」（CodeBuddy Agent SDK 的 Agent Web 应用），2026-10-21 评估为鸡肋的炫技，
归档到 `docs/archive/experiments-retired-2026-10-21/hub-agent/`。要复活就 `git mv` 回来；
它读的目录数据由自己目录下的 `npm run sync:catalog` 从主站配置生成。
