# 上传到 GitHub

先解压源码 ZIP，进入能看到 `README.md`、`dist/`、`server.cjs` 的目录。上传的是这些文件和文件夹，GitHub 不会自动把 ZIP 解压成项目。

## 方法一：GitHub Desktop（推荐）

本包超过 100 个文件，GitHub Desktop 可以一次发布整个项目，不需要网页分批上传。

1. 安装并登录 [GitHub Desktop](https://desktop.github.com/)。
2. 选择 **File / Add local repository**，选中解压后的项目目录。
3. 如果提示不是 Git 仓库，点击 **create a repository here**，使用当前项目目录创建仓库；不要选择覆盖现有 README 或添加不确定的许可证。
4. 在 Changes 中检查文件，填写 `Initial DRIVEFIT source`，提交。
5. 点击 **Publish repository**，填写名称如 `drivefit-bmw`，按需要选择仓库可见性，再发布。

仓库根目录应直接显示 `dist/`、`README.md`、`.github/` 等内容，不要多套一层源码包目录。

## 方法二：网页分批上传

1. 在 GitHub 创建新仓库。
2. 进入仓库，选择 **Add file / Upload files**。
3. 将解压目录中的文件／文件夹拖入上传区域，保持目录结构，再提交。
4. 分批上传其余文件，直至本地目录全部上传完成。

GitHub 网页每批最多上传 100 个文件，每个文件上限 25 MiB。本包每个文件均低于该限制，但全包文件数超过 100，不能一次拖入全部内容。可以先上传 `dist/`，再上传 `docs/`、`scripts/`、`tests/`、`research/` 和根目录文件，最后上传 `.github/`。

特别检查 `.github/workflows/pages.yml`：它是隐藏目录中的部署配置，不能遗漏。若网页拖入隐藏目录不方便，可在仓库中通过 **Add file / Create new file** 创建同名路径，并复制包内文件内容。

## 方法三：Git 命令

先在 GitHub 创建一个空仓库，不勾选自动生成 README、许可证或 gitignore。在解压后的项目目录执行：

```sh
git init
git add .
git commit -m "Initial DRIVEFIT source"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

将 `YOUR_REPOSITORY_URL` 替换为你创建的仓库地址。Git 的登录／授权按你自己的账户提示完成。

上传源码后如需得到可访问的网站，继续阅读 [部署说明](DEPLOY.md)。

参考：[GitHub 官方文件上传说明](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)、[GitHub Desktop 添加本地仓库](https://docs.github.com/en/desktop/adding-and-cloning-repositories/adding-a-repository-from-your-local-computer-to-github-desktop)。
