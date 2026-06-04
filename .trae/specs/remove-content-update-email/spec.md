# 移除部分内容并更新邮箱 Spec

## Why
用户希望简化页面内容，移除技能标签和工具推荐模块，并更新邮箱地址。同时希望获得可植入模块的建议。

## What Changes
- 移除 Profile 插件中的技能标签区域
- 移除 Tools 插件（整个工具推荐模块）
- 更新邮箱地址为 1215240348@qq.com

## Impact
- Affected code:
  - `src/plugins/profile/index.tsx`（移除技能标签）
  - `src/plugins/tools/index.tsx`（禁用或删除）
  - `public/config/plugins.config.json`（更新邮箱、禁用 Tools）

## ADDED Requirements

### Requirement: 可植入模块建议
系统可扩展以下模块：

#### 建议模块列表
1. **项目展示模块 (Projects Plugin)**
   - 展示个人项目作品集
   - 包含项目名称、描述、技术栈、链接
   - 支持图片/截图展示

2. **时间线模块 (Timeline Plugin)**
   - 展示个人经历/职业历程
   - 时间节点形式展示
   - 包含教育背景、工作经历

3. **博客文章模块 (Blog Plugin)**
   - 展示最新博客文章
   - 支持外部博客链接或内置文章
   - 显示文章标题、摘要、日期

4. **统计数据模块 (Stats Plugin)**
   - GitHub 统计（仓库数、贡献数）
   - 编程语言使用比例
   - 可视化图表展示

5. **音乐/爱好模块 (Interests Plugin)**
   - 展示个人兴趣爱好
   - 音乐播放器集成
   - 书籍/电影推荐

6. **访客统计模块 (Analytics Plugin)**
   - 访客数量统计
   - 访客来源分析
   - 热门页面排行

7. **留言板模块 (Comments Plugin)**
   -访客留言功能
   - 支持匿名留言
   - 留言审核功能

8. **下载/资源模块 (Downloads Plugin)**
   - 提供资源下载
   - 文档、工具、模板等
   - 下载次数统计

## MODIFIED Requirements

### Requirement: 移除技能标签
Profile 插件不再显示技能标签区域。

### Requirement: 禁用 Tools 插件
Tools 插件从页面中移除，不再显示工具推荐。

### Requirement: 更新邮箱
邮箱地址从 yuanyu@example.com 更改为 1215240348@qq.com。

## REMOVED Requirements

### Requirement: 技能标签展示
**Reason**: 用户希望简化页面内容
**Migration**: 移除 Profile 插件中的技能标签相关代码

### Requirement: 工具推荐模块
**Reason**: 用户希望移除该模块
**Migration**: 在配置中禁用 Tools 插件