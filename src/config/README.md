# Mansus 配置目录

这里保留 Firefly 的模块化配置方式，但生产内容已经改成 Mansus 自己的站点信息。常改入口如下：

```text
src/config/siteConfig.ts          站点名、域名、favicon、默认主题色、页面开关
src/config/navBarConfig.ts        顶部导航栏字段、链接顺序、图标
src/config/backgroundWallpaper.ts 首页背景和漫宿地图展示
src/config/profileConfig.ts       作者头像、名字、简介、社交链接
src/config/musicConfig.ts         音乐播放器来源
src/config/sidebarConfig.ts       左右侧栏组件
src/config/commentConfig.ts       评论系统
```

文章不放在这里。文章统一放到：

```text
src/content/posts/
```

更完整的内容管理说明见：

```text
deploy/CONTENT_MANAGEMENT.md
```

没有启用的 Firefly 功能可以先保留配置文件和组件代码，只把页面开关关掉。这样以后要恢复评论、相册、Bangumi、音乐或看板娘时，不需要重新搬底层实现。
