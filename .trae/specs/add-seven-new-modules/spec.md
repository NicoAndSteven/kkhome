# 添加7个新功能模块 Spec

## Why
用户希望扩展个人主页功能，添加项目展示、时间线、博客文章、统计数据、访客统计、留言板、下载资源等7个模块，以提供更丰富的个人展示和互动功能。

## What Changes
- 新增 Projects Plugin（项目展示模块）
- 新增 Timeline Plugin（时间线模块）
- 新增 Blog Plugin（博客文章模块）
- 新增 Stats Plugin（统计数据模块）
- 新增 Analytics Plugin（访客统计模块）
- 新增 Comments Plugin（留言板模块）
- 新增 Downloads Plugin（下载资源模块）

## Impact
- Affected code:
  - `src/plugins/projects/index.tsx`（新建）
  - `src/plugins/timeline/index.tsx`（新建）
  - `src/plugins/blog/index.tsx`（新建）
  - `src/plugins/stats/index.tsx`（新建）
  - `src/plugins/analytics/index.tsx`（新建）
  - `src/plugins/comments/index.tsx`（新建）
  - `src/plugins/downloads/index.tsx`（新建）
  - `src/plugins/index.ts`（更新插件注册）
  - `src/core/types.ts`（添加新类型定义）
  - `public/config/plugins.config.json`（添加新插件配置）

## ADDED Requirements

### Requirement: Projects Plugin（项目展示模块）
展示个人项目作品集。

#### Scenario: 项目卡片展示
- **WHEN** 用户访问网站
- **THEN** 应看到项目展示区域
- **AND** 每个项目包含名称、描述、技术栈标签
- **AND** 显示项目链接（GitHub/演示地址）
- **AND** 支持项目截图/图片展示
- **AND** 使用玻璃态卡片样式

### Requirement: Timeline Plugin（时间线模块）
展示个人经历/职业历程。

#### Scenario: 时间节点展示
- **WHEN** 用户访问网站
- **THEN** 应看到时间线区域
- **AND** 以时间轴形式展示经历
- **AND** 包含教育背景、工作经历
- **AND** 每个节点显示时间、标题、描述
- **AND** 使用左右交替布局

### Requirement: Blog Plugin（博客文章模块）
展示最新博客文章。

#### Scenario: 文章列表展示
- **WHEN** 用户访问网站
- **THEN** 应看到博客文章区域
- **AND** 显示文章标题、摘要、日期
- **AND** 支持外部博客链接
- **AND** 使用卡片样式展示
- **AND** 显示文章数量限制（最多5篇）

### Requirement: Stats Plugin（统计数据模块）
展示 GitHub 统计数据。

#### Scenario: 统计数据展示
- **WHEN** 用户访问网站
- **THEN** 应看到统计数据区域
- **AND** 显示 GitHub 仓库数、贡献数
- **AND** 显示编程语言使用比例
- **AND** 使用可视化图表或进度条
- **AND** 数据从配置文件读取

### Requirement: Analytics Plugin（访客统计模块）
展示访客统计数据。

#### Scenario: 访客数据展示
- **WHEN** 用户访问网站
- **THEN** 应看到访客统计区域
- **AND** 显示总访客数量
- **AND** 显示今日访客数量
- **AND** 使用简洁的数字展示
- **AND** 数据从配置文件读取（模拟数据）

### Requirement: Comments Plugin（留言板模块）
访客留言功能。

#### Scenario: 留言展示和提交
- **WHEN** 用户访问网站
- **THEN** 应看到留言板区域
- **AND** 显示已有留言列表
- **AND** 提供留言输入框
- **AND** 支持匿名留言
- **AND** 留言存储在本地状态（演示）

### Requirement: Downloads Plugin（下载资源模块）
提供资源下载。

#### Scenario: 资源列表展示
- **WHEN** 用户访问网站
- **THEN** 应看到下载资源区域
- **AND** 显示资源名称、描述、类型
- **AND** 提供下载链接
- **AND** 显示下载次数（模拟）
- **AND** 使用卡片样式展示