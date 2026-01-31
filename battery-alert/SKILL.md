---
name: battery-alert
description: Monitor laptop battery and alert via TTS when below threshold while on battery power. Use for preventing unexpected shutdowns. Requires: edge-tts for voice alerts.
---

# Battery Alert

Monitor laptop battery level and broadcast voice alerts when battery is low and not charging.

## Quick Usage

```bash
# Start monitoring (check every 2 minutes)
./scripts/start_monitoring.sh

# Run once
python3 scripts/check_battery.py

# Install as background service
./scripts/install_service.sh
```

## Installation

```bash
cd battery-alert
./scripts/install.sh
```

## Features

- **Auto-detection**: Only alerts when on battery (not charging)
- **Configurable threshold**: Default 30% alert level
- **Voice alerts**: Uses edge-tts for natural voice notifications
- **Cooldown**: 5-minute cooldown between alerts
- **Lightweight**: Minimal resource usage

## Configuration

Edit `scripts/config.py` to customize:

```python
LOW_THRESHOLD = 30      # Alert when below 30%
COOLDOWN_SECONDS = 300  # 5 minutes between alerts
VOICE = "zh-CN-XiaoxiaoNeural"  # TTS voice
```

## Workflow

1. Check battery status every 2 minutes
2. If on battery AND below threshold:
   - Generate voice alert
   - Broadcast via system audio
   - Log alert timestamp
3. Skip if charging or above threshold
4. Sleep until next check

## Files

```
battery-alert/
├── SKILL.md              # This file
├── scripts/
│   ├── install.sh        # Install dependencies
│   ├── check_battery.py  # Core check logic
│   ├── monitor.sh        # Continuous monitoring loop
│   ├── start_monitoring.sh  # Easy start script
│   └── install_service.sh   # Install as macOS service
└── references/
    └── README.md         # Additional notes
```

## Dependencies

| Tool | Purpose | Install |
|------|---------|---------|
| edge-tts | Voice alerts | `pip3 install edge-tts` |
| pyttsx3 | Fallback TTS | `pip3 install pyttsx3` |

## Notes

- Best used when laptop is running on battery
- Automatically stops alerting when AC power connected
- Compatible with macOS only
