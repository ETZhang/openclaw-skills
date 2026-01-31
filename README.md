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

### 🚀 claude-code-runner-glm (NEW!)
- 功能：调用Claude Code + GLM-4.7模型，支持中文提示词
- 作者：ET
- 路径：`claude-code-runner-glm/`
- 依赖：Claude Code CLI + GLM-4.7 API配置
- 特色：
  - ✅ GLM-4.7中文模型支持
  - ✅ 完整提示词工程指南
  - ✅ 多种代码生成模板
  - ✅ 模型选择指南
  - ✅ 安全配置（不泄露API Key）
- 使用方法：
  ```bash
  cd claude-code-runner-glm
  
  # 配置GLM（添加到 ~/.zshrc）
  export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/anthropic"
  export ANTHROPIC_AUTH_TOKEN="your-token"
  
  # 使用
  ./scripts/run.sh '用Python写个爬虫'  # 中文提示词
  ./scripts/run.sh 'Create a game' --model opus  # 复杂任务
  
  # 查看示例
  ./scripts/examples.sh
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
├── claude-code-runner-glm/         # NEW!
│   ├── SKILL.md                    # 完整使用文档
│   ├── .gitignore                  # 安全配置模板
│   ├── scripts/
│   │   ├── run.sh                  # 主脚本
│   │   ├── install.sh              # 安装检查
│   │   ├── examples.sh             # 示例命令
│   │   ├── quick-start.sh          # 快速开始
│   │   └── prompt-templates/       # 提示词模板
│   │       └── code-generation.md
│   └── references/
│       ├── PROMPT_GUIDE.md         # 提示词工程指南
│       └── MODEL_COMPARISON.md     # 模型选择指南
└── ... (更多技能待添加)
```

## Claude Code + GLM 集成指南

### 配置GLM-4.7

```bash
# 添加到 ~/.zshrc
export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/anthropic"
export ANTHROPIC_AUTH_TOKEN="your-token"  # ⚠️ 不要提交到git!
```

### 安全使用

1. **不要提交API Key** - 已配置.gitignore
2. **使用环境变量** - 不要硬编码在代码中
3. **定期轮换Token** - 保护账户安全

### 提示词工程

参考 `claude-code-runner-glm/references/PROMPT_GUIDE.md` 学习：
- 角色定位
- 任务描述
- 输出格式
- 迭代开发

### 模型选择

参考 `claude-code-runner-glm/references/MODEL_COMPARISON.md`：
- **sonnet**: 通用代码生成
- **opus**: 复杂推理调试
- **haiku**: 简单快速任务

## 添加新Skill

1. 创建新目录：`mkdir 新技能名称/`
2. 添加SKILL.md和scripts/
3. 更新README.md
4. 提交并推送

## 许可证

MIT
