#!/bin/bash
# Feishu Integration - Setup Script

echo "🚀 Feishu Integration Setup"
echo "============================"

# Check if credentials are set
if [ -z "$FEISHU_APP_ID" ] || [ -z "$FEISHU_APP_SECRET" ]; then
    echo "⚠️  Credentials not found in environment variables!"
    echo ""
    echo "Please set them before using:"
    echo ""
    echo "  export FEISHU_APP_ID=\"your_app_id\""
    echo "  export FEISHU_APP_SECRET=\"your_app_secret\""
    echo ""
    echo "Or create a .env file in this directory:"
    echo ""
    echo "  FEISHU_APP_ID=your_app_id"
    echo "  FEISHU_APP_SECRET=your_app_secret"
    echo ""
    echo "⚠️  IMPORTANT: Add .env to .gitignore before committing!"
else
    echo "✅ Credentials detected"
    echo "   App ID: ${FEISHU_APP_ID:0:10}..."
fi

# Verify .gitignore exists
if [ -f ".gitignore" ]; then
    echo "✅ .gitignore exists"
else
    echo "⚠️  .gitignore not found - please create one!"
fi

echo ""
echo "📚 Next steps:"
echo "1. Read SKILL.md for full documentation"
echo "2. Configure your Feishu app at https://open.feishu.cn/"
echo "3. Enable required permissions"
echo "4. Start using OpenClaw feishu tools!"
echo ""
echo "🔗 Useful links:"
echo "   - Docs: https://open.feishu.cn/document/"
echo "   - API Ref: https://open.feishu.cn/document/server-docs/docs/docx/intro"
