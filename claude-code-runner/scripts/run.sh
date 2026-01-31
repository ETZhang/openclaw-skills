#!/bin/bash
# Claude Code Runner - Execute Claude Code CLI
# Usage: ./run.sh <prompt> [options]

set -e

# Configuration
CLAUDE_CMD="/opt/homebrew/bin/claude"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Claude Code is installed
if [ ! -f "$CLAUDE_CMD" ]; then
    echo -e "${RED}❌ Claude Code not found at $CLAUDE_CMD${NC}"
    echo "Install with: brew install claude-code"
    exit 1
fi

# Usage function
usage() {
    echo -e "${BLUE}Claude Code Runner${NC}"
    echo "======================"
    echo ""
    echo "Usage: $0 <prompt> [options]"
    echo ""
    echo "Options:"
    echo "  --model <name>     Use specific model (sonnet, opus, haiku)"
    echo "  --json             Output in JSON format"
    echo "  --file <path>     Include file in context"
    echo "  --dir <path>      Allow directory access"
    echo "  --continue        Continue previous conversation"
    echo "  --system <prompt> Custom system prompt"
    echo "  --help            Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 'Create a Python hello world'"
    echo "  $0 'Review my code' --file app.py"
    echo "  $0 'Debug this error' --model opus"
    echo "  $0 'List files' --json"
}

# Parse arguments
PROMPT=""
MODEL=""
OUTPUT_FORMAT=""
FILES=()
DIRS=""
CONTINUE=""
SYSTEM_PROMPT=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --model)
            MODEL="$2"
            shift 2
            ;;
        --json)
            OUTPUT_FORMAT="--output-format json"
            shift
            ;;
        --file)
            FILES+=("--add-dir $(dirname $2)")
            FILES+=("--file $2")
            shift 2
            ;;
        --dir)
            DIRS="$DIRS --add-dir $2"
            shift 2
            ;;
        --continue)
            CONTINUE="--continue"
            shift
            ;;
        --system)
            SYSTEM_PROMPT="--system-prompt $2"
            shift 2
            ;;
        --help)
            usage
            exit 0
            ;;
        -*)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
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
    usage
    exit 1
fi

# Build command - put --print first
CMD="$CLAUDE_CMD --print \"$PROMPT\""
[ -n "$MODEL" ] && CMD="$CMD --model $MODEL"
[ -n "$OUTPUT_FORMAT" ] && CMD="$CMD $OUTPUT_FORMAT"
[ -n "$CONTINUE" ] && CMD="$CMD $CONTINUE"
[ -n "$SYSTEM_PROMPT" ] && CMD="$CMD $SYSTEM_PROMPT"
[ -n "$DIRS" ] && CMD="$CMD $DIRS"

# Add files
for file in "${FILES[@]}"; do
    CMD="$CMD $file"
done

echo -e "${GREEN}🤖 Running Claude Code...${NC}"
echo -e "${YELLOW}Prompt: $PROMPT${NC}"
if [ -n "$MODEL" ]; then
    echo -e "${YELLOW}Model: $MODEL${NC}"
fi
echo ""

# Execute
eval "$CMD"

echo ""
echo -e "${GREEN}✅ Done!${NC}"
