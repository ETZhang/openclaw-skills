#!/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/bin/python3
"""
News Image Reader - Read text from images and broadcast via TTS
Usage: python3 read_image_news.py <image_path> [--voice VOICE] [--lang LANG]
"""

import os
import sys
import argparse
import subprocess
from pathlib import Path
from PIL import Image
import pytesseract

# Configuration
DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural"
TEMP_AUDIO = "/tmp/news_broadcast.mp3"

def check_dependencies():
    """Check if required tools are installed"""
    print("Checking dependencies...")
    
    # Check tesseract
    result = subprocess.run(["which", "tesseract"], capture_output=True)
    if result.returncode != 0:
        print("❌ tesseract not found. Install with: brew install tesseract")
        return False
    print("✅ tesseract found")
    
    # Check Python packages
    try:
        import pytesseract
        import edge_tts
        print("✅ Python packages found")
    except ImportError as e:
        print(f"❌ Missing Python package: {e}")
        print("Install with: pip3 install pytesseract Pillow edge-tts")
        return False
    
    return True

def extract_text(image_path, lang="chi_sim"):
    """Extract text from image using tesseract OCR, with automatic slicing for long images"""
    print(f"📖 Reading text from: {image_path}")
    
    img = Image.open(image_path)
    width, height = img.size
    print(f"   Image size: {width}x{height}")
    
    # Check if image is too long (over 5000 pixels)
    MAX_HEIGHT = 5000
    all_text = []
    
    if height > MAX_HEIGHT:
        print(f"   📐 Image too tall ({height}px), auto-slicing into segments...")
        num_segments = (height + MAX_HEIGHT - 1) // MAX_HEIGHT
        segment_height = height // num_segments
        
        for i in range(num_segments):
            top = i * segment_height
            bottom = min((i + 1) * segment_height, height)
            
            # Extract segment with overlap
            overlap = 100  # 100px overlap
            if i > 0:
                top = top - overlap
            if bottom < height:
                bottom = bottom + overlap
            
            # Crop segment
            segment = img.crop((0, top, width, bottom))
            segment_path = f"/tmp/segment_{i}.jpg"
            segment.save(segment_path, quality=85)
            
            # OCR on segment
            print(f"   Processing segment {i+1}/{num_segments} (y: {top}-{bottom})...")
            segment_text = pytesseract.image_to_string(segment, lang=lang)
            
            if segment_text.strip():
                all_text.append(segment_text)
                print(f"      ✅ Extracted {len(segment_text)} chars")
            
            # Clean up
            os.remove(segment_path)
        
        text = "\n".join(all_text)
    else:
        # Extract text from full image
        text = pytesseract.image_to_string(img, lang=lang)
    
    if not text.strip():
        print("⚠️ No text found in image")
        return None
    
    print(f"✅ Total extracted {len(text)} characters")
    return text

def clean_text(text):
    """Clean and format extracted text"""
    # Remove extra whitespace
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    return '\n'.join(lines)

def generate_tts(text, voice=DEFAULT_VOICE):
    """Generate TTS audio from text"""
    print(f"🎵 Generating speech with voice: {voice}")
    
    # Limit text length for TTS
    max_chars = 2000
    if len(text) > max_chars:
        text = text[:max_chars] + "... (内容过长，已截断)"
        print(f"   Text truncated to {max_chars} characters")
    
    cmd = [
        "/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/bin/python3",
        "-m", "edge_tts",
        "--text", text,
        "--voice", voice,
        "--write-media", TEMP_AUDIO
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ TTS generation failed: {result.stderr}")
        return False
    
    print(f"✅ Audio saved to: {TEMP_AUDIO}")
    return True

def broadcast_audio():
    """Play the generated audio"""
    print("🔊 Broadcasting audio...")
    
    if not os.path.exists(TEMP_AUDIO):
        print("❌ Audio file not found")
        return False
    
    result = subprocess.run(["afplay", TEMP_AUDIO], capture_output=True)
    if result.returncode != 0:
        print(f"❌ Playback failed: {result.stderr}")
        return False
    
    print("✅ Broadcast complete")
    return True

def main():
    parser = argparse.ArgumentParser(description="Read news from images and broadcast via TTS")
    parser.add_argument("image_path", help="Path to image file")
    parser.add_argument("--voice", default=DEFAULT_VOICE, help="TTS voice (default: zh-CN-XiaoxiaoNeural)")
    parser.add_argument("--lang", default="chi_sim", help="OCR language (default: chi_sim)")
    parser.add_argument("--check", action="store_true", help="Only check dependencies")
    
    args = parser.parse_args()
    
    if args.check:
        check_dependencies()
        return
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check image exists
    if not os.path.exists(args.image_path):
        print(f"❌ Image not found: {args.image_path}")
        sys.exit(1)
    
    # Extract text
    raw_text = extract_text(args.image_path, args.lang)
    if not raw_text:
        sys.exit(1)
    
    # Clean text
    text = clean_text(raw_text)
    print(f"\n📄 Extracted text preview:\n{text[:200]}...\n")
    
    # Generate TTS
    if not generate_tts(text, args.voice):
        sys.exit(1)
    
    # Broadcast
    broadcast_audio()

if __name__ == "__main__":
    main()
