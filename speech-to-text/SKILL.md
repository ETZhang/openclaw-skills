---
name: speech-to-text
description: "Speech-to-Text (STT) integration for OpenClaw. Convert spoken language to text using OpenAI Whisper or cloud APIs. Actions: transcribe, transcribe_file, transcribe_stream, transcribe_realtime. Topics: speech recognition, voice to text, whisper, audio transcription, ASR."
---

# Speech-to-Text (STT)

OpenClaw 语音识别技能，支持将语音转换为文字。使用 OpenAI Whisper 或云端 API。

## Features

- 🎤 **文件转录** - 支持多种音频格式
- ⏱️ **实时转录** - 流式语音识别
- 📱 **麦克风输入** - 直接从麦克风获取音频
- 🌐 **多语言支持** - 中文、英文等多语言
- 📝 **标点恢复** - 自动添加标点符号
- 🔇 **VAD 检测** - 语音活动检测

## Available Tools

| Tool | Description |
|------|-------------|
| `stt_transcribe_file` | 转录音频文件 |
| `stt_transcribe_microphone` | 从麦克风实时转录 |
| `stt_transcribe_stream` | 流式转录（长音频） |
| `stt_detect_language` | 检测音频语言 |
| `stt_get_duration` | 获取音频时长 |

## Setup

### 1. Install Dependencies

```bash
# For Whisper local inference
pip install openai-whisper ffmpeg-python

# For microphone input
pip install sounddevice soundfile numpy
```

### 2. Configure (Optional)

Create `.env` file:

```bash
# OpenAI API (for cloud Whisper)
OPENAI_API_KEY=your_api_key_here

# Azure Speech (alternative)
AZURE_SPEECH_KEY=your_key
AZURE_SPEECH_REGION=eastus
```

Or set environment variables:

```bash
export OPENAI_API_KEY="your_api_key"
```

## Usage

### Transcribe Audio File

```python
from openclaw.tools import stt_transcribe_file

result = stt_transcribe_file(
    audio_path="/path/to/audio.mp3",
    language="zh",  # Optional: auto-detect if not specified
    model="whisper-1"  # or "base", "small", "medium", "large"
)
text = result.text
```

### Transcribe from Microphone

```python
from openclaw.tools import stt_transcribe_microphone

result = stt_transcribe_microphone(
    duration=5.0,  # Record for 5 seconds
    language="zh"
)
print(result.text)
```

### Detect Language

```python
from openclaw.tools import stt_detect_language

result = stt_detect_language(audio_path="/path/to/audio.mp3")
print(f"Detected language: {result.language}")  # e.g., "zh", "en"
```

## Supported Formats

| Format | Extension | Support |
|--------|-----------|---------|
| MP3 | `.mp3` | ✅ |
| WAV | `.wav` | ✅ |
| OGG | `.ogg` | ✅ |
| FLAC | `.flac` | ✅ |
| M4A | `.m4a` | ✅ |
| WebM | `.webm` | ✅ |

## Whisper Models

| Model | Size | Speed | Accuracy |
|-------|------|-------|----------|
| `tiny` | 39MB | ⚡ Fast | 📝 Basic |
| `base` | 74MB | ⚡ Fast | 📝 Good |
| `small` | 244MB | 🚀 Medium | ✅ Better |
| `medium` | 769MB | 🚗 Slow | ✅ Great |
| `large` | 1550MB | 🐢 Slowest | ✅ Best |
| `whisper-1` | Cloud | ☁️ Varies | ✅ Excellent |

## Example: Voice Command to Text

```python
from openclaw.tools import (
    stt_transcribe_microphone,
    llm_process
)

# 1. Record voice command
audio = stt_transcribe_microphone(duration=3.0)

# 2. Convert to text
text_result = stt_transcribe_file(audio.path, language="zh")

# 3. Process with LLM
response = llm_process(text_result.text)

print(f"You said: {text_result.text}")
print(f"Response: {response}")
```

## Integration with Jarvis (小T)

```python
from openclaw.tools import (
    stt_transcribe_microphone,
    tts_speak,  # Existing TTS tool
    jarvis_animate  # 3D interface animation
)

def listen_and_respond():
    """Main conversation loop for 小T"""
    
    # 1. Listen
    print("🎤 Listening...")
    audio = stt_transcribe_microphone(duration=5.0)
    
    # 2. Transcribe
    result = stt_transcribe_file(audio.path, language="zh")
    user_input = result.text
    
    # 3. Animate avatar (3D interface)
    jarvis_animate(animation="speaking")
    
    # 4. Process with LLM
    response = llm_process(user_input)
    
    # 5. Speak response
    tts_speak(text=response, voice="nova")
    
    # 6. Reset animation
    jarvis_animate(animation="idle")

# Run in loop
while True:
    listen_and_respond()
```

## Troubleshooting

### "ffmpeg not found" Error
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
winget install FFmpeg
```

### "Microphone not found" Error
- Check microphone permissions
- Verify device is not in use
- Try: `import sounddevice; print(sounddevice.query_devices())`

### "API key not found" Error
- Set `OPENAI_API_KEY` environment variable
- Or use local Whisper models

### Low Accuracy
- Use larger Whisper model
- Ensure clear audio quality
- Add language parameter explicitly

## Performance Tips

1. **For real-time**: Use `base` or `small` model
2. **For accuracy**: Use `medium` or `large` model
3. **For long audio**: Use `transcribe_stream` with chunk processing
4. **Reduce latency**: Pre-load model in memory

## Resources

- [OpenAI Whisper Docs](https://platform.openai.com/docs/guides/speech-to-text)
- [Whisper GitHub](https://github.com/openai/whisper)
- [FFmpeg](https://ffmpeg.org/)

## License

MIT
