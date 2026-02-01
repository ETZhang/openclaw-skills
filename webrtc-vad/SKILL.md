# WebRTC & VAD - Real-time Voice Communication

实时语音通信技能，包含语音活动检测(VAD)和WebRTC双向通信。

## Features

### 🎤 VAD (Voice Activity Detection)
- **Silero VAD 模拟** - 高精度语音检测
- **WebRTC VAD 兼容** - 浏览器原生支持
- **语音/静音区分** - 准确识别说话状态
- **回调事件** - onSpeechStart, onSpeechEnd, onVADUpdate
- **可配置参数** - 阈值、静音时长、采样率

### 📡 WebRTC Communication
- **P2P 连接** - 端到端加密通信
- **数据通道** - 实时消息传递
- **音频流** - 低延迟语音传输
- **ICE 候选** - NAT穿透支持
- **双向通信** - 发起方/接收方模式

## Available Tools

| Tool | Description |
|------|-------------|
| `vad_init` | 初始化VAD系统 |
| `vad_start` | 从麦克风开始语音检测 |
| `vad_stop` | 停止VAD检测 |
| `vad_get_status` | 获取当前VAD状态 |
| `webrtc_create_offer` | 创建WebRTC Offer (发起方) |
| `webrtc_create_answer` | 创建WebRTC Answer (接收方) |
| `webrtc_connect` | 建立WebRTC连接 |
| `webrtc_disconnect` | 断开连接 |
| `webrtc_send` | 发送消息 |

## Setup

### Dependencies
```bash
# No additional dependencies needed
# Uses browser native WebRTC API
```

### Quick Start
```javascript
import { XiaotVAD, XiaotWebRTC } from './js/vad.js';
import { XiaotWebRTC } from './js/webrtc.js';
```

## Usage

### VAD - Voice Activity Detection

```javascript
// Initialize VAD
const vad = new XiaotVAD({
    threshold: 0.5,           // Speech detection threshold
    minSpeechDuration: 0.3,   // Min speech duration (seconds)
    minSilenceDuration: 0.5   // Min silence duration (seconds)
});

await vad.init();

// Set callbacks
vad.onSpeechStart = () => {
    console.log('🎤 Speech started');
    // Update UI: show listening state
};

vad.onSpeechEnd = () => {
    console.log('🔇 Speech ended');
    // Process the spoken audio
};

vad.onVADUpdate = (status) => {
    console.log(`VAD: ${status.probability.toFixed(2)}, Speech: ${status.isSpeech}`);
    // Update UI: show speech probability
};

// Start monitoring
await vad.startFromMicrophone();

// Stop when done
vad.stop();
```

### WebRTC - Real-time Communication

#### As Initiator (Caller)
```javascript
const webrtc = new XiaotWebRTC();

webrtc.onDataChannelMessage = (message) => {
    console.log('Received:', message);
};

webrtc.onRemoteStream = (stream) => {
    // Play remote audio
    const audio = new Audio();
    audio.srcObject = stream;
    audio.play();
};

// Create offer
const offer = await webrtc.createOffer();

// Send offer to peer (via your signaling server)
// ...

// Add peer's answer
await webrtc.handleAnswer(answer);

// Add ICE candidates as they arrive
for (const candidate of candidates) {
    await webrtc.addIceCandidate(candidate);
}
```

#### As Receiver (Callee)
```javascript
const webrtc = new XiaotWebRTC();

webrtc.onDataChannelMessage = (message) => {
    console.log('Received:', message);
};

webrtc.onRemoteStream = (stream) => {
    // Play remote audio
};

// Create answer from peer's offer
const answer = await webrtc.createAnswer(offer);

// Send answer back to peer

// Add ICE candidates
for (const candidate of candidates) {
    await webrtc.addIceCandidate(candidate);
}

// Send messages
webrtc.sendText('Hello from 小T!');
```

### Combined: Voice Chat with VAD

