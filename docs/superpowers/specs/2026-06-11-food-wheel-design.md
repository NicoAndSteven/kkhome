# 🍽️ 今天吃什么 — 转盘决定器

> 在个人主页中增加一个「转盘决定今天吃什么」的插件，按北京时间自动切换中午/晚上转盘。

---

## 1. 概述

在现有的 React + TypeScript 插件系统中增加 `food` 插件。页面展示一个**旋转转盘**，根据北京时间自动决定显示中午还是晚上的转盘，用户点击旋转后随机推荐一个选项。

| 时段（北京时间） | 转盘 | 场景 | 数据来源 |
|:---:|:---:|:---:|:---:|
| 00:00 ~ 12:59 | ☀️ 中午 | 公司附近吃什么 | 用户手动维护 |
| 13:00 ~ 23:59 | 🌙 晚上 | 今晚在家做什么 | 内置菜谱库 + 用户自定义 |

### 1.1 核心交互流程

```
页面加载
  │
  ├→ 获取北京时间
  │   ├→ <13:00  → 显示☀️中午转盘
  │   └→ ≥13:00  → 显示🌙晚上转盘
  │
  ├→ 用户点击 [🎯 转一次]
  │   ├→ 转盘旋转 N 圈 (CSS transform)
  │   └→ 停在一个选项上 → 高亮 + 显示结果
  │
  ├→ 底部标签切换 (预览模式)
  │   └→ 可手动切到另一个时段的转盘预览
  │
  └→ [📝 管理菜单]
      ├→ 中午: 增删改附近店铺
      └→ 晚上: 内置菜谱中关闭不喜欢的菜 + 添加自定义菜
```

---

## 2. 文件结构

```
src/plugins/food/
├── index.tsx           # 主插件组件
├── FoodWheel.tsx       # 转盘核心组件（渲染、动画、结果）
├── FoodManager.tsx     # 管理菜单弹窗
├── recipes.ts          # 内置家常菜谱库
├── types.ts            # 类型定义
└── utils.ts            # 工具函数（北京时间、随机算法）
```

### 注册变更

| 文件 | 变更 |
|------|------|
| `src/plugins/index.ts` | 注册 food 插件 |
| `src/App.tsx` | 添加 `{ id: 'food', label: '吃啥', href: routeHash('food'), pluginId: 'food' }` |
| `src/core/routeBridge.ts` | 添加 `'food'` 到 HubRouteId 和 routeAliases |

---

## 3. 组件设计

### 3.1 FoodPlugin (index.tsx)

主入口组件，负责：

- **北京时间判断**：`getBeijingTime()` 返回北京的当前小时，决定展示哪个转盘
- **自动切换**：每 60s 轮询一次，到 13:00 自动从中午切到晚上
- **预览模式**：底部标签可手动切换到另一时段，显示"预览模式"提示

### 3.2 FoodWheel (FoodWheel.tsx)

核心转盘组件，Props：

```typescript
interface FoodWheelProps {
  items: FoodItem[]           // 转盘选项列表
  label: string               // "中午·公司附近" 或 "晚上·在家做"
  emptyText: string           // 无数据时显示
  onSpin: (result: FoodItem) => void  // 旋转结束回调
  onEdit: () => void          // 打开管理菜单
}
```

**状态：**

```
spinning: boolean       — 正在旋转
selected: FoodItem|null — 当前选中的结果
rotation: number        — 当前旋转角度 (deg)
```

**旋转动画实现：**

1. 根据 `items.length` 计算每个扇形的角度 = `360 / n`
2. 点击旋转时，随机选一个目标项，计算其所在扇形角度
3. 总旋转角度 = `(3~6 圈) × 360 + 目标扇形中心角度`
4. 用 CSS `transition: transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)` 实现减速效果
5. `onTransitionEnd` 后高亮结果

**渲染方式：** CSS `conic-gradient` 配合 `transform: rotate()`，指针用绝对定位元素固定在顶部

**空状态：** 显示 "还没有添加选项，点击管理菜单添加"

### 3.3 FoodManager (FoodManager.tsx)

管理菜单——从底部弹出的 Drawer 或 Modal，两个 Tab：

| Tab | 数据来源 | 操作 |
|:---|:---|:---|
| ☀️ 中午清单 | localStorage | 添加、删除、编辑名称 |
| 🌙 晚上清单 | 内置菜谱 + localStorage 个性化 | 关闭不喜欢的菜、添加自定义菜 |

