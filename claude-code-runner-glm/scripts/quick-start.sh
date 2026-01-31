# Claude Code Runner - GLM-4.7

# Dependency check
echo "Checking Claude Code..."
if command -v claude &> /dev/null; then
    echo "✅ Claude Code installed"
else
    echo "❌ Claude Code not found"
    echo "Install: brew install claude-code"
fi

# Check GLM configuration
if [ -n "$ANTHROPIC_AUTH_TOKEN" ]; then
    echo "✅ GLM-4.7 configured"
else
    echo "⚠️  GLM-4.7 token not set"
    echo "Add to ~/.zshrc:"
    echo '  export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/anthropic"'
    echo '  export ANTHROPIC_AUTH_TOKEN="your-token"'
fi

echo ""
echo "Ready to use!"
echo "Example: ./run.sh 'Create a Python script'"
