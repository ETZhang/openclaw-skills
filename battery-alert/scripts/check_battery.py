#!/usr/bin/env python3
"""
Battery Alert - Check battery level and alert if low
Usage: python3 check_battery.py [--config CONFIG_FILE]
"""

import subprocess
import os
import time
from pathlib import Path

# Configuration
CONFIG_FILE = Path(__file__).parent / "config.py"
if not CONFIG_FILE.exists():
    CONFIG_FILE = Path(__file__).parent.parent.parent / "skills" / "openclaw-skills" / "battery-alert" / "scripts" / "config.py"

def load_config():
    """Load configuration from config.py"""
    config = {
        "LOW_THRESHOLD": 30,
        "COOLDOWN_SECONDS": 300,
        "VOICE": "zh-CN-XiaoxiaoNeural",
        "ALERT_FILE": "/tmp/battery_alert_last_triggered",
        "USE_EDGE_TTS": True
    }
    
    if CONFIG_FILE.exists():
        exec(CONFIG_FILE.read_text(), config)
    
    return config

def get_battery_status():
    """Get current battery status and percentage"""
    try:
        # Get battery info
        result = subprocess.run(
            ["pmset", "-g", "batt"],
            capture_output=True,
            text=True
        )
        
        output = result.stdout
        
        # Parse battery percentage
        import re
        match = re.search(r'(\d+)%', output)
        battery = int(match.group(1)) if match else None
        
        # Check if charging
        charging = "discharging" not in output and "AC" not in output
        
        return battery, charging
        
    except Exception as e:
        print(f"Error getting battery: {e}")
        return None, None

def should_alert(config):
    """Check if we should alert (low battery, not charging, cooldown passed)"""
    battery, charging = get_battery_status()
    
    # Skip if charging
    if charging:
        print(f"🔌 On AC power, battery: {battery}% - No alert needed")
        return False, battery
    
    # Skip if battery is OK
    if battery is None:
        print("❓ Could not read battery")
        return False, None
    
    if battery >= config["LOW_THRESHOLD"]:
        print(f"🔋 Battery: {battery}% - Above threshold, no alert")
        return False, battery
    
    # Check cooldown
    alert_file = config["ALERT_FILE"]
    now = time.time()
    
    if os.path.exists(alert_file):
        last_alert = os.path.getmtime(alert_file)
        if now - last_alert < config["COOLDOWN_SECONDS"]:
            remaining = int(config["COOLDOWN_SECONDS"] - (now - last_alert))
            print(f"⏰ Cooldown: {remaining}s remaining - No alert")
            return False, battery
    
    return True, battery

def generate_alert(battery, config):
    """Generate voice alert"""
    text = f"电池电量不足{battery}%，请及时充电。"
    
    print(f"🎵 Generating alert: {text}")
    
    # Use edge-tts
    cmd = [
        "/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/bin/python3",
        "-m", "edge_tts",
        "--text", text,
        "--voice", config["VOICE"],
        "--write-media", "/tmp/battery_alert.mp3"
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ TTS failed: {result.stderr}")
        return False
    
    # Play alert
    result = subprocess.run(["afplay", "/tmp/battery_alert.mp3"], capture_output=True)
    
    # Mark alert time
    Path(config["ALERT_FILE"]).touch()
    
    return result.returncode == 0

def main():
    config = load_config()
    print("🔋 Battery Alert Check")
    print(f"   Threshold: {config['LOW_THRESHOLD']}%")
    print(f"   Cooldown: {config['COOLDOWN_SECONDS']}s")
    print("-" * 40)
    
    should, battery = should_alert(config)
    
    if should:
        print(f"⚠️ LOW BATTERY: {battery}% - Alerting!")
        if generate_alert(battery, config):
            print("✅ Alert complete")
        else:
            print("❌ Alert failed")
    else:
        print("✅ No alert needed")

if __name__ == "__main__":
    main()
