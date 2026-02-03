# DingTalk Robot - 钉钉机器人

钉钉群机器人 SDK，支持消息接收/发送、自动回复、LLM集成。

## Features

- 📨 **消息接收** - 支持文本、图片、链接、Markdown
- 📤 **消息发送** - 支持文本、Markdown、图片、FeedCard
- 🔐 **安全验证** - 关键词验证 + 加签验证
- 🤖 **自动回复** - 基于 LLM 的智能对话
- 💬 **会话历史** - 上下文理解
- 🌐 **内置服务器** - 接收回调通知

## Setup

### Dependencies
```bash
# Node.js 环境
npm install crypto
# 或直接使用内置 crypto 模块 (Node.js/浏览器)
```

### Quick Start
```javascript
const robot = new DingTalkRobot({
    webhook: 'https://oapi.dingtalk.com/robot/send?access_token=xxx',
    keyword: '小T',                    // 关键词验证
    // secret: 'SECxxx',               // 加签密钥 (可选)
    autoReply: true,
    llmEndpoint: 'http://localhost:18790',  // LLM API
    llmSession: 'main'
});

robot.init();
```

## Usage

### Basic: 消息接收与回复

```javascript
const robot = new DingTalkRobot({
    webhook: 'YOUR_WEBHOOK_URL'
});

robot.init();

// 监听消息
robot.onMessage = (message) => {
    console.log(`收到消息: ${message.text}`);
    
    // 手动回复
    message.reply('收到，我在这里！');
};

// 启动服务器接收回调
robot.startServer(3000);
```

### Advanced: 自动回复 + LLM

```javascript
const robot = new DingTalkRobot({
    webhook: 'YOUR_WEBHOOK_URL',
    keyword: '小T',
    autoReply: true,
    llmEndpoint: 'http://localhost:18790',  // 小T后端
    llmSession: 'main'
});

robot.init();

// 自定义回复逻辑
robot.onTextMessage = async (message) => {
    console.log(`${message.senderNick}: ${message.text}`);
    
    // 发送回执
    message.reply('收到，正在思考...');
};

robot.startServer(3000);
```

### 只发送消息

```javascript
// 发送文本消息
await robot.send('你好，我是小T！');

// 发送 Markdown
await robot.send('# 你好\n这是**小T**的回复', 'markdown');

// 发送图片 (需要先上传图片获取 media_id)
await robot.send('media_id_xxx', 'image');

// 发送链接卡片
await robot.send({
    title: '小T的网站',
    content: '点击访问',
    url: 'https://example.com',
    picUrl: 'https://example.com/image.png'
}, 'link');

// 发送 FeedCard (图文消息)
await robot.sendFeedCard([
    {
        title: '文章标题',
        url: 'https://example.com',
        picUrl: 'https://example.com/image.png'
    }
]);
```

## API Reference

### Constructor Options

```javascript
{
    webhook: 'https://oapi.dingtalk.com/robot/send?access_token=xxx',
    keyword: '小T',           // 关键词验证
    secret: 'SECxxx',         // 加签密钥 (可选)
    sessionTimeout: 30000,    // LLM 超时
    autoReply: true,          // 自动回复
    llmEndpoint: '',          // LLM API 地址
    llmSession: 'main'        // LLM 会话
}
```

### Methods

| Method | Description |
|--------|-------------|
| `init()` | 初始化机器人 |
| `send(text, type, conversationId)` | 发送消息 |
| `sendFeedCard(links)` | 发送图文消息 |
| `startServer(port)` | 启动回调服务器 |
| `handleCallback(request)` | 处理回调请求 |
| `dispose()` | 清理资源 |

### Message Object

```javascript
message = {
    msgUid: 'xxx',              // 消息ID
    conversationId: 'xxx',      // 会话ID
    senderId: 'xxx',            // 发送者ID
    senderNick: 'xxx',          // 发送者昵称
    type: 'text',               // 消息类型
    text: '消息内容',            // 文本消息内容
    raw: {...},                 // 原始数据
    reply(text, type)           // 回复函数
}
```

### Callbacks

| Callback | Parameters | Description |
|----------|------------|-------------|
| `onMessage` | `(message)` | 收到任何消息 |
| `onTextMessage` | `(message)` | 收到文本消息 |
| `onImageMessage` | `(message)` | 收到图片消息 |
| `onError` | `(error)` | 发生错误 |
| `onResponse` | `(result)` | 发送回复后 |

## Demo

Open `demo.html` for an interactive demo:

```bash
cd dingding-robot
python3 -m http.server 8080
# Visit http://localhost:8080/demo.html
```

### Demo Features:
- 📝 消息发送测试
- 🔐 签名验证演示
- 📊 消息记录
- ⚙️ 配置测试

## Deploy

### 1. 创建钉钉机器人

1. 打开钉钉群设置 → 智能群助手 → 添加机器人
2. 选择 **自定义机器人**
3. 安全设置：选择"关键词"或"加签"
4. 复制 Webhook URL

### 2. 配置反向代理 (生产环境)

```
# Nginx 示例
location /dingding/ {
    proxy_pass http://localhost:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### 3. 配置回调地址

在钉钉机器人设置中填写：
- 回调 URL: `https://your-domain.com/dingding/callback`
- 对应服务器路由: `POST /dingding/callback`

## Example: 完整集成

```javascript
const robot = new DingTalkRobot({
    webhook: process.env.DINGTALK_WEBHOOK,
    keyword: '小T',
    autoReply: true,
    llmEndpoint: 'http://localhost:18790',
    llmSession: 'main'
});

robot.init();

// 错误处理
robot.onError = (error) => {
    console.error('Error:', error);
    robot.send(`出错了: ${error.message}`);
};

// 启动
const server = robot.startServer(3000);

// 优雅关闭
process.on('SIGINT', () => {
    robot.dispose();
    server.close();
    process.exit(0);
});
```

## Files

```
dingding-robot/
├── SKILL.md            # This file
├── demo.html           # 🎮 Interactive demo
└── js/
    └── dingding.js     # Core SDK
```

## License

MIT
