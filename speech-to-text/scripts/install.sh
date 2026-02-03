#!/bin/bash
# Speech-to-Text - Setup and Usage

echo "🎤 Speech-to-Text Setup"
echo "======================"

# Check dependencies
echo ""
echo "1. Checking ffmpeg..."
if command -v ffmpeg &> /dev/null; then
    echo "✅ ffmpeg installed"
else
    echo "❌ ffmpeg not found"
    echo "   macOS: brew install ffmpeg"
    echo "   Linux: sudo apt install ffmpeg"
fi

echo ""
echo "2. Checking Python packages..."
python3 -c "import whisper" 2>/dev/null && echo "✅ Whisper installed" || echo "❌ Whisper not installed"
python3 -c "import sounddevice" 2>/dev/null && echo "✅ sounddevice installed" || echo "❌ sounddevice not installed"

echo ""
echo "3. Checking environment variables..."
if [ -n "$OPENAI_API_KEY" ]; then
    echo "✅ OPENAI_API_KEY set"
else
    echo "⚠️  OPENAI_API_KEY not set (using local Whisper)"
fi

echo ""
echo "📖 Usage:"
echo "--------"
echo "Transcribe file:"
echo "  stt_transcribe_file(audio_path='audio.mp3', language='zh')"
echo ""
echo "Transcribe microphone:"
echo "  stt_transcribe_microphone(duration=5.0, language='zh')"
echo ""
echo "See SKILL.md for full documentation"
