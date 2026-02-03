#!/bin/bash
# News Image Reader - Bash wrapper
# Usage: ./read_image_news.sh <image_path> [--voice VOICE]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default voice
VOICE="zh-CN-XiaoxiaoNeural"

# Parse arguments
IMAGE_PATH=""
for arg in "$@"; do
    if [[ "$arg" == --* ]]; then
        if [[ "$arg" == --voice=* ]]; then
            VOICE="${arg#--voice=}"
        fi
    else
        IMAGE_PATH="$arg"
    fi
done

if [ -z "$IMAGE_PATH" ]; then
    echo "Usage: $0 <image_path> [--voice VOICE]"
    echo "Example: $0 news.jpg --voice zh-CN-XiaoxiaoNeural"
    exit 1
fi

if [ ! -f "$IMAGE_PATH" ]; then
    echo "Error: Image not found: $IMAGE_PATH"
    exit 1
fi

echo "🎤 News Image Reader"
echo "===================="
echo "Image: $IMAGE_PATH"
echo "Voice: $VOICE"
echo ""

# Run Python script
python3 "$SCRIPT_DIR/read_image_news.py" "$IMAGE_PATH" --voice "$VOICE"
