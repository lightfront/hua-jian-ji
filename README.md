# 花间集

五代词总集——交互式古典诗词浏览应用。

## 概述

《花间集》是五代十国时期编纂的一部词总集，由后蜀赵崇祚编选，收录了温庭筠、韦庄等18位词人的近500首词作。本书是中国文学史上第一部文人词总集，对后世词的发展影响深远。

## 功能

- **浏览**：以卡片形式浏览全部497首词作
- **搜索**：按词牌、作者或诗句内容全文搜索
- **筛选**：按作者或词牌筛选
- **详情**：点击卡片在弹窗中查看完整词作及注释标签
- **响应式**：在桌面和移动设备上均可舒适浏览

## 技术栈

- 纯 HTML / CSS / JavaScript，无框架依赖
- Google Fonts `Noto Serif SC` 中文衬线字体
- 数据来自 [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry) 开源数据库

## 本地运行

```bash
# 克隆仓库
git clone https://github.com/你的用户名/huajianji.git
cd huajianji

# 用任意静态服务器启动（例如 Python）
python3 -m http.server 8000
# 访问 http://localhost:8000
```

## 数据编译

项目包含 `compile.py`，可以从上游数据源重新编译：

```bash
python3 compile.py
```

## 部署

推荐使用 GitHub Pages：

1. 推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages（选择 `main` 分支，根目录）
3. 访问 `https://你的用户名.github.io/huajianji`

## 许可

诗词数据来自 [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry)（MIT 许可证）。前端代码同样以 MIT 许可证发布。
