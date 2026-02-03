---
name: vision-monitor
description: "Vision-based monitoring system using camera + AI to detect specific objects or activities. Features: real-time photo capture, visual analysis via GLM-4V-Flash, customizable detection targets (spoons, cups, dangerous activities), Feishu notification alerts. Actions: monitor, detect, watch, alert, capture, analyze."
metadata:
  openclaw:
    emoji: "👁️"
    requires:
      bins: ["ffmpeg"]
    install:
      - id: brew
        kind: brew
        formula: ffmpeg
        label: "Install ffmpeg (required for camera capture)"
---

# Vision Monitor Skill

AI-powered visual monitoring system using your Mac's camera and GLM-4V-Flash for real-time object/activity detection.

## Features

- 📸 **Real-time Capture** - Automatic photo capture at configurable intervals (default: 5 seconds)
- 🔍 **Visual Analysis** - Uses GLM-4V-Flash to detect specific objects or activities
- 🎯 **Customizable Targets** - Monitor for spoons, cups, people, dangerous activities, etc.
- 📱 **Feishu Alerts** - Instant notifications when targets are detected
- 🧹 **Auto Cleanup** - Keeps only latest N photos to prevent disk overflow

## Requirements

- macOS with built-in camera (FaceTime HD Camera)
- FFmpeg installed (`brew install ffmpeg`)
- GLM-4V-Flash API key (智谱AI)
- Feishu app (optional, for notifications)

## Installation

```bash
# Install ffmpeg
brew install ffmpeg
```

## Configuration

### API Key Setup

Set environment variables:
```bash
export GLM_API_KEY="your-glm-api-key"
export FEISHU_TOKEN="your-feishu-token"  # Optional
export FEISHU_USER_ID="your-user-id"     # Optional
```

Or configure in `~/.clawdbot/skills/vision-monitor/config.yaml`:
```yaml
glm_api_key: "your-glm-api-key"
feishu:
  token: "your-feishu-token"
  user_id: "your-user-id"
```

## Usage

### Start Monitoring

```bash
# Monitor for spoons
./monitor.sh --target spoon

# Monitor for cups
./monitor.sh --target cup

# Monitor for dangerous activities
./monitor.sh --target danger

# Custom target
./monitor.sh --target "red phone"
```

### Check Status

```bash
# View latest photo
cat /tmp/camera_monitor_latest.jpg | open -f

# View monitoring logs
tail -f /tmp/vision-monitor.log
```

### Stop Monitoring

```bash
pkill -f vision-monitor
# or
kill $(cat /tmp/vision-monitor.pid)
```

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `--interval` | Capture interval in seconds | 5 |
| `--target` | What to detect | required |
| `--max-photos` | Max photos to keep | 10 |
| `--output` | Photo output directory | /tmp/camera_monitor |

Example:
```bash
./monitor.sh --interval 10 --target "suspicious person" --max-photos 20
```

## Project Structure

```
vision-monitor/
├── SKILL.md          # This file
├── README.md         # User guide
├── monitor.sh        # Main monitoring script
├── detect.sh         # Detection logic
├── config/           # Configuration files
│   └── prompts.yaml  # Detection prompts
└── scripts/
    ├── capture.sh   # Photo capture
    ├── analyze.sh   # Image analysis
    └── notify.sh    # Alert system
```

## Supported Detection Targets

- **Objects**: spoon, cup, phone, laptop, bag, etc.
- **People**: count people, specific actions
- **Activities**: climbing, danger, theft
- **Custom**: Any object or behavior you define

## Example Prompts

### Spoon Detection
```yaml
prompt: "请仔细看这张图片。如果有人手里拿着勺子，请说'发现勺子'。如果没有人拿勺子，请说'安全'。"
alert: "🚨 有人拿勺子了！"
```

### Danger Detection
```yaml
prompt: "请检测是否有人做危险动作，例如爬高、攀爬、站在高处等。如果发现危险动作，请说'危险警报'。"
alert: "🚨 检测到危险动作！"
```

## Troubleshooting

### Camera not detected
```bash
ffmpeg -f avfoundation -list_devices true -i ""
```

### FFmpeg pixel format error
```bash
# Use correct pixel format
ffmpeg -f avfoundation -framerate 30 -video_size 1280x720 -i "0" -pix_fmt uyvy422 ...
```

### API errors
- Check API key is valid
- Ensure GLM-4V-Flash has sufficient quota
- Verify network connectivity

## API Credits

Uses **GLM-4V-Flash** from 智谱AI (BigModel).
- Free tier available
- Fast inference
- Good for real-time monitoring

Get API key: https://open.bigmodel.cn/

## License

MIT License

## Author

Created for OpenClaw personal AI assistant

## Changelog

**v1.0.0** (2026-02-03)
- Initial release
- Basic monitoring
- GLM-4V-Flash integration
- Feishu notifications
