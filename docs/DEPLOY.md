# 部署 DRIVEFIT

## GitHub Pages

项目已附 `.github/workflows/pages.yml`，直接将完整静态网站 `dist/` 部署为站点，不需要安装依赖或构建。仅创建源码包不会发布网站；以下步骤由仓库拥有者执行。

1. 完整上传项目，确保默认分支名为 `main`。若使用其他分支，修改工作流的 `on.push.branches`。
2. 打开仓库 **Settings / Pages**，将 **Build and deployment / Source** 设为 **GitHub Actions**。
3. 打开 **Actions**，选择 **Deploy DRIVEFIT to GitHub Pages**，通过 **Run workflow** 手动运行。后续推送到 `main` 会自动部署。
4. 等待流程成功，在 **Settings / Pages** 或部署记录中查看网站地址。

项目仓库的地址通常为 `https://你的用户名.github.io/你的仓库名/`，以 GitHub 显示的实际地址为准。网站使用相对资源路径和 hash 路由，适合放在仓库子路径下。

GitHub Free 的 Pages 适用于公开仓库；私有仓库支持取决于账号计划。按自己的发布需求选择仓库可见性。工作流的部署权限及 `github-pages` 环境已配置，若仓库设置了分支／环境保护，仍需满足你的仓库策略。

### 常见问题

- **首页 404**：核对部署的目录是 `dist/`，其中直接包含 `index.html`；检查工作流是否成功。
- **没有工作流**：检查 `.github/workflows/pages.yml` 是否完整上传，仓库 Actions 是否启用。
- **首轮部署失败**：先设置 Pages 来源为 GitHub Actions，再手动重新运行工作流。
- **图片或模型缺失**：检查 `dist/assets/`、`dist/vendor/` 是否完整上传；文件名大小写需保持一致。

## 其他静态托管

将 `dist/` 的完整内容作为发布目录即可。无需运行构建命令，也不需要部署 `server.cjs`，后者仅用于本地预览。保留 `assets/`、`vendor/` 的结构和全部许可文件。

官方参考：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
