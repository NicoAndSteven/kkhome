# 数据替换为真实信息 Spec

## Why
当前 UI 显示的所有数据都是预留的示例数据，需要替换为用户的真实个人信息、项目、经历等数据，以提供真实有效的个人展示。

## What Changes
- 将所有配置文件中的示例数据替换为真实数据
- 更新个人信息、社交链接、项目作品、职业经历、博客文章等
- 更新统计数据和访客数据

## Impact
- Affected code:
  - `public/config/site.config.json`
  - `public/config/plugins.config.json`

## 需要用户提供的信息清单

### 1. Profile（个人信息）✅ 已有部分真实数据
**当前状态**: 姓名、邮箱已真实，其他需要确认
**需要确认/补充**:
- ✅ 姓名：垣钰（已确认）
- ✅ 邮箱：1215240348@qq.com（已确认）
- ❓ 职位标题：当前为"全栈开发工程师"，是否需要修改？
- ❓ 个人简介：当前为"专注于现代 Web 技术开发..."，是否需要修改？
- ❓ 技能列表：当前为 ["React", "TypeScript", "Node.js", "Python", "Docker", "Cloudflare"]，是否需要修改？
- ❓ 所在地：当前为"北京，中国"，是否需要修改？

### 2. Navigation（导航链接）
**需要提供**:
- 个人博客链接（当前：https://blog.example.com）
- GitHub 主页链接（当前：https://github.com/yourusername）
- 技术文档链接（当前：https://docs.example.com）
- 在线简历链接（当前：https://resume.example.com）

### 3. Social（社交链接）
**需要提供**:
- GitHub 用户名（当前：yourusername）
- Twitter 用户名（当前：yourusername）
- LinkedIn 用户名（当前：yourusername）
- 微博链接（当前：https://weibo.com/yourusername）
- 知乎链接（当前：https://zhihu.com/people/yourusername）

### 4. Projects（项目作品）- 6个项目
**每个项目需要提供**:
- 项目名称
- 项目描述
- 技术栈（数组）
- GitHub 链接（可选）
- 演示链接（可选）
- 项目截图（可选）

**当前示例项目**:
1. 个人主页
2. CLI 工具集
3. 博客系统
4. API 服务
5. 移动应用
6. 数据可视化

### 5. Timeline（职业历程）- 5个节点
**每个节点需要提供**:
- 日期（格式：YYYY-MM）
- 标题
- 描述
- 类型：education（教育）/ work（工作）/ achievement（成就）

**当前示例节点**:
1. 2024-01：高级开发工程师
2. 2022-06：全栈开发工程师
3. 2022-03：获得优秀毕业生
4. 2018-09：计算机科学学士
5. 2017-05：编程竞赛获奖

### 6. Blog（博客文章）- 4篇文章
**每篇文章需要提供**:
- 文章标题
- 文章摘要
- 发布日期（格式：YYYY-MM-DD）
- 文章链接
- 标签（可选）

**当前示例文章**:
1. 深入理解 React Hooks
2. TypeScript 高级类型技巧
3. Node.js 性能优化实践
4. Docker 容器化部署指南

### 7. Stats（统计数据）
**需要提供**:
- GitHub 仓库数量（当前：42）
- GitHub 贡献次数（当前：1256）
- 编程语言使用比例（当前示例）：
  - TypeScript: 45%
  - JavaScript: 25%
  - Python: 15%
  - Go: 10%
  - Other: 5%

### 8. Analytics（访客统计）
**需要提供**:
- 总访客数量（当前：12580）
- 今日访客数量（当前：156）
- 本周访客数量（当前：892）
- 注：可使用真实数据或保留模拟数据

### 9. Comments（留言板）
**可选处理**:
- 保留示例留言
- 清空留言列表
- 提供真实留言数据

### 10. Downloads（下载资源）- 6个资源
**每个资源需要提供**:
- 资源名称
- 资源描述
- 资源类型
- 下载链接
- 下载次数（可选）
- 图标（可选）

**当前示例资源**:
1. 开发工具包
2. 技术文档
3. 代码模板
4. 配置文件集
5. 设计资源
6. 演示视频

## ADDED Requirements

### Requirement: 数据收集计划
系统需要用户提供真实数据以替换示例数据。

#### Scenario: 用户提供数据
- **WHEN** 用户准备替换数据
- **THEN** 用户应按照信息清单提供真实数据
- **AND** 数据格式应符合配置文件要求
- **AND** 链接应有效可访问

### Requirement: 数据验证
替换后的数据应有效可用。

#### Scenario: 数据验证
- **WHEN** 数据替换完成
- **THEN** 所有链接应可访问
- **AND** 图片应正确加载
- **AND** 数据格式应正确