/**
 * WebRTC - 实时双向语音通信
 * 用于小T实时对话
 */

class XiaotWebRTC {
    constructor(options = {}) {
        this.config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ],
            ...options
        };

        this.peerConnection = null;
        this.dataChannel = null;
        this.audioTrack = null;
        this.isConnected = false;
        this.isInitiator = false;

        // 回调
        this.onConnectionStateChange = null;
        this.onDataChannelMessage = null;
        this.onRemoteStream = null;
        this.onIceCandidate = null;
    }

    // 创建Offer (发起方)
    async createOffer() {
        try {
            this.peerConnection = new RTCPeerConnection({
                iceServers: this.config.iceServers
            });

            this.setupPeerConnection();

            // 创建数据通道
            this.dataChannel = this.peerConnection.createDataChannel('chat', {
                ordered: true
            });
            this.setupDataChannel();

            // 添加本地音频轨道
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: false
            });

            this.audioTrack = stream.getAudioTracks()[0];
            this.peerConnection.addTrack(this.audioTrack, stream);

            // 创建Offer
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            this.isInitiator = true;
            console.log('✅ WebRTC Offer created');

            return {
                type: 'offer',
                sdp: offer.sdp,
                iceCandidates: await this.gatherIceCandidates()
            };
        } catch (e) {
            console.error('❌ Create offer failed:', e);
            throw e;
        }
    }

    // 创建Answer (接收方)
    async createAnswer(offer) {
        try {
            this.peerConnection = new RTCPeerConnection({
                iceServers: this.config.iceServers
            });

            this.setupPeerConnection();

            // 设置远程Offer
            await this.peerConnection.setRemoteDescription({
                type: 'offer',
                sdp: offer.sdp
            });

            // 监听数据通道
            this.peerConnection.ondatachannel = (event) => {
                this.dataChannel = event.channel;
                this.setupDataChannel();
            };

            // 添加本地音频轨道
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: false
            });

            this.audioTrack = stream.getAudioTracks()[0];
            this.peerConnection.addTrack(this.audioTrack, stream);

            // 创建Answer
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            console.log('✅ WebRTC Answer created');

            return {
                type: 'answer',
                sdp: answer.sdp,
                iceCandidates: await this.gatherIceCandidates()
            };
        } catch (e) {
            console.error('❌ Create answer failed:', e);
            throw e;
        }
    }

    // 处理Answer (发起方收到Answer后)
    async handleAnswer(answer) {
        try {
            await this.peerConnection.setRemoteDescription({
                type: 'answer',
                sdp: answer.sdp
            });
            console.log('✅ WebRTC Answer applied');
        } catch (e) {
            console.error('❌ Apply answer failed:', e);
            throw e;
        }
    }

    // 添加ICE候选
    async addIceCandidate(candidate) {
        if (candidate) {
            try {
                await this.peerConnection.addIceCandidate({
                    candidate: candidate.candidate,
                    sdpMid: candidate.sdpMid,
                    sdpMLineIndex: candidate.sdpMLineIndex
                });
            } catch (e) {
                console.error('❌ Add ICE candidate failed:', e);
            }
        }
    }

    // 设置PeerConnection
    setupPeerConnection() {
        // ICE候选收集
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.onIceCandidate) {
                this.onIceCandidate(event.candidate);
            }
        };

        // 连接状态变化
        this.peerConnection.onconnectionstatechange = () => {
            this.isConnected = this.peerConnection.connectionState === 'connected';
            console.log('🔗 Connection state:', this.peerConnection.connectionState);
            
            if (this.onConnectionStateChange) {
                this.onConnectionStateChange(this.peerConnection.connectionState);
            }
        };

        // 收到远程轨道
        this.peerConnection.ontrack = (event) => {
            console.log('📥 Remote track received');
            if (this.onRemoteStream) {
                this.onRemoteStream(event.streams[0]);
            }

            // 播放远程音频
            const audio = new Audio();
            audio.srcObject = event.streams[0];
            audio.play().catch(e => console.error('❌ Play remote audio failed:', e));
        };
    }

    // 设置数据通道
    setupDataChannel() {
        this.dataChannel.onopen = () => {
            console.log('💬 Data channel opened');
        };

        this.dataChannel.onclose = () => {
            console.log('💬 Data channel closed');
        };

        this.dataChannel.onmessage = (event) => {
            console.log('💬 Received:', event.data);
            if (this.onDataChannelMessage) {
                this.onDataChannelMessage(JSON.parse(event.data));
            }
        };

        this.dataChannel.onerror = (error) => {
            console.error('❌ Data channel error:', error);
        };
    }

    // 收集ICE候选
    async gatherIceCandidates() {
        return new Promise((resolve) => {
            const candidates = [];
            
            const checkComplete = () => {
                if (candidates.length > 0 || this.peerConnection.iceGatheringState === 'complete') {
                    resolve(candidates);
                }
            };

            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    candidates.push({
                        candidate: event.candidate.candidate,
                        sdpMid: event.candidate.sdpMid,
                        sdpMLineIndex: event.candidate.sdpMLineIndex
                    });
                }
            };

            this.peerConnection.onicegatheringstatechange = () => {
                if (this.peerConnection.iceGatheringState === 'complete') {
                    checkComplete();
                }
            };

            // 超时保护
            setTimeout(checkComplete, 2000);
        });
    }

    // 发送消息
    send(message) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(message));
            console.log('💬 Sent:', message);
        } else {
            console.warn('⚠️ Data channel not ready');
        }
    }

    // 发送文本消息
    sendText(text) {
        this.send({
            type: 'text',
            content: text,
            timestamp: Date.now()
        });
    }

    // 发送语音数据
    sendAudioData(data) {
        this.send({
            type: 'audio',
            data: data,
            timestamp: Date.now()
        });
    }

    // 开启/关闭本地音频
    toggleLocalAudio(enabled) {
        if (this.audioTrack) {
            this.audioTrack.enabled = enabled;
            console.log(`🔊 Local audio ${enabled ? 'enabled' : 'disabled'}`);
        }
    }

    // 断开连接
    disconnect() {
        if (this.audioTrack) {
            this.audioTrack.stop();
            this.audioTrack = null;
        }

        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }

        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        this.isConnected = false;
        this.isInitiator = false;
        console.log('🔇 WebRTC disconnected');
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XiaotWebRTC;
}
