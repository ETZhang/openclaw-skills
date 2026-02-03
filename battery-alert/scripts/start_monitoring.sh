#!/bin/bash
# Start continuous battery monitoring
# Checks battery every 2 minutes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔋 Battery Monitor Started"
echo "========================="
echo "Checking every 2 minutes..."
echo "Press Ctrl+C to stop"
echo ""

while true; do
    date "+%Y-%m-%d %H:%M:%S"
    $SCRIPT_DIR/check_battery.py
    echo ""
    sleep 120  # 2 minutes
done
