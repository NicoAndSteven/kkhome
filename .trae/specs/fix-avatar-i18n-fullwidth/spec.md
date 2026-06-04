# 修复头像、中文化和全屏布局 Spec

## Why
头像图片未正确加载、多处英文文本未切换为中文、页面内容区域过窄导致左侧大量空白，需要修复这些问题以提供完整的中文用户体验。

## What Changes
- 修复头像图片路径和加载问题
- 将所有英文 UI 文本切换为中文（按钮、标题、标签等）
- 移除最大宽度限制，让页面占满全屏
- 修复 Header Logo 显示问题（不应显示完整站点标题）

## Impact
- Affected code:
  - `public/avatar.jpg`（头像文件缺失）
  - `src/plugins/profile/index.tsx`（按钮英文→中文）
  - `src/plugins/navigation/index.tsx`（标题和搜索框英文→中文）
  - `src/plugins/tools/index.tsx`（标题和标签英文→中文）
  - `src/plugins/social/index.tsx`（标题英文→中文）
  - `src/components/Layout.tsx`（移除 max-w 限制）
  - `src/components/Header.tsx`（Logo 显示修复）
  - `src/components/Footer.tsx`（英文→中文）

## ADDED Requirements

### Requirement: 头像图片正确显示
系统应正确加载和显示用户头像图片。

#### Scenario: 头像加载
- **WHEN** 用户访问网站
- **THEN** 应看到头像图片正确显示
- **AND** 头像保持圆形裁切和渐变边框样式

### Requirement: 全部 UI 文本中文化
所有用户可见的英文文本应切换为中文。

#### Scenario: 按钮文本
- **WHEN** 显示 CTA 按钮
- **THEN** "Get in Touch" → "联系我"
- **AND** "View My Work" → "查看作品"

#### Scenario: 区块标题
- **WHEN** 显示区块标题
- **THEN** "Explore My World" → "探索我的世界"
- **AND** "The Daily Stack" → "常用工具栈"
- **AND** "Connected Everywhere" → "社交网络"

#### Scenario: 搜索框
- **WHEN** 显示搜索框
- **THEN** placeholder "Search resources..." → "搜索资源..."

#### Scenario: 工具标签
- **WHEN** 显示工具标签
- **THEN** "Daily Use" → "日常使用"
- **AND** "Active" → "常用"
- **AND** "Pro Level" → "专业级"
- **AND** "Expert" → "专家"
- **AND** "Architect" → "架构级"
- **AND** "Mastery" → "精通"

#### Scenario: 页脚文本
- **WHEN** 显示页脚
- **THEN** "Available for projects" → "可接受项目合作"
- **AND** "Built with precision" → "精心构建"

### Requirement: 全屏布局
页面内容应占满全屏宽度，不留过多空白。

#### Scenario: 内容宽度
- **WHEN** 用户在宽屏显示器上访问
- **THEN** 内容区域应占满可用宽度
- **AND** 左右两侧不应有过多的空白
- **AND** 保留适当的内边距（32px-48px）

## MODIFIED Requirements

### Requirement: Header Logo
Logo 应显示简短的站点名称，而非完整的站点标题。

- **WHEN** 显示导航栏 Logo
- **THEN** 显示 "垣钰" 而非 "垣钰 | 个人主页"
