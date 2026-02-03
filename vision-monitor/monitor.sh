#!/bin/bash
# Vision Monitor - AI-powered camera monitoring system
# Usage: ./monitor.sh --target [spoon|cup|danger|custom] --interval [seconds] --max-photos [N]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default settings
INTERVAL=5
MAX_PHOTOS=10
TARGET=""
OUTPUT_DIR="/tmp/camera_monitor"
LOG_FILE="/tmp/vision-monitor.log"
API_KEY="${GLM_API_KEY}"
FEISHU_TOKEN="${FEISHU_TOKEN}"
FEISHU_USER_ID="${FEISHU_USER_ID}"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --target)
            TARGET="$2"
            shift 2
            ;;
        --interval)
            INTERVAL="$2"
            shift 2
            ;;
        --max-photos)
            MAX_PHOTOS="$2"
            shift 2
            ;;
        --output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --help|-h)
            echo "Vision Monitor - AI-powered camera monitoring"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --target TARGET      What to detect (spoon, cup, danger, custom)"
            echo "  --interval SECONDS    Capture interval (default: 5)"
            echo "  --max-photos N       Max photos to keep (default: 10)"
            echo "  --output DIR         Output directory (default: /tmp/camera_monitor)"
            echo "  --help, -h          Show this help"
            echo ""
            echo "Examples:"
            echo "  $0 --target spoon           # Monitor for spoons"
            echo "  $0 --target cup --interval 10  # Check every 10 seconds"
            echo "  --target danger             # Monitor for dangerous activities"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate target
if [[ -z "$TARGET" ]]; then
    echo -e "${RED}Error: --target is required${NC}"
    echo "Use --help for usage information"
    exit 1
fi

# Check API key
if [[ -z "$API_KEY" ]]; then
    echo -e "${YELLOW}Warning: GLM_API_KEY not set. Detection will fail.${NC}"
    echo "Set it with: export GLM_API_KEY=\"your-api-key\""
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Save PID
echo $$ > /tmp/vision-monitor.pid

# Cleanup function
cleanup() {
    echo -e "${GREEN}Stopping Vision Monitor...${NC}"
    rm -f /tmp/vision-monitor.pid
    exit 0
}

trap cleanup SIGINT SIGTERM

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}  Vision Monitor - AI Camera System${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo "Target: $TARGET"
echo "Interval: ${INTERVAL}s"
echo "Max Photos: $MAX_PHOTOS"
echo "Output: $OUTPUT_DIR"
echo ""
echo -e "${YELLOW}Monitoring started. Press Ctrl+C to stop.${NC}"
echo ""

# Main monitoring loop
while true; do
    TIMESTAMP=$(date +%s)
    
    # Capture photo
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Capturing photo..."
    ffmpeg -f avfoundation -framerate 30 -video_size 1280x720 -i "0" \
        -pix_fmt uyvy422 -update 1 -frames:v 1 \
        "$OUTPUT_DIR/camera_$TIMESTAMP.jpg" -y 2>&1 | tail -1
    
    # Keep only latest N photos
    cd "$OUTPUT_DIR"
    ls -t camera_*.jpg 2>/dev/null | tail -n +$((MAX_PHOTOS + 1)) | xargs rm -f 2>/dev/null
    
    # Update latest.jpg
    LATEST=$(ls -t camera_*.jpg 2>/dev/null | head -1)
    if [[ -n "$LATEST" ]]; then
        cp "$LATEST" /tmp/camera_monitor_latest.jpg
    fi
    
    # Analyze image with GLM-4V-Flash
    if [[ -n "$API_KEY" ]]; then
        # Build detection prompt based on target
        case $TARGET in
            spoon)
                PROMPT='如果有人手里拿着勺子，请说"发现勺子"。如果没有人拿勺子，请说"安全"。不需要描述其他内容。'
                ALERT_PATTERN="发现勺子"
                ;;
            cup)
                PROMPT='如果有人手里拿着杯子，请说"发现杯子"。如果没有人拿杯子，请说"安全"。不需要描述其他内容。'
                ALERT_PATTERN="发现杯子"
                ;;
            danger|dangerous)
                PROMPT='请检测是否有人做危险动作，例如爬高、攀爬、站在高处等。如果发现危险动作，请说"危险警报"。如果一切正常，请说"安全"。'
                ALERT_PATTERN="危险"
                ;;
            person)
                PROMPT='请数一下图片中有多少人。说"人数：X"。'
                ALERT_PATTERN="[0-9]+"
                ;;
            *)
                PROMPT="请检测图片中是否有$TARGET。如果发现$TARGET，请说"发现$TARGET"。如果没有，请说"安全"。"
                ALERT_PATTERN="发现$TARGET"
                ;;
        esac
        
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Analyzing for $TARGET..."
        
        # Call GLM-4V-Flash API
        RESPONSE=$(curl -s -X POST "https://open.bigmodel.cn/api/paas/v4/chat/completions" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $API_KEY" \
            -d '{
                "model": "glm-4v-flash",
                "messages": [{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "'"$PROMPT"'"},
                        {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,'$(base64 -i /tmp/camera_monitor_latest.jpg | tr -d '\n')'"}}
                    ]
                }]
            }')
        
        # Extract result
        RESULT=$(echo $RESPONSE | grep -o '"content":"[^"]*"' | sed 's/"content":"//;s/"$//' | sed 's/\\n/\n/g')
        
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Result: $RESULT"
        
        # Check if alert should be triggered
        if echo "$RESULT" | grep -q "$ALERT_PATTERN"; then
            echo -e "${RED}🚨 ALERT: $TARGET detected!${NC}"
            
            # Send Feishu notification
            if [[ -n "$FEISHU_TOKEN" ]] && [[ -n "$FEISHU_USER_ID" ]]; then
                echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sending Feishu notification..."
                curl -s -X POST "https://open.feishu.cn/open-apis/im/v1/messages" \
                    -H "Content-Type: application/json" \
                    -H "Authorization: Bearer $FEISHU_TOKEN" \
                    -d '{
                        "receive_id": "'"$FEISHU_USER_ID"'",
                        "msg_type": "text",
                        "content": "{\"text\":\"🚨 Vision Monitor Alert: '"$TARGET"' detected!\\n'"$RESULT"'\"}"
                    }' 2>/dev/null
            fi
        else
            echo -e "${GREEN}✓ Safe${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ API key not configured, skipping analysis${NC}"
    fi
    
    echo ""
    sleep $INTERVAL
done
