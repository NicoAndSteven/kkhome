# UI 优化与日间模式 Spec

## Why
用户需要移除社交链接的邮箱图标按钮，并为现有的主题切换按钮添加日间模式 CSS 样式适配。

## What Changes
- 移除 Social 插件中的邮箱图标按钮 div
- 为日间模式添加 CSS 样式适配（浅色主题）
- 现有的 ThemeToggle 组件已有切换逻辑，只需添加样式

## Impact
- Affected specs: 社交插件、主题样式
- Affected code:
  - `src/plugins/social/index.tsx` - 移除邮箱图标
  - `src/index.css` - 添加日间模式样式
  - `tailwind.config.js` - 添加日间模式颜色变量

## ADDED Requirements

### Requirement: 移除邮箱图标按钮
系统应当移除社交链接中的邮箱图标按钮，保持界面简洁。

#### Scenario: 社交区域显示
- **WHEN** 用户查看社交区域
- **THEN** 不显示邮箱图标按钮

### Requirement: 日间模式样式适配
系统应当为日间模式提供完整的 CSS 样式支持。

#### Scenario: 切换到日间模式
- **WHEN** 用户点击现有的主题切换按钮切换到日间模式
- **THEN** 页面显示浅色背景、深色文字的日间主题

#### Scenario: 主题持久化
- **WHEN** 用户切换主题后刷新页面
- **THEN** 系统保持用户选择的主题（现有 localStorage 逻辑已实现）

### Requirement: 现有主题切换按钮功能适配
系统现有的 ThemeToggle 组件已有完整的切换逻辑，只需添加 CSS 样式即可生效。

#### Scenario: 主题切换按钮显示
- **WHEN** 用户查看导航栏
- **THEN** 主题切换按钮显示当前主题对应的图标（日间显示月亮，夜间显示太阳）

## MODIFIED Requirements
无

## REMOVED Requirements
无