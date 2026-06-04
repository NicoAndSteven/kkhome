# 修复布局问题并更新个人信息 Spec

## Why
页面左侧显示缺失部分内容，需要修复布局问题。同时需要将个人信息从英文更新为中文，并更换头像图片。

## What Changes
- 修复页面左侧布局缺失问题
- 将姓名从 "Your Name" 改为 "垣钰"
- 将所有英文内容切换为中文
- 更换头像图片为用户提供的本地图片

## Impact
- Affected specs: UI 布局、配置文件
- Affected code:
  - `src/components/Layout.tsx` (布局修复)
  - `src/plugins/profile/index.tsx` (头像样式)
  - `public/config/site.config.json` (个人信息)
  - `public/config/plugins.config.json` (插件配置)

## ADDED Requirements

### Requirement: 布局修复
系统应正确显示完整页面内容，无左侧缺失。

#### Scenario: 页面完整显示
- **WHEN** 用户访问网站
- **THEN** 页面左侧内容应完整显示
- **AND** 所有卡片和组件应正确对齐
- **AND** 无内容被裁切或隐藏

### Requirement: 个人信息中文化
所有显示的个人信息应使用中文。

#### Scenario: 中文姓名显示
- **WHEN** 用户访问网站
- **THEN** 应显示中文姓名 "垣钰"
- **AND** 职位标题应为中文
- **AND** 个人简介应为中文
- **AND** 技能标签可保持英文（技术术语）

### Requirement: 头像图片更换
系统应显示用户提供的头像图片。

#### Scenario: 本地头像显示
- **WHEN** 用户访问网站
- **THEN** 应显示用户提供的头像图片
- **AND** 图片应正确加载和显示
- **AND** 图片应保持圆形裁切和样式

## MODIFIED Requirements

### Requirement: 配置文件更新
更新配置文件中的个人信息：

**site.config.json 更新内容**:
- title: "垣钰 | 个人主页"
- description: "全栈开发工程师"
- author: "垣钰"
- profile.name: "垣钰"
- profile.title: "全栈开发工程师"
- profile.bio: 中文描述
- profile.location: "北京，中国"
- profile.avatar: 用户提供的图片路径

**plugins.config.json 更新内容**:
- 导航链接标题和描述改为中文
- 工具名称保持英文（技术术语）
- 分类名称改为中文

## REMOVED Requirements

无移除的需求。