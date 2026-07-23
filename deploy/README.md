# 部署说明

## GitHub Pages

仓库已包含 `.github/workflows/deploy.yml`。Fork 后启用 GitHub Pages，并手动运行一次部署工作流即可。

默认地址会根据仓库自动计算。自定义域名可设置 Actions Variables：`SITE_URL` 和 `BASE_PATH`。

## Vercel

导入仓库并使用默认配置即可；构建命令为 `pnpm build`，输出目录为 `dist`。

## Cloudflare Workers

构建时设置 `CF_WORKERS=1`，再使用仓库内的 `wrangler.jsonc` 部署。
