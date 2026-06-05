# Disruptive Hub Capsules 规格说明

## 背景

当前 Personal Hub 已具备 Quick Launch、Workbench、Collections 和 Scratchpad，但仍偏向常规导航与工具集合。下一阶段需要把页面升级为可热插拔的个人能力总线：输入内容后系统自动识别、匹配能力胶囊，并触发收纳、转换、跳转或工作流。

## 目标

- 在 Featured Project 后引入更强的 Universal Inbox。
- 使用 Capsule Registry 表达可热插拔能力。
- 引入 Workflow Deck，把多个动作组合成可执行场景。
- 继续保持静态优先、配置驱动、无前端密钥。
- 与现有 Workbench、Collections、Scratchpad 协同，而不是重复实现。

## 非目标

- 不在本阶段引入远程 JavaScript 插件。
- 不执行任意本地脚本。
- 不接入需要私钥的 API。
- 不做完整自动化平台或登录系统。
- 不把胶囊做成不可审查的黑盒。

## 模块

### Universal Inbox

用户可以粘贴 URL、JSON、Base64、时间戳、命令、Prompt 或普通文本。系统自动识别类型，并展示匹配的 Capsule。

第一阶段识别类型：

- `url`
- `json`
- `timestamp`
- `base64`
- `command`
- `prompt`
- `text`

可触发动作：

- 发送到 Workbench 指定工具。
- 保存到 Scratchpad。
- 复制片段。
- 跳转到指定 section。

### Capsule Registry

Capsule 是可配置能力单元。

```ts
interface CapsuleItem {
  id: string
  title: string
  description?: string
  icon?: string
  triggers: CapsuleTrigger[]
  action: CapsuleAction
  enabled?: boolean
}
```

Capsule 不直接执行危险能力。需要本地脚本、私钥或外部写操作的 Capsule 必须保持 disabled，直到存在安全边界。

### Workflow Deck

Workflow 是一组可执行动作，面向场景而不是单个链接。

例子：

- 开发模式：跳到 Workbench、激活 JSON 工具、收纳当前检查命令。
- 审查模式：复制审查 Prompt、跳到 Scratchpad。
- 阅读模式：跳到 Collections、收纳稍后读模板。

## 交互原则

- 用户的第一动作是投喂内容，而不是浏览卡片。
- Capsule 只展示可解释的匹配原因和动作。
- Workflow 必须显示将要执行的动作列表。
- 所有动作都应有可见反馈。

## 验收标准

- Universal Inbox 能识别至少 5 类输入。
- JSON 输入能激活 Workbench 的 JSON 工具。
- URL 或命令能保存到 Scratchpad。
- Workflow Deck 至少有 3 个配置驱动 workflow。
- 关闭 Universal Inbox 或 Workflow Deck 后页面不崩溃。
- 不引入前端密钥、假状态或不可审查的远程脚本。
- `npm run check` 通过。
