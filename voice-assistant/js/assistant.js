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
            vadSilenceDuration: 0.8,
            sttLanguage: 'zh-CN',
            ttsVoice: 'Google 普通话（中国大陆）',
            ttsRate: 1.0,
            ttsPitch: 1.0,
            autoListen: true,
            ...options
        };

        // 模块
        this.vad = null;
        this.isListening = false;
        this.isSpeaking = false;
        this.isProcessing = false;

        // 状态
        this.conversationHistory = [];
        this.lastSpeechTime = null;
        this.finalTranscript = '';  // 保存最终转录
        this.interimTranscript = ''; // 保存临时转录

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
            this.vad.onSpeechStart = () => this.handleSpeechStart();
            this.vad.onSpeechEnd = () => this.handleSpeechEnd();
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
        this.stt.continuous = true;  // 持续识别
        this.stt.interimResults = true;
        this.stt.lang = this.config.sttLanguage;

        this.stt.onresult = (event) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += transcript;
                } else {
                    interim += transcript;
                }
            }

            // 保存转录结果
            if (final) {
                this.finalTranscript += final;
                console.log('📝 Final:', final);
            }
            if (interim) {
                this.interimTranscript = interim;
                console.log('📝 Interim:', interim);
            }

            if (this.onTranscript) {
                this.onTranscript(this.finalTranscript || interim, !!final);
            }
        };

        this.stt.onerror = (event) => {
            console.error('❌ STT error:', event.error);
            if (event.error === 'not-allowed') {
                if (this.onError) this.onError(new Error('麦克风权限被拒绝'));
            }
        };

        this.stt.onend = () => {
            console.log('🔇 STT ended');
            if (this.isListening && !this.isProcessing) {
                try {
                    this.stt.start();
                } catch (e) {
                    console.warn('STT restart failed:', e);
                }
            }
        };

        console.log('🎤 STT initialized');
    }

    // 开始监听
    async startListening() {
        try {
            // 清空转录结果
            this.finalTranscript = '';
            this.interimTranscript = '';

            await this.vad.startFromMicrophone();
            this.isListening = true;

            // 开始STT
            if (this.stt) {
                try {
                    this.stt.start();
                } catch (e) {
                    console.warn('STT start failed:', e);
                }
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

        if (this.stt) {
            try {
                this.stt.stop();
            } catch (e) {
                console.warn('STT stop failed:', e);
            }
        }

        this.updateStatus('idle', '待机');
        console.log('🔇 Stopped listening');
    }

    // 处理语音开始
    handleSpeechStart() {
        console.log('🎤 Speech started');
        this.updateStatus('speech', '听到你说话了...');
        this.lastSpeechTime = Date.now();
    }

    // 处理语音结束
    async handleSpeechEnd() {
        console.log('🔇 Speech ended');
        
        // 等待一小会儿获取最终转录
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 使用转录结果
        const transcript = (this.finalTranscript || this.interimTranscript).trim();
        
        if (transcript) {
            console.log('📝 Using transcript:', transcript);
            this.processVoiceInput(transcript);
        } else {
            // 没有检测到有效语音，继续监听
            console.log('⚠️ No transcript, continuing...');
            this.interimTranscript = '';
            this.finalTranscript = '';
            this.updateStatus('listening', '监听中...');
        }
    }

    // 处理语音输入
    async processVoiceInput(transcript) {
        this.isProcessing = true;
        
        // 触发转录回调
        if (this.onTranscript) {
            this.onTranscript(transcript, true);
        }

        // 清空，为下一次识别做准备
        this.interimTranscript = '';
        this.finalTranscript = '';

        // 发送到OpenClaw
        await this.sendToOpenClaw(transcript);
    }

    // 发送到OpenClaw
    async sendToOpenClaw(message) {
        try {
            console.log('📤 Sending to OpenClaw:', message);
            this.updateStatus('processing', '思考中...');

            // 发送到OpenClaw消息API
            const response = await fetch(`${this.config.openclawUrl}/api/sessions/${this.config.openclawSession}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('📥 Received from OpenClaw:', data);

            if (this.onResponse) {
                this.onResponse(data);
            }

            // 语音回复
            if (data.response) {
                await this.speak(data.response);
            }

        } catch (e) {
            console.error('❌ OpenClaw API error:', e);
            
            // 模拟回复（开发用）
            const mockResponse = await this.getMockResponse(message);
            if (this.onResponse) {
                this.onResponse({ response: mockResponse });
            }
            await this.speak(mockResponse);
        } finally {
            this.isProcessing = false;
        }
    }

    // 模拟回复（开发/测试用）
    async getMockResponse(message) {
        const responses = [
            `我听到了："${message}"`,
            `好的，让我帮你查一下"${message}"`,
            `"${message}"...这个很有意思！`,
            `收到，我已经记住了"${message}"`,
            `关于"${message}"，我的看法是...`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // 语音合成
    async speak(text) {
        if (this.isSpeaking) {
            this.synth.cancel();
        }

        this.isSpeaking = true;
        this.updateStatus('speaking', '说话中...');

        if (this.onSpeakingStart) {
            this.onSpeakingStart();
        }

        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = this.config.ttsRate;
            utterance.pitch = this.config.ttsPitch;

            // 选择语音
            const voice = this.ttsVoices.find(v => 
                v.name.includes('Google 普通话') || 
                v.name.includes('Microsoft') ||
                v.lang.includes('zh')
            );
            if (voice) {
                utterance.voice = voice;
            }

            utterance.onend = () => {
                this.isSpeaking = false;
                this.updateStatus('listening', '监听中...');
                
                if (this.onSpeakingEnd) {
                    this.onSpeakingEnd();
                }

                // 继续监听
                if (this.isListening) {
                    setTimeout(() => {
                        if (this.stt && this.isListening) {
                            try {
                                this.stt.start();
                            } catch (e) {}
                        }
                    }, 300);
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
    handleVADUpdate(status) {
        // 可以在UI中显示音量级别
    }

    // 更新状态
    updateStatus(state, message) {
        if (this.onStatusChange) {
            this.onStatusChange(state, message);
        }
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
        if (this.vad) {
            this.vad.dispose();
        }
        console.log('🧹 XiaotVoiceAssistant disposed');
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XiaotVoiceAssistant;
}
