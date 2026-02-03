#!/bin/bash
# Install dependencies for battery-alert skill

set -e

echo "🔋 Battery Alert - Dependency Installation"
echo "=========================================="
echo ""

# Check Python
PYTHON_CMD="/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/bin/python3"
if [ ! -f "$PYTHON_CMD" ]; then
    PYTHON_CMD="python3"
fi

echo "Using Python: $PYTHON_CMD"

# Install edge-tts
if $PYTHON_CMD -c "import edge_tts" 2>/dev/null; then
    echo "✅ edge-tts already installed"
else
    echo "📦 Installing edge-tts..."
    $PYTHON_CMD -m pip install edge-tts
    echo "✅ edge-tts installed"
fi

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "📖 Usage:"
echo "   ./check_battery.py          # Run once"
echo "   ./start_monitoring.sh       # Start continuous monitoring"
echo "   ./install_service.sh        # Install as background service"
