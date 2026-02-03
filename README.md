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

### 🎨 ui-ux-pro-max (NEW!)
- 功能：专业UI/UX设计智能，提供67种风格、96种配色、13个技术栈的设计建议
- 作者：ET
- 路径：`ui-ux-pro-max/`
- 依赖：Python 3
- 特色：
  - ✅ 67种设计风格（glassmorphism, brutalism, neumorphism等）
  - ✅ 96种配色方案
  - ✅ 13个技术栈指南（React, Vue, Tailwind, Flutter等）
  - ✅ 25种图表类型
  - ✅ 完整的UX设计指南（无障碍、动画、响应式）
  - ✅ 命令行搜索工具
- 使用方法：
  ```bash
  cd ui-ux-pro-max
  
  # 获取设计系统建议
  python3 scripts/search.py "fintech dashboard" --design-system
  
  # 搜索特定领域
  python3 scripts/search.py "dark mode" --domain style
  python3 scripts/search.py "elegant font" --domain typography
  python3 scripts/search.py "real-time chart" --domain chart
  
  # 获取技术栈指南
  python3 scripts/search.py "responsive form" --stack html-tailwind
  python3 scripts/search.py "performance" --stack react
  ```

### 📱 feishu-integration (NEW!)
- 功能：飞书（Feishu/Lark）集成，管理文档、文件夹和权限
- 作者：ET
- 路径：`feishu-integration/`
- 依赖：OpenClaw Feishu Tools
- 特色：
  - ✅ 文档管理（创建、读取、写入、追加、更新、删除）
  - ✅ 文件夹操作（列出文档和子文件夹）
  - ✅ 权限查询（获取应用权限范围）
  - ✅ 块级操作（获取、更新、删除文档块）
  - ⚠️ **敏感信息保护** - 已配置 .gitignore
- 使用方法：
  ```bash
  cd feishu-integration
  
  # 配置凭据（添加到 ~/.zshrc）
  export FEISHU_APP_ID="your_app_id"
  export FEISHU_APP_SECRET="your_app_secret"
  
  # 或创建 .env 文件（已加入 .gitignore）
  echo "FEISHU_APP_ID=your_app_id" > .env
  echo "FEISHU_APP_SECRET=your_app_secret" >> .env
  
  # 运行配置检查
  ./scripts/install.sh
  ```
- OpenClaw 工具：
  ```python
  # 创建文档
  feishu_doc_create(title="新文档", folder_token="可选父文件夹")
  
  # 读取文档
  feishu_doc_read(doc_token="文档token")
  
  # 写入内容（覆盖）
  feishu_doc_write(doc_token="文档token", content="# 标题\n内容")
  
  # 追加内容
  feishu_doc_append(doc_token="文档token", content="更多内容")
  
  # 列出文档块
  feishu_doc_list_blocks(doc_token="文档token")
  
  # 列出文件夹内容
  feishu_folder_list(folder_token="文件夹token")
  
  # 查询权限范围
  feishu_app_scopes()
  ```

### 🎤 speech-to-text (NEW!)
- 功能：语音识别（Speech-to-Text），将语音转换为文字
- 作者：ET
- 路径：`speech-to-text/`
- 依赖：OpenAI Whisper / ffmpeg / sounddevice
- 特色：
  - ✅ 支持多种音频格式（MP3, WAV, OGG, FLAC, M4A, WebM）
  - ✅ 实时麦克风转录
  - ✅ 多语言支持（中文、英文等）
  - ✅ 多种模型选择（tiny, base, small, medium, large）
  - ✅ VAD 语音活动检测
- 使用方法：
  ```bash
  cd speech-to-text
  ./scripts/install.sh  # 检查依赖
  
  # 安装 Whisper（本地推理）
  pip install openai-whisper ffmpeg-python
  
  # 安装麦克风支持
  pip install sounddevice soundfile numpy
  ```
- OpenClaw 工具：
  ```python
  # 转录音频文件
  stt_transcribe_file(audio_path="audio.mp3", language="zh")
  
  # 麦克风实时转录
  stt_transcribe_microphone(duration=5.0, language="zh")
  
  # 检测语言
  stt_detect_language(audio_path="audio.mp3")
  ```
- **与小T集成**：
  ```python
  # 语音对话循环
  audio = stt_transcribe_microphone(duration=5.0)
  result = stt_transcribe_file(audio.path, language="zh")
  response = llm_process(result.text)
  ```

