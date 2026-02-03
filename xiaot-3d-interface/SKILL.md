---
name: xiaot-3d-interface
description: "小T 3D interface - 3D AI assistant with emotions and particle effects. Features: 3D avatar, particle effects, emotion colors, speech animations, system status display. Built with Three.js. Topics: 3D graphics, AI avatar, visual effects, animation."
---

# 小T 3D Interface

小T 3D AI 助手界面。使用 Three.js 构建，支持实时动画和情绪表达。

## Features

- 🤖 **3D 头像** - 可爱的 AI 助手小T
- ✨ **粒子效果** - 全息数据流效果
- 🎨 **情绪颜色** - 7种情绪对应不同颜色
- 🔊 **语音波形** - 实时音频可视化
- 🗣️ **表情动画** - 说话、思考、聆听状态
- 📊 **系统状态** - CPU、内存、网络监控
- 🎨 **多种主题** - 蓝色、橙色、紫色等
- 📱 **响应式设计** - 适配不同屏幕
- 🌐 **Web 技术** - Three.js + WebGL

## Available Tools

| Tool | Description |
|------|-------------|
| `xiaot_init` | 初始化 3D 场景 |
| `xiaot_animate` | 播放动画（idle, speaking, thinking, listening） |
| `xiaot_set_emotion` | 设置情绪（happy, serious, excited, calm） |
| `xiaot_update_status` | 更新系统状态显示 |
| `xiaot_speak_wave` | 启动语音波形动画 |
| `xiaot_particles` | 启动/停止粒子效果 |
| `xiaot_fullscreen` | 全屏切换 |
| `xiaot_dispose` | 清理场景资源 |

## Quick Start

### 1. Include in HTML

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>小T - AI Assistant</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body class="bg-black">
    <div id="xiaot-container"></div>
    <script src="xiaot-3d-interface/js/xiaot.js"></script>
</body>
</html>
```

### 2. Initialize

```javascript
// Initialize 小T
const xiaot = new XiaotInterface({
    container: '#xiaot-container',
    theme: 'blue',        // blue, orange, purple
    avatar: 'robot',      // robot, cute, holographic
    particles: true,
    autostart: true
});

// Start the interface
xiaot.init();
```

### 3. Control from OpenClaw

```python
from openclaw.tools import (
    xiaot_init,
    xiaot_animate,
    xiaot_set_emotion,
    xiaot_update_status
)

# Initialize
xiaot_init(
    container="#xiaot-container",
    theme="blue",
    particles=True
)

# Animate when speaking
xiaot_animate(animation="speaking")

# Set emotion
xiaot_set_emotion(emotion="happy")

# Update system status
xiaot_update_status(
    cpu=45,
    memory=68,
    network="1.2 GB/s"
)

# Back to idle
xiaot_animate(animation="idle")
```

## Animations

| Animation | Description |
|-----------|-------------|
| `idle` | 默认待机状态，轻微浮动 |
| `speaking` | 说话状态，嘴巴动画 |
| `thinking` | 思考状态，旋转效果 |
| `listening` | 聆听状态，波形响应 |
| `excited` | 兴奋状态，快速动画 |
| `sleeping` | 睡眠状态，关闭眼睛 |

## Emotions

| Emotion | Visual Effect |
|---------|---------------|
| `happy` | 微笑眼睛，颜色变暖 |
| `serious` | 严肃表情，冷色调 |
| `excited` | 闪烁效果，粒子加速 |
| `calm` | 平滑动画，低饱和度 |
| `sad` | 下垂效果，蓝色调 |
| `surprised` | 放大效果，震动 |

## System Status Display

```python
from openclaw.tools import xiaot_update_status

# Update all metrics
xiaot_update_status(
    cpu=45,              # CPU 使用率 %
    memory=68,           # 内存使用率 %
    disk=32,             # 磁盘使用率 %
    network="1.2 GB/s",  # 网络速度
    battery=85,          # 电池电量 %
    temperature=42,      # 温度 °C
    uptime="2d 5h",      # 运行时间
    tasks_completed=156, # 完成任务数
    active_agents=4      #活跃Agent数
)
```

## Themes

```javascript
const themes = {
    blue: {
        primary: '#3b82f6',
        secondary: '#1d4ed8',
        accent: '#60a5fa',
        particle: '#3b82f6'
    },
    orange: {
        primary: '#f97316',
        secondary: '#ea580c',
        accent: '#fb923c',
        particle: '#f97316'
    },
    purple: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#a78bfa',
        particle: '#8b5cf6'
    },
    cyan: {
        primary: '#06b6d4',
        secondary: '#0891b2',
        accent: '#22d3ee',
        particle: '#06b6d4'
    },
    dark: {
        primary: '#6366f1',
        secondary: '#4f46e5',
        accent: '#818cf8',
        particle: '#818cf8'
    }
};
```

## Integration with STT and TTS

```python
from openclaw.tools import (
    stt_transcribe_microphone,
    tts_speak,
    xiaot_init,
    xiaot_animate,
    xiaot_set_emotion
)

