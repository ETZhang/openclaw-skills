/**
 * 钉钉机器人 SDK
 * 支持：消息接收、发送、回调验证、LLM集成
 */

class DingTalkRobot {
    constructor(options = {}) {
        this.config = {
            webhook: '',              // 机器人 Webhook URL
            keyword: '',              // 安全设置：关键词
            secret: '',               // 安全设置：加签密钥
            sessionTimeout: 30000,    // 会话超时(ms)
            autoReply: true,          // 自动回复
            llmEndpoint: '',          // LLM API 地址
            llmSession: 'main',       // LLM 会话ID
            ...options
        };

        this.requestCache = new Map();  // 用于回调签名验证
        this.sessionHistory = new Map(); // 会话历史
        this.isRunning = false;

        // 回调
        this.onMessage = null;      // 收到消息 (message, callback)
        this.onTextMessage = null;  // 文本消息
        this.onImageMessage = null; // 图片消息
        this.onError = null;        // 错误
        this.onResponse = null;     // 发送回复后
    }

    // 初始化
    init() {
        if (!this.config.webhook) {
            throw new Error('缺少 Webhook URL');
        }

        console.log('✅ DingTalk Robot initialized');
        console.log(`   Webhook: ${this.config.webhook.substring(0, 50)}...`);
        
        return this;
    }

    // 验证回调签名 (加签模式)
    verifySignature(timestamp, sign, body) {
        if (!this.config.secret) return true;

        const crypto = require('crypto');
        const stringToSign = `${timestamp}\n${this.config.secret}`;
        const hmac = crypto.createHmac('sha256', this.config.secret);
        hmac.update(stringToSign);
        const calculatedSign = hmac.digest('base64');

        return sign === calculatedSign;
    }

    // 处理回调请求
    handleCallback(request) {
        const { headers, body, query } = request;
        
        // 验证签名 (如果有)
        const timestamp = headers['x-dingtalk-signature-timestamp'] || 
                          headers['timestamp'];
        const sign = headers['x-dingtalk-signature'] || 
                     headers['sign'];

        if (timestamp && sign && !this.verifySignature(timestamp, sign, body)) {
            throw new Error('签名验证失败');
        }

        // 解析消息体
        let data;
        try {
            data = typeof body === 'string' ? JSON.parse(body) : body;
        } catch (e) {
            throw new Error('无效的 JSON');
        }

        // 钉钉消息格式
        const message = {
            msgUid: data.msgUid,
            conversationId: data.conversationId,
            senderId: data.senderId,
            senderNick: data.senderNick,
            type: data.msgType,
            content: data.content || data,
            raw: data,
            timestamp: Date.now(),
            // 回复函数
            reply: (text, type = 'text') => this.send(text, type, data.conversationId)
        };

        // 消息类型分发
        switch (data.msgType) {
            case 'text':
                message.text = data.content.text.trim();
                if (this.onTextMessage) {
                    this.onTextMessage(message);
                }
                break;
                
            case 'image':
                message.image = data.content.image;
                if (this.onImageMessage) {
                    this.onImageMessage(message);
                }
                break;
                
            case 'markdown':
                message.markdown = data.content.markdown;
                break;
                
            case 'link':
                message.link = {
                    title: data.content.title,
                    text: data.content.text,
                    picUrl: data.content.picUrl,
                    messageUrl: data.content.messageUrl
                };
                break;
                
            default:
                console.log(`📨 Unknown message type: ${data.msgType}`);
        }

        // 通用消息回调
        if (this.onMessage) {
            this.onMessage(message);
        }

        // 自动回复
        if (this.config.autoReply && message.text) {
            this.autoReply(message);
        }

        return { errcode: 0, errmsg: 'ok' };
    }

    // 自动回复
    async autoReply(message) {
        try {
            // 获取或创建会话历史
            const history = this.getHistory(message.conversationId);
            
            // 构建提示
            const prompt = this.buildPrompt(message.text, history);
            
            // 调用 LLM
            let responseText = '';
            if (this.config.llmEndpoint) {
                responseText = await this.callLLM(prompt);
            } else {
                responseText = this.getDefaultResponse(message.text);
            }

            // 发送回复
            await message.reply(responseText);

            // 添加到历史
            this.addToHistory(message.conversationId, message.text, responseText);

            console.log(`💬 ${message.senderNick}: ${message.text}`);
            console.log(`🤖 小T: ${responseText}`);

        } catch (e) {
            console.error('❌ Auto reply failed:', e);
            if (this.onError) this.onError(e);
        }
    }

    // 获取会话历史
    getHistory(conversationId) {
        if (!this.sessionHistory.has(conversationId)) {
            this.sessionHistory.set(conversationId, []);
        }
        return this.sessionHistory.get(conversationId);
    }

