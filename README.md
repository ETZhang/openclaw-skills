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

### 🔋 battery-alert
- 功能：监控电量，低电量时语音提醒
- 作者：ET
- 路径：`battery-alert/`
- 依赖：edge-tts
- 使用方法：
  ```bash
  cd battery-alert
  ./scripts/install.sh              # 安装依赖
  ./scripts/start_monitoring.sh     # 开始监控
  ./scripts/install_service.sh      # 安装为后台服务
  ```

### 🤖 claude-code-runner
- 功能：调用Claude Code CLI进行代码生成、分析和调试
- 作者：ET
- 路径：`claude-code-runner/`
- 依赖：Claude Code CLI (`/opt/homebrew/bin/claude`)
- 使用方法：
  ```bash
  cd claude-code-runner
  ./scripts/run.sh 'Create a Python function'  # 生成代码
  ./scripts/run.sh 'Review my code' --file mycode.py  # 代码审查
  ./scripts/examples.sh  # 查看更多示例
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
├── battery-alert/
│   ├── SKILL.md
│   └── scripts/
│       ├── install.sh
│       ├── check_battery.py
│       ├── start_monitoring.sh
│       ├── install_service.sh
│       └── config.py
├── claude-code-runner/
│   ├── SKILL.md
│   └── scripts/
│       ├── run.sh
│       ├── install.sh
│       └── examples.sh
└── ... (更多技能待添加)
```

## 添加新Skill

1. 创建新目录：`mkdir 新技能名称/`
2. 添加SKILL.md和scripts/
3. 更新README.md
4. 提交并推送

## 许可证

MIT
