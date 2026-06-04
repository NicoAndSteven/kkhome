# Tasks

- [x] Task 1: 更新类型定义
  - [x] 1.1: 在 src/core/types.ts 中添加 Projects、Timeline、Blog、Stats、Analytics、Comments、Downloads 相关类型

- [x] Task 2: 创建 Projects Plugin
  - [x] 2.1: 创建 src/plugins/projects/index.tsx
  - [x] 2.2: 实现项目卡片展示（名称、描述、技术栈、链接）
  - [x] 2.3: 使用 glass 样式和 grid-cols-2 md:grid-cols-3 布局

- [x] Task 3: 创建 Timeline Plugin
  - [x] 3.1: 创建 src/plugins/timeline/index.tsx
  - [x] 3.2: 实现时间轴布局（左右交替）
  - [x] 3.3: 显示时间节点（时间、标题、描述、图标）

- [x] Task 4: 创建 Blog Plugin
  - [x] 4.1: 创建 src/plugins/blog/index.tsx
  - [x] 4.2: 实现文章卡片（标题、摘要、日期、链接）
  - [x] 4.3: 使用 grid-cols-1 md:grid-cols-2 布局

- [x] Task 5: 创建 Stats Plugin
  - [x] 5.1: 创建 src/plugins/stats/index.tsx
  - [x] 5.2: 实现 GitHub 统计展示（仓库数、贡献数）
  - [x] 5.3: 实现编程语言比例进度条

- [x] Task 6: 创建 Analytics Plugin
  - [x] 6.1: 创建 src/plugins/analytics/index.tsx
  - [x] 6.2: 实现访客统计数字展示
  - [x] 6.3: 使用简洁的卡片样式

- [x] Task 7: 创建 Comments Plugin
  - [x] 7.1: 创建 src/plugins/comments/index.tsx
  - [x] 7.2: 实现留言列表展示
  - [x] 7.3: 实现留言输入和提交功能（本地状态）

- [x] Task 8: 创建 Downloads Plugin
  - [x] 8.1: 创建 src/plugins/downloads/index.tsx
  - [x] 8.2: 实现资源卡片（名称、描述、下载链接）
  - [x] 8.3: 显示下载次数

- [x] Task 9: 更新插件注册
  - [x] 9.1: 在 src/plugins/index.ts 中注册所有新插件

- [x] Task 10: 更新配置文件
  - [x] 10.1: 在 public/config/plugins.config.json 中添加所有新插件配置
  - [x] 10.2: 添加示例数据（项目、时间线、文章、统计等）

# Task Dependencies
- [Task 2-8] depends on [Task 1]
- [Task 9] depends on [Task 2-8]
- [Task 10] depends on [Task 9]