# OpenClaw 能力配置

**更新时间**: 2026-02-04

## 画图能力

OpenClaw 可以生成各种类型的图像，包括：
- UI/UX 设计稿
- 图表和可视化
- 产品原型
- 创意插图

**工具位置**: `~/.openclaw/workspace/ui-ux-pro-max/`

**使用方法**:
```python
# 获取 UI/UX 设计建议
python3 ui-ux-pro-max/scripts/search.py "<查询>" --design-system
```

## 监控能力

OpenClaw 可以使用摄像头进行实时监控：
- 目标检测（勺子、杯子、人等）
- 危险动作识别
- 飞书报警

**工具位置**: `~/.openclaw/workspace/vision-monitor/`

**使用方法**:
```bash
cd vision-monitor
./monitor.sh --target "检测目标"
```

## 摄像头能力

OpenClaw 可以使用 Mac 摄像头拍照和录像：
- 拍照：`ffmpeg -f avfoundation -i "0" -frames:v 1 photo.jpg`
- 录像：`ffmpeg -f avfoundation -i "0" -t 5 video.mp4`

**设备**: FaceTime高清相机 (索引 0)

## TTS 语音播报

- **状态**: ✅ 已配置
- **引擎**: Edge TTS
- **语音**: zh-CN-XiaoxiaoNeural
- **自动播放**: ✅ 已启用（通过 tts-autoplay 脚本）

## 其他 Skills

- 🔋 `battery-alert` - 电量监控
- 🤖 `claude-code-runner-glm` - Claude Code + GLM
- 📱 `feishu-integration` - 飞书集成
- 📰 `news-image-reader` - 新闻图片识别
- 🎤 `speech-to-text` - 语音识别
- 🔊 `voice-assistant` - 语音助手
- 🎙️ `webrtc-vad` - 实时语音
- 🤖 `xiaot-3d-interface` - 3D 界面

## 重要提醒

**每天启动后需要确认**:
1. ✅ TTS 自动播放脚本运行中
2. ✅ Gateway 正常运行
3. ✅ SSH 密钥已加载
4. ✅ Workspace 路径正确
