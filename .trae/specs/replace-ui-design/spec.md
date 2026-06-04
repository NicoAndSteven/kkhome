# 替换为 Luminous Minimalism 设计系统

## Why
当前网站使用的是深色霓虹科技风格，用户希望替换为更专业、极简的 "Luminous Minimalism" 设计系统，该设计强调清晰、透气感和专业感，适合展示个人作品和专业形象。

## What Changes
- **BREAKING**: 完全替换当前深色霓虹主题为浅色极简主题
- 更新 Tailwind 配置为新的设计令牌（颜色、字体、间距、圆角）
- 重写全局 CSS 样式（玻璃态、阴影、动画）
- 重构所有组件以匹配新设计系统
- 更新所有插件组件的视觉风格
- 添加 Geist 字体和 Material Symbols 图标

## Impact
- Affected specs: 整体 UI/UX 设计系统
- Affected code: 
  - `tailwind.config.js`
  - `src/index.css`
  - `src/components/*` (所有组件)
  - `src/plugins/*` (所有插件)

## ADDED Requirements

### Requirement: Luminous Minimalism 设计系统
系统应采用 "Luminous Minimalism" 设计系统，包含以下特性：

#### Scenario: 配色方案
- **WHEN** 用户访问网站
- **THEN** 应看到基于薄荷绿、柔和橙、天蓝色的浅色主题
- **AND** 背景使用暖白色 (#f8faf8)
- **AND** 卡片使用玻璃态效果（半透明白色 + 模糊）

#### Scenario: 玻璃态卡片
- **WHEN** 显示卡片组件
- **THEN** 应有半透明白色背景 (70% 不透明度)
- **AND** 20px 背景模糊
- **AND** 1px 白色边框 (80% 不透明度)
- **AND** 柔和的自然光阴影

#### Scenario: 排版系统
- **WHEN** 显示文字内容
- **THEN** 使用 Geist 字体
- **AND** 标题使用 600 字重，负字间距
- **AND** 正文使用 16px，1.5 行高

#### Scenario: 间距系统
- **WHEN** 布局页面元素
- **THEN** 遵循 8px 网格系统
- **AND** 使用慷慨的留白（64px+ 区块间距）

### Requirement: 组件设计规范
所有组件应遵循新设计系统的视觉规范：

#### Scenario: 按钮样式
- **WHEN** 显示主按钮
- **THEN** 使用薄荷绿填充 + 白色文字
- **WHEN** 显示次按钮
- **THEN** 使用玻璃态样式 + 薄荷绿文字

#### Scenario: 卡片悬停效果
- **WHEN** 用户悬停卡片
- **THEN** 卡片向上移动 8px
- **AND** 阴影增强

#### Scenario: 工具/技能标签
- **WHEN** 显示技能标签
- **THEN** 使用低饱和度背景色 (10-20% 不透明度)
- **AND** 高饱和度文字颜色

### Requirement: 图标系统
系统应使用 Material Symbols Outlined 图标：

#### Scenario: 图标显示
- **WHEN** 显示图标
- **THEN** 使用 Material Symbols Outlined 字体
- **AND** 图标风格为圆角终端和柔和角落

## MODIFIED Requirements

### Requirement: 主题切换
原深色/浅色主题切换改为仅支持浅色主题（可选深色模式支持）

### Requirement: 响应式布局
保持响应式设计，但调整断点和间距：
- Mobile: 20px 水平内边距
- Desktop: 48px 水平内边距
- 最大宽度: 1440px

## REMOVED Requirements

### Requirement: 霓虹发光效果
**Reason**: 新设计系统使用自然光和玻璃态，不使用霓虹效果
**Migration**: 移除所有 neon-text、neon-border、text-glow-* 类

### Requirement: 深色背景
**Reason**: 新设计系统使用浅色暖白背景
**Migration**: 移除 cyber-dark、cyber-darker 背景色

### Requirement: 网格背景和扫描线
**Reason**: 新设计系统强调极简和留白
**Migration**: 移除 cyber-grid、scanlines 效果
