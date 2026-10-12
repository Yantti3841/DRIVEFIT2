# VORA v2 — 参考、实现与验证

参考核对：2026-10-12；复评：2026-10-13。

## 原站实际依据（SOURCE）

- Awwwards 入口：https://www.awwwards.com/sites/363-car-social-club
- 实际原站：https://363sudbury.com/ 。已读取 HTML、CSS 与客户端脚本，并用浏览器观察首页、Explore 面板和手机布局。
- 原站实际为 Astro + GSAP，首页用视频，没有 Canvas 三维场景。主要体验为居中文字、底部主入口、同画布展开图片面板，背景模糊。
- CSS 高亮为 `#eaff00`；原站使用 Neue Plak 字体。本产品使用开源 Manrope 和系统中文字体。
- `layout...Cu00QaFq.js` 中面板底部 clip-path 揭幕，约 `.75s / power4.out`，背景 blur 约 `.25s`，文字 stagger 与图片小幅平移。实现代码独立编写，没有将原站脚本、字体、视频或商业组件加入发布产物。
- 原始抓取仅留在本地 `research/363/`，不进 Git 与部署包。包仅包含 hosting manifest 与 `dist/`。

## 本产品决策（PROPOSED）

- 删除长营销首页，第一屏明确“试驾前，先选对宝马”，一个主选车入口与一个次展厅入口。
- 用三张 BMW 官方照片做慢速缩放／交叉淡化，保留实际车型；这不是原站的视频复制。
- 1.35 秒顶部幕布、短字标、标题依次显现；可跳过，减少动态效果时即时显示。
- 展厅采用紧密图片面板、模糊背景、.75 秒揭幕。手机顺序为选车、目录／依据、三维入口。
- 三维为独立按需看车面板，真实 WebGL，拖动与缩放、视角和颜色都作用于模型。颜色更改主体与外观覆盖层，不替代具体在售选装数据。
- 替换所有装饰箭头，删除其生成代码与 CSS。

## GitHub Skill 与素材

- https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md — 清晰视觉方向、主体驱动、克制动效、避免模板符号与空泛营销。
- https://github.com/Leonxlnx/taste-skill/blob/main/skills/redesign-skill/SKILL.md — 先审计原实现，在现有技术栈内修正字体、层次、交互与状态。已阅读存档，未全局安装，也未迁移框架。
- BMW M4 模型：https://github.com/coopercodes/bmwGLB 。原作者 SRT Performance、原始 Sketchfab 链接与 CC BY 4.0 署名见 `dist/assets/models/CREDITS.txt`，页面可见。
- 查看器：Google model-viewer 4.0.0，Apache 2.0；Meshoptimizer 1.3.0 解码器，MIT；Manrope，SIL OFL。许可随本地资源发布。
- 模型处理：glTF Transform 4.5.1 dedup/weld/simplify（ratio .28，error .002）/prune、1024 WebP、Meshopt medium；未删主体构件。优化记录见 `model-metadata.json`。

## 审美与逻辑复评

两位独立评审均实际打开 Chrome 页面，未直接修改文件；由主实现者修正后再次检查。

- 审美发现并修复：390／360 手机模型预览图压字；问答标题的程序化焦点边框；换色仅改了被覆盖的材质。复查无剩余必改项。桌面模型放大且底部入口在一屏内。
- 逻辑发现并修复：未完成问答直接 #results 使用默认需求；重点偏好没有权重区别；三项清单遗漏补能；双门／敞篷混用；六人以上与七人需求混用。
- 开场 animationend 仅响应幕布本身，子标题与字标事件不会提前结束；子动画在幕布之前完成。
- 11 项规则测试通过。Chrome + Playwright 浏览器核对 1440×900、768×1024、390／360×844，首页／展厅／目录／问答／结果／详情／三维无横向溢出与页面脚本错误。
- 验证未答完重定向、编辑需求后往返保留条件、低预算与7座空结果、硬动力／车身条件、三维请求失败、快速退出、真实旋转与视角、真实换色、减少动态效果。
- 发布仍保留当前私有访问范围；车型价格快照日期仍为 2026-10-12，不冒充实时更新。

## 设计图比对

`design-concept-v2.png` 是方向参考；最新实际截图已逐项查看。实际首页使用可追溯 BMW 官方照片，代替概念图的虚构车库背景；模型单独打开，避免大资源阻塞选车。紧密展厅、黑白黄、清晰主入口与无箭头与设计方向一致。