```javascript
// Initialize
const vad = new XiaotVAD({ threshold: 0.5 });
const webrtc = new XiaotWebRTC();

await vad.init();

// VAD callbacks
vad.onSpeechStart = () => {
    console.log('🎤 User started speaking');
    // Mute remote audio while user is speaking
    webrtc.toggleLocalAudio(false);
};

vad.onSpeechEnd = () => {
    console.log('🔇 User stopped speaking');
    // Unmute and send response
    webrtc.toggleLocalAudio(true);
    sendMessageToPeer("稍等，我正在思考...");
};

// WebRTC message handling
webrtc.onDataChannelMessage = async (message) => {
    if (message.type === 'text') {
        // Get AI response
        const response = await getAIResponse(message.content);
        // Text-to-speech
        speakText(response);
        // Send to peer
        webrtc.sendText(response);
    }
};

// Start conversation
await vad.startFromMicrophone();
await webrtc.createOffer();
```

## API Reference

### XiaotVAD

```javascript
const vad = new XiaotVAD(options)

// Methods
await vad.init()                    // Initialize
await vad.startFromMicrophone()      // Start from mic
vad.startFromStream(stream)         // Start from stream
vad.stop()                           // Stop monitoring
vad.dispose()                        // Cleanup

// Options
{
    threshold: 0.5,           // VAD threshold (0-1)
    minSpeechDuration: 0.3,   // Min speech to trigger
    minSilenceDuration: 0.5,  // Min silence to end
    samplingRate: 16000       // Audio sample rate
}

// Callbacks
vad.onSpeechStart = () => {}    // Speech detected
vad.onSpeechEnd = () => {}      // Speech ended
vad.onVADUpdate = (status) => {
    // status: { probability, isSpeech, level }
}

// Status
vad.isListening    // Is monitoring
vad.isSpeechActive // Is currently detecting speech
```

### XiaotWebRTC

```javascript
const webrtc = new XiaotWebRTC(options)

// Methods
await webrtc.createOffer()                    // Create offer (caller)
await webrtc.createAnswer(offer)              // Create answer (callee)
await webrtc.handleAnswer(answer)             // Apply answer
await webrtc.addIceCandidate(candidate)       // Add ICE candidate
webrtc.send(message)                          // Send any message
webrtc.sendText(text)                         // Send text
webrtc.toggleLocalAudio(enabled)              // Enable/disable mic
webrtc.disconnect()                           // Disconnect

// Callbacks
webrtc.onConnectionStateChange = (state) => {}
webrtc.onDataChannelMessage = (message) => {}
webrtc.onRemoteStream = (stream) => {}
webrtc.onIceCandidate = (candidate) => {}

// Properties
webrtc.isConnected     // Is connected
webrtc.isInitiator     // Is caller (not callee)
```

## Demo

Open `demo-webrtc.html` for a complete demo:

```bash
cd webrtc-vad
python3 -m http.server 8080
# Visit http://localhost:8080/demo-webrtc.html
```

### Demo Features:
- 🎤 Click to start/stop recording
- 📊 VAD probability visualization
- 🎵 Audio playback from remote
- 💬 Real-time chat
- 🎨 Emotion indicators

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Edge | ✅ Full |
| Mobile Chrome | ✅ Full |
| Mobile Safari | ✅ Limited |

## Troubleshooting

### "Permission denied" for microphone
- Check browser permissions
- Use HTTPS (required for mic access)
- User must explicitly grant permission

### WebRTC connection failed
- Check STUN/TURN servers
- Ensure both peers are online
- Check firewall settings

### Poor audio quality
- Enable echoCancellation
- Use noiseSuppression
- Check network bandwidth

## Files

```
webrtc-vad/
├── SKILL.md              # This file
├── js/
│   ├── vad.js           # VAD module
│   └── webrtc.js        # WebRTC module
└── demo-webrtc.html     # Interactive demo
```

## License

MIT
