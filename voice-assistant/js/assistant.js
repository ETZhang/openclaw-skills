/**
 * XiaotVoiceAssistant - 语音助手核心
 * 集成：VAD → STT → OpenClaw → TTS
 */

class XiaotVoiceAssistant {
    constructor(options = {}) {
        this.config = {
            openclawUrl: 'http://localhost:11434',
            openclawSession: 'main',
            vadThreshold: 0.5,
            vadSilenceDuration: 1.0,  // 延长静音时间
            sttLanguage: 'zh-CN',
            ttsVoice: 'Google 普通话（中国大陆）',
            ttsRate: 1.0,
            ttsPitch: 1.0,
            ...options
        };

        // 模块
        this.vad = null;
        this.isListening = false;
        this.isSpeaking = false;
        this.isProcessing = false;
        this.isUserSpeaking = false;  // 标记用户是否在说话

        // 转录
        this.currentTranscript = '';   // 当前完整的转录

        // 回调
        this.onStatusChange = null;
        this.onTranscript = null;
        this.onResponse = null;
        this.onError = null;
        this.onSpeakingStart = null;
        this.onSpeakingEnd = null;
    }

    // 初始化
    async init() {
        try {
            // 初始化VAD
            this.vad = new XiaotVAD({
                threshold: this.config.vadThreshold,
                minSilenceDuration: this.config.vadSilenceDuration
            });

            await this.vad.init();

            // VAD回调
            this.vad.onSpeechStart = () => {
                // 只有不在说话时才认为是用户说话
                if (!this.isSpeaking) {
                    this.isUserSpeaking = true;
                    this.currentTranscript = '';  // 清空转录
                    this.handleSpeechStart();
                }
            };
            this.vad.onSpeechEnd = () => {
                if (!this.isSpeaking) {
                    this.isUserSpeaking = false;
                    this.handleSpeechEnd();
                }
            };
            this.vad.onVADUpdate = (status) => this.handleVADUpdate(status);

            // 初始化语音合成
            this.initTTS();

            // 初始化语音识别
            this.initSTT();

            console.log('✅ XiaotVoiceAssistant initialized');
            return true;
        } catch (e) {
            console.error('❌ Init failed:', e);
            if (this.onError) this.onError(e);
            return false;
        }
    }

