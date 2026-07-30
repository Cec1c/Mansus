<div align="center">

# Mansus

[![框架](https://img.shields.io/badge/%E6%A1%86%E6%9E%B6-Astro-BC52EE?style=flat-square&logo=astro&logoColor=white)](https://astro.build/)
[![包管理器](https://img.shields.io/badge/%E5%8C%85%E7%AE%A1%E7%90%86%E5%99%A8-pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![部署](https://img.shields.io/badge/%E9%83%A8%E7%BD%B2-GitHub%20Pages-222222?style=flat-square&logo=github&logoColor=white)](#快速部署)
[![使用模板](https://img.shields.io/badge/%E4%BD%BF%E7%94%A8-Template-2EA44F?style=flat-square&logo=github&logoColor=white)](https://github.com/new?template_name=Mansus&template_owner=Cec1c)
[![许可](https://img.shields.io/badge/%E8%AE%B8%E5%8F%AF-MIT-2563EB?style=flat-square)](LICENSE)

一个基于 Firefly 二次开发的 Astro 博客模板，保留准则分类、文章墨水混色、RSS、全文搜索和响应式布局。

[在线示范](https://mansus.cc) ｜ [快速部署](#快速部署) ｜ [内容与配置](#内容与配置) ｜ [本地运行](#本地运行)

</div>

## Mansus 能做什么？

- **让文章拥有自己的颜色。** 选择单个或多个准则，由墨水系统生成文章主题色。
- **让内容保持简单可维护。** 使用 Markdown 写作，文章、图片和站点配置都有明确目录。
- **让个人博客快速上线。** 从模板创建仓库后，可通过 GitHub Actions 自动构建并部署到 GitHub Pages。

## 页面预览

<table>
  <tr>
    <td align="center">
      <strong>Mansus 首页</strong><br>
      <a href="https://mansus.cc">
        <img src="docs/preview.png" alt="Mansus 首页预览" width="900">
      </a>
    </td>
  </tr>
</table>

## 核心能力

### 准则与墨水

- 支持单准则、多准则和自定义点数混色。
- 文章卡片、标题、徽标和正文强调色会随准则组合变化。
- 内置八个可见准则，并保留加密文章使用的隐藏准则约束。

### 写作与内容

- 使用 Astro 内容集合校验文章元数据。
- 支持 Markdown、MDX、文章封面、正文图片、标签、分类和置顶。
- 内置 RSS、归档、分类、标签、准则页面和 Pagefind 全文搜索。

### 部署与维护

- 自动识别 GitHub Pages 的仓库子路径。
- 支持自定义域名、Vercel 和 Cloudflare Workers。
- GitHub Actions 会执行内容校验、构建和静态站点部署。

## 快速部署

### GitHub Pages

1. 点击 [Use this template](https://github.com/new?template_name=Mansus&template_owner=Cec1c) 创建一个公开仓库，不要使用 Fork。
2. 仓库名使用 `<用户名>.github.io` 时会部署到根路径；使用其他名称时会部署到 `/<仓库名>/`。
3. 打开新仓库的 `Settings > Pages`，将 Source 设为 `GitHub Actions`。
4. 如果 `Actions` 页面要求确认，先点击 `I understand my workflows, go ahead and enable them`。
5. 在 `Actions` 中运行一次 `Deploy to GitHub Pages`。

GitHub 出于权限安全不会允许公共模板使用默认 `GITHUB_TOKEN` 自动开启 Pages，因此第 3 步是首次创建时唯一需要手动完成的设置。若第一次部署在 `Configure Pages` 处提示 Pages 尚未启用，完成第 3 步后重新运行即可。

以后推送到 `main` 或 `master` 会自动更新站点。默认地址会自动适配为：

```text
https://<用户名>.github.io/<仓库名>/
```

### 自定义域名

在 `Settings > Secrets and variables > Actions > Variables` 中添加：

| 变量 | 用途 | 示例 |
| --- | --- | --- |
| `SITE_URL` | 站点完整地址 | `https://blog.example.com` |
| `BASE_PATH` | 站点基础路径；自定义域名通常使用根路径 | `/` |

### 其他平台

- **Vercel：** 导入仓库，使用默认配置构建。
- **Cloudflare Workers：** 设置 `CF_WORKERS=1` 后执行构建，再通过 `wrangler.jsonc` 部署。

## 内容与配置

| 要修改的内容 | 文件或目录 |
| --- | --- |
| 站点标题、描述、页面开关 | `src/config/siteConfig.ts` |
| 头像、昵称和个人链接 | `src/config/profileConfig.ts` |
| 导航栏 | `src/config/navBarConfig.ts` |
| 主页背景与横幅文字 | `src/config/backgroundWallpaper.ts` |
| 文章 | `src/content/posts/` |
| 正文图片 | `public/assets/uploads/` |
| 文章封面 | `src/assets/images/mansus/` |
| 准则名称与颜色 | `src/data/aspects.ts` |

### 示例文章

| 示例 | 文件 | 说明 |
| --- | --- | --- |
| 单准则 | `src/content/posts/01-single-aspect.md` | 只使用一个准则颜色 |
| 多准则 | `src/content/posts/02-multiple-aspects.md` | 主准则与相关准则自动混色 |
| 自定义混色 | `src/content/posts/03-custom-color-mix.md` | 使用高级点数控制颜色比例 |

## 本地运行

```bash
corepack enable
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
```

构建产物位于 `dist/`。


## 来源与致谢

- 感谢 [CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly) 提供原始主题与工程基础。
- 感谢 [Astro](https://astro.build/) 提供静态站点框架。
- 准则名称与相关美术源自《密教模拟器》世界观，权利归原权利方所有。

## 许可

[MIT](LICENSE)。公开部署前，请自行确认第三方美术素材的使用范围。
