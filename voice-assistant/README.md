# 小T 语音助手 - 方案2：HTTP 后端模式

## 🎯 问题解决方案

**原问题**：语音界面与 OpenClaw Web UI (http://127.0.0.1:18789/chat) 争夺 WebSocket 连接，导致两者都无法使用。

**解决方案**：语音界面通过 HTTP 调用自己的后端服务器，后端服务器再调用 OpenClaw CLI 命令，从而避免与 OpenClaw Web UI 的 WebSocket 连接冲突。

```
用户语音 → 浏览器 (STT) → HTTP → 小T后端 (18790) → OpenClaw CLI → 响应
                     ↑                                  ↑
                不使用 WebSocket                    不使用 WebSocket
```

## 📁 文件结构

```
voice-assistant/
├── server.js          # Node.js 后端服务器（监听 18790 端口）
├── package.json       # NPM 依赖配置
├── start-backend.command  # 后端启动脚本
├── index.html         # 语音助手 Web UI
└── js/
    ├── assistant.js   # 语音助手核心逻辑
    ├── vad.js         # 语音活动检测
    └── xiaot-core.js  # 3D 粒子界面
```

## 🚀 使用步骤

### 1. 启动后端服务器

```bash
cd /Users/moltbot-stardust/.clawdbot/skills/openclaw-skills/voice-assistant
./start-backend.command
# 或
npm start
```

后端服务器将在 `http://127.0.0.1:18790` 启动。

### 2. 打开语音助手界面

在浏览器中打开：
```
file:///Users/moltbot-stardust/.clawdbot/skills/openclaw-skills/voice-assistant/index.html
```

### 3. 开始使用

1. 点击 **"🎤 点击开始对话"** 按钮
2. 允许麦克风权限
3. 说话，系统会自动：
   - 检测语音活动 (VAD)
   - 语音转文字 (STT)
   - 发送到后端
   - 后端调用 OpenClaw CLI
   - 返回响应并语音播放 (TTS)

## 🔧 配置

### 后端服务器配置

默认配置：
- 地址：`http://127.0.0.1:18790`
- 端点：`POST /agent`
- 请求体：`{"message": "你的消息", "agent": "main"}`

### 浏览器端配置

在 `index.html` 中可以配置：
- 后端 URL（默认：`http://127.0.0.1:18790`）
- 会话 ID（默认：`main`）

## 🧪 测试后端服务器

```bash
curl -X POST http://127.0.0.1:18790/agent \
  -H "Content-Type: application/json" \
  -d '{"message":"你好"}'
```

响应示例：
```json
{
  "response": "你好！我能听到你！...",
  "fromMock": false
}
```

## 🔍 与 OpenClaw Web UI 共存

现在你可以同时使用：
- ✅ **小T语音助手**：通过 HTTP 后端调用 OpenClaw
- ✅ **OpenClaw Web UI**：http://127.0.0.1:18789/chat 通过 WebSocket 连接

两者不会冲突！

## 📝 技术细节

### 后端服务器 (server.js)
- 使用 Express.js 框架
- 监听端口 18790（避免与 OpenClaw 网关 18789 冲突）
- 接收 HTTP POST 请求
- 调用 `openclaw agent --agent main --message "..."`
- 清理响应中的 ANSI 颜色码和调试信息
- 返回干净的 JSON 响应

### 语音助手 (assistant.js)
- 使用 VAD 检测语音活动
- 使用 Web Speech API 进行 STT 和 TTS
- 通过 HTTP 与后端服务器通信
- 不直接连接 OpenClaw WebSocket

## ⚠️ 注意事项

1. **后端服务器必须先启动**：在使用语音助手前，确保后端服务器正在运行
2. **麦克风权限**：首次使用需要授予浏览器麦克风权限
3. **HTTPS 要求**：Web Speech API 要求使用 HTTPS 或 localhost
4. **OpenClaw 状态**：确保 OpenClaw 网关正常运行（虽然语音助手不直接连接，但 CLI 需要访问配置）

## 🐛 故障排除

### 后端服务器无法启动
```bash
# 检查端口占用
lsof -i :18790

# 杀死占用进程
kill -9 <PID>

# 重新启动
npm start
```

### 语音识别不工作
- 确保使用 Chrome/Edge 浏览器（Safari 的 Web Speech API 支持有限）
- 检查麦克风权限是否已授予
- 打开浏览器控制台查看错误信息

### 无法获取 OpenClaw 响应
- 确保 OpenClaw CLI 可以正常工作：`openclaw agent --agent main --message "测试"`
- 检查后端服务器日志
- 确保 OpenClaw 配置正确

## 📊 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     用户界面层                               │
├─────────────────────────────────────────────────────────────┤
│  浏览器 (index.html)                                        │
│    ├── 3D 粒子界面 (xiaot-core.js)                          │
│    ├── 语音助手 (assistant.js)                              │
│    │   ├── VAD (vad.js)                                     │
│    │   ├── STT (Web Speech API)                             │
│    │   └── TTS (Web Speech API)                             │
│    └── HTTP 客户端                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP POST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     后端服务层                               │
├─────────────────────────────────────────────────────────────┤
│  Node.js 服务器 (server.js) - 端口 18790                    │
│    └── 接收 HTTP 请求                                       │
│        └── 调用 OpenClaw CLI 命令                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ exec()
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   OpenClaw CLI 层                            │
├─────────────────────────────────────────────────────────────┤
│  openclaw agent --agent main --message "..."                │
│    └── 使用 embedded 模式（fallback）                       │
└─────────────────────────────────────────────────────────────┘
```

## 🎉 完成！

现在你的小T语音助手和 OpenClaw Web UI 可以和平共处了！