每个列表项右侧有删除/禁用按钮。

### 3.4 recipes.ts — 内置菜谱库

预置 ~200 道家常菜，分类如下：

```
素菜类：番茄炒蛋、酸辣土豆丝、手撕包菜、干煸四季豆、地三鲜、清炒时蔬…
肉菜类：红烧肉、糖醋排骨、可乐鸡翅、回锅肉、宫保鸡丁、鱼香肉丝…
汤类：紫菜蛋花汤、番茄蛋汤、排骨汤、酸辣汤…
主食类：蛋炒饭、炒面、煮面条、炒河粉、煎饺…
凉菜类：凉拌黄瓜、皮蛋豆腐、口水鸡、凉拌木耳…
```

数据格式：

```typescript
interface Recipe {
  id: string
  name: string
  category: 'vegetable' | 'meat' | 'soup' | 'staple' | 'cold' | 'other'
}
```

---

## 4. 数据结构

### 4.1 类型定义 (types.ts)

```typescript
interface FoodItem {
  id: string
  name: string
  source: 'user' | 'builtin'  // 用户添加 / 内置菜谱
  disabled?: boolean          // 用户禁用
}

interface FoodData {
  noon: FoodItem[]      // 中午清单 (localStorage)
  evening: FoodItem[]   // 晚上清单 (内置 + 用户自定义)
  disabledIds: string[] // 用户禁用的内置菜 ID
}

interface WheelResult {
  item: FoodItem
  timestamp: string
  period: 'noon' | 'evening'
}
```

### 4.2 存储

```
localStorage:
  hub:food-noon       → FoodItem[] (中午清单)
  hub:food-evening    → { custom: FoodItem[], disabledIds: string[] }
  hub:food-today      → WheelResult | null (今日已转结果)
  hub:food-history    → WheelResult[] (最近历史)
```

---

## 5. 状态与边界

### 空状态
- 中午清单为空 → 显示 "还没添加公司附近的店，点击管理菜单添加"
- 晚上内置菜谱被禁用太多导致无可选项 → 提示 "已禁用的菜太多啦，去管理菜单恢复一些吧"
- 刚打开页面未旋转过 → 显示 "点击转盘，决定今天吃什么"

### 错误状态
- localStorage 解析失败 → 回退默认值，不会报错崩溃（参考 stock-watch 做法）
- 所有项都被禁用 → 旋转时提示 "没有可用选项，请管理菜单添加"

### 边界条件
- 只有一个选项 → 旋转直接返回该选项（转盘只有一格）
- 13:00 整点切换 → setInterval 60s 轮询，到点自动切
- 浏览器时区不是北京时间 → 用 `Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai' })` 强制北京时间
- 今日已经转过的 → 保留结果并显示"今日已选"，可再次旋转

---

## 6. 视觉风格

与现有设计系统一致：
- 字体: 使用现有 `font-label-mono`, `font-headline-md`, `font-body-md` 等 token
- 颜色: `text-on-surface`, `text-muted`, `bg-primary`, `text-primary` 等
- 转盘配色: 选项多时用交替色系（浅色/深色交替），每一项名称显示在扇形中
- 指针: 三角形指针固定在转盘顶部
- 管理菜单: 参照现有 ContactDrawer 风格实现

---

## 7. 路由与导航

| 路由 | 导航标签 | 图标 |
|------|---------|------|
| `#/food` | 吃啥 | 🍽️ |

在 Header 中按 order 排序，注册 order 设为 7（介于 news 和 stock-watch 之间）。

---

## 8. 与现有系统的集成

- **插件注册**: 在 `plugins/index.ts` 添加 food 插件，默认 enabled: true
- **路由注册**: 在 `routeBridge.ts` 添加 food 别名，在 `App.tsx` routeItems 添加条目
- **配置**: 暂无外部配置项，纯前端功能
- **测试**: 如果已有 e2e 测试框架 (Playwright)，可补充基本渲染测试

---

## 9. 未来扩展（不做，仅记录）

- 周末特殊转盘（当前版本不做，按同一套逻辑）
- 接入菜谱 API 拓展晚间选项
- 转盘结果分享/截图
- 历史记录统计（最爱吃啥）
- 多人投票模式
