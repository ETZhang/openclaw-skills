#!/bin/bash
# Claude Code Runner - GLM-4.7 Version
# Usage: ./run.sh "Your prompt" [--file path] [--model model] [--continue]

# GLM-4.7 Configuration (from environment)
export ANTHROPIC_BASE_URL="${ANTHROPIC_BASE_URL:-https://open.bigmodel.cn/api/anthropic}"

CLAUDE="/opt/homebrew/bin/claude"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Show help
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo -e "${BLUE}🤖 Claude Code Runner (GLM-4.7)${NC}"
    echo "======================================"
    echo ""
    echo "Usage: $0 \"prompt\" [options]"
    echo ""
    echo "Options:"
    echo "  --model <name>   Model (sonnet/opus/haiku)"
    echo "  --file <path>    Include file in context"
    echo "  --continue, -c   Continue previous conversation"
    echo "  --json           JSON output"
    echo "  --help           Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 'Create a Python hello world'"
    echo "  $0 'Review my code' --file app.py"
    echo "  $0 'Debug error' --model opus"
    echo ""
    exit 0
fi

# Check Claude Code installation
if [ ! -f "$CLAUDE" ]; then
    echo -e "${RED}❌ Claude Code not found at $CLAUDE${NC}"
    echo "Install with: brew install claude-code"
    exit 1
fi

# Check GLM configuration
if [ -z "$ANTHROPIC_AUTH_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  ANTHROPIC_AUTH_TOKEN not set${NC}"
    echo "Configure in ~/.zshrc:"
    echo '  export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/anthropic"'
    echo '  export ANTHROPIC_AUTH_TOKEN="your-token"'
    echo ""
    echo "Or set temporary:"
    echo '  export ANTHROPIC_AUTH_TOKEN="your-token" && ./run.sh "..."'
fi

# Parse arguments
PROMPT=""
MODEL=""
OUTPUT_FORMAT=""
FILES=()
CONTINUE=""
JSON=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --model)
            MODEL="$2"
            shift 2
            ;;
        --file|-f)
            FILES+=("--add-dir $(dirname $2)")
            FILES+=("--file $2")
            shift 2
            ;;
        --continue|-c)
            CONTINUE="--continue"
            shift
            ;;
        --json)
            OUTPUT_FORMAT="--output-format json"
            shift
            ;;
        --help|-h)
            $0 --help
            exit 0
            ;;
        -*)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
        *)
            PROMPT="$1"
            shift
            ;;
    esac
done

# Validate prompt
if [ -z "$PROMPT" ]; then
    echo -e "${RED}❌ Please provide a prompt${NC}"
    echo "Usage: $0 \"Your prompt here\""
    exit 1
fi

# Build command
CMD="$CLAUDE --dangerously-skip-permissions --print \"$PROMPT\""
[ -n "$MODEL" ] && CMD="$CMD --model $MODEL"
[ -n "$OUTPUT_FORMAT" ] && CMD="$CMD $OUTPUT_FORMAT"
[ -n "$CONTINUE" ] && CMD="$CMD $CONTINUE"

# Add files
for file in "${FILES[@]}"; do
    CMD="$CMD $file"
done

# Execute
echo -e "${GREEN}🤖 Running Claude Code (GLM-4.7)...${NC}"
echo -e "${YELLOW}Prompt: $PROMPT${NC}"
if [ -n "$MODEL" ]; then
    echo -e "${YELLOW}Model: $MODEL${NC}"
fi
echo ""

eval "$CMD"

echo ""
echo -e "${GREEN}✅ Done!${NC}"
