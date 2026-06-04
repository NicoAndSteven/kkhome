# 验证清单

## 已验证

- [x] TypeScript 编译通过。
- [x] Vite 生产构建通过。
- [x] ESLint 检查通过。
- [x] 配置本地资源检查通过。
- [x] Playwright Chromium 首页烟测通过。
- [x] 综合质量门禁 `npm run check` 通过。
- [x] `site.config.json` 使用 `{ site, profile }` 契约。
- [x] `site.config.json` 支持 `motion` 入场动画配置。
- [x] Profile 插件合并站点 profile 配置。
- [x] Header 只保留一个主题切换入口。
- [x] 入场动画结束后首页核心内容可见。
- [x] Header 可根据滚动 section 高亮。
- [x] Progress Rail 可用于页面锚点跳转。
- [x] Tools 分类过滤可用。
- [x] Projects inline 展开详情可用。
- [x] Contact Drawer 可打开和关闭。
- [x] 页面仍为 Cloudflare Pages 兼容的纯静态前端。
- [x] 配置中已移除 `example.com` 与 `yourusername` 占位链接。
- [x] 假统计、假评论、假下载模块默认禁用。

## 已浏览器验证

- [x] 页面标题正确。
- [x] 首页核心区块可见。
- [x] 主题切换按钮可点击。
- [x] 页面不展示 `example.com` 与 `yourusername` 占位内容。
- [x] 首页烟测期间无 console error。

## 待人工响应式验证

- [ ] 1440x900 首屏可见姓名、职业定位、简介、联系按钮、查看项目按钮和真实能力信号。
- [ ] 375x812 首屏可见姓名、职业定位、简介和主要 CTA，且无超过 160px 的无意义垂直空白。
- [ ] Profile Hero 不再只由头像、姓名、两个按钮构成。
- [ ] 单项目 Projects 使用 featured case-study 布局，而不是三列网格。
- [ ] Tools 不展示随机生成的“专家”“架构级”“精通”等熟练度标签。
- [ ] Navigation 搜索框与标题属于同一视觉组，桌面首屏不孤立。
- [ ] 320px 宽度正常显示。
- [ ] 375px 宽度正常显示。
- [ ] 768px 宽度正常显示。
- [ ] 1024px 宽度正常显示。
- [ ] 1440px 宽度正常显示。
- [ ] 键盘可访问 Header 导航、主题切换、插件链接。
- [ ] 主题切换状态与 `localStorage` 一致。
- [ ] 站内锚点跳转正常。
- [ ] 页面无控制台错误。

## 待线上验证

- [ ] Cloudflare Pages 部署成功。
- [ ] HTTPS 证书正常。
- [ ] 自定义域名配置正确。
- [ ] 边缘缓存策略符合预期。
- [ ] Lighthouse 可访问性分数达到 90+。
