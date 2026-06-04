# Tasks

- [x] Task 1: 更新 Tailwind 配置
  - [x] 1.1: 添加新的颜色令牌（surface、primary、secondary、tertiary 等）
  - [x] 1.2: 配置 Geist 字体和排版系统
  - [x] 1.3: 设置新的间距系统（8px 网格）
  - [x] 1.4: 配置圆角系统（sm、DEFAULT、md、lg、xl、full）
  - [x] 1.5: 添加自定义动画（hover-lift、sunlight-shadow）

- [x] Task 2: 更新全局 CSS 样式
  - [x] 2.1: 移除深色背景和霓虹效果样式
  - [x] 2.2: 添加玻璃态卡片样式（glass-card）
  - [x] 2.3: 添加自然光阴影样式（sunlight-shadow）
  - [x] 2.4: 添加悬停提升动画（hover-lift）
  - [x] 2.5: 添加渐变文字效果（dynamic-gradient-text）
  - [x] 2.6: 配置 Geist 字体导入

- [x] Task 3: 更新基础组件
  - [x] 3.1: 重写 Layout 组件（移除网格背景，添加浅色背景）
  - [x] 3.2: 重写 Header 组件（固定导航栏 + 玻璃态）
  - [x] 3.3: 重写 Footer 组件（极简风格）
  - [x] 3.4: 重写 Card 组件（玻璃态样式）
  - [x] 3.5: 重写 Loading 组件（极简加载动画）
  - [x] 3.6: 更新 ThemeToggle 组件（可选）

- [x] Task 4: 更新 Profile 插件
  - [x] 4.1: 重新设计头像展示（渐变边框圆环）
  - [x] 4.2: 更新个人信息布局
  - [x] 4.3: 重新设计技能标签（低饱和度背景）
  - [x] 4.4: 添加悬停效果

- [x] Task 5: 更新 Navigation 插件
  - [x] 5.1: 重新设计搜索框（极简风格）
  - [x] 5.2: 更新链接卡片样式
  - [x] 5.3: 重新设计分类标签

- [x] Task 6: 更新 Tools 插件
  - [x] 6.1: 重新设计工具卡片（白色丙烯风格）
  - [x] 6.2: 更新分类筛选按钮
  - [x] 6.3: 重新设计收藏功能

- [x] Task 7: 更新 Social 插件
  - [x] 7.1: 重新设计社交链接卡片
  - [x] 7.2: 添加悬停颜色变化效果
  - [x] 7.3: 使用 Material Symbols 图标

- [x] Task 8: 添加 Material Symbols 图标支持
  - [x] 8.1: 在 index.html 中添加 Material Symbols 字体链接
  - [x] 8.2: 配置图标样式（FILL、wght、GRAD、opsz）

- [x] Task 9: 更新配置文件
  - [x] 9.1: 更新 site.config.json 中的主题设置
  - [x] 9.2: 更新 plugins.config.json 中的图标配置

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1, Task 2]
- [Task 4] depends on [Task 3]
- [Task 5] depends on [Task 3]
- [Task 6] depends on [Task 3]
- [Task 7] depends on [Task 3, Task 8]
- [Task 9] depends on [Task 4, Task 5, Task 6, Task 7]
