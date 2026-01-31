# OpenClaw Skills Collection

OpenClaw AI Agent的实用技能集合，包含自动化任务、语音播报、图片处理等功能。

## Skills列表

### 📰 news-image-reader
- 功能：读取新闻图片并语音播报
- 作者：ET
- 路径：`news-image-reader/`
- 依赖：tesseract, edge-tts, pytesseract, Pillow
- 使用方法：
  ```bash
  cd news-image-reader
  ./scripts/install.sh  # 安装依赖
  ./scripts/read_image_news.sh <图片路径>  # 播报新闻
  ```

## 目录结构

```
openclaw-skills/
├── README.md
├── news-image-reader/
│   ├── SKILL.md
│   └── scripts/
│       ├── install.sh
│       ├── read_image_news.py
│       └── read_image_news.sh
└── ... (更多技能待添加)
```

## 添加新Skill

1. 创建新目录：`mkdir 新技能名称/`
2. 添加SKILL.md和scripts/
3. 更新README.md
4. 提交并推送

## 许可证

MIT
