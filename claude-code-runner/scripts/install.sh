#!/bin/bash
# Install dependencies for claude-code-runner skill

set -e

echo "🤖 Claude Code Runner - Installation Check"
echo "=========================================="
echo ""

# Check Claude Code
CLAUDE_CMD="/opt/homebrew/bin/claude"
if [ -f "$CLAUDE_CMD" ]; then
    VERSION=$($CLAUDE_CMD --version 2>&1)
    echo -e "✅ Claude Code found: $VERSION"
else
    echo -e "${YELLOW}⚠️  Claude Code not found${NC}"
    echo "Install with: brew install claude-code"
    echo ""
    echo "Note: This skill requires Claude Code CLI to work."
    echo "You can download from: https://claude.com/claude-code"
fi

echo ""
echo "✅ Installation check complete!"
echo ""
echo "📖 Usage:"
echo "   ./run.sh 'Your prompt here'"
echo "   ./run.sh 'Generate code' --model opus"
echo "   ./run.sh 'Review file' --file path/to/file.py"
