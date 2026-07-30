# 部署说明

## GitHub Pages

仓库已包含 `.github/workflows/deploy.yml`：

1. 在 `Settings > Pages` 中将 Source 设为 `GitHub Actions`。
2. 如果 Actions 尚未启用，先在 `Actions` 页面确认启用仓库工作流。
3. 手动运行一次 `Deploy to GitHub Pages`；以后推送到 `main` 或 `master` 会自动更新。

默认地址会根据仓库自动计算：`<用户名>.github.io` 使用根路径，其他仓库使用 `/<仓库名>/`。构建末尾会执行 `validate-pages-base`，防止不兼容项目站点子路径的链接进入部署产物。

自定义域名可设置 Actions Variables：`SITE_URL` 和 `BASE_PATH`。自定义域名通常把 `BASE_PATH` 设为 `/`。

## Vercel

导入仓库并使用默认配置即可；构建命令为 `pnpm build`，输出目录为 `dist`。

## Cloudflare Workers

构建时设置 `CF_WORKERS=1`，再使用仓库内的 `wrangler.jsonc` 部署。