# Initialize 小T
xiaot_init(container="#xiaot-container", theme="blue", particles=True)

def conversation_loop():
    """小T 对话循环"""
    
    # 1. 聆听状态
    xiaot_set_emotion(emotion="listening")
    xiaot_animate(animation="listening")
    
    # 2. 录音
    audio = stt_transcribe_microphone(duration=5.0)
    
    # 3. 思考状态
    xiaot_set_emotion(emotion="thinking")
    xiaot_animate(animation="thinking")
    
    # 4. 处理
    result = stt_transcribe_file(audio.path, language="zh")
    response = llm_process(result.text)
    
    # 5. 说话状态
    xiaot_set_emotion(emotion="speaking")
    xiaot_animate(animation="speaking")
    xiaot_speak_wave(enabled=True)
    
    # 6. TTS 播放
    tts_speak(text=response, voice="nova")
    
    # 7. 恢复待机
    xiaot_speak_wave(enabled=False)
    xiaot_set_emotion(emotion="happy")
    xiaot_animate(animation="idle")

# Start conversation
while True:
    conversation_loop()
```

## Custom Avatar

You can customize 小T's appearance:

```javascript
const xiaot = new XiaotInterface({
    container: '#xiaot-container',
    avatar: {
        type: 'robot',  // robot, cute, minimal
        color: '#3b82f6',
        eyeShape: 'circle',  // circle, oval, square
        mouthShape: 'smile',  // smile, open, line
        hasAntenna: true,
        hasWings: false,
        glowIntensity: 0.5
    },
    effects: {
        particles: true,
        glow: true,
        shadow: true,
        reflection: true
    }
});
```

## API Reference

### xiaot_init
```python
xiaot_init(
    container: str,           # CSS selector or element ID
    theme: str = "blue",      # blue, orange, purple, cyan, dark
    avatar: str = "robot",    # robot, cute, holographic
    particles: bool = True,
    autostart: bool = True
)
```

### xiaot_animate
```python
xiaot_animate(
    animation: str,           # idle, speaking, thinking, listening
    duration: float = 0.0     # Animation duration (0 = indefinite)
)
```

### xiaot_set_emotion
```python
xiaot_set_emotion(
    emotion: str,             # happy, serious, excited, calm, sad, surprised
    intensity: float = 1.0    # Emotion intensity (0.0 - 1.0)
)
```

## Files

```
xiaot-3d-interface/
├── SKILL.md                 # This file
├── .gitignore              # Sensitive files
├── demo.html               # 🎮 Interactive demo page
└── js/
    ├── xiaot.js            # Main 3D interface (24KB)
    ├── avatar.js           # Avatar rendering
    ├── particles.js        # Particle system
    ├── animation.js        # Animation controller
    └── effects.js          # Visual effects
```

## Quick Demo

Open `demo.html` in a browser to see 小T in action!

```bash
cd xiaot-3d-interface
# Open demo.html in your browser
# Or serve with:
python3 -m http.server 8080
# Visit http://localhost:8080/demo.html
```

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Edge | ✅ Full |
| IE 11 | ❌ Not supported |

## Performance

| Component | Impact |
|-----------|--------|
| 3D Avatar | Medium |
| Particles | Low-Medium |
| Glow Effects | Low |
| Audio Waveform | Low |

## Troubleshooting

### Black screen
- Check WebGL support: `navigator.getUserMedia`
- Update browser to latest version
- Check console for errors

### Low FPS
- Reduce particle count
- Disable glow effects
- Use simpler avatar

### Animation not playing
- Check animation name is valid
- Ensure scene is initialized
- Check for JavaScript errors

## Resources

- [Three.js Docs](https://threejs.org/docs/)
- [WebGL Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial)
- [Particle Systems](https://threejs.org/examples/#webgpu_compute_particles)

## License

MIT

---

*小T - 你的 AI 助手 🤖*
