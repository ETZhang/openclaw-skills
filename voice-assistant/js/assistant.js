/**
 * XiaotVoiceAssistant - 语音助手核心
 * 集成：VAD → STT → OpenClaw → TTS
 */

class XiaotVoiceAssistant {
    constructor(options = {}) {
        this.config = {
            backendUrl: 'http://127.0.0.1:18790',  // 小T后端服务器地址
            openclawSession: 'main',
            vadThreshold: 0.5,
            vadSilenceDuration: 0.8,
            sttLanguage: 'zh-CN',
            ttsVoice: 'Google 普通话（中国大陆）',
            ttsRate: 1.0,
            ttsPitch: 1.0,
            useMockResponse: false,  // 默认使用真实 OpenClaw
            ...options
        };

        // 模块
        this.vad = null;
        this.stt = null;
        this.synth = null;
        this.ttsVoices = [];

        // 状态
        this.isListening = false;
        this.isSpeaking = false;
        this.isProcessing = false;

        // 转录
        this.finalTranscript = '';
        this.isUserSpeaking = false;
        this.sttActive = false;

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
                if (!this.isSpeaking) {
                    this.isUserSpeaking = true;
                    this.finalTranscript = '';
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

            // 初始化TTS
            this.initTTS();

            // 初始化STT
            this.initSTT();

            console.log('✅ XiaotVoiceAssistant initialized');
            console.log('📝 Use mock responses:', this.config.useMockResponse);
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
            console.log(`🎤 TTS voices loaded: ${this.ttsVoices.length}`);
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
        this.stt.continuous = true;
        this.stt.interimResults = true;
        this.stt.lang = this.config.sttLanguage;

        this.stt.onresult = (event) => {
            if (this.isSpeaking) return;

            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const text = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += text;
                } else {
                    interim += text;
                }
            }

            if (final.trim()) {
                this.finalTranscript = final.trim();
                if (this.onTranscript) {
                    this.onTranscript(this.finalTranscript, true);
                }
            }
        };

        this.stt.onerror = (event) => {
            console.error('❌ STT error:', event.error);
            this.sttActive = false;
            
            // 自动重启
            if (event.error !== 'not-allowed' && this.isListening && !this.isSpeaking) {
                setTimeout(() => this.restartSTT(), 1000);
            }
        };

        this.stt.onend = () => {
            this.sttActive = false;
            // 自动重启
            if (this.isListening && !this.isSpeaking && this.isUserSpeaking) {
                setTimeout(() => this.restartSTT(), 100);
            }
        };

        console.log('🎤 STT initialized');
    }

    // 重启STT
    restartSTT() {
        if (!this.stt || !this.isListening || this.isSpeaking) return;
        
        try {
            if (this.sttActive) return;
            this.stt.start();
            this.sttActive = true;
            console.log('🔄 STT restarted');
        } catch (e) {
            console.warn('STT restart failed:', e);
        }
    }

    // 开始监听
    async startListening() {
        try {
            // 重置状态
            this.finalTranscript = '';
            this.isUserSpeaking = false;
            this.sttActive = false;

            await this.vad.startFromMicrophone();
            this.isListening = true;

            // 启动STT
            this.startSTT();

            this.updateStatus('listening', '监听中...');
            console.log('🎤 Started listening');
        } catch (e) {
            console.error('❌ Start listening failed:', e);
            this.updateStatus('error', '启动失败');
            if (this.onError) this.onError(e);
        }
    }

    // 启动STT
    startSTT() {
        if (this.stt && !this.sttActive && !this.isSpeaking) {
            try {
                this.stt.start();
                this.sttActive = true;
            } catch (e) {
                console.warn('STT start failed:', e);
            }
        }
    }

    // 停止监听
    stopListening() {
        this.vad.stop();
        this.isListening = false;
        this.isUserSpeaking = false;

        if (this.stt) {
            try {
                this.stt.stop();
            } catch (e) {}
            this.sttActive = false;
        }

        this.updateStatus('idle', '待机');
        console.log('🔇 Stopped listening');
    }

    // 处理语音开始
    handleSpeechStart() {
        console.log('🎤 Speech started');
        this.updateStatus('speech', '听到你说话了...');
    }

    // 处理语音结束
    async handleSpeechEnd() {
        console.log('🔇 Speech ended');

        // 等待最后结果
        await new Promise(resolve => setTimeout(resolve, 200));

        const transcript = this.finalTranscript.trim();

        if (transcript) {
            console.log('📝 Transcript:', transcript);
            this.finalTranscript = '';  // 清空
            await this.processVoiceInput(transcript);
        } else {
            console.log('⚠️ No transcript');
            this.updateStatus('listening', '监听中...');
            // 重启STT继续监听
            setTimeout(() => this.startSTT(), 300);
        }
    }

    // 处理语音输入
    async processVoiceInput(transcript) {
        this.isProcessing = true;

        if (this.onTranscript) {
            this.onTranscript(transcript, true);
        }

        // 发送到OpenClaw或使用模拟回复
        await this.sendToOpenClaw(transcript);
    }

    // 发送到小T后端服务器 (通过 HTTP，避免与 OpenClaw WebSocket 冲突)
    async sendToOpenClaw(message) {
        try {
            console.log('📤 发送到小T后端:', message);
            this.updateStatus('processing', '思考中...');

            // 使用小T后端服务器 HTTP API
            const response = await fetch(`${this.config.backendUrl}/agent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    agent: this.config.openclawSession
                }),
                signal: AbortSignal.timeout(30000) // 30秒超时
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            console.log('📥 从后端收到响应:', data);

            // 后端返回格式: { response: "...", fromMock: false }
            let responseText = data.response || '';

            if (this.onResponse) {
                this.onResponse({ response: responseText, fromMock: data.fromMock || false });
            }

            if (responseText) await this.speak(responseText);

        } catch (e) {
            console.warn('⚠️ 后端服务调用失败，使用模拟回复:', e.message);

            // 使用模拟回复
            const mockResponses = [
                `好的，我听到了"${message}"`,
                `"${message}"...让我想想`,
                `关于"${message}"，我记下来了`,
                `收到！"${message}"`,
                `"${message}" - 这是个有意思的话题`
            ];
            const mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

            if (this.onResponse) {
                this.onResponse({ response: mockResponse, fromMock: true });
            }
            await this.speak(mockResponse);
        } finally {
            this.isProcessing = false;
        }
    }

    // 语音合成
    async speak(text) {
        if (this.synth.speaking) {
            this.synth.cancel();
        }

        this.isSpeaking = true;
        this.updateStatus('speaking', '说话中...');

        if (this.onSpeakingStart) this.onSpeakingStart();

        // 说话时停止STT
        if (this.stt && this.sttActive) {
            try { this.stt.stop(); } catch (e) {}
            this.sttActive = false;
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

                // 说话结束后恢复STT
                if (this.isListening) {
                    setTimeout(() => this.startSTT(), 500);
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