### 🤖 xiaot-3d-interface (NEW!)
- 功能：小T 3D 界面 - 贾维斯风格的 AI 助手全息界面
- 作者：ET
- 路径：`xiaot-3d-interface/`
- 依赖：Three.js, WebGL
- 特色：
  - ✅ 3D 头像渲染（机器人风格）
  - ✅ 粒子系统效果
  - ✅ 语音波形可视化
  - ✅ 多种动画状态（idle, speaking, thinking, listening）
  - ✅ 情绪表达（happy, serious, excited, calm等）
  - ✅ 系统状态显示（CPU、内存、网络）
  - ✅ 多种主题（blue, orange, purple, cyan, dark）
- 使用方法：
  ```html
  <!DOCTYPE html>
  <html>
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="xiaot-3d-interface/js/xiaot.js"></script>
  </head>
  <body>
    <div id="xiaot-container"></div>
    <script>
      const xiaot = new XiaotInterface({
        container: '#xiaot-container',
        theme: 'blue',
        particles: true
      });
      xiaot.init();
    </script>
  </body>
  </html>
  ```
- OpenClaw 工具：
  ```python
  # 初始化 3D 场景
  xiaot_init(container="#xiaot-container", theme="blue", particles=True)
  
  # 播放动画
  xiaot_animate(animation="speaking")  # idle, speaking, thinking, listening
  xiaot_animate(animation="idle")
  
  # 设置情绪
  xiaot_set_emotion(emotion="happy")  # happy, serious, excited, calm, sad
  
  # 更新系统状态
  xiaot_update_status(cpu=45, memory=68, network="1.2 GB/s")
  
  # 语音波形动画
  xiaot_speak_wave(enabled=True)
  
  # 粒子效果
  xiaot_particles(enabled=True)
  ```
- **与小T对话**：
  ```python
  # 完整对话循环
  xiaot_set_emotion(emotion="listening")
  xiaot_animate(animation="listening")
  
  audio = stt_transcribe_microphone(duration=5.0)
  result = stt_transcribe_file(audio.path, language="zh")
  
  xiaot_set_emotion(emotion="thinking")
  xiaot_animate(animation="thinking")
  
  response = llm_process(result.text)
  
  xiaot_set_emotion(emotion="speaking")
  xiaot_animate(animation="speaking")
  xiaot_speak_wave(enabled=True)
  
  tts_speak(text=response, voice="nova")
  
  xiaot_speak_wave(enabled=False)
  xiaot_set_emotion(emotion="happy")
  xiaot_animate(animation="idle")
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
├── ui-ux-pro-max/                  # NEW!
│   ├── SKILL.md                    # 完整使用文档
│   ├── scripts/
│   │   ├── search.py               # 主搜索脚本
│   │   ├── core.py                 # 核心搜索逻辑
│   │   └── design_system.py        # 设计系统生成
│   └── data/
│       ├── styles.csv              # 67种设计风格
│       ├── colors.csv              # 96种配色方案
│       ├── typography.csv          # 字体搭配
│       ├── charts.csv              # 图表类型
│       ├── landing.csv             # Landing页面结构
│       ├── products.csv            # 产品类型
│       ├── icons.csv               # 图标规范
│       ├── ux-guidelines.csv       # UX设计指南
│       ├── ui-reasoning.csv        # UI设计推理
│       ├── web-interface.csv       # Web界面规范
│       ├── react-performance.csv   # React性能优化
│       ├── landing.csv             # Landing页面
│       └── stacks/                 # 技术栈指南
│           ├── html-tailwind.csv
│           ├── react.csv
│           ├── vue.csv
│           ├── nextjs.csv
│           ├── svelte.csv
│           ├── flutter.csv
│           ├── swiftui.csv
│           ├── react-native.csv
│           └── ...
├── feishu-integration/             # NEW!
│   ├── SKILL.md                    # 完整使用文档
│   ├── .gitignore                  # 排除敏感文件
│   └── scripts/
│       ├── install.sh              # 配置检查
│       └── examples.sh             # 使用示例
├── speech-to-text/                 # NEW!
│   ├── SKILL.md                    # 完整使用文档
│   ├── .gitignore                  # 排除敏感文件
│   └── scripts/
│       └── install.sh              # 依赖检查
├── xiaot-3d-interface/             # NEW!
│   ├── SKILL.md                    # 完整使用文档
│   ├── .gitignore                  # 排除敏感文件
│   ├── demo.html                   # 🎮 交互式演示页面
│   └── js/
│       └── xiaot.js                # 3D渲染核心代码
├── webrtc-vad/                     # NEW!
│   ├── SKILL.md                    # 完整使用文档
│   ├── .gitignore                  # 排除敏感文件
│   ├── demo-webrtc.html            # 🎮 WebRTC+VAD演示
│   └── js/
│       ├── vad.js                  # 语音活动检测模块
│       └── webrtc.js               # WebRTC通信模块
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
