# UI 重构计划：参照 TECH_PRO 深色技术专业风格

## 概述

将当前浅色 Luminous Minimalism 设计重构为深色技术专业风格（TECH_PRO），面向台式电脑优化排版和显示比例。

## 当前状态分析

### 当前设计特点
- **主题**: 浅色 Luminous Minimalism
- **背景**: 暖白色 #f8faf8
- **主色**: 薄荷绿 #006d43
- **最大宽度**: 1440px
- **字体**: Geist
- **效果**: 玻璃态卡片、自然光阴影

### 参考设计特点（TECH_PRO）
- **主题**: 深色技术风格
- **背景**: 深黑 #0a0a0a
- **主色**: 青色 #8aebff / #22d3ee
- **最大宽度**: 1200px（更适合台式电脑）
- **字体**: Inter + JetBrains Mono + Geist
- **效果**: 交互式背景、玻璃态、shimmer 动画、渐变文字

## 关键差异

| 方面 | 当前 | 目标 |
|------|------|------|
| 主题 | 浅色 | 深色 |
| 背景 | #f8faf8 | #0a0a0a |
| 主色 | #006d43 | #8aebff |
| 最大宽度 | 1440px | 1200px |
| 字体 | Geist | Inter + JetBrains Mono + Geist |
| 特效 | 玻璃态 | 交互背景 + 玻璃态 + Shimmer |

## 实施步骤

### Phase 1: 更新 Tailwind 配置

**文件**: `tailwind.config.js`

**更改内容**:
1. 替换所有颜色令牌为深色主题配色
   - surface: #131313
   - background: #0a0a0a
   - primary: #8aebff
   - secondary: #c0c1ff
   - text-muted: #a3a3a3
   - border-subtle: rgba(255, 255, 255, 0.1)
   - glow-cyan: rgba(34, 211, 238, 0.15)
   - glow-indigo: rgba(99, 102, 241, 0.15)

2. 更新间距系统
   - container-max: 1200px（从 1440px 改为 1200px）
   - gutter: 32px（从 24px 增加）
   - xl: 80px（从 64px 增加）

3. 更新字体配置
   - display-lg: Geist 64px（大标题）
   - headline-md: Geist 32px
   - body-lg/body-md: Inter
   - label-mono: JetBrains Mono

### Phase 2: 更新全局 CSS 样式

**文件**: `src/index.css`

**更改内容**:
1. 移除浅色背景，添加深色背景
2. 添加交互式背景样式（.interactive-bg）
3. 更新玻璃态样式为深色版本
4. 添加渐变文字效果（.text-gradient）
5. 添加 shimmer 动画（.shimmer-btn）
6. 添加 reveal 动画
7. 添加 float 动画
8. 更新 Material Symbols 样式

### Phase 3: 更新基础组件

**文件**: 
- `src/components/Layout.tsx`
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/components/Card.tsx`

**更改内容**:

#### Layout.tsx
- 添加交互式背景组件
- 更新背景色为深色
- 更新最大宽度为 1200px
- 更新内边距为 gutter (32px)

#### Header.tsx
- 更新为深色玻璃态导航栏
- 高度改为 h-16（从 h-20 减少）
- 添加 border-subtle 边框
- 更新 Logo 样式
- 更新导航链接样式

#### Footer.tsx
- 更新为深色主题
- 添加"Available for projects"状态指示器
- 使用 JetBrains Mono 字体

#### Card.tsx
- 更新为深色玻璃态样式
- 添加悬停发光效果

### Phase 4: 更新插件组件

**文件**:
- `src/plugins/profile/index.tsx`
- `src/plugins/navigation/index.tsx`
- `src/plugins/tools/index.tsx`
- `src/plugins/social/index.tsx`

**更改内容**:

#### Profile 插件
- Hero 区域重新设计
- 头像添加 float 动画
- 标题使用 display-lg 字号
- 添加渐变文字效果
- 添加 CTA 按钮（shimmer 效果）
- 技能标签使用 JetBrains Mono 字体
- 添加工作台图片展示区域

#### Navigation 插件
- 更新搜索框为深色风格
- 卡片使用深色玻璃态
- 添加箭头图标动画
- 更新分类标签样式

#### Tools 插件
- 工具卡片重新设计（4 列网格）
- 添加"Daily Use"/"Active"标签
- 添加收藏按钮
- 使用 JetBrains Mono 字体
- 添加发光悬停效果

#### Social 插件
- 更新为深色玻璃态
- 悬停时背景变为 primary 色
- 添加向上移动动画

### Phase 5: 更新 App.tsx

**文件**: `src/App.tsx`

**更改内容**:
- 添加交互式背景的鼠标跟踪逻辑
- 添加 reveal 动画的 Intersection Observer
- 更新主内容区域的间距

### Phase 6: 更新 index.html

**文件**: `index.html`

**更改内容**:
- 添加 Inter 字体
- 添加 JetBrains Mono 字体
- 更新 title 为 "TECH_PRO | Full-Stack Engineer"

## 台式电脑优化要点

1. **最大宽度**: 1200px（更适合桌面显示器）
2. **内边距**: gutter 32px（更宽松）
3. **网格布局**: 
   - Hero: 单列居中
   - About: 2 列（文字 + 图片）
   - Quick Links: 3 列
   - Tools: 4 列
4. **字体大小**:
   - 标题: 64px（display-lg）
   - 副标题: 32px（headline-md）
   - 正文: 16-18px
5. **间距**: 更慷慨的垂直间距（xl: 80px）

## 验证步骤

1. 检查深色主题是否正确应用
2. 检查交互式背景是否工作
3. 检查所有组件的深色玻璃态效果
4. 检查字体是否正确加载（Inter, JetBrains Mono, Geist）
5. 检查最大宽度是否为 1200px
6. 检查 shimmer 动画是否正常
7. 检查 reveal 动画是否触发
8. 检查响应式布局（移动端适配）

## 假设与决策

1. **保留插件系统架构**: 不改变核心插件系统，只更新视觉样式
2. **保留配置文件结构**: 不改变配置文件格式，只更新内容
3. **默认深色主题**: 移除浅色主题支持，专注于深色体验
4. **保留 Material Symbols**: 继续使用 Material Symbols 图标
5. **添加交互式背景**: 实现鼠标跟随的渐变背景效果
