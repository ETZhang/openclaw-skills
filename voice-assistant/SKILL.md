# Voice Assistant - OpenClaw 语音助手

小T语音助手，集成 VAD → STT → OpenClaw → TTS 完整语音对话流程。

## Features

- 🎤 **VAD语音检测** - 自动检测说话开始/结束
- 🗣️ **STT语音识别** - Web Speech API 中文识别
- 🤖 **OpenClaw集成** - 发送消息到OpenClaw处理
- 🔊 **TTS语音合成** - 中文语音回复
- 🎨 **3D界面** - 小T风格全息头像
- 💬 **对话历史** - 实时显示对话内容

## Setup

### Dependencies
```bash
# 无需额外依赖
# 使用浏览器原生 API
# - Web Speech API (STT + TTS)
# - Web Audio API (VAD)
# - WebRTC (可选)
```

### Quick Start
```html
<!DOCTYPE html>
<html>
<head>
    <script src="js/xiaot-core.js"></script>
    <script src="js/vad.js"></script>
    <script src="js/assistant.js"></script>
</head>
<body>
    <div id="xiaot"></div>
    <script>
        const assistant = new XiaotVoiceAssistant({
            openclawUrl: 'http://localhost:11434',
            openclawSession: 'main',
            vadThreshold: 0.5,
            sttLanguage: 'zh-CN'
        });

        await assistant.init();
        await assistant.startListening();
    </script>
</body>
</html>
```

## Usage

### Basic Example

```javascript
// 创建助手
const assistant = new XiaotVoiceAssistant({
    openclawUrl: 'http://localhost:11434',  // OpenClaw API 地址
    openclawSession: 'main',                 // 会话ID
    vadThreshold: 0.5,                       // VAD阈值
    sttLanguage: 'zh-CN',                    // 识别语言
    ttsVoice: 'Google 普通话',               // TTS语音
    ttsRate: 1.0,                            // 语速
    ttsPitch: 1.0                            // 音调
});

// 设置回调
assistant.onStatusChange = (state, message) => {
    console.log(`Status: ${state} - ${message}`);
};

assistant.onTranscript = (text, isFinal) => {
    if (isFinal) {
        console.log(`Recognized: ${text}`);
    }
};

assistant.onResponse = (data) => {
    console.log('Response:', data.response);
};

assistant.onSpeakingStart = () => {
    console.log('🎤 Started speaking');
};

assistant.onSpeakingEnd = () => {
    console.log('🔇 Stopped speaking');
};

assistant.onError = (error) => {
    console.error('Error:', error);
};

// 初始化并开始
await assistant.init();
await assistant.startListening();

// 停止
assistant.stopListening();

// 清理
assistant.dispose();
```

### Advanced: Manual Control

```javascript
// 手动触发TTS
await assistant.speak('你好，我是小T！');

// 打断说话
assistant.interrupt();

// 获取状态
console.log(assistant.isListening);   // 是否在监听
console.log(assistant.isSpeaking);    // 是否在说话
console.log(assistant.isProcessing);  // 是否在处理
```

### With Custom VAD

```javascript
// 自定义VAD配置
const assistant = new XiaotVoiceAssistant({
    vadThreshold: 0.6,              // 提高阈值减少误检
    vadSilenceDuration: 1.0,        // 延长静音时间
    autoListen: true                // 自动开始监听
});
```

## API Reference

### Constructor Options

```javascript
{
    openclawUrl: 'http://localhost:11434',  // OpenClaw API 地址
    openclawSession: 'main',                 // 会话ID
    vadThreshold: 0.5,                       // VAD检测阈值 (0-1)
    vadSilenceDuration: 0.8,                 // 停止说话的静音时长(秒)
    sttLanguage: 'zh-CN',                    // 语音识别语言
    ttsVoice: 'Google 普通话',               // TTS语音名称
    ttsRate: 1.0,                            // TTS语速 (0.5-2)
    ttsPitch: 1.0,                           // TTS音调 (0.5-2)
    autoListen: true                         // 初始化后自动开始监听
}
```

### Methods

| Method | Description |
|--------|-------------|
| `await init()` | 初始化VAD、STT、TTS |
| `await startListening()` | 开始监听麦克风 |
| `stopListening()` | 停止监听 |
| `await speak(text)` | 语音合成并播放 |
| `interrupt()` | 打断当前语音 |
| `dispose()` | 清理资源 |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `isListening` | boolean | 是否正在监听 |
| `isSpeaking` | boolean | 是否正在播放语音 |
| `isProcessing` | boolean | 是否正在处理 |
| `conversationHistory` | array | 对话历史 |

### Callbacks

| Callback | Parameters | Description |
|----------|------------|-------------|
| `onStatusChange` | `(state, message)` | 状态变化 |
| `onTranscript` | `(text, isFinal)` | 语音识别结果 |
| `onResponse` | `{response, ...}` | OpenClaw回复 |
| `onSpeakingStart` | `()` | 开始播放语音 |
| `onSpeakingEnd` | `()` | 播放完成 |
| `onError` | `(error)` | 发生错误 |

## Demo

Open `index.html` for a complete interactive demo:

```bash
cd voice-assistant
python3 -m http.server 8080
# Visit http://localhost:8080/index.html
```

### Demo Features:
- 🎤 Click to start/stop voice conversation
- 📊 VAD visualization (probability meter)
- 💬 Real-time chat history
- 🎨 3D 小T风格 avatar
- 🔧 OpenClaw connection config
- 🔊 TTS test button

## OpenClaw Integration

### Send Message to OpenClaw

```javascript
// 通过API发送消息
POST http://localhost:11434/api/sessions/{session}/messages
{
    "message": "你的语音识别结果"
}

// 响应
{
    "response": "OpenClaw的回复文本"
}
```

### WebSocket实时通信 (可选)

```javascript
// 连接到OpenClaw WebSocket
const ws = new WebSocket('ws://localhost:11434/ws');

// 发送语音
ws.send(JSON.stringify({
    type: 'voice_input',
    text: recognizedText
}));

// 接收回复
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'response') {
        assistant.speak(data.text);
    }
};
```

## Troubleshooting

### "SpeechRecognition not found"
- Chrome/Edge: 默认支持
- Safari: 需要用户手动启用
- Firefox: 需要配置

### Microphone permission denied
- 检查浏览器地址栏左侧的权限图标
- 确认为HTTPS或localhost
- 系统设置 > 隐私 > 麦克风 > 允许浏览器

### TTS voice not found
```javascript
// 查看可用语音
console.log(assistant.ttsVoices);

// 手动选择
const voice = assistant.ttsVoices.find(v => v.lang.includes('zh'));
```

### VAD too sensitive / not sensitive
```javascript
// 调整阈值
const assistant = new XiaotVoiceAssistant({
    vadThreshold: 0.3,  // 降低: 更敏感
    // 或
    vadThreshold: 0.7   // 提高: 更严格
});
```

## Files

```
voice-assistant/
├── SKILL.md            # This file
├── index.html          # 🎮 Interactive demo
└── js/
    ├── assistant.js    # Core assistant
    ├── xiaot-core.js   # 3D avatar
    └── vad.js          # Voice activity detection
```

## Browser Support

| Browser | STT | TTS | Web Audio |
|---------|-----|-----|-----------|
| Chrome | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |
| Safari | ⚠️ | ✅ | ✅ |
| Firefox | ⚠️ | ✅ | ✅ |

⚠️ STT可能需要手动启用

## License

MIT
