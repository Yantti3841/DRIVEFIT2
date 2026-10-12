# 参考与设计记录

核对日期：2026-10-12。

## 产品和 GitHub

- https://www.bmw.com.cn/zh/ssl/model-finder.html — 官方车型、展示价、图片与咨询状态。保留来源，价格不替换成未核实优惠。
- https://www.bmw.com.cn/zh/all-models/x-series/X7/2022/inspire.html — 三排七座与行政六座车型方向；具体版本另核对。
- https://www.bmw.com.cn/zh/all-models/x-series/X3/2024/inspire.html — 长轴距、后排与产品定位，支撑团队空间／舒适标签；不将文案等同于实测结论。
- https://www.bmw.com.cn/zh/all-models/x-series/X2/2023/inspire.html — 轿跑 SUV 定位；避免所有 SUV 都被统一赋予空间优先标签。
- https://www.bmw.com.cn/zh/all-models/m-series/m5/2024/inspire.html — M Hybrid 动力。
- https://www.bmw.com.cn/zh/all-models/m-series/xm/2025/inspire.html — 插混车型方向。
- https://github.com/hanfuzhao/carrec-ai — 阅读推荐源码，借鉴先过滤后解释；原代码存在无候选时扩大预算的分支，本项目没有采用。
- https://github.com/ericnguyen58/Car-Recommendation-System — 同一推荐服务支持筛选和对话的思路。
- https://github.com/potatobox1/BMW-Rag-based-Chatbot — BMW / MINI 文档检索销售助手案例，仅参考范围，不复制实现或海外数据。
- https://github.com/RasaHQ/rasa-maestro-voice-car-purchase-skills — 购车到人工交接示例；本原型不引入完整依赖及模拟金融功能。
- https://www.carwow.co.uk/help-me-carwow — 简单问题、不确定可跳过、选择器与问答双入口。
- https://www.carwow.co.uk/car-chooser — 用户按重要条件筛选。
- https://www.carwow.co.uk/car-comparison — 车辆并排比较。
- https://363sudbury.com/ — 用户截图对应网站；参考深色、荧光黄、大图和卡片展开的视觉语言。未复制其代码或品牌资产。

GitHub 参考项目未在本地运行，未复制第三方源代码。

## 设计系统

- 背景 #111312，面板 #1b1e1c，正文 #f5f6f2，辅助文字 #a3a8a3，重点色 #e9ff53。
- 8px 控件圆角；44px 最小点击区；大标题与克制的辅助文案。
- 图片慢速缩放、页面淡入、卡片轻微抬升、选项描边反馈。
- 原生 dialog 提供模态与键盘关闭；减少动态效果偏好关闭动画。
- 视觉概念由内置 ImageGen 生成。提示词摘要：两个协调的 HOME / QUESTION 屏幕，深色、荧光黄、VORA 品牌、中文短问答、大片汽车图、代码原生控件；仅作设计参考。

## 概念到网页的核对

概念文件：design-concept.png。浏览器验证：Playwright + 已安装 Chrome；Browser 插件不在本会话可用工具中。

| 对比点 | 网页实现及调整 |
|---|---|
| 配色 | 保留近黑、白字、荧光黄主按钮；辅助文字统一色值 |
| 首屏布局 | 左文案、右车图、底部三个步骤；导航独立在上方，便于所有页面复用 |
| 标题与 CTA | 保留“下一台宝马，从你的生活出发”“找到我的宝马”“探索全部车型” |
| 图片 | 有意用宝马官方红色 4 系城市图片替代概念中的银色山路图片，满足真实车型素材要求；真实来源可追溯 |
| 问答 | 左进度、中选项、右图片；问题顺序服从 PRD，最多 6 题；移动端省略装饰图与垂直侧栏 |
| 控件 | 同一选项与按钮组件风格；多选反馈、返回和更新推荐真实工作 |
| 结果 / 目录 | 用户要求全面车型，新增同风格车型卡片、筛选和比较弹窗 |
| 文案差异 | 新增无需留手机号、数据日期、独立原型说明与推荐依据，属于事实说明及产品功能所需 |

视觉检查应覆盖桌面 1440×900、手机 390×844 与 360×800；概念由两个屏幕组成，不能把其整个双屏尺寸当作单页浏览器尺寸。
