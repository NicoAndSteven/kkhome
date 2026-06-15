# kkhome Redesign: 海盐苏打个人HUB

## 视觉方向
**清新治愈风 · 海盐苏打配色**

以冷白海盐色为基底，海蓝绿与天蓝为交互色，樱花粉为点缀，营造海边咖啡馆般的通透清凉感。

## 配色体系
| Token | 色值 | 用途 |
|-------|------|------|
| 背景 | #F5F9FC | 主背景色，极浅蓝白 |
| 卡片 | #FFFFFF | 卡片、容器填充 |
| 卡片边框 | #E0ECF5 | 淡蓝灰边框 |
| 主色 | #4DD0C8 | 按钮、链接、激活态、交互色 |
| 辅助色 | #64B5F6 | 次要交互、渐变搭配 |
| 点缀色 | #F06292 | CTA 按钮、重要标记、活力感 |
| 文字主 | #37474F | 标题、正文 |
| 文字次 | #90A4AE | 描述、次要信息 |
| 容器底色 | #F0F6FE | 标签、chip 背景 |
| 主色光晕 | rgba(77, 208, 200, 0.10) | 浮层光晕 |

## 布局体系
- **首页 Hero**：保留现有不对称 12-column 网格（7+5 分栏），包含大字标题、badge、bio、CTA、signal stats 和 identity plate
- **路由页面**：移除 3D depth 层和网格线背景，替换为"水族窗格"容器
- **导航**：保留顶部固定导航，移除右侧 progress rail
- **卡片系统**：轻柔极简 — 微圆角 (8px)，极细边框 (#E0ECF5)，纯白填充

## 组件风格

### 水族窗格（路由容器）
- 半透明玻璃质感（backdrop-filter: blur, rgba white bg）
- 圆润大圆角 (16px)
- 1px 边框带海蓝绿光晕 (rgba(77,208,200,0.2))
- 顶部装饰性 header（icon + 标题 + 状态点）
- 虚线分隔线 (#E0ECF5)
- 内容区为浅蓝底 (#F5F9FC) 卡片网格

### 卡片
- 纯白填充，微圆角 (8px)
- 1px 淡蓝灰边框 (#E0ECF5)
- hover: -2px lift + 海蓝绿边框 + 柔和阴影

### 按钮
- **主要**：海蓝绿渐变 (#4DD0C8 → #64B5F6)，白色文字
- **强调**：樱花粉 #F06292，白色文字
- **次要**：白底 + 淡蓝灰边框

### 导航
- 毛玻璃效果（bg rgba(255,255,255,0.85) + backdrop-filter）
- 底部海蓝绿渐变线
- 品牌"K"徽标：海蓝绿色，圆角框

### 标签/Tag
- 极浅蓝底 (#F0F6FE) + 海蓝绿文字
- 或浅粉底 (#FCE4EC) + 樱花粉文字

## 动效
- 保留现有的 reveal scroll-trigger 动画
- 移除 route-stage-in 和 route-camera-in 增强（恢复原始简单版本）
- 保留 pulse-dot 和 float-gentle 微交互
- 柔和过渡（cubic-bezier(0.16, 1, 0.3, 1)）

## 文件变更清单
1. `src/index.css` — 全部配色替换，路由容器重写，卡片样式更新
2. `src/App.tsx` — 移除 route parallax，路由容器 class 更新
3. `src/components/Layout.tsx` — 颜色更新，orb 保留但调色
4. `src/components/Header.tsx` — 颜色更新
5. `src/components/Footer.tsx` — 颜色更新
6. `src/components/Loading.tsx` — 颜色更新
7. `src/plugins/profile/index.tsx` — 颜色更新（保留布局）
8. `src/plugins/ai-navigator/index.tsx` — 颜色更新
9. `src/plugins/news/index.tsx` — 颜色更新
10. `src/plugins/cloudflare-lab/index.tsx` — 颜色更新
11. `tailwind.config.js` — 自定义颜色更新
12. `public/config/site.config.json` — 主题色更新
