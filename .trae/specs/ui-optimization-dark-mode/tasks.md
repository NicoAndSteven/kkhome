# Tasks

- [x] Task 1: 移除社交链接中的邮箱图标按钮
  - [x] SubTask 1.1: 修改 `src/plugins/social/index.tsx`，过滤掉邮箱类型的链接

- [x] Task 2: 实现日间模式 CSS 样式适配
  - [x] SubTask 2.1: 在 `tailwind.config.js` 添加日间模式颜色变量（使用 CSS 变量）
  - [x] SubTask 2.2: 在 `src/index.css` 添加 `:root` 和 `:root.dark` 选择器的日间/夜间模式样式
  - [x] SubTask 2.3: 确保所有关键组件（背景、文字、卡片、按钮）在日间模式下正确显示

- [x] Task 3: 验证主题切换功能
  - [x] SubTask 3.1: 测试日间模式显示（浅色背景、深色文字）
  - [x] SubTask 3.2: 测试夜间模式显示（保持原有深色主题）
  - [x] SubTask 3.3: 测试主题持久化（刷新页面后保持选择）

# Task Dependencies
- [Task 1] 和 [Task 2] 可并行执行
- [Task 3] 依赖于 [Task 2]