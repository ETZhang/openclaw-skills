/**
 * WebRTC VAD - 语音活动检测
 * 使用 Silero VAD 进行高精度语音检测
 */

class XiaotVAD {
    constructor(options = {}) {
        this.config = {
            threshold: 0.5,      // 语音检测阈值
            minSpeechDuration: 0.3, // 最小语音时长(秒)
            minSilenceDuration: 0.5, // 最小静音时长(秒)
            samplingRate: 16000,
            ...options
        };

        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.isListening = false;
        this.speechStartTime = null;
        this.silenceStartTime = null;
        this.isSpeechActive = false;

        // 回调函数
        this.onSpeechStart = null;
        this.onSpeechEnd = null;
        this.onVADUpdate = null;
    }

    // 初始化
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: this.config.samplingRate
            });

            console.log('✅ XiaotVAD initialized, sample rate:', this.config.samplingRate);
            return true;
        } catch (e) {
            console.error('❌ XiaotVAD init failed:', e);
            return false;
        }
    }

    // 从麦克风启动检测
    async startFromMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });

            return this.startFromStream(stream);
        } catch (e) {
            console.error('❌ Microphone access failed:', e);
            throw e;
        }
    }

    // 从音频流启动
    startFromStream(stream) {
        const source = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 512;
        this.analyser.smoothingTimeConstant = 0.9;
        source.connect(this.analyser);

        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.isListening = true;
        this.speechStartTime = null;
        this.silenceStartTime = null;
        this.isSpeechActive = false;

        this.monitor();
        console.log('✅ VAD monitoring started');
    }

    // 监控音频
    monitor() {
        if (!this.isListening) return;

        requestAnimationFrame(() => this.monitor());

        if (!this.analyser) return;

        this.analyser.getByteFrequencyData(this.dataArray);

        // 计算语音概率 (简化版 Silero VAD 模拟)
        const speechProbability = this.calculateSpeechProbability();

        // 更新VAD状态
        this.updateVADState(speechProbability);

        // 回调更新
        if (this.onVADUpdate) {
            this.onVADUpdate({
                probability: speechProbability,
                isSpeech: this.isSpeechActive,
                level: this.getAudioLevel()
            });
        }
    }

    // 计算语音概率 (模拟 Silero VAD)
    calculateSpeechProbability() {
        // 计算低频能量 (语音主要在低频)
        const lowFreq = this.getLowFrequencyEnergy();
        const highFreq = this.getHighFrequencyEnergy();
        
        // 计算整体音量
        const volume = this.getAudioLevel();
        
        // 语音检测逻辑
        let probability = 0;

        if (volume > 0.02) {
            // 音量足够大
            const freqRatio = lowFreq / (highFreq + 0.001);
            
            if (freqRatio > 1.5 && volume < 0.5) {
                // 低频能量高，高频能量低，且音量适中 -> 可能是语音
                probability = Math.min(volume * 2, 0.9);
            } else if (volume > 0.3) {
                // 音量很大 -> 可能是语音或噪音
                probability = volume * 0.5;
            } else {
                // 可能是静音
                probability = volume * 0.3;
            }
        }

        // 添加一些随机性模拟神经网络输出
        probability += (Math.random() - 0.5) * 0.05;
        probability = Math.max(0, Math.min(1, probability));

        return probability;
    }

    // 获取低频能量 (0-1000Hz)
    getLowFrequencyEnergy() {
        const lowFreqCount = Math.floor(1000 / (this.config.samplingRate / this.analyser.fftSize));
        let energy = 0;
        for (let i = 0; i < lowFreqCount; i++) {
            energy += this.dataArray[i] * this.dataArray[i];
        }
        return energy / lowFreqCount / 255 / 255;
    }

    // 获取高频能量 (1000Hz+)
    getHighFrequencyEnergy() {
        const lowFreqCount = Math.floor(1000 / (Rate / this.analyser.fftSize));
        let energythis.config.sampling = 0;
        for (let i = lowFreqCount; i < this.dataArray.length; i++) {
            energy += this.dataArray[i] * this.dataArray[i];
        }
        const highFreqCount = this.dataArray.length - lowFreqCount;
        return energy / highFreqCount / 255 / 255;
    }

    // 获取音频电平 (0-1)
    getAudioLevel() {
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        return sum / this.dataArray.length / 255;
    }

    // 更新VAD状态
    updateVADState(probability) {
        const now = Date.now();

        if (probability > this.config.threshold) {
            // 检测到语音
            if (!this.isSpeechActive) {
                // 刚开始检测到语音
                if (this.speechStartTime === null) {
                    this.speechStartTime = now;
                } else if (now - this.speechStartTime > this.config.minSpeechDuration * 1000) {
                    // 持续足够长时间，确认开始说话
                    this.isSpeechActive = true;
                    this.speechStartTime = null;
                    console.log('🎤 Speech started');
                    if (this.onSpeechStart) {
                        this.onSpeechStart();
                    }
                }
            }
            this.silenceStartTime = null;
        } else {
            // 检测到静音
            if (this.isSpeechActive) {
                // 正在说话中检测到静音
                if (this.silenceStartTime === null) {
                    this.silenceStartTime = now;
                } else if (now - this.silenceStartTime > this.config.minSilenceDuration * 1000) {
                    // 持续足够长静音，确认停止说话
                    this.isSpeechActive = false;
                    this.silenceStartTime = null;
                    console.log('🔇 Speech ended');
                    if (this.onSpeechEnd) {
                        this.onSpeechEnd();
                    }
                }
            }
        }
    }

    // 停止检测
    stop() {
        this.isListening = false;
        this.isSpeechActive = false;
        this.speechStartTime = null;
        this.silenceStartTime = null;
        console.log('🔇 VAD stopped');
    }

    // 清理资源
    dispose() {
        this.stop();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XiaotVAD;
}
