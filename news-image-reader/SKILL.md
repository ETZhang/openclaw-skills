---
name: news-image-reader
description: Read news from images using OCR and broadcast via TTS. Use when user sends news screenshots or images with text that needs to be read aloud. Requires: tesseract (OCR) and edge-tts (TTS).
---

# News Image Reader

Read text from images (news screenshots, articles) and broadcast via TTS.

## Quick Usage

```bash
# Read image and broadcast
{baseDir}/scripts/read_image_news.sh <image_path>

# Or run directly
python3 {baseDir}/scripts/read_image_news.py <image_path>
```

## Installation

The skill automatically checks for dependencies on first run:

1. **tesseract** (OCR)
   ```bash
   brew install tesseract
   brew install tesseract-lang  # Chinese language support
   ```

2. **Python dependencies**
   ```bash
   pip3 install pytesseract Pillow edge-tts
   ```

3. **Python path** (for macOS with multiple Python versions)
   ```bash
   # Use Python 3.9 from CommandLineTools
   /Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/bin/python3
   ```

## Features

- **OCR**: Extract text from images using tesseract
- **Language support**: Chinese (chi_sim) and English (eng)
- **TTS**: Broadcast via edge-tts with natural voice
- **Auto-install**: Checks and installs missing dependencies

## Workflow

1. Receive image from user (via chat or file path)
2. Run OCR to extract text
3. Process and clean text
4. Generate TTS audio
5. Broadcast via system audio

## Examples

**Trigger phrases:**
- "读一下这个新闻"
- "播报这张图片"
- "读取图片内容"

**Command usage:**
```bash
# Read news image
./scripts/read_image_news.sh /path/to/news_screenshot.jpg

# With custom voice
python3 scripts/read_image_news.py image.jpg --voice zh-CN-XiaoxiaoNeural

# English news
python3 scripts/read_image_news.py article.png --lang eng
```

## Dependencies

| Tool | Purpose | Install Command |
|------|---------|-----------------|
| tesseract | OCR engine | `brew install tesseract` |
| tesseract-lang | Language data | `brew install tesseract-lang` |
| pytesseract | Python OCR wrapper | `pip3 install pytesseract Pillow` |
| edge-tts | Text-to-speech | `pip3 install edge-tts` |

## Notes

- Best results with clear, high-resolution images
- Supports Chinese and English text
- Voice: Default zh-CN-XiaoxiaoNeural
- Audio saved to /tmp/ for playback
