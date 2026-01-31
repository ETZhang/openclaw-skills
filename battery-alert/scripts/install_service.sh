#!/bin/bash
# Install battery-alert as macOS background service

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔋 Installing Battery Alert as macOS Service"
echo "============================================="
echo ""

# Create LaunchAgent plist
PLIST_DIR="$HOME/Library/LaunchAgents"
PLIST_FILE="$PLIST_DIR/com.et.battery-alert.plist"

mkdir -p "$PLIST_DIR"

cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.et.battery-alert</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$SCRIPT_DIR/start_monitoring.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/battery-alert.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/battery-alert.err</string>
</dict>
</plist>
EOF

echo "✅ Created LaunchAgent: $PLIST_FILE"

# Load the service
launchctl load "$PLIST_FILE" 2>/dev/null || true

echo ""
echo "✅ Service installed and started!"
echo ""
echo "Commands:"
echo "   launchctl list | grep battery-alert   # Check status"
echo "   launchctl stop com.et.battery-alert   # Stop"
echo "   launchctl start com.et.battery-alert  # Start"
echo ""
echo "Logs:"
echo "   tail -f /tmp/battery-alert.log"
