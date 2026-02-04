# Vision Monitor

👁️ AI-powered visual monitoring system for your Mac

## What is Vision Monitor?

Vision Monitor turns your Mac's camera into an intelligent monitoring system. It uses AI (GLM-4V-Flash) to detect specific objects or activities and sends you alerts when targets are found.

## Quick Start

```bash
# Clone or download this skill
cd vision-monitor

# Make scripts executable
chmod +x monitor.sh

# Start monitoring for spoons
./monitor.sh --target spoon

# Monitor for dangerous activities
./monitor.sh --target danger

# Stop with Ctrl+C
```

## Features

✅ Real-time camera monitoring (5-second intervals)  
✅ AI-powered object/activity detection  
✅ Customizable detection targets  
✅ Instant Feishu notifications  
✅ Auto-cleanup of old photos  

## Use Cases

- 🏠 Home security monitoring  
- 👀 Office safety surveillance  
- 🔍 Object tracking (where's my spoon?)  
- ⚠️ Danger detection (climbing, theft)  
- 📸 Time-lapse photography  

## Requirements

- macOS with FaceTime HD Camera  
- FFmpeg (`brew install ffmpeg`)  
- GLM-4V-Flash API key  

## Getting Help

See [SKILL.md](SKILL.md) for full documentation.

## License

MIT
