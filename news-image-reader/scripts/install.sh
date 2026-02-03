#!/bin/bash
# Install dependencies for News Image Reader Skill

set -e

echo "📦 News Image Reader - Dependency Installation"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install Homebrew if not present
if ! command_exists brew; then
    echo -e "${YELLOW}⚠️  Homebrew not found. Installing...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew found"
fi

# Install tesseract
if command_exists tesseract; then
    echo "✅ tesseract already installed"
else
    echo -e "${YELLOW}📦 Installing tesseract...${NC}"
    brew install tesseract
    echo "✅ tesseract installed"
fi

# Install tesseract language data
if command_exists tesseract && brew list tesseract-lang &>/dev/null; then
    echo "✅ tesseract-lang already installed"
else
    echo -e "${YELLOW}📦 Installing tesseract-lang (Chinese support)...${NC}"
    brew install tesseract-lang
    echo "✅ tesseract-lang installed"
fi

# Install Python packages
echo ""
echo -e "${YELLOW}📦 Installing Python packages...${NC}"

# Check Python version
PYTHON_CMD=""
for py in python3.11 python3.10 python3.9 python3; do
    if command_exists $py; then
        PYTHON_CMD=$py
        break
    fi
done

if [ -z "$PYTHON_CMD" ]; then
    echo -e "${RED}❌ Python not found${NC}"
    exit 1
fi

echo "Using Python: $PYTHON_CMD"

# Install pip if needed
if ! $PYTHON_CMD -m pip --version &>/dev/null; then
    echo -e "${YELLOW}📦 Installing pip...${NC}"
    curl https://bootstrap.pypa.io/get-pip.py -o /tmp/get-pip.py
    $PYTHON_CMD /tmp/get-pip.py
    rm /tmp/get-pip.py
fi

# Install required packages
PACKAGES=("pytesseract" "Pillow" "edge-tts")
for pkg in "${PACKAGES[@]}"; do
    if $PYTHON_CMD -c "import ${pkg//-/_}" 2>/dev/null; then
        echo "✅ $pkg already installed"
    else
        echo -e "${YELLOW}📦 Installing $pkg...${NC}"
        $PYTHON_CMD -m pip install $pkg
        echo "✅ $pkg installed"
    fi
done

echo ""
echo "✅ All dependencies installed successfully!"
echo ""
echo "📖 Usage:"
echo "   python3 scripts/read_image_news.py <image_path>"
echo "   ./scripts/read_image_news.sh <image_path>"
echo ""
