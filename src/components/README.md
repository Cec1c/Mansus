# Mansus 组件目录

本目录沿用 Firefly 的组件分层。当前站点是二开项目，优先复用原有组件、动效和优化能力，只在 Mansus 风格需要的地方做局部覆盖。

```text
layout/       页面框架、导航栏、文章卡片、侧边栏、页脚
controls/     搜索、主题切换、返回顶部、归档面板、布局切换
common/       通用按钮、Markdown 包装、图片包装、分页、消息框
widget/       侧边栏小组件：作者、站点信息、标签、分类、音乐等
features/     全局功能：音乐管理、KaTeX、Fancybox、加密内容、特效、Live2D/Spine
pages/        特定页面组件：Bangumi、相册、高级搜索等
comment/      第三方评论系统集成
analytics/    统计分析集成
misc/         许可证、推荐文章、分享海报等辅助组件
mansus/       Mansus 二开新增组件，例如文章概要和准则展示
```

维护原则：

- 能通过配置关闭的 Firefly 功能，先不要删除组件代码。
- 新增 Mansus 专属表现时，优先放到 `mansus/` 或靠近调用点。
- 文章列表、导航栏、Swup 过渡、RSS、Sitemap、Pagefind 搜索等底层能力尽量沿用原实现。
- 示例资源和模板演示内容不放在生产目录；需要留存时放到 `.example/firefly-reference/`。
