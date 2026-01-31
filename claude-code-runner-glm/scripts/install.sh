#!/bin/bash
# Installation check for Claude Code Runner (GLM)

echo "🔍 Checking Claude Code Runner dependencies..."
echo ""

# Check Claude Code
CLAUDE="/opt/homebrew/bin/claude"
if [ -f "$CLAUDE" ]; then
    VERSION=$($CLAUDE --version 2>&1)
    echo "✅ Claude Code: $VERSION"
else
    echo "❌ Claude Code not found"
    echo "Install: brew install claude-code"
fi

# Check GLM environment variables
echo ""
echo "🔐 GLM-4.7 Configuration:"
if [ -n "$ANTHROPIC_AUTH_TOKEN" ]; then
    echo "✅ ANTHROPIC_AUTH_TOKEN set"
else
    echo "❌ ANTHROPIC_AUTH_TOKEN not set"
    echo "Add to ~/.zshrc:"
    echo '  export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/anthropic"'
    echo '  export ANTHROPIC_AUTH_TOKEN="your-token"'
fi

if [ -n "$ANTHROPIC_BASE_URL" ]; then
    echo "✅ ANTHROPIC_BASE_URL: $ANTHROPIC_BASE_URL"
else
    echo "⚠️  ANTHROPIC_BASE_URL not set (using default)"
fi

echo ""
echo "✅ Installation check complete!"
echo ""
echo "📖 Usage:"
echo "   ./run.sh 'Your prompt'"
echo "   ./run.sh 'Generate code' --model opus"
echo "   ./examples.sh  # View examples"