    // 初始化TTS
    initTTS() {
        this.synth = window.speechSynthesis;
        this.ttsVoices = [];

        const loadVoices = () => {
            this.ttsVoices = this.synth.getVoices();
            console.log(`🎤 Loaded ${this.ttsVoices.length} TTS voices`);
        };

        loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = loadVoices;
        }
    }

    // 初始化STT
    initSTT() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('⚠️ SpeechRecognition not supported');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.stt = new SpeechRecognition();
        this.stt.continuous = false;  // 不持续识别
        this.stt.interimResults = true;
        this.stt.lang = this.config.sttLanguage;

        this.stt.onresult = (event) => {
            // 只在用户说话时处理
            if (!this.isUserSpeaking || this.isSpeaking) return;

            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                }
            }

            // 如果有最终结果，处理它
            if (final.trim()) {
                console.log('📝 Final transcript:', final);
                this.currentTranscript = final.trim();
                if (this.onTranscript) {
                    this.onTranscript(this.currentTranscript, true);
                }
            }
        };

        this.stt.onerror = (event) => {
            console.error('❌ STT error:', event.error);
            if (event.error === 'not-allowed') {
                if (this.onError) this.onError(new Error('麦克风权限被拒绝'));
            }
            // 出错后重启
            if (this.isListening && this.isUserSpeaking) {
                setTimeout(() => {
                    try { this.stt.start(); } catch(e) {}
                }, 1000);
            }
        };

        this.stt.onend = () => {
            // 如果用户还在说话，继续识别
            if (this.isListening && this.isUserSpeaking) {
                try { this.stt.start(); } catch(e) {}
            }
        };

        console.log('🎤 STT initialized');
    }

    // 开始监听
    async startListening() {
        try {
            // 清空状态
            this.currentTranscript = '';
            this.isUserSpeaking = false;

            await this.vad.startFromMicrophone();
            this.isListening = true;

            // 开始STT
            if (this.stt) {
                try { this.stt.start(); } catch (e) { console.warn('STT start failed:', e); }
            }

            this.updateStatus('listening', '监听中...');
            console.log('🎤 Started listening');
        } catch (e) {
            console.error('❌ Start listening failed:', e);
            this.updateStatus('error', '启动失败');
            if (this.onError) this.onError(e);
        }
    }

    // 停止监听
    stopListening() {
        this.vad.stop();
        this.isListening = false;
        this.isUserSpeaking = false;

        if (this.stt) {
            try { this.stt.stop(); } catch (e) {}
        }

        this.updateStatus('idle', '待机');
        console.log('🔇 Stopped listening');
    }

    // 处理语音开始
    handleSpeechStart() {
        console.log('🎤 User speech started');
        this.updateStatus('speech', '听到你说话了...');
    }

    // 处理语音结束
    async handleSpeechEnd() {
        console.log('🔇 User speech ended');

        // 等待最后的结果
        await new Promise(resolve => setTimeout(resolve, 300));

        const transcript = this.currentTranscript.trim();

        if (transcript) {
            console.log('📝 Using transcript:', transcript);
            await this.processVoiceInput(transcript);
        } else {
            console.log('⚠️ No transcript, continuing...');
            this.updateStatus('listening', '监听中...');
        }
    }

    // 处理语音输入
    async processVoiceInput(transcript) {
        this.isProcessing = true;
        this.currentTranscript = '';  // 清空，防止重复

        // 触发转录回调
        if (this.onTranscript) {
            this.onTranscript(transcript, true);
        }

        // 发送到OpenClaw
        await this.sendToOpenClaw(transcript);
    }

    // 发送到OpenClaw
    async sendToOpenClaw(message) {
        try {
            console.log('📤 Sending to OpenClaw:', message);
            this.updateStatus('processing', '思考中...');

            const response = await fetch(`${this.config.openclawUrl}/api/sessions/${this.config.openclawSession}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            console.log('📥 Received from OpenClaw:', data);

            if (this.onResponse) this.onResponse(data);

            // 语音回复
            if (data.response) await this.speak(data.response);

        } catch (e) {
            console.error('❌ OpenClaw API error:', e);
            // 模拟回复
            const mockResponse = `收到："${message}"`;
            if (this.onResponse) this.onResponse({ response: mockResponse });
            await this.speak(mockResponse);
        } finally {
            this.isProcessing = false;
        }
    }

    // 语音合成
    async speak(text) {
        if (this.isSpeaking) this.synth.cancel();

        this.isSpeaking = true;
        this.updateStatus('speaking', '说话中...');

        if (this.onSpeakingStart) this.onSpeakingStart();

        // 说话时停止STT和VAD，防止回声识别
        if (this.stt) {
            try { this.stt.stop(); } catch (e) {}
        }

        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = this.config.ttsRate;
            utterance.pitch = this.config.ttsPitch;

            const voice = this.ttsVoices.find(v => 
                v.name.includes('Google 普通话') || 
                v.name.includes('Microsoft') ||
                v.lang.includes('zh')
            );
            if (voice) utterance.voice = voice;

            utterance.onend = () => {
                this.isSpeaking = false;
                this.updateStatus('listening', '监听中...');
                if (this.onSpeakingEnd) this.onSpeakingEnd();

                // 说话结束后恢复监听
                if (this.isListening) {
                    setTimeout(() => {
                        if (this.stt && !this.isUserSpeaking) {
                            try { this.stt.start(); } catch (e) {}
                        }
                    }, 500);
                }
                resolve();
            };

            utterance.onerror = (e) => {
                console.error('❌ TTS error:', e);
                this.isSpeaking = false;
                resolve();
            };

            this.synth.speak(utterance);
        });
    }

    // 处理VAD更新
    handleVADUpdate(status) {}

    // 更新状态
    updateStatus(state, message) {
        if (this.onStatusChange) this.onStatusChange(state, message);
    }

    // 打断说话
    interrupt() {
        this.synth.cancel();
        this.isSpeaking = false;
        console.log('🛑 Interrupted');
    }

    // 清理
    dispose() {
        this.stopListening();
        this.interrupt();
        if (this.vad) this.vad.dispose();
        console.log('🧹 XiaotVoiceAssistant disposed');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = XiaotVoiceAssistant;
}