    // 添加到历史
    addToHistory(conversationId, userMsg, botMsg) {
        const history = this.getHistory(conversationId);
        history.push({ role: 'user', content: userMsg });
        history.push({ role: 'assistant', content: botMsg });
        
        // 只保留最近10轮
        if (history.length > 20) {
            this.sessionHistory.set(conversationId, history.slice(-20));
        }
    }

    // 构建提示词
    buildPrompt(userMessage, history) {
        let prompt = '你是一个友好的AI助手小T。请简洁回答用户的问题。\n\n';
        
        // 添加历史
        if (history.length > 0) {
            prompt += '对话历史：\n';
            history.forEach(h => {
                prompt += `${h.role === 'user' ? '用户' : '小T'}：${h.content}\n`;
            });
        }
        
        prompt += `\n用户最新问题：${userMessage}`;
        return prompt;
    }

    // 调用LLM
    async callLLM(prompt) {
        try {
            const response = await fetch(`${this.config.llmEndpoint}/api/sessions/${this.config.llmSession}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompt }),
                signal: AbortSignal.timeout(this.config.sessionTimeout)
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            return data.response || this.getDefaultResponse(prompt);
            
        } catch (e) {
            console.warn('LLM 调用失败，使用默认回复:', e.message);
            return this.getDefaultResponse(prompt);
        }
    }

    // 默认回复
    getDefaultResponse(text) {
        const responses = [
            `好的，我听到了"${text}"`,
            `"${text}"...这个很有意思！`,
            `收到，让我帮你查一下`,
            `关于"${text}"，我的看法是...`,
            `好的，稍等一下哦`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // 发送消息
    async send(text, type = 'text', conversationId = null) {
        const payload = this.buildPayload(text, type, conversationId);
        
        try {
            const response = await fetch(this.config.webhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (data.errcode !== 0) {
                throw new Error(`DingTalk Error: ${data.errmsg}`);
            }

            if (this.onResponse) {
                this.onResponse({ text, type, success: true });
            }

            console.log('✅ Message sent:', text.substring(0, 50));
            return data;
            
        } catch (e) {
            console.error('❌ Send failed:', e);
            if (this.onError) this.onError(e);
            if (this.onResponse) {
                this.onResponse({ text, type, success: false, error: e.message });
            }
            throw e;
        }
    }

    // 构建消息体
    buildPayload(text, type, conversationId) {
        switch (type) {
            case 'text':
                return {
                    msgtype: 'text',
                    text: { content: text },
                    at: { isAtAll: false }
                };
                
            case 'markdown':
                return {
                    msgtype: 'markdown',
                    markdown: { title: '小T回复', text: text }
                };
                
            case 'image':
                return {
                    msgtype: 'image',
                    image: { media_id: text }  // 图片ID
                };
                
            case 'link':
                return {
                    msgtype: 'link',
                    link: {
                        title: text.title,
                        text: text.content,
                        picUrl: text.picUrl,
                        messageUrl: text.url
                    }
                };
                
            case 'actionCard':
                return {
                    msgtype: 'actionCard',
                    actionCard: {
                        title: text.title,
                        text: text.content,
                        singleTitle: text.button || '查看详情',
                        singleURL: text.url
                    }
                };
                
            default:
                return {
                    msgtype: 'text',
                    text: { content: text }
                };
        }
    }

    // 发送富文本消息 (FeedCard)
    async sendFeedCard(links) {
        const payload = {
            msgtype: 'feedCard',
            feedCard: {
                links: links.map(link => ({
                    title: link.title,
                    messageURL: link.url,
                    picURL: link.picUrl
                }))
            }
        };

        await fetch(this.config.webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }

    // 启动 Web Server (用于接收回调)
    startServer(port = 3000) {
        const http = require('http');
        
        const server = http.createServer((req, res) => {
            if (req.method === 'POST' && req.url === '/callback') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    try {
                        const result = this.handleCallback({
                            headers: req.headers,
                            body: body,
                            query: {}
                        });
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(result));
                    } catch (e) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ errcode: -1, errmsg: e.message }));
                    }
                });
            } else if (req.method === 'GET' && req.url === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok', service: 'dingtalk-robot' }));
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
        });

        server.listen(port, () => {
            console.log(`🚀 DingTalk Robot Server started on port ${port}`);
            console.log(`   Callback URL: http://your-domain:${port}/callback`);
            console.log(`   Health Check: http://your-domain:${port}/health`);
        });

        this.isRunning = true;
        return server;
    }

    // 清理
    dispose() {
        this.isRunning = false;
        this.sessionHistory.clear();
        console.log('🧹 DingTalk Robot disposed');
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DingTalkRobot;
}
